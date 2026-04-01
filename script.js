"use strict";

/* ──────────────────────────────────────────
   DOM references
   ────────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const darkButton   = $("#dark");
const lightButton  = $("#light");
const loader       = $("#loader");
const app          = $("#app");
const platformCards = $("#platformCards");
const overviewCards = $("#overviewCards");
const chartsGrid   = $("#chartsGrid");
const totalEl      = $("#totalFollowers");
const searchInput  = $("#searchInput");
const bellBtn      = $("#bellBtn");
const notifBadge   = $("#notifBadge");
const notifDropdown = $("#notifDropdown");
const notifList     = $("#notifList");
const markAllRead   = $("#markAllRead");

/* ──────────────────────────────────────────
   Theme handling
   ────────────────────────────────────────── */
const setDarkMode = () => {
  document.body.classList.replace("light", "dark") || document.body.classList.add("dark");
  document.body.classList.remove("light");
  localStorage.setItem("colorMode", "dark");
};
const setLightMode = () => {
  document.body.classList.replace("dark", "light") || document.body.classList.add("light");
  document.body.classList.remove("dark");
  localStorage.setItem("colorMode", "light");
};
const colorModeFromStorage = () => localStorage.getItem("colorMode");
const colorModeFromPrefs   = () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

function loadTheme() {
  const mode = colorModeFromStorage() || colorModeFromPrefs();
  mode === "dark" ? darkButton.click() : lightButton.click();
}

$$(".toggle__wrapper input").forEach((el) =>
  el.addEventListener("click", () => (darkButton.checked ? setDarkMode() : setLightMode()))
);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) =>
  e.matches ? darkButton.click() : lightButton.click()
);

/* ──────────────────────────────────────────
   Data fetching (simulated network delay)
   ────────────────────────────────────────── */
async function fetchDashboardData() {
  const res = await fetch("./data.json");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ──────────────────────────────────────────
   Animated number counter
   ────────────────────────────────────────── */
function animateCount(el, target, duration = 1200) {
  const start = performance.now();
  const from = 0;
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(from + (target - from) * eased);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ──────────────────────────────────────────
   Render platform follower cards
   ────────────────────────────────────────── */
function renderPlatformCards(platforms) {
  platformCards.innerHTML = "";
  platforms.forEach((p, i) => {
    const dir = p.changeDirection;
    const card = document.createElement("div");
    card.className = `card card--${p.id} fade-in`;
    card.style.animationDelay = `${i * 0.08}s`;
    card.dataset.platform = p.name.toLowerCase();
    card.innerHTML = `
      <div class="card__platform">
        <img class="card__icon" src="${p.icon}" alt="${p.name}" />
        <div class="card__username">${p.username}</div>
      </div>
      <div class="card__followers">
        <div class="card__count card__count--big" data-target="${p.followers}">${p.followersDisplay || "0"}</div>
        <div class="card__label">${p.label}</div>
      </div>
      <div class="card__change card__change--${dir}">
        <img src="./images/icon-${dir}.svg" alt="${dir} arrow" />
        <div class="card__number">${p.changeToday.toLocaleString()} Today</div>
      </div>`;
    platformCards.appendChild(card);
  });

  // Animate big numbers
  platformCards.querySelectorAll("[data-target]").forEach((el) => {
    animateCount(el, parseInt(el.dataset.target, 10));
  });
}

/* ──────────────────────────────────────────
   Render overview cards
   ────────────────────────────────────────── */
function renderOverviewCards(platforms) {
  overviewCards.innerHTML = "";
  let delay = 0;
  platforms.forEach((p) => {
    p.overview.forEach((o) => {
      const card = document.createElement("div");
      card.className = `card card-grid fade-in`;
      card.style.animationDelay = `${delay * 0.06}s`;
      card.dataset.platform = p.name.toLowerCase();
      const dir = o.changeDirection;
      card.innerHTML = `
        <div class="card__subtitle">${o.metric}</div>
        <img src="${p.icon}" alt="${p.name}" />
        <div class="card__count card__count--small" data-target-small="${o.value}">${o.valueDisplay || "0"}</div>
        <div class="card__change card__change--${dir}">
          <img src="./images/icon-${dir}.svg" alt="${dir} arrow" />
          <div class="card__number">${o.changePercent}%</div>
        </div>`;
      overviewCards.appendChild(card);
      delay++;
    });
  });

  overviewCards.querySelectorAll("[data-target-small]").forEach((el) => {
    const target = parseInt(el.dataset.targetSmall, 10);
    if (!isNaN(target) && !el.dataset.targetSmall.includes("k")) {
      animateCount(el, target, 900);
    } else {
      el.textContent = el.dataset.targetSmall;
    }
  });
}

/* ──────────────────────────────────────────
   Render Chart.js trend charts
   ────────────────────────────────────────── */
const chartColors = {
  facebook:  { bg: "rgba(25,143,245,0.15)", border: "#198ff5" },
  instagram: { bg: "rgba(223,73,150,0.15)", border: "#df4996" },
  twitter:   { bg: "rgba(28,160,242,0.15)", border: "#1ca0f2" },
  youtube:   { bg: "rgba(196,3,42,0.15)",   border: "#c4032a" },
};
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let chartInstances = [];

function renderCharts(platforms) {
  chartsGrid.innerHTML = "";
  chartInstances.forEach((c) => c.destroy());
  chartInstances = [];

  platforms.forEach((p, i) => {
    const wrap = document.createElement("div");
    wrap.className = "chart-card fade-in";
    wrap.style.animationDelay = `${i * 0.1}s`;
    wrap.dataset.platform = p.name.toLowerCase();
    wrap.innerHTML = `<h3 class="chart-card__title"><img src="${p.icon}" alt="" width="16" height="16" /> ${p.name}</h3><canvas id="chart-${p.id}"></canvas>`;
    chartsGrid.appendChild(wrap);

    const ctx = wrap.querySelector("canvas").getContext("2d");
    const colors = chartColors[p.id];
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dayLabels,
        datasets: [{
          label: p.label,
          data: p.trend,
          fill: true,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: colors.border,
          tension: 0.35,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#8b97c6", font: { size: 11 } } },
          y: { grid: { color: "rgba(139,151,198,0.12)" }, ticks: { color: "#8b97c6", font: { size: 11 } } },
        },
        animation: { duration: 1200, easing: "easeOutQuart" },
      },
    });
    chartInstances.push(chart);
  });
}

/* ──────────────────────────────────────────
   Notifications
   ────────────────────────────────────────── */
let notifications = [];

function renderNotifications(notifs) {
  notifications = notifs;
  const unread = notifications.filter((n) => !n.read).length;
  notifBadge.textContent = unread;
  notifBadge.classList.toggle("hidden", unread === 0);

  notifList.innerHTML = "";
  notifications.forEach((n, i) => {
    const li = document.createElement("li");
    li.className = `notifications__item ${n.read ? "" : "notifications__item--unread"}`;
    li.innerHTML = `<img src="./images/icon-${n.platform}.svg" alt="" width="16" height="16" />
      <div class="notifications__body">
        <span class="notifications__msg">${n.message}</span>
        <span class="notifications__time">${n.time}</span>
      </div>`;
    notifList.appendChild(li);
  });
}

bellBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const open = notifDropdown.classList.toggle("hidden");
  bellBtn.setAttribute("aria-expanded", !open);
});
document.addEventListener("click", (e) => {
  if (!notifDropdown.classList.contains("hidden") && !e.target.closest("#notificationsWidget")) {
    notifDropdown.classList.add("hidden");
    bellBtn.setAttribute("aria-expanded", "false");
  }
});
markAllRead.addEventListener("click", () => {
  notifications.forEach((n) => (n.read = true));
  renderNotifications(notifications);
});

/* ──────────────────────────────────────────
   Search / Filter
   ────────────────────────────────────────── */
searchInput.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase().trim();
  $$("[data-platform]").forEach((card) => {
    const match = !q || card.dataset.platform.includes(q);
    card.style.display = match ? "" : "none";
  });
});

/* ──────────────────────────────────────────
   Bootstrap
   ────────────────────────────────────────── */
(async function init() {
  loadTheme();
  try {
    const data = await fetchDashboardData();

    // Total followers with animation
    const totalTarget = data.totalFollowers;
    totalEl.textContent = "Total Followers: 0";
    const totalSpan = totalEl;
    const startTime = performance.now();
    const dur = 1400;
    (function countUp(now) {
      const progress = Math.min((now - startTime) / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      totalSpan.textContent = `Total Followers: ${Math.floor(totalTarget * eased).toLocaleString()}`;
      if (progress < 1) requestAnimationFrame(countUp);
    })(startTime);

    renderPlatformCards(data.platforms);
    renderOverviewCards(data.platforms);
    renderCharts(data.platforms);
    renderNotifications(data.notifications);

    // Reveal
    loader.classList.add("hidden");
    app.classList.remove("hidden");
  } catch (err) {
    loader.innerHTML = `<p class="loader__error">Failed to load dashboard data. Please refresh.</p>`;
    console.error(err);
  }
})();
