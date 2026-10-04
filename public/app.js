const $ = (s) => document.querySelector(s);

let state = {
  games: [],
  providers: [],
  sessions: [],
  ledger: [],
  rounds: [],
  balance: 10000
};

async function api(path, opts = {}) {
  const r = await fetch(path, opts);
  const data = await r.json().catch(() => ({}));

  if (!r.ok) {
    throw new Error(data.error || `HTTP ${r.status}`);
  }

  return data;
}

function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function money(v) {
  const n = Number(v || 0);
  return n.toFixed(2);
}

function toast(msg) {
  const el = $("#toast");
  if (!el) return;

  el.textContent = msg;
  el.style.display = "block";

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.style.display = "none";
  }, 3500);
}

function showTab(id) {
  document.querySelectorAll("main > section.tab").forEach(section => {
    section.classList.remove("active");
    section.style.display = "none";
  });

  document.querySelectorAll(".main-nav button").forEach(button => {
    button.classList.remove("active");

    if (button.dataset.tab === id) {
      button.classList.add("active");
    }
  });

  const target = document.getElementById(id);

  if (!target) {
    console.error("Missing tab:", id);
    toast("Page is not available.");
    return;
  }

  target.classList.add("active");
  target.style.display = "block";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {

  const balance = Number(state.balance || 0);

  const balanceEl = $("#balance");
  const walletBalanceEl = $("#walletBalance");

  if (balanceEl) {
    balanceEl.textContent = `${money(balance)} ETB`;
  }

  if (walletBalanceEl) {
    walletBalanceEl.textContent = `${money(balance)} ETB`;
  }

  const query = ($("#search")?.value || "").toLowerCase().trim();

  const gamesEl = $("#games");

  if (gamesEl) {

    const games = state.games.filter(g => {
      const text = [
        g.name,
        g.category,
        g.provider,
        g.status
      ].join(" ").toLowerCase();

      return !query || text.includes(query);
    });

    if (!games.length) {
      gamesEl.innerHTML = `
        <div class="provider">
          <h3>No games found</h3>
          <p>Try another search.</p>
        </div>
      `;
    } else {

      gamesEl.innerHTML = games.map(g => `
        <article class="game">

          <div class="cover">${esc(g.icon || "🎮")}</div>

          <div class="game-body">

            <h3>${esc(g.name)}</h3>

            <div class="meta">
              <span class="tag">${esc((g.provider || "local").toUpperCase())}</span>
              <span class="tag">${esc(g.category || "Game")}</span>
              <span class="tag">${esc(g.status || "")}</span>
            </div>

            <button
              class="launch"
              data-game-id="${esc(g.id)}">
              Open Game
            </button>

          </div>

        </article>
      `).join("");
    }
  }

  const providersEl = $("#providersList");

  if (providersEl) {

    providersEl.innerHTML = state.providers.length
      ? state.providers.map(p => `
        <div class="provider">
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.status || "")} · ${Number(p.game_count || 0)} game(s)</p>
        </div>
      `).join("")
      : `<div class="provider"><p>No providers yet.</p></div>`;
  }

  const sessionsEl = $("#sessionsList");

  if (sessionsEl) {

    sessionsEl.innerHTML = state.sessions.length
      ? state.sessions.map(x => `
        <div class="row">
          <strong>${esc(x.game_name || x.game_id || "Game")}</strong>
          <span>${esc(x.status || "session")}</span>
        </div>
      `).join("")
      : `<div class="provider"><p>No sessions yet.</p></div>`;
  }

  const ledgerEl = $("#ledgerList");

  if (ledgerEl) {

    ledgerEl.innerHTML = state.ledger.length
      ? state.ledger.map(x => `
        <div class="row">
          <strong>${esc(x.kind || x.type || "Transaction")}</strong>
          <span>${money(x.amount)} ETB</span>
        </div>
      `).join("")
      : `<div class="provider"><p>No ledger entries.</p></div>`;
  }

  const roundsEl = $("#roundsList");

  if (roundsEl) {

    roundsEl.innerHTML = state.rounds.length
      ? state.rounds.map(x => `
        <div class="row">
          <strong>${esc(x.game_id || "Game")}</strong>
          <span>${esc(x.state || x.status || "Recorded")}</span>
        </div>
      `).join("")
      : `<div class="provider"><p>No rounds yet.</p></div>`;
  }
}

async function load() {

  try {

    const data = await api("/api/bootstrap");

    state.games = Array.isArray(data.games) ? data.games : [];
    state.providers = Array.isArray(data.providers) ? data.providers : [];
    state.sessions = Array.isArray(data.sessions) ? data.sessions : [];
    state.ledger = Array.isArray(data.ledger) ? data.ledger : [];
    state.rounds = Array.isArray(data.rounds) ? data.rounds : [];

    if (typeof data.balance === "number") {
      state.balance = data.balance;
    }

    render();

  } catch (e) {

    console.error(e);
    toast(e.message || "Unable to load BINIYAM.");
  }
}

async function launch(id) {

  try {

    const game = state.games.find(g => g.id === id);

    if (!game) {
      throw new Error("Game not found.");
    }

    if (game.provider && game.provider !== "biniyam-local") {

      const out = await api("/api/provider-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          game_id: id
        })
      });

      const url = out?.session?.launch_url;

      if (!url || !/^https?:\/\//i.test(url)) {
        throw new Error("Provider did not return a valid launch URL.");
      }

      window.location.assign(url);
      return;
    }

    const out = await api("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        game_id: id
      })
    });

    const session = out?.session;

    if (!session?.launch_url) {
      throw new Error("Local provider did not return a launch URL.");
    }

    window.location.assign(session.launch_url);

  } catch (e) {

    console.error(e);
    toast(e.message || "Unable to open game.");
  }
}

document.addEventListener("change", async (event) => {
  if (event.target.id !== "depositMethod") {
    return;
  }

  const method = event.target.value;
  const box = $("#depositDestination");
  const account = $("#depositAccount");
  const name = $("#depositAccountName");

  if (!method) {
    if (box) box.style.display = "none";
    return;
  }

  try {
    const response = await fetch("/api/deposit-info");
    if (!response.ok) throw new Error("Failed to load payment details");

    const data = await response.json();
    const details = data[method];

    if (!details || !details.account) {
      toast("Payment details are not available.");
      if (box) box.style.display = "none";
      return;
    }

    if (account) account.textContent = details.account;
    if (name) name.textContent = details.name || "—";
    if (box) box.style.display = "block";
  } catch (error) {
    console.error("Deposit info error:", error);
    toast("Could not load payment details.");
  }
});

document.addEventListener("click", async (event) => {
  if (event.target.id === "copyDepositAccount") {
    const account = $("#depositAccount")?.textContent?.trim();

    if (!account || account === "—") {
      toast("Select a payment method first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(account);
      toast("Account number copied.");
    } catch (error) {
      toast("Copy failed. Please copy the account manually.");
    }
    return;
  }
});

document.addEventListener("click", (event) => {

  const nav = event.target.closest("[data-tab]");

  if (nav) {
    event.preventDefault();
    showTab(nav.dataset.tab);
    return;
  }

  const launchButton = event.target.closest(".launch");

  if (launchButton) {
    launch(launchButton.dataset.gameId);
  }

});

document.addEventListener("input", (event) => {

  if (event.target.id === "search") {
    render();
  }

});

document.addEventListener("click", (event) => {

  if (event.target.id !== "depositSubmit") {
    return;
  }

  const method = $("#depositMethod")?.value;
  const amount = Number($("#depositAmount")?.value || 0);
  const reference = $("#depositReference")?.value.trim();
  const note = $("#depositNote")?.value.trim();

  if (!method || amount <= 0 || !reference) {
    toast("Please complete the payment method, amount and reference.");
    return;
  }

  try {
    const response = await fetch("/api/deposit-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        method,
        amount,
        reference,
        note
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to submit deposit request");
    }

    toast(`Deposit request ${data.request.id} submitted for verification.`);

    $("#depositAmount").value = "";
    $("#depositReference").value = "";
    $("#depositNote").value = "";

  } catch (error) {
    console.error("Deposit request error:", error);
    toast(error.message || "Could not submit deposit request.");
  }
});

load();
