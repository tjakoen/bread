// portfolio/scripts/site.js — the portfolio's own site island (THE EDITOR chrome behaviors).
// Loaded render-BLOCKING in <head> (composition root) because the startup redirect must run
// before first paint; everything DOM-facing waits for DOMContentLoaded. Persona and product
// choices live HERE, not in grain: grain ships the mechanisms (app-window, status-bar,
// theme.js, ai-dispatch's data-ai-online), this file wires them to TJ's site.
(() => {
  "use strict";
  if (window.tjSite) return;   // idempotent
  window.tjSite = true;

  const KEY = { startup: "tj.welcome-startup", lastPage: "tj.last-page", stars: "tj.repo-stars" };
  const store = (() => { try { return window.localStorage; } catch { return null; } })();
  const get = (k) => { try { return store && store.getItem(k); } catch { return null; } };
  const put = (k, v) => { try { if (store) store.setItem(k, v); } catch { /* private mode */ } };

  // ---- startup redirect (BEFORE paint): "/" honors the welcome checkbox — unchecked means
  // the desk opens straight to where you last were (falling back to the workspace).
  const path = location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/" && get(KEY.startup) === "off") {
    const last = get(KEY.lastPage);
    location.replace(last && last !== "/" ? last : "/dashboard");
    return;                                          // stop — this page is being left
  }

  document.addEventListener("DOMContentLoaded", () => {
    // ---- remember the open page (the "reopen where you left off" cache)
    if (path !== "/") put(KEY.lastPage, path);

    // ---- the window dots: close / clear cached data / back
    document.querySelector("[data-window-close]")?.addEventListener("click", () => {
      window.close();                                // scripted-open windows close; others no-op
    });
    document.querySelector("[data-window-clear]")?.addEventListener("click", () => {
      try { localStorage.clear(); sessionStorage.clear(); } catch { /* ignore */ }
      location.reload();
    });
    document.querySelector("[data-window-back]")?.addEventListener("click", () => history.back());

    // ---- the ⌘K search field's placeholder = the open page's breadcrumb
    const crumb = document.querySelector("[data-breadcrumb]");
    if (crumb) {
      const segs = path === "/" ? ["welcome"] : path.split("/").filter(Boolean);
      crumb.textContent = ["tjakoen.github.io", ...segs].join(" › ");
    }

    // ---- the welcome checkbox (functional): checked = land on the welcome page
    const startup = document.querySelector("[data-startup-checkbox]");
    if (startup) {
      startup.checked = get(KEY.startup) !== "off";
      startup.addEventListener("change", () => put(KEY.startup, startup.checked ? "on" : "off"));
    }

    // ---- offline degradation: if the door never came up (body[data-ai-online="false"], set
    // by ai-dispatch by OUTCOME), the chat composer disables honestly instead of pretending.
    const composer = document.querySelectorAll(".assistant__composer input, .assistant__composer button");
    const applyPresence = () => {
      const off = document.body.dataset.aiOnline === "false";
      for (const el of composer) {
        el.disabled = off;
        if (off && el.matches("input")) el.placeholder = "The desk is offline";
      }
    };
    new MutationObserver(applyPresence).observe(document.body, { attributes: true, attributeFilter: ["data-ai-online"] });
    applyPresence();

    // ---- repo stars (status bar): GitHub API, cached a day, hidden if unreachable
    const starsEl = document.querySelector("[data-github-stars]");
    if (starsEl) {
      const repo = starsEl.getAttribute("data-github-stars");
      const show = (n) => { starsEl.querySelector("[data-stars-count]").textContent = String(n); starsEl.hidden = false; };
      const cached = (() => { try { return JSON.parse(get(KEY.stars) || "null"); } catch { return null; } })();
      if (cached && Date.now() - cached.t < 864e5) show(cached.n);
      else fetch(`https://api.github.com/repos/${repo}`)
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((j) => { put(KEY.stars, JSON.stringify({ n: j.stargazers_count, t: Date.now() })); show(j.stargazers_count); })
        .catch(() => { /* stays hidden — never show a fake count */ });
    }
  });
})();
