# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Environment variables

Copy [.env.example](.env.example) to `.env` or `.env.local` and fill in the API URL for your backend.

Required variables:

- `VITE_API_URL`: Base URL for the backend REST API, for example `http://localhost:5000/api`

## Local development

1. Start the backend from `BE/`:

	```bash
	npm install
	npm run dev
	```

2. Start the frontend from `FE/exam-review/`:

	```bash
	npm install
	npm run dev
	```

The frontend now proxies `/api` requests to `http://localhost:5000`, so it will talk to the backend during local development even if `VITE_API_URL` is not set.
