# TALA Research Lab

TALA Research Lab is a FastAPI backend service that runs real web research
via Agent Reach and returns structured reports through OpenRouter.

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+ (for the MerQato webshop — only needed if you also want to
  verify the frontend build)
- An OpenRouter API key (free — get one at https://openrouter.ai/keys)

### Setup

```bash
# 1. Copy the env file and fill in your key
cp services/tala-research/.env.example services/tala-research/.env
# Edit services/tala-research/.env and set OPENROUTER_API_KEY

# 2. Start the backend
cd services/tala-research
uv run python main.py --host 0.0.0.0 --port 8002

# Or with the environment variables directly:
OPENROUTER_API_KEY=your-key-here TALA_LLM_MODEL=openai/gpt-4o-mini \
  uv run python main.py --host 0.0.0.0 --port 8002
```

### Verify the backend is running

```bash
curl http://localhost:8002/health
# Expected: {"status":"ok","service":"tala-research","model":"openai/gpt-4o-mini","openrouter_configured":true}
```

### Run a research query

```bash
curl -X POST http://localhost:8002/research \
  -H "Content-Type: application/json" \
  -d '{
    "business": "Marina Terrace",
    "location": "San Vicente, Palawan",
    "audience": "Digital nomads and sustainable-tourism investors",
    "question": "Find evidence of people seeking peaceful island stays with reliable internet and a small community."
  }'
```

### Run the frontend (from the repo root)

```bash
npm run dev
# Opens at http://localhost:5173
# Navigate to http://localhost:5173/tala-research
```

### Set the API URL for the frontend

If the backend is not on `localhost:8002`, update `.env.local` in the
frontend root:

```bash
echo 'VITE_TALA_API_URL=http://localhost:8002' > .env.local
```

## Project Structure

```
services/tala-research/
├── main.py          # FastAPI app — /health, /research
├── pyproject.toml   # Project metadata
├── requirements.txt # Python dependencies
├── .env.example     # Template for environment variables
└── README.md        # This file
```

## Environment Variables

### Backend (`services/tala-research/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Yes | — | OpenRouter API key (never exposed to the browser) |
| `TALA_LLM_MODEL` | No | `openai/gpt-4o-mini` | OpenRouter model to use |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173,http://localhost:3000` | Comma-separated CORS origins |

### Frontend (repo root `.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_TALA_API_URL` | No | `http://localhost:8002` | Backend URL the frontend calls |

## Source Validation

TALA rejects pages containing:
- HTTP 401, 403, 429 status codes
- "You've been blocked", "Access denied", "Login required", "CAPTCHA"
- Empty or abnormally short content (<120 characters)

Only verified pages may support TALA's conclusions. URLs are never invented.

## Test Commands

```bash
# Verify the existing webshop still builds
npm run build

# Verify the backend starts and /health responds
cd services/tala-research
uv run python -c "from main import app; print('Import OK')"

# Health check
curl http://localhost:8002/health

# Run a full research test with the Marina Terrace example
# (requires OPENROUTER_API_KEY to be set)
curl -X POST http://localhost:8002/research \
  -H "Content-Type: application/json" \
  -d '{"business":"Marina Terrace","location":"San Vicente, Palawan","audience":"Digital nomads and sustainable-tourism investors","question":"Find evidence of people seeking peaceful island stays with reliable internet and a small community."}'
```

## What This Version Does NOT Include

- No Facebook or Instagram integration
- No social cookies
- No Reddit login
- No posting or messaging
- No Supabase
- No user accounts
- No saved reports
- No payments
- No deployment automation

"Deploy TALA" on the report page links to `/contact`.

## Local URLs

| Service | URL |
|---|---|
| Webshop | http://localhost:5173 |
| TALA Research page | http://localhost:5173/tala-research |
| Backend health | http://localhost:8002/health |
| Backend research API | http://localhost:8002/research (POST) |
| Contact page | http://localhost:5173/contact |
