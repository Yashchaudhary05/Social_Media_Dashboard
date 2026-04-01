# Social Media Dashboard

A modern, responsive social media analytics dashboard with real-time data rendering, interactive trend charts, dark/light mode, and full CI/CD deployment pipelines for both **GitHub Pages** and **AWS (EC2 + ALB)**.

![Dashboard Preview](https://img.shields.io/badge/status-live-brightgreen) ![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue) ![Docker](https://img.shields.io/badge/container-Docker-2496ED) ![AWS](https://img.shields.io/badge/cloud-AWS%20EC2%20%2B%20ALB-FF9900)

---

## Features

| Feature | Description |
|---------|-------------|
| **Dynamic Data Rendering** | All dashboard data fetched from `data.json` — no hardcoded HTML |
| **Dark / Light Mode** | Toggle with smooth CSS transitions, persisted in `localStorage`, respects `prefers-color-scheme` |
| **Follower Trend Charts** | Chart.js line charts showing 7-day follower trends per platform |
| **Animated Counters** | Numbers animate from 0 to target with eased cubic timing |
| **Search / Filter** | Real-time platform filtering across all card sections |
| **Notification System** | Bell icon with unread badge, dropdown panel, mark-all-read |
| **Responsive CSS Grid** | 1-column mobile → 2-column tablet → 4-column desktop |
| **Fade-in Animations** | Staggered card entrance animations on load |
| **Security Headers** | Nginx config with CSP, X-Frame-Options, XSS protection |
| **Health Checks** | Docker HEALTHCHECK + ALB target group health monitoring |

## Tech Stack

- **Frontend:** Vanilla JS (ES6+), CSS Custom Properties, CSS Grid, Chart.js
- **Containerization:** Docker (multi-stage Nginx Alpine), Docker Compose
- **CI/CD:** GitHub Actions (lint → Docker build test → deploy)
- **Cloud:** AWS CloudFormation (VPC, EC2, ALB, Auto Scaling Group)
- **Web Server:** Nginx with gzip, caching, and security headers

## Project Structure

```
Social_Media_Dashboard/
├── index.html                  # Main dashboard page
├── style.css                   # Responsive styles with CSS variables
├── script.js                   # Data fetching, charts, animations, search, notifications
├── data.json                   # Externalized dashboard data
├── Dockerfile                  # Production Nginx container
├── docker-compose.yml          # Local container orchestration
├── nginx.conf                  # Nginx with security headers & caching
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD: lint → docker build → GitHub Pages deploy
├── deploy/
│   └── aws/
│       ├── cloudformation.yml  # Full AWS infra: VPC, EC2, ALB, ASG
│       └── deploy.sh           # One-command AWS deployment script
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
export AWS_KEY_PAIR=your-key-pair-name
bash deploy/aws/deploy.sh production
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
           │ GitHub Pages  │  │ AWS CloudFormation│
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
