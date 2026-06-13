# Tradex AI

Tradex AI is a portfolio-demo stock analysis portal built around a decision-support workflow rather than live trade execution. The repository contains:

- A Python backend with authentication, watchlists, symbol analytics, sentiment summaries, portfolio risk analysis, alert management, and mock ingestion utilities.
- A Next.js frontend scaffold for the dashboard, symbol detail views, portfolio analysis, alerts, and auth flows.

## Product Boundaries

- US equities only
- Delayed or minute-level market data
- AI-assisted analysis, not autonomous trading
- No broker integration in v1

## Repository Layout

- `backend/` Python API and service layer
- `frontend/` Next.js application scaffold

## Local Runtime Setup

This workspace now uses a local Python virtual environment and a portable Node.js runtime stored in the project folder.

- Python environment: `.venv`
- Portable Node.js runtime: `.tools/node`

## Backend Quick Start

```powershell
.venv\Scripts\python.exe -m uvicorn backend.app.fastapi_app:app --host 127.0.0.1 --port 8000
```

The API listens on `http://127.0.0.1:8000`.

### Demo Credentials

- Email: `demo@tradex.ai`
- Password: `demo1234`

### Available Endpoints

- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `GET /watchlist`
- `POST /watchlist/items`
- `GET /symbols/{ticker}/overview`
- `GET /symbols/{ticker}/signal`
- `GET /symbols/{ticker}/sentiment`
- `POST /portfolio/analyze`
- `GET /alerts`
- `POST /alerts`

## Frontend Quick Start

The frontend is structured as a Next.js app. Dependencies are already installed locally in `frontend/node_modules`.

```powershell
cd frontend
..\.tools\node\npm.cmd run dev
```

If you need to reinstall frontend dependencies later:

```powershell
cd frontend
..\.tools\node\npm.cmd install
```

The frontend expects `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` by default, which matches the local setup.

## Testing

Run backend tests with:

```powershell
.venv\Scripts\python.exe -m unittest discover -s backend/tests
```

## Notes

- Market data, news, and model outputs are seeded for demo purposes.
- The signal engine uses baseline feature engineering with explainable outputs.
- The portfolio risk engine highlights concentration, sector skew, and volatility concerns.
- CORS is enabled for `http://127.0.0.1:3000` and `http://localhost:3000` so the local frontend can call the API directly.
