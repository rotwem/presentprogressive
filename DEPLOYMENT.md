# GitHub Pages Deployment

This React app is configured to automatically deploy to GitHub Pages.

## How it works

1. **Automatic Deployment**: Every push to the `main` branch triggers a GitHub Actions workflow
2. **Build Process**: The workflow builds the React app using Vite
3. **Deployment**: The built files are automatically deployed to GitHub Pages

## Configuration

### Vite Configuration (`vite.config.ts`)
- **Base path**: Set to `/presentprogressive/` for GitHub Pages
- **Build output**: `dist/` directory
- **Source maps**: Disabled for production

### GitHub Actions (`.github/workflows/deploy.yml`)
- **Trigger**: Push to `main` branch
- **Build**: Node.js 18, npm install, build
- **Deploy**: Automatic deployment to GitHub Pages

## Manual Setup Steps

### 1. Enable GitHub Pages
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the settings

### 2. Enable GitHub Actions
1. Go to **Settings** → **Actions** → **General**
2. Ensure **Actions permissions** is set to **Allow all actions and reusable workflows**
3. Save the settings

## Deployment URL

Once deployed, your app will be available at:
```
https://rotwem.github.io/presentprogressive/
```

## Troubleshooting

### If deployment fails:
1. Check the **Actions** tab in your GitHub repository
2. Look for any build errors in the workflow logs
3. Ensure all dependencies are properly installed
4. Verify the Vite configuration is correct

### If the site doesn't load:
1. Check that GitHub Pages is enabled in repository settings
2. Verify the base path in `vite.config.ts` matches your repository name
3. Wait a few minutes for the deployment to complete

## Local Testing

To test the production build locally:
```bash
npm run build
npm run preview
```

This will serve the built files locally to verify everything works before deployment. 