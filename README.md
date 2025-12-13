# Beyhan Family

This repository is a personal playground to practice modern front-end tooling used at work: TypeScript, React, Vite, Tailwind and Cypress.

Getting started

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Open Cypress (separate terminal):

```bash
npm run cypress:open
```

Run the example E2E test which asserts the homepage headline.

If you want, I can help you push this to a GitHub repo and/or run the tests locally.

Publishing / Deploy

This repository includes a GitHub Actions workflow that builds the site and deploys
the `dist` output to GitHub Pages whenever you push to the `main` branch:

- Workflow: `.github/workflows/deploy.yml`

To publish from your machine:

1. Create a GitHub repository (via the website) and copy the remote URL.
2. In this project folder, add the remote and push:

```bash
git remote add origin <your-git-remote-url>
git branch -M main
git add .
git commit -m "Initial site"
git push -u origin main
```

3. After push completes, GitHub Actions will run the build and publish to GitHub Pages.

If you prefer Netlify or Vercel instead I can add the configuration for those providers.

