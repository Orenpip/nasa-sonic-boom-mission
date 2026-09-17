# Sonic Boom Simulator Integration

The simulator is available at `simulator.html` and uses `simulator.css` and `simulator.js`. It is fully client-side so it works when deployed as the existing static site on Vercel.

## Run locally

No server is required on Vercel. Deploy the repository and open `/simulator.html`, or use the new **OPEN FLIGHT LAB** link on `dashboard.html`.

For optional local Python serving, from the repository root:

```powershell
python sonic_boom_server.py
```

Open http://127.0.0.1:8000/simulator.

The Python server uses only the standard library and is not required for the Vercel deployment. It remains available for local experiments and provides:

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `POST /api/simulate`
- `GET /api/history`
- `GET /api/leaderboard`

The original NASA lesson pages remain static and unchanged apart from the new Flight Lab link on `dashboard.html`. Browser-local runs are intentionally scoped to the current device and browser; persistent cross-user accounts would require a hosted database and serverless API.
