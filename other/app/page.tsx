"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, FAKE_DOMAIN } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/designer");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: `${username.toLowerCase()}@${FAKE_DOMAIN}`,
      password,
    });
    if (authError) {
      setError("Invalid username or password");
    } else {
      router.push("/designer");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✈</div>
          <h1 className="text-3xl font-bold text-white mb-2">Sonic Boom Simulator</h1>
          <p className="text-slate-400">
            Design supersonic aircraft. Minimize the boom. Top the leaderboard!
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-slate-200">Log In</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            No account?{" "}
            <Link href="/register" className="text-sky-400 hover:text-sky-300">
              Register here
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          You can also{" "}
          <Link href="/leaderboard" className="text-slate-400 hover:text-slate-300">
            browse the leaderboard
          </Link>{" "}
          without logging in.
        </p>
      </div>
    </main>
  );
}
