// portfolio/scripts/site.js — the portfolio's own site island (THE EDITOR chrome behaviors).
// Loaded render-BLOCKING in <head> (composition root) because the startup redirect must run
// before first paint; everything DOM-facing waits for DOMContentLoaded. Persona and product
// choices live HERE, not in grain: grain ships the mechanisms (app-window, status-bar,
// theme.js, ai-dispatch's data-ai-online), this file wires them to TJ's site.
(() => {
  "use strict";
  if (window.tjSite) return;   // idempotent
  window.tjSite = true;

  const KEY = { startup: "tj.welcome-startup", lastPage: "tj.last-page", chat: "tj.chat", term: "tj.terminal" };
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

    // ---- the window nav: back / refresh / forward (VS Code-style, our hover color)
    document.querySelector("[data-window-back]")?.addEventListener("click", () => history.back());
    document.querySelector("[data-window-refresh]")?.addEventListener("click", () => location.reload());
    document.querySelector("[data-window-forward]")?.addEventListener("click", () => history.forward());

    // ---- the breadcrumb (now in the status bar, next to presence) = the open page's path
    const crumb = document.querySelector("[data-breadcrumb]");
    if (crumb) {
      const segs = path === "/" ? ["welcome"] : path.split("/").filter(Boolean);
      crumb.textContent = ["tjakoen.github.io", ...segs].join(" / ");
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

    // ---- persistent chat + terminal across navigation (this is an MPA: each page is a fresh
    // document, so the desk's conversation and its narration would reset on every nav. Restore
    // both from localStorage on load, and save on change — capped so they can't grow unbounded).
    // A `replace` RenderOp swaps a surface NODE (outerHTML), so bind the observer to a STABLE
    // ancestor and re-query the surface each time — otherwise persistence orphans after the first run.
    const persist = (ancestorSel, surface, key, cap) => {
      const root = document.querySelector(ancestorSel);
      if (!root) return null;
      const cur = () => root.querySelector(`[data-surface="${surface}"]`);
      const el0 = cur();
      if (!el0) return null;
      const saved = get(key);
      if (saved != null) el0.innerHTML = saved;
      let t = null;
      const save = () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const el = cur();
          if (!el) return;
          while (el.children.length > cap) el.removeChild(el.firstElementChild);
          put(key, el.innerHTML);
        }, 400);                                   // debounce: type/stream ops mutate rapidly
      };
      new MutationObserver(save).observe(root, { childList: true, subtree: true, characterData: true });
      return el0;
    };
    const chatLog = persist(".app-shell__aside", "chat-log", KEY.chat, 40);
    persist(".app-shell__console", "console", KEY.term, 60);

    // ---- fresh cache: the desk greets in the chat (typed). Only when there's no stored
    // conversation yet; once greeted it's persisted, so return visits restore it instead.
    if (chatLog && get(KEY.chat) == null) {
      const msg = document.createElement("div");
      msg.className = "chat-message"; msg.setAttribute("data-role", "ai"); msg.setAttribute("data-grade", "grain");
      msg.innerHTML = `<span class="chat-message__who">Desk</span><span class="chat-message__body"></span>`;
      chatLog.appendChild(msg);                    // a real .chat-message → the empty-state hides
      const body = msg.querySelector(".chat-message__body");
      const hello = "Hi — I'm the desk. Ask me about TJ, or anything on this site. I'll answer here and think out loud in the terminal.";
      let i = 0;
      const tick = () => {                         // lightweight typewriter (the "type" flourish)
        body.textContent = hello.slice(0, ++i);
        if (i < hello.length) setTimeout(tick, 18);
      };
      tick();
    }
  });
})();
