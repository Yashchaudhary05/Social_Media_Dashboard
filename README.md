# Social Media Dashboard

A modern, responsive social media analytics dashboard with real-time data rendering, interactive trend charts, dark/light mode, and full CI/CD deployment pipelines for both **GitHub Pages** and **AWS (EC2 + ALB)**.

![Dashboard Preview](https://img.shields.io/badge/status-live-brightgreen) ![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue) ![Docker](https://img.shields.io/badge/container-Docker-2496ED) ![AWS](https://img.shields.io/badge/cloud-AWS%20EC2%20%2B%20ALB-FF9900) ![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC) ![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)

---

## Features

| Feature | Description |
|---------|-------------|
| **6 Platforms** | Meta, Instagram, X, YouTube, LinkedIn, GitHub — all with real brand colors |
| **Live Auto-Refresh** | Dashboard data updates every 30s with simulated live changes |
| **Dark / Light Mode** | Glassmorphism toggle with smooth CSS transitions, persisted in `localStorage` |
| **Follower Trend Charts** | Chart.js line charts showing 7-day follower trends per platform |
| **Animated Counters** | Numbers animate from 0 to target with eased cubic timing |
| **Search / Filter** | Real-time platform filtering across all card sections |
| **Notification System** | Bell icon with unread badge, dropdown panel, mark-all-read |
| **CSV Export** | One-click export of all platform data to CSV file |
| **PWA** | Installable as a standalone app, works offline via service worker |
| **Responsive CSS Grid** | 1-col mobile → 2-col tablet → 3-col → 6-col desktop |
| **Glassmorphism UI** | Frosted glass cards, gradient header, platform glow effects |
| **Security Headers** | Nginx config with CSP, X-Frame-Options, XSS protection |
| **Health Checks** | Docker HEALTHCHECK + ALB target group health monitoring |
| **Custom 404 Page** | Styled error page for nginx deployment |

## Tech Stack

- **Frontend:** Vanilla JS (ES6+), CSS Custom Properties, CSS Grid, Chart.js, PWA
- **Containerization:** Docker (Nginx Alpine), Docker Compose
- **CI/CD:** GitHub Actions (lint → Docker build test → GitHub Pages deploy)
- **Cloud (CloudFormation):** AWS VPC, EC2, ALB, Auto Scaling Group
- **Cloud (Terraform):** Identical infra as code using HashiCorp Terraform
- **Web Server:** Nginx with gzip, caching, security headers, custom 404

## Project Structure

```
Social_Media_Dashboard/
├── index.html                  # Main dashboard page
├── style.css                   # Glassmorphism styles with CSS variables
├── script.js                   # Data fetching, charts, auto-refresh, export, PWA
├── data.json                   # Externalized dashboard data (6 platforms)
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker for offline support
├── 404.html                    # Custom error page
├── Dockerfile                  # Production Nginx container
├── docker-compose.yml          # Local container orchestration
├── nginx.conf                  # Nginx with security headers, caching, 404
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD: lint → docker build → GitHub Pages deploy
├── deploy/
│   ├── aws/
│   │   ├── cloudformation.yml  # AWS infra: VPC, EC2, ALB, ASG
│   │   └── deploy.sh           # One-command AWS deployment script
│   └── terraform/
│       ├── main.tf             # Provider configuration
│       ├── variables.tf        # Input variables with validation
│       ├── infrastructure.tf   # VPC, EC2, ALB, ASG resources
│       ├── outputs.tf          # ALB URL, VPC ID outputs
│       └── terraform.tfvars.example
├── README.md                   # ← You are here
├── README-GITHUB-DEPLOY.md     # GitHub Pages deployment guide
├── README-AWS-DEPLOY.md        # AWS EC2 + ALB deployment guide
└── images/                     # Platform icons & favicon
```

## Quick Start

### Run locally (no Docker)
```bash
# Any static file server works
npx serve .
# or
python3 -m http.server 8080
```

### Run with Docker
```bash
docker-compose up --build
# Dashboard available at http://localhost:8080
```

### Deploy to GitHub Pages
Push to `main` branch — GitHub Actions will automatically deploy. See [README-GITHUB-DEPLOY.md](README-GITHUB-DEPLOY.md) for setup.

### Deploy to AWS (EC2 + ALB)
```bash
# Option A: CloudFormation
export AWS_KEY_PAIR=your-key-pair-name
bash deploy/aws/deploy.sh production

# Option B: Terraform
cd deploy/terraform
cp terraform.tfvars.example terraform.tfvars  # edit with your values
terraform init
terraform plan
terraform apply
```
See [README-AWS-DEPLOY.md](README-AWS-DEPLOY.md) for full guide.

## Architecture

```
                    ┌─────────────────┐
                    │   GitHub Repo   │
                    └────────┬────────┘
                             │ push to main
                    ┌────────▼────────┐
                    │  GitHub Actions  │
                    │  (lint/build/    │
                    │   deploy)        │
                    └───┬─────────┬───┘
                        │         │
           ┌────────────▼──┐  ┌──▼──────────────┐
           │ GitHub Pages  │  │ AWS (CFn or TF)  │
           │ (static)      │  │ (EC2+ALB+ASG)    │
           └───────────────┘  └─────────────────┘
```

## Deployment Options

| Method | URL | Cost | Best For |
|--------|-----|------|----------|
| GitHub Pages | `https://<user>.github.io/Social_Media_Dashboard` | Free | Demo / Portfolio |
| Docker Local | `http://localhost:8080` | Free | Development |
| AWS EC2 + ALB | ALB DNS name | ~$20/mo | Production simulation |

## Author

**Yash Chaudhary** — Cloud & DevOps Engineer

- GitHub: [@Yashchaudhary05](https://github.com/Yashchaudhary05)
- Email: yashch1077@gmail.com
- LinkedIn: [Yash Chaudhary](https://linkedin.com/in/yashchaudhary05)

## License

MIT
