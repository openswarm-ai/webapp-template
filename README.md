<h1 align="center">OpenSwarm</h1>

<p align="center">A full-stack web app template built to be cloned and extended by AI agents.</p>

<p align="center">
  <a href="#quick-start">Quick Start</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#project-structure">Structure</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#architecture">Architecture</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#extending">Extending</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="frontend/DESIGN.md">Design System</a>
</p>

---

## Tech Stack

| Layer | Tech | Notes |
|---|---|---|
| Frontend | React 18, TypeScript, Vite | Path alias `@` → `src/` |
| UI | MUI v7, Emotion | Custom design token system (`frontend/DESIGN.md`) |
| State | Redux Toolkit | `frontend/src/shared/state/store.ts` |
| Animation | Framer Motion | |
| Routing | react-router-dom v7, vite-plugin-pages | File-based routing — `src/pages/*.tsx` auto-registers as routes |
| Dev tools | vite-plugin-terminal | Logs `console.*` calls to the Vite terminal |
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
BACKEND_PORT=NONE   # set to a port number to enable the backend, or NONE for frontend-only mode
FRONTEND_PORT=4949
```

> **Frontend-only mode**: When `BACKEND_PORT=NONE` (the default), the backend is not started and the frontend runs standalone with no API proxy. Set it to a port number (e.g. `8324`) to enable the full stack.

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
├── .env.example                        # Template env with defaults (BACKEND_PORT=NONE)
├── run.sh                              # Starts backend → waits for health → starts frontend
├── backend/
│   ├── __init__.py
│   ├── run.sh                          # Venv setup, pip install, uvicorn --reload
│   ├── pyproject.toml                  # fastapi[standard], typeguard, swarm-debug
│   ├── main.py                         # App entry: registers SubApps, adds CORS
│   ├── config/
│   │   ├── __init__.py
│   │   └── Apps.py                     # SubApp / MainApp plugin framework
│   └── apps/
│       └── health/
│           └── health.py               # GET /api/health/check → PlainTextResponse "OK"
└── frontend/
    ├── run.sh                          # npm install, vite dev server
    ├── index.html                      # HTML entry point (mounts #root)
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts                  # Dev server, proxy, path alias, vite-plugin-pages
    ├── DESIGN.md                       # Full design system specification
    └── src/
        ├── index.tsx                   # ReactDOM entry
        ├── vite-env.d.ts               # Vite + vite-plugin-pages type references
        ├── pages/                      # File-based routes (auto-registered)
        │   ├── index.tsx               # Home page → /
        │   └── health.tsx              # Health check page → /health
        ├── app/
        │   ├── Main.tsx                # Root: Redux + Theme + BrowserRouter + AppShell
        │   └── components/
        │       └── Layout/
        │           ├── AppShell.tsx    # Sidebar + scrollable content area
        │           └── Sidebar.tsx    # Nav items, logo (collapse toggle), theme switch
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

### Frontend — Layout, Routing & Theming

**File-based routing**: Any `.tsx` file in `frontend/src/pages/` automatically becomes a route via `vite-plugin-pages`. The filename maps to the URL path — `index.tsx` → `/`, `health.tsx` → `/health`. No manual route registration needed.

**AppShell layout**: All pages render inside a persistent shell with a collapsible sidebar (click the logo to toggle) and a scrollable content area. The sidebar contains nav items and a dark/light theme switch.

**Token-based theming**: All styling flows through a custom design token system layered on MUI — **not** MUI's built-in `theme.palette`. Tokens are accessed via hook:

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

**1.** Create `frontend/src/pages/{name}.tsx` — the filename becomes the route (e.g. `settings.tsx` → `/settings`):

```tsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useClaudeTokens } from '@/shared/styles/ThemeContext';

const Settings: React.FC = () => {
  const c = useClaudeTokens();
  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontFamily: c.font.serif, color: c.text.primary }}>Settings</Typography>
    </Box>
  );
};

export default Settings;
```

The route registers automatically — no changes to `Main.tsx` needed.

**2.** (Optional) Add a sidebar nav entry in `frontend/src/app/components/Layout/Sidebar.tsx`:

```ts
import SettingsIcon from '@mui/icons-material/Settings';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/health', label: 'Health', icon: FavoriteIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },  // new
];
```

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
