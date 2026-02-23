# Gatey — Setup & Installation Guide

This document covers everything needed to get Gatey running on your local machine for development, testing, or preview purposes.

---

## Prerequisites

| Tool                           | Minimum Version        | Purpose            |
| ------------------------------ | ---------------------- | ------------------ |
| [Node.js](https://nodejs.org/) | 18.x+                  | JavaScript runtime |
| [npm](https://www.npmjs.com/)  | 9.x+ (ships with Node) | Package manager    |
| Git                            | 2.x+                   | Source control     |

> [!TIP]
> We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions:
>
> ```bash
> nvm install 18
> nvm use 18
> ```

---

## Clone the Repository

```bash
git clone https://github.com/<your-org>/Gatey.git
cd Gatey
```

---

## Frontend Setup

The frontend is a **React 19 + Vite 6** single-page application.

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This installs both runtime and dev dependencies, including:

| Category             | Key Packages                                                                  |
| -------------------- | ----------------------------------------------------------------------------- |
| **UI Framework**     | `react`, `react-dom`, `@coreui/react`, `@coreui/icons`, `@coreui/icons-react` |
| **State Management** | `@reduxjs/toolkit`, `react-redux`                                             |
| **Drag & Drop**      | `react-dnd`, `react-dnd-html5-backend`                                        |
| **Routing**          | `react-router-dom`                                                            |
| **Utilities**        | `uuid`, `pathfinding`, `simplebar-react`                                      |
| **Dev Tooling**      | `vite`, `@vitejs/plugin-react`, `sass`, `eslint`                              |

### 2. Run the Development Server

```bash
npm run dev
```

Vite will start a local dev server (default: `http://localhost:5173`) with Hot Module Replacement (HMR). The page auto-reloads on file changes.

### 3. Lint the Code

```bash
npm run lint
```

ESLint is configured via `eslint.config.js` with:

- `eslint-plugin-react-hooks` — enforces rules of hooks
- `eslint-plugin-react-refresh` — validates fast-refresh compatibility
- Unused variable pattern set to ignore variables starting with uppercase or `_`

### 4. Build for Production

```bash
npm run build
```

This generates an optimized static bundle in `frontend/dist/`.

### 5. Preview the Production Build

```bash
npm run preview
```

This serves the `dist/` bundle locally for pre-deployment verification.

---

## Backend

> [!NOTE]
> The `backend/` directory exists in the project structure but is currently empty. No backend setup is required at this time. All circuit simulation runs entirely in the browser.

---

## Static Assets

The `frontend/public/` directory contains assets served at the root URL:

| Path                        | Contents                             |
| --------------------------- | ------------------------------------ |
| `public/fonts/FontAwesome/` | Font Awesome icon library (CSS + JS) |
| `public/logo/`              | Gatey logo images                    |
| `public/img/`               | User avatar and other static images  |
| `public/vite.svg`           | Default Vite favicon                 |

Font Awesome is loaded globally via `<link>` and `<script>` tags in `index.html`.

---

## Environment & Configuration

| File               | Purpose                                                 |
| ------------------ | ------------------------------------------------------- |
| `vite.config.js`   | Vite build configuration — uses `@vitejs/plugin-react`  |
| `eslint.config.js` | ESLint flat-config with React hooks and refresh plugins |
| `package.json`     | Project metadata, scripts, and dependency manifest      |

> [!IMPORTANT]
> No `.env` files are currently required. All configuration is embedded in the build tooling and source code. If environment variables are added in the future, create a `.env` file in `frontend/` following Vite's [env variable conventions](https://vite.dev/guide/env-and-mode.html) (`VITE_` prefix).

---

## Troubleshooting

| Problem                    | Solution                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `npm install` fails        | Ensure Node.js ≥ 18. Delete `node_modules/` and `package-lock.json`, then retry.         |
| Port 5173 in use           | Run `npm run dev -- --port 3000` to use an alternative port.                             |
| Font Awesome icons missing | Verify `public/fonts/FontAwesome/` contains `all.min.css` and `all.min.js`.              |
| Styles broken              | Ensure `sass` dev dependency is installed — it's required for `custom.scss` compilation. |
