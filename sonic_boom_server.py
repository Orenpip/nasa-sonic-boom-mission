"""Standalone Python backend for the NASA Sonic Boom Simulator."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from http import HTTPStatus
from pathlib import Path
from urllib.parse import parse_qs, urlparse
import hashlib
import http.cookies
import json
import secrets
import sqlite3
import time

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "sonic_boom.sqlite3"
SESSIONS = {}
RATE_LIMITS = {}


def db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )""")
    connection.execute("""CREATE TABLE IF NOT EXISTS runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        nose_angle REAL NOT NULL,
        fuselage_ratio REAL NOT NULL,
        wing_sweep REAL NOT NULL,
        tail_taper REAL NOT NULL,
        volume_distribution REAL NOT NULL,
        pldb REAL NOT NULL,
        overpressure REAL NOT NULL,
        run_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )""")
    connection.commit()
    return connection


def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return f"{salt}${digest}"


def valid_password(password, stored):
    salt, expected = stored.split("$", 1)
    actual = password_hash(password, salt).split("$", 1)[1]
    return secrets.compare_digest(actual, expected)


def clamp(value, low, high):
    value = float(value)
    if value != value or value in (float("inf"), float("-inf")):
        raise ValueError("Invalid parameter")
    return max(low, min(high, value))


def calculate_sonic_boom(params):
    gamma, mach, p_inf, altitude, length, points = 1.4, 1.6, 19399, 12000, 50, 200
    mach_angle = __import__("math").degrees(__import__("math").asin(1 / mach))
    sweep_opt = 52
    import math
    nose, ratio, sweep, tail, volume = (params[key] for key in (
        "noseAngle", "fuselageRatio", "wingSweep", "tailTaper", "volumeDistribution"))
    r_max = length / (2 * ratio)
    area_max = math.pi * r_max * r_max
    x_peak = length * (0.5 - 0.15 * volume)
    nose_power = 1.4 - 0.8 * nose
    tail_power = 0.6 + 0.8 * tail
    wing_sigma = length * (0.04 + 0.16 * (sweep / 75))
    if sweep < mach_angle:
        sweep_factor = 1 + 2.0 * ((mach_angle - sweep) / mach_angle) ** 2
    else:
        sweep_factor = 1 + 1.5 * (max(0, sweep - sweep_opt) / (75 - sweep_opt)) ** 2
    wing_max = 0.35 * area_max * sweep_factor
    area = []
    for index in range(points):
        x = index / (points - 1) * length
        if x <= x_peak:
            t = max(0, min(1, x / x_peak if x_peak else 0))
            angle = math.pi / 2 * t ** nose_power
        else:
            t = max(0, min(1, (length - x) / (length - x_peak)))
            angle = math.pi / 2 * t ** tail_power
        fuselage = area_max * math.sin(angle) ** 2
        wing = wing_max * math.exp(-0.5 * ((x - 0.45 * length) / wing_sigma) ** 2)
        area.append(fuselage + wing)
    dx = length / (points - 1)
    second = [0] * points
    for index in range(1, points - 1):
        second[index] = (area[index + 1] - 2 * area[index] + area[index - 1]) / dx ** 2
    second[0], second[-1] = second[1], second[-2]
    f_max = 0
    for j in range(1, points):
        tau = j * dx
        integral = sum((0.5 * (second[i] + second[min(i + 1, points - 1)]) /
                        math.sqrt(tau - (i + 0.5) * dx)) * dx for i in range(j))
        f_max = max(f_max, abs(integral) / (2 * math.pi))
    nose_factor = 1 + (0.7 * ((0.2 - nose) / 0.2) ** 2 if nose < 0.2 else 0.35 * ((nose - 0.2) / 0.8) ** 2)
    tail_factor = 1 + (0.45 * ((tail - 0.5) / 0.5) ** 2 if tail > 0.5 else 0.35 * ((0.5 - tail) / 0.5) ** 2)
    volume_factor = 1 + 0.5 * (volume + 0.2) ** 2
    fineness_factor = 1 + 0.5 * ((ratio - 10) / 2) ** 2 if ratio > 10 else 1
    adjusted = f_max * nose_factor * tail_factor * volume_factor * fineness_factor
    raw = ((p_inf * gamma * mach ** 2) / (2 * math.sqrt(2))) * math.sqrt(math.sqrt(mach ** 2 - 1) / altitude) * adjusted
    return {"pldb": 20 * math.log10(raw / 2e-5) - 53, "overpressure": raw / (10 ** (53 / 20))}


def design_from_body(body):
    return {
        "noseAngle": clamp(body["noseAngle"], 0, 1),
        "fuselageRatio": clamp(body["fuselageRatio"], 3, 12),
        "wingSweep": clamp(body["wingSweep"], 0, 75),
        "tailTaper": clamp(body["tailTaper"], 0, 1),
        "volumeDistribution": clamp(body["volumeDistribution"], -1, 1),
    }


def allowed(key, limit, window=60):
    now = time.time()
    recent = [stamp for stamp in RATE_LIMITS.get(key, []) if stamp > now - window]
    if len(recent) >= limit:
        RATE_LIMITS[key] = recent
        return False
    recent.append(now)
    RATE_LIMITS[key] = recent
    return True


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        return

    def json_response(self, payload, status=HTTPStatus.OK):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length) or b"{}")

    def session_user(self):
        cookies = http.cookies.SimpleCookie(self.headers.get("Cookie", ""))
        token = cookies.get("session")
        if not token or token.value not in SESSIONS:
            return None
        connection = db()
        user = connection.execute("SELECT * FROM users WHERE id = ?", (SESSIONS[token.value],)).fetchone()
        connection.close()
        return user

    def set_session(self, user_id):
        token = secrets.token_urlsafe(32)
        SESSIONS[token] = user_id
        self.send_header("Set-Cookie", f"session={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800")

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            body = self.body()
            if path == "/api/register":
                username, password = str(body.get("username", "")), str(body.get("password", ""))
                if not 3 <= len(username) <= 20 or not username.replace("_", "").isalnum():
                    return self.json_response({"error": "Username must be 3–20 letters, numbers, or underscores"}, 400)
                if len(password) < 6:
                    return self.json_response({"error": "Password must be at least 6 characters"}, 400)
                connection = db()
                try:
                    cursor = connection.execute("INSERT INTO users(username, password_hash) VALUES (?, ?)", (username, password_hash(password)))
                    connection.commit()
                except sqlite3.IntegrityError:
                    connection.close()
                    return self.json_response({"error": "Username already taken"}, 400)
                connection.close()
                return self.json_response({"ok": True, "username": username})
            if path == "/api/login":
                connection = db()
                user = connection.execute("SELECT * FROM users WHERE lower(username) = lower(?)", (str(body.get("username", "")),)).fetchone()
                connection.close()
                if not user or not valid_password(str(body.get("password", "")), user["password_hash"]):
                    return self.json_response({"error": "Invalid username or password"}, 401)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.set_session(user["id"])
                data = json.dumps({"ok": True, "username": user["username"]}).encode()
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            if path == "/api/logout":
                cookies = http.cookies.SimpleCookie(self.headers.get("Cookie", ""))
                token = cookies.get("session")
                if token:
                    SESSIONS.pop(token.value, None)
                return self.json_response({"ok": True})
            if path == "/api/simulate":
                user = self.session_user()
                if not user:
                    return self.json_response({"error": "Unauthorized"}, 401)
                if not allowed(f"simulate:{user['id']}", 10):
                    return self.json_response({"error": "Too many requests"}, 429)
                params = design_from_body(body)
                result = calculate_sonic_boom(params)
                connection = db()
                best = connection.execute("SELECT MIN(pldb) AS pldb FROM runs WHERE user_id = ?", (user["id"],)).fetchone()["pldb"]
                connection.execute("INSERT INTO runs(user_id,nose_angle,fuselage_ratio,wing_sweep,tail_taper,volume_distribution,pldb,overpressure) VALUES (?,?,?,?,?,?,?,?)", (user["id"], *params.values(), result["pldb"], result["overpressure"]))
                connection.commit()
                connection.close()
                return self.json_response({"result": result, "isNewBest": best is None or result["pldb"] < best})
        except (KeyError, ValueError, TypeError, json.JSONDecodeError):
            return self.json_response({"error": "Invalid request"}, 400)
        self.json_response({"error": "Not found"}, 404)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/me":
            user = self.session_user()
            return self.json_response({"user": user["username"] if user else None})
        if path == "/api/history":
            user = self.session_user()
            if not user:
                return self.json_response({"error": "Unauthorized"}, 401)
            connection = db()
            rows = connection.execute("SELECT * FROM runs WHERE user_id = ? ORDER BY run_at DESC LIMIT 100", (user["id"],)).fetchall()
            connection.close()
            return self.json_response({"history": [row_to_run(row) for row in rows]})
        if path == "/api/leaderboard":
            connection = db()
            rows = connection.execute("SELECT users.username, runs.* FROM runs JOIN users ON users.id = runs.user_id ORDER BY runs.pldb ASC LIMIT 50").fetchall()
            connection.close()
            return self.json_response({"entries": [row_to_entry(row, index + 1) for index, row in enumerate(rows)]})
        return self.static_file(path)

    def static_file(self, path):
        requested = "simulator.html" if path in ("/", "/simulator") else path.lstrip("/")
        file_path = ROOT / requested
        if not file_path.is_file() or ".." in Path(requested).parts:
            self.send_error(404)
            return
        content_type = {".html": "text/html", ".css": "text/css", ".js": "text/javascript"}.get(file_path.suffix, "application/octet-stream")
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def row_to_design(row):
    return {"noseAngle": row["nose_angle"], "fuselageRatio": row["fuselage_ratio"], "wingSweep": row["wing_sweep"], "tailTaper": row["tail_taper"], "volumeDistribution": row["volume_distribution"]}


def row_to_run(row):
    return {"id": row["id"], "pldb": row["pldb"], "overpressure": row["overpressure"], "design": row_to_design(row), "runAt": row["run_at"]}


def row_to_entry(row, rank):
    return {"rank": rank, "username": row["username"], "pldb": row["pldb"], "overpressure": row["overpressure"], "design": row_to_design(row), "runAt": row["run_at"]}


if __name__ == "__main__":
    db().close()
    server = ThreadingHTTPServer(("127.0.0.1", 8000), Handler)
    print("Sonic Boom Simulator: http://127.0.0.1:8000/simulator")
    server.serve_forever()
