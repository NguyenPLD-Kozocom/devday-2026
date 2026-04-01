# DevDay 2026 - Games Monorepo

This is the shared source code repository (monorepo) for the interactive games featured at the DevDay 2026 event. It includes the following games:

- **Bee Word Search**
- **Lucky Draw**
- **Ten Seconds**

## System Requirements

- **[Node.js](https://nodejs.org/)** (Version 20 or above is recommended)
- **[pnpm](https://pnpm.io/)** (The primary package manager used in this project)

> **Note:** This project strictly uses `pnpm` (as tracked in the `pnpm-lock.yaml` file). Please avoid using `npm` or `yarn` to prevent dependency version conflicts.

## Setup and Run Instructions

**1. Install Dependencies**  
Open your terminal in the root directory of the project (`devday-2026`) and run the following command:

```bash
pnpm install
```

**2. Run Development Server**  
Start the local development server by running:

```bash
pnpm run dev
```

Once it's running successfully, your terminal will log a local URL (usually `http://localhost:5173/`). You can `Ctrl + Click` the link to open the application in your browser.

**3. Run Linter (Optional)**  
This project uses ESLint. To check for codebase errors, styles, and types, run:

```bash
pnpm run lint
```

## Technologies Used

- Vite
- React 19
- TypeScript
- Tailwind CSS
