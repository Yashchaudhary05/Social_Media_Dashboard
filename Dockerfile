# ── Stage 1: Build ──────────────────────────────────
FROM nginx:1.25-alpine AS production

LABEL maintainer="Yash Chaudhary <yashch1077@gmail.com>"
LABEL description="Social Media Dashboard — Nginx static site"

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy application files
COPY index.html /usr/share/nginx/html/
COPY 404.html   /usr/share/nginx/html/
COPY style.css  /usr/share/nginx/html/
COPY script.js  /usr/share/nginx/html/
COPY data.json  /usr/share/nginx/html/
COPY manifest.json /usr/share/nginx/html/
COPY sw.js      /usr/share/nginx/html/
COPY images/    /usr/share/nginx/html/images/

# Security: run as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
