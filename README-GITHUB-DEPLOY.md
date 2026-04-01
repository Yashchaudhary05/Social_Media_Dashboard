# Deploying to GitHub Pages

Step-by-step guide to deploy the Social Media Dashboard using **GitHub Actions CI/CD** to **GitHub Pages**.

---

## Prerequisites

- GitHub account with a public (or Pro/Team private) repository
- Repository contains the project files on the `main` branch

## How It Works

```
push to main → GitHub Actions triggers → lint & validate → deploy to Pages
```

The workflow (`.github/workflows/deploy.yml`) runs three jobs:

1. **Lint & Validate** — checks HTML validity, JSON syntax, and required file structure
2. **Docker Build Test** — ensures the Dockerfile builds successfully (validates container config)
3. **Deploy** — uploads static files to GitHub Pages (only on `main` branch push)

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

### 2. Push to Main Branch

```bash
git add .
git commit -m "feat: enhanced dashboard with CI/CD pipeline"
git push origin main
```

### 3. Verify Deployment

1. Go to **Actions** tab — you should see the workflow running
2. Once the "Deploy to GitHub Pages" job completes, your site is live
3. URL format: `https://<your-username>.github.io/Social_Media_Dashboard/`

## CI/CD Pipeline Details

### Lint Job
```yaml
- Validates HTML structure using html-validate
- Validates data.json is valid JSON
- Checks all required files exist (index.html, style.css, script.js, data.json)
```

### Docker Build Test Job
```yaml
- Builds Docker image without pushing (validates Dockerfile correctness)
- Uses GitHub Actions cache for faster builds
- Runs only after lint passes
```

### Deploy Job
```yaml
- Runs only on push to main (not on PRs)
- Uses official GitHub Pages actions (configure-pages, upload-pages-artifact, deploy-pages)
- Creates a deployment environment with direct URL
```

## Workflow Permissions

The workflow requires these repository permissions (configured in the YAML):
- `contents: read` — to checkout code
- `pages: write` — to deploy to Pages  
- `id-token: write` — for Pages deployment authentication

## Triggering Deployments

| Event | Lint | Docker Build | Deploy |
|-------|------|-------------|--------|
| Push to `main` | Yes | Yes | Yes |
| Pull Request to `main` | Yes | Yes | No |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on GitHub Pages | Ensure Pages source is set to "GitHub Actions" in repo settings |
| Workflow not triggering | Check that `.github/workflows/deploy.yml` is on the `main` branch |
| HTML validation fails | Fix HTML errors shown in the Actions log |
| Pages deploy fails | Ensure `pages: write` and `id-token: write` permissions are set |

## Custom Domain (Optional)

1. Go to **Settings** → **Pages** → **Custom domain**
2. Enter your domain (e.g., `dashboard.yashchaudhary.com`)
3. Add a CNAME record in your DNS pointing to `<user>.github.io`
4. Enable **Enforce HTTPS**
