<h1 align="center">OpenSwarm</h1>

<p align="center">A full-stack web app template built to be cloned and extended by AI agents.</p>

<p align="center">
  <a href="#quick-start">Quick Start</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#project-structure">Structure</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#architecture">Architecture</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#extending">Extending</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="frontend/DESIGN.md">Design System</a>
</p>

---

## Tech Stack

| Layer | Tech | Notes |
|---|---|---|
| Frontend | React 18, TypeScript, Webpack 5 | Babel transpilation, path alias `@` → `src/` |
| UI | MUI v7, Emotion | Custom design token system (`frontend/DESIGN.md`) |
| State | Redux Toolkit | `frontend/src/shared/state/store.ts` |
| Animation | Framer Motion | |
| Routing | react-router-dom v7 | Installed, not yet wired |
| Backend | FastAPI, Python 3.10+ | Uvicorn ASGI, port configurable via `.env` |
| Runtime types | typeguard | `@typechecked` decorator on endpoints |
| Logging | swarm-debug | Lightweight `debug()` logger used in backend |

## Quick Start

**1.** Copy the environment file and set your variables:

```bash
cp .env.example .env
```

Edit `.env` to configure ports (and any future settings):

```
BACKEND_PORT=8324
FRONTEND_PORT=3000
```

**2.** Run both services:

```bash
bash run.sh
```

Individually:

```bash
bash backend/run.sh    # backend only
bash frontend/run.sh   # frontend only
```

API docs: `http://127.0.0.1:<BACKEND_PORT>/docs`

## Project Structure

```
├── .env                                # BACKEND_PORT, FRONTEND_PORT
├── run.sh                              # Starts backend → waits for health → starts frontend
├── backend/
│   ├── run.sh                          # Venv setup, pip install -e ., uvicorn --reload
│   ├── pyproject.toml                  # fastapi[standard], typeguard, swarm-debug
│   ├── main.py                         # App entry: registers SubApps, adds CORS
│   ├── config/
│   │   └── Apps.py                     # SubApp / MainApp plugin framework
│   └── apps/
│       └── health/
│           └── health.py               # GET /api/health/check → PlainTextResponse "OK"
└── frontend/
    ├── run.sh                          # npm install, webpack-dev-server
    ├── package.json
    ├── webpack.config.js
    ├── DESIGN.md                       # Full design system specification
    └── src/
        ├── index.tsx                   # ReactDOM entry
        ├── app/
        │   ├── Main.tsx                # Root: Redux Provider → ThemeProvider → page
        │   └── pages/
        │       └── Health/
        │           └── Health.tsx      # Health check UI with latency display
        └── shared/
            ├── hooks.ts                # useAppDispatch, useAppSelector
            ├── state/
            │   ├── store.ts            # Redux store config
            │   ├── tempStateSlice.ts   # Placeholder slice (replace or extend)
            │   └── API_ENDPOINTS.ts    # All backend URL constants
            └── styles/
                └── ThemeContext.tsx     # Design tokens, MUI theme, dark/light mode
```

## Architecture

### Backend — SubApp Pattern

Each feature is a **SubApp**: a self-contained module with its own `APIRouter` and async lifespan, auto-mounted at `/api/{name}/`.

Defined in `backend/config/Apps.py`:

- **`SubApp(name, lifespan)`** — Creates a router prefixed to `/api/{name}/`
- **`MainApp([sub_apps])`** — Composes all SubApps into one FastAPI instance, manages combined lifespans

Registration in `backend/main.py`:

```python
main_app = MainApp([health])
app = main_app.app
```

### Frontend — Token-Based Theming

All styling flows through a custom design token system layered on MUI — **not** MUI's built-in `theme.palette`. Tokens are accessed via hook:

```tsx
const c = useClaudeTokens();
// c.bg.page, c.bg.surface, c.text.primary, c.accent.primary, etc.
```

Dark/light mode toggling:

```tsx
const { mode, toggleMode } = useThemeMode();
```

**Enforced conventions** (detailed in `frontend/DESIGN.md`):

- All styling via MUI `sx` prop only — no CSS files, no `styled()`, no inline `style={{}}`
- All UI via MUI components — no raw HTML elements
- All colors from tokens — no hardcoded values

## Extending

### Add a Backend Feature

**1.** Create `backend/apps/{name}/{name}.py`:

```python
from backend.config.Apps import SubApp
from contextlib import asynccontextmanager

@asynccontextmanager
async def my_feature_lifespan():
    yield

my_feature = SubApp("my_feature", my_feature_lifespan)

@my_feature.router.get("/example")
async def example():
    return {"status": "ok"}
```

**2.** Register in `backend/main.py`:

```python
from backend.apps.my_feature.my_feature import my_feature

main_app = MainApp([health, my_feature])
```

Routes become available at `/api/my_feature/example`.

### Add a Frontend Page

**1.** Create `frontend/src/app/pages/{Name}/{Name}.tsx`:

```tsx
import { useClaudeTokens } from '@/shared/styles/ThemeContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const MyPage: React.FC = () => {
  const c = useClaudeTokens();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: c.bg.page, color: c.text.primary }}>
      <Typography sx={{ fontFamily: c.font.serif }}>My Page</Typography>
    </Box>
  );
};

export default MyPage;
```

**2.** Wire into `frontend/src/app/Main.tsx`.

### Add a Redux Slice

**1.** Create `frontend/src/shared/state/{name}Slice.ts`.

**2.** Register in `frontend/src/shared/state/store.ts`:

```ts
import myReducer from './{name}Slice';

export const store = configureStore({
  reducer: {
    tempState: tempStateReducer,
    myFeature: myReducer,
  },
});
```

### Add an API Endpoint Constant

Add to `frontend/src/shared/state/API_ENDPOINTS.ts`:

```ts
export const MY_FEATURE_URL = API_URL + '/my_feature/example';
```

## License

[MIT](LICENSE)
