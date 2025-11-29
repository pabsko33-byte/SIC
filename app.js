// Détection de page via data-page sur le <body>
const page = document.body.dataset.page || "";

/* --- ANIMATION REVEAL --- */
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

/* --- NAV ACTIVE --- */
document.querySelectorAll(".nav-link").forEach((link) => {
  if (link.href && link.href === window.location.href) {
    link.classList.add("active");
  }
});

/* =============== PAGE ACCUEIL =============== */
if (page === "home") {
  const chart = document.getElementById("home-mini-chart");
  if (chart) {
    const values = [100, 104, 102, 108, 112, 118, 125];
    const max = Math.max(...values);
    values.forEach((v) => {
      const bar = document.createElement("div");
      bar.className = "small-chart-bar";
      const ratio = v / max;
      bar.style.height = `${10 + ratio * 90}%`;
      chart.appendChild(bar);
    });
  }
}

/* =============== PAGE SIMULATION =============== */
if (page === "simulation") {
  const form = document.getElementById("sim-form");
  const pessEl = document.getElementById("scenario-pess");
  const baseEl = document.getElementById("scenario-base");
  const optEl = document.getElementById("scenario-opt");
  const chartEl = document.getElementById("sim-chart");

  function computeScenario(capitalInit, versementMensuel, annees, tauxAnnuel) {
    const mois = annees * 12;
    const tauxMensuel = tauxAnnuel / 100 / 12;
    let capital = capitalInit;
    let totalVerse = capitalInit;

    const points = [];
    const step = Math.max(1, Math.floor(mois / 24)); // ~24 points max

    for (let m = 1; m <= mois; m++) {
      capital = capital * (1 + tauxMensuel) + versementMensuel;
      totalVerse += versementMensuel;
      if (m % step === 0 || m === mois) {
        points.push(capital);
      }
    }

    return {
      final: capital,
      verse: totalVerse,
      perf: capital - totalVerse,
      points
    };
  }

  function renderScenario(elem, data) {
    elem.querySelector(".final").textContent = formatCurrency(data.final);
    elem.querySelector(".verse").textContent = formatCurrency(data.verse);
    elem.querySelector(".perf").textContent = formatCurrency(data.perf);
  }

  function formatCurrency(v) {
    return v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €";
  }

  function renderChart(seriesP, seriesB, seriesO) {
    chartEl.innerHTML = "";
    const max = Math.max(...seriesP, ...seriesB, ...seriesO);

    const len = seriesB.length;
    for (let i = 0; i < len; i++) {
      const bar = document.createElement("div");
      bar.className = "sim-chart-bar";
      const val = seriesB[i];
      const ratio = val / max;
      bar.style.height = `${10 + ratio * 90}%`;
      chartEl.appendChild(bar);
    }
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const capital = Number(form.elements["capital"].value || 0);
      const mensuel = Number(form.elements["mensuel"].value || 0);
      const annees = Number(form.elements["annees"].value || 0);
      const taux = Number(form.elements["taux"].value || 0);

      if (!annees || (!capital && !mensuel)) return;

      const svalP = taux - 2;
      const svalB = taux;
      const svalO = taux + 2;

      const pess = computeScenario(capital, mensuel, annees, svalP);
      const base = computeScenario(capital, mensuel, annees, svalB);
      const opt = computeScenario(capital, mensuel, annees, svalO);

      renderScenario(pessEl, pess);
      renderScenario(baseEl, base);
      renderScenario(optEl, opt);
      renderChart(pess.points, base.points, opt.points);
    });
  }
}

/* =============== PAGE MARCHES & NEWS =============== */
if (page === "markets") {
  const ASSETS = [
    {
      id: "sp500",
      name: "S&P 500",
      label: "Large cap US",
      ticker: "^GSPC",
      value: 5098.4,
      change: -0.27,
      type: "equity",
      tags: ["US", "Large cap", "Indice de référence"],
      comment:
        "Indice actions large US, souvent au cœur d’une poche ETF diversifiée.",
      series: [100, 99, 101, 102, 103, 101, 104, 105]
    },
    {
      id: "cac40",
      name: "CAC 40",
      label: "Actions France",
      ticker: "^FCHI",
      value: 7420.2,
      change: 0.32,
      type: "equity",
      tags: ["France", "Indice domestique"],
      comment:
        "Indice actions français, utilisé pour relier les annonces économiques locales au marché.",
      series: [95, 96, 94, 97, 98, 99, 100, 101]
    },
    {
      id: "msciworld",
      name: "MSCI World",
      label: "ETF monde développé",
      ticker: "URTH",
      value: 3220.7,
      change: 0.18,
      type: "equity",
      tags: ["Monde développé", "ETF long terme"],
      comment:
        "Indice monde développé, utilisé comme base de portefeuille long terme.",
      series: [90, 91, 92, 93, 94, 95, 96, 97]
    },
    {
      id: "bitcoin",
      name: "Bitcoin",
      label: "Crypto labo",
      ticker: "BTC",
      value: 68440,
      change: 1.25,
      type: "crypto",
      tags: ["Crypto", "Volatilité forte"],
      comment:
        "Traitée comme poche expérimentale, avec un poids limité dans une allocation globale.",
      series: [100, 103, 98, 105, 110, 108, 112, 115]
    },
    {
      id: "ethereum",
      name: "Ethereum",
      label: "Smart contracts",
      ticker: "ETH",
      value: 3905,
      change: -0.8,
      type: "crypto",
      tags: ["Crypto", "Réseau"],
      comment:
        "Actif lié à un réseau de contrats intelligents. Analyse centrée sur la technologie et le risque.",
      series: [95, 97, 96, 98, 97, 99, 101, 100]
    }
  ];

  const NEWS = [
    {
      title: "Annonce de politique monétaire d’une banque centrale",
      source: "Source macro",
      date: "Aujourd’hui",
      category: "Banques centrales",
      summary:
        "Décision de taux et commentaire sur l’inflation, à relier à la courbe des taux et aux indices."
    },
    {
      title: "Publication de résultats d’un grand indice",
      source: "Marchés actions",
      date: "Cette semaine",
      category: "Actions",
      summary:
        "Point sur les bénéfices agrégés, impact potentiel sur les valorisations et les multiples."
    },
    {
      title: "Signal sur l’immobilier et le crédit",
      source: "Économie / immobilier",
      date: "Récemment",
      category: "Immobilier",
      summary:
        "Données sur le crédit, les volumes de transaction et les prix, à mettre en perspective avec les taux."
    }
  ];

  const tableEl = document.getElementById("markets-table");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const chartTitleEl = document.getElementById("chart-title");
  const chartTickerEl = document.getElementById("chart-ticker");
  const chartCanvasEl = document.getElementById("chart-canvas");
  const chartCommentEl = document.getElementById("chart-comment");
  const chartTagsEl = document.getElementById("chart-tags");
  const newsListEl = document.getElementById("news-list");

  let currentFilter = "all";
  let currentAssetId = null;

  function formatNumber(n) {
    if (n >= 1000) {
      return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    return n.toFixed(2);
  }

  function formatChange(pct) {
    const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
    return `${sign}${Math.abs(pct).toFixed(2)}%`;
  }

  function renderTable() {
    tableEl.innerHTML = "";
    ASSETS.filter((a) => currentFilter === "all" || a.type === currentFilter).forEach((asset) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "table-row";
      row.dataset.assetId = asset.id;
      row.innerHTML = `
        <div>
          <span class="table-name-main">${asset.name}</span>
          <span class="table-name-sub">${asset.label}</span>
        </div>
        <div class="table-value">${formatNumber(asset.value)}</div>
        <div class="table-change ${asset.change >= 0 ? "pos" : "neg"}">
          ${formatChange(asset.change)}
        </div>
      `;
      row.addEventListener("click", () => selectAsset(asset.id));
      tableEl.appendChild(row);
    });
  }

  function renderChart(asset) {
    chartTitleEl.textContent = asset.name;
    chartTickerEl.textContent = asset.ticker;
    chartCommentEl.textContent = asset.comment;

    chartTagsEl.innerHTML = "";
    asset.tags.forEach((t) => {
      const tag = document.createElement("span");
      tag.className = "chart-tag";
      tag.textContent = t;
      chartTagsEl.appendChild(tag);
    });

    chartCanvasEl.innerHTML = "";
    const max = Math.max(...asset.series);
    asset.series.forEach((v) => {
      const bar = document.createElement("div");
      bar.className = "chart-bar";
      const ratio = v / max;
      bar.style.transform = `scaleY(${Math.max(0.15, ratio)})`;
      chartCanvasEl.appendChild(bar);
    });
  }

  function selectAsset(id) {
    const asset = ASSETS.find((a) => a.id === id);
    if (!asset) return;
    currentAssetId = id;
    renderChart(asset);
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter || "all";
      renderTable();
      if (currentAssetId) {
        const stillVisible = ASSETS.some(
          (a) =>
            a.id === currentAssetId && (currentFilter === "all" || a.type === currentFilter)
        );
        if (!stillVisible) {
          chartTitleEl.textContent = "Sélectionne un actif";
          chartTickerEl.textContent = "";
          chartCommentEl.textContent =
            "Clique sur un actif de la liste pour afficher une trajectoire simulée.";
          chartCanvasEl.innerHTML = "";
          chartTagsEl.innerHTML = "";
          currentAssetId = null;
        }
      }
    });
  });

  function renderNews() {
    if (!newsListEl) return;
    newsListEl.innerHTML = "";
    NEWS.forEach((n) => {
      const item = document.createElement("article");
      item.className = "news-item";
      item.innerHTML = `
        <div class="news-meta">${n.category} • ${n.source} • ${n.date}</div>
        <strong>${n.title}</strong>
        <p>${n.summary}</p>
      `;
      newsListEl.appendChild(item);
    });
  }

  renderTable();
  renderNews();
  const defaultAsset = ASSETS.find((a) => a.id === "sp500") || ASSETS[0];
  if (defaultAsset) {
    selectAsset(defaultAsset.id);
  }

  // NOTE: pour plus tard, remplacer les données ASSETS/NEWS
  // par des réponses d'API marchés / API news.
}

/* =============== PAGE CHAT / ASSISTANT =============== */
if (page === "chat") {
  const chatLogEl = document.getElementById("chat-log");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const faqAnswerEl = document.getElementById("faq-answer");
  const faqChips = document.querySelectorAll(".faq-chip");

  function addMessage(text, from = "bot") {
    const msg = document.createElement("div");
    msg.className = `chat-message ${from}`;
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.innerHTML = text;
    msg.appendChild(bubble);
    chatLogEl.appendChild(msg);
    chatLogEl.scrollTop = chatLogEl.scrollHeight;
  }

  function answerForQuestion(q) {
    const txt = q.toLowerCase();

    if (txt.includes("livret") || txt.includes("pel")) {
      return `
        <strong>Lecture SIC Alpha – Livret vs ETF :</strong><br/>
        • Le livret reste une poche de sécurité liquide, horizon très court.<br/>
        • Un ETF actions s’inscrit dans un horizon long, avec une valeur qui fluctue.<br/>
        • On ne remplace pas l’un par l’autre : on définit d’abord la sécurité, puis la part exposée aux marchés.
      `;
    }

    if (txt.includes("crypto")) {
      return `
        <strong>Lecture SIC Alpha – Crypto :</strong><br/>
        • Classe d’actifs très volatile, à traiter comme poche expérimentale limitée.<br/>
        • Elle arrive après le cash de précaution et une base d’ETF diversifiés bien comprise.<br/>
        • L’enjeu principal est la gestion du risque, pas la recherche de coups rapides.
      `;
    }

    if (txt.includes("risque") || txt.includes("perdre")) {
      return `
        <strong>Lecture SIC Alpha – Risque :</strong><br/>
        • On commence par définir ce que tu ne veux pas perdre (épargne de sécurité).<br/>
        • La part investissable doit accepter des fluctuations temporaires.<br/>
        • On parle en pourcentage de baisse acceptable et en horizon de temps.
      `;
    }

    if (txt.includes("horizon") || txt.includes("long terme") || txt.includes("court terme")) {
      return `
        <strong>Lecture SIC Alpha – Horizon :</strong><br/>
        • Court terme (&lt; 3 ans) : priorité à la liquidité, peu ou pas d’exposition actions.<br/>
        • Moyen terme (3–7 ans) : exposition graduelle, diversifiée, calibrée.<br/>
        • Long terme (10 ans et plus) : les indices larges et ETF monde prennent tout leur sens.
      `;
    }

    if (txt.includes("etf")) {
      return `
        <strong>Lecture SIC Alpha – ETF :</strong><br/>
        • Un ETF réplique un indice (par exemple MSCI World, S&amp;P 500).<br/>
        • Il apporte diversification et transparence de la stratégie suivie.<br/>
        • La question clé n’est pas un ETF isolé, mais la construction d’ensemble du portefeuille.
      `;
    }

    return `
      <strong>Lecture SIC Alpha :</strong><br/>
      Ta question touche à plusieurs briques (sécurité, horizon, risque, diversification).<br/>
      En club, on la décomposerait en étapes avant de parler d’allocation.<br/>
      Tu peux la reformuler en choisissant un mot-clé : livret, ETF, crypto, risque ou horizon.
    `;
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = chatInput.value.trim();
      if (!value) return;
      addMessage(value, "user");
      chatInput.value = "";

      // Ici, plus tard : appel à une API IA
      // sendToChatbotAPI(value).then(resp => addMessage(resp, "bot"));
      const resp = answerForQuestion(value);
      setTimeout(() => addMessage(resp, "bot"), 200);
    });
  }

  const FAQ_RESPONSES = {
    livret: `
      <strong>Livret vs ETF :</strong><br/>
      • Deux outils complémentaires plutôt que concurrents.<br/>
      • Le livret assure la trésorerie, l’ETF expose au marché sur une durée plus longue.<br/>
      • On clarifie d’abord le rôle de chaque poche avant de parler rendement.
    `,
    risque: `
      <strong>Gérer le risque :</strong><br/>
      • Le point de départ est l’épargne de sécurité.<br/>
      • Le reste peut être exposé aux marchés dans des proportions assumées.<br/>
      • L’idée est de comprendre les scénarios possibles, pas de les annuler.
    `,
    crypto: `
      <strong>Place de la crypto :</strong><br/>
      • Poche limitée, explicitement acceptée comme volatile.<br/>
      • Elle vient après un socle plus stable (livret, ETF diversifié).<br/>
      • Le club la traite comme sujet d’étude, pas comme solution.
    `,
    horizon: `
      <strong>Horizon :</strong><br/>
      • Toute décision d’investissement commence par cette question.<br/>
      • Plus l’horizon est long, plus les marchés actions peuvent avoir leur place.<br/>
      • L’horizon conditionne le choix des outils.
    `,
    etf: `
      <strong>ETF monde :</strong><br/>
      • Réplique un panier large d’actions de plusieurs pays.<br/>
      • Sert souvent de base pour une stratégie de long terme.<br/>
      • Au club, c’est l’un des premiers objets d’analyse.
    `
  };

  faqChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const key = chip.dataset.faq;
      faqAnswerEl.innerHTML = FAQ_RESPONSES[key] || "";
    });
  });

  // NOTE : l’architecture est prête pour brancher une API IA :
  // créer une fonction sendToChatbotAPI(question) côté backend
  // et l’appeler dans answerForQuestion / submit.
}

/* =============== PAGE WORKSHOPS =============== */
if (page === "workshops") {
  const WORKSHOPS = [
    {
      tag: "Marchés",
      title: "Lire une journée de marché",
      text: "Relier indices, annonces macro et mouvements de prix sur une séance type."
    },
    {
      tag: "Allocation",
      title: "Construire une base ETF + cash",
      text: "Étude de cas pour un profil étudiant, avec scénarios et tolérance au risque."
    },
    {
      tag: "Macro",
      title: "Décoder une conférence de presse de banque centrale",
      text: "Analyser un communiqué, ses nuances, et l’impact possible sur les marchés."
    },
    {
      tag: "Crypto labo",
      title: "Crypto : laboratoire de volatilité",
      text: "Cartographier les risques sans la présenter comme un raccourci de performance."
    }
  ];

  const container = document.getElementById("workshop-list");
  if (container) {
    WORKSHOPS.forEach((w) => {
      const card = document.createElement("article");
      card.className = "workshop-card";
      card.innerHTML = `
        <div>
          <p class="workshop-tag">${w.tag}</p>
          <p class="workshop-title">${w.title}</p>
          <p class="workshop-text">${w.text}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }
}
