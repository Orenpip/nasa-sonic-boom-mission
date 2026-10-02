# Sonic Boom Flight Lab

The Flight Lab is built into Mission 8 at `lesson8.html#flight-lab`. It presents five design sliders and live sonic-boom and ground-overpressure readouts. Once BOOM is complete, the dashboard begins caching the Unity WebGL build in the background. Opening Mission 8 starts the Unity player and displays its loading progress. The current design values are passed to the Unity page as URL/runtime data.

This checkout contains only the compiled Unity WebGL player, not its Unity project, scene, or aircraft scripts. The browser can pass design values to the Unity page, but the compiled aircraft cannot use them until the Unity project adds an in-game receiver/3D preview and is rebuilt.

## Run locally

On Vercel, use the HTTPS site URL and open the dashboard. Once BOOM is complete, the dashboard starts caching the Unity build; Mission 8 opens the game from that cache when available.

For optional local Python serving, from the repository root:

```powershell
python sonic_boom_server.py
```

Open http://127.0.0.1:8000/dashboard.html. Service-worker preloading works on localhost and HTTPS, but not when opening files directly with `file://`.

The Python server uses only the standard library and is not required for the Vercel deployment. It remains available for local experiments and provides:

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `POST /api/simulate`
- `GET /api/history`
- `GET /api/leaderboard`

The Flight Lab calculates and displays the design readouts entirely in the browser.
