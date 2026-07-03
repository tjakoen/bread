// portfolio/scripts/surface-demo.js — the /grain "One surface, both operators" showcase demo.
// It lives in portfolio/ (not grain/) because it's SHOWCASE-SPECIFIC — it hardcodes the /grain
// page's layout selectors, so it isn't reusable design-system code. It REUSES grain's own
// mechanisms rather than reimplementing them: the "AI is acting" spotlight (createSpotlight) and
// the typing effect (typeText/typeInput) are imported from grain's shared modules.
//
// The surface is operable by a HUMAN (switch tabs / rail, complete a task, type + Send) AND, on
// "Watch the AI act", by a scripted AI that drives the SAME controls under the spotlight. Native
// ES module; contained to [data-surface-demo] (+ the [data-ai-run] trigger beside it).
import { createSpotlight } from "/scripts/ai-spotlight.js";
import { typeText, typeInput, reducedMotion } from "/scripts/type-effect.js";

(() => {
  const root = document.querySelector("[data-surface-demo]");
  if (!root) return;

  const rm = reducedMotion();
  const sleep = (ms) => new Promise((r) => setTimeout(r, rm ? 0 : ms));

  const rail    = root.querySelector(".surface__rail");
  const compose = root.querySelector(".surface__compose");
  const input   = root.querySelector(".surface__compose .field__input");
  const sendBtn = root.querySelector(".surface__compose .btn");
  const field   = input && input.closest(".field");
  const chatLog = root.querySelector("[data-chat-log]");
  const verbs   = root.querySelector("[data-verbs]");
  const tasks   = root.querySelector("[data-tasks]");
  const aiBtn   = document.querySelector("[data-ai-run]");

  // ---- surface helpers ---------------------------------------------------------
  function addMsg(role) {
    const m = document.createElement("div");
    m.className = "chat-message"; m.setAttribute("data-role", role);
    if (role === "ai") m.setAttribute("data-grade", "grain");   // AI speech stays grain
    const who = document.createElement("span"); who.className = "chat-message__who"; who.textContent = role === "you" ? "You" : "GRAIN";
    const body = document.createElement("span"); body.className = "chat-message__body";
    m.append(who, body); chatLog.append(m); chatLog.scrollTop = chatLog.scrollHeight;
    return body;
  }
  function completeTask(row) {
    if (!row || row.classList.contains("is-done")) return;
    row.classList.add("is-done");
    const badge = row.querySelector(".badge");
    if (badge) { badge.setAttribute("data-status", "archived"); badge.textContent = "done"; }
  }
  // the AI drafts a new task — AI-authored, so the <li> carries data-grade="grain" (stays grain)
  function draftTask() {
    const li = document.createElement("li");
    li.className = "list__item"; li.setAttribute("data-grade", "grain");
    const label = document.createElement("span"); label.className = "task-label";
    const badge = document.createElement("span"); badge.className = "badge"; badge.setAttribute("data-status", "active"); badge.textContent = "new";
    li.append(label, document.createTextNode(" "), badge);
    tasks && tasks.append(li);
    return label;
  }
  function setVerb(name) {
    verbs && verbs.querySelectorAll("action-badge").forEach((b) =>
      b.getAttribute("verb") === name ? b.setAttribute("status", "active") : b.removeAttribute("status"));
  }

  // ---- HUMAN interactivity (delegated) -----------------------------------------
  root.addEventListener("click", (e) => {
    const choice = e.target.closest(".tab-bar .tab, .surface__rail .nav-item");
    if (choice) {
      e.preventDefault();
      choice.closest(".tab-bar, .surface__rail").querySelectorAll("[aria-current]").forEach((a) => a.removeAttribute("aria-current"));
      choice.setAttribute("aria-current", "page");
      return;
    }
    const done = e.target.closest(".icon-btn");
    if (done) completeTask(done.closest(".list__item"));   // your committed action → clean
  });

  async function humanSend() {
    const val = input.value.trim();
    if (!val || running) return;
    input.value = "";
    addMsg("you").textContent = val;                       // your words, clean
    await typeText(addMsg("ai"), "On it — I'll get started on that.");   // AI reply, grain
  }
  sendBtn && sendBtn.addEventListener("click", humanSend);
  input && input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); humanSend(); } });

  // ---- AI mode: the same controls, driven under grain's shared spotlight -------
  // Control lifecycle (AI-INTERFACE §5, same as ai-dispatch's pendingTriggers): a control the AI
  // operates enters data-commit="pending" (dashed edge + caret, non-interactive) the moment it's
  // used and HOLDS it until that action's output is done, then releases. The trigger holds for the
  // whole run; each sub-control for its own action.
  let running = false, token = 0;
  const pend = (el) => el && el.setAttribute("data-commit", "pending");
  const settle = (el) => el && el.removeAttribute("data-commit");
  // release everything the run may have left pending (root is scoped; the trigger sits outside it)
  function clearPending() {
    root.querySelectorAll('[data-commit="pending"]').forEach((el) => el.removeAttribute("data-commit"));
    settle(aiBtn);
  }
  function stop() { token++; running = false; spotlight.off(); setVerb(null); clearPending(); }

  const spotlight = createSpotlight({ onInterrupt: stop });   // reuse grain's spotlight, don't reinvent

  async function aiRun() {
    if (running) return;
    running = true; const my = ++token;
    const spot = !rm;
    pend(aiBtn);                                   // the trigger enters AI mode — HELD for the whole run
    if (spot) spotlight.on("GRAIN is working");
    const live = () => my === token;
    try {
      setVerb("reads");
      if (spot) spotlight.move(rail); await sleep(650); if (!live()) return;

      // types into the Ask field — grain while in transit
      setVerb("types");
      if (spot) spotlight.move(compose); await sleep(350);
      pend(field);
      await typeInput(input, "Plan Thursday around the review"); if (!live()) return;
      await sleep(300);
      // presses Send: the button HOLDS AI mode until its OUTPUT — the reply — is done, then releases
      if (spot) spotlight.move(sendBtn);
      pend(sendBtn);
      if (spot) { await sleep(300); spotlight.pulse(sendBtn); await sleep(200); }
      settle(field); input.value = "";
      await typeText(addMsg("ai"), "On it — three deep-work blocks, review at 2."); if (!live()) return;
      settle(sendBtn);                             // output committed → Send back to human state
      await sleep(300);

      // completes a task: the check HOLDS AI mode until the task flips to done
      setVerb("commits");
      const row = tasks && tasks.querySelector(".list__item:not(.is-done)");
      const check = row && row.querySelector(".icon-btn");
      if (spot) spotlight.move(row);
      pend(check);
      if (spot) { await sleep(300); spotlight.pulse(check || row); await sleep(200); }
      completeTask(row); settle(check); if (!live()) return;
      await sleep(500);

      // drafts a new task of its own (AI-authored → stays grain)
      setVerb("types");
      if (spot) spotlight.move(tasks); await sleep(300);
      await typeText(draftTask(), "Block 9–11am for deep work"); if (!live()) return;
      await sleep(600);
    } finally {
      if (my === token) { setVerb(null); if (spot) spotlight.off(); clearPending(); running = false; }
    }
  }
  // click runs it; while running the trigger is pending (non-interactive), so it can't re-enter.
  // No bespoke "Stop" — clicking the veil quietly ends the run (matches "no need to interrupt").
  aiBtn && aiBtn.addEventListener("click", aiRun);
})();
