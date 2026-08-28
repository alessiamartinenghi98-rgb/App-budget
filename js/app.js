(function () {
  "use strict";

  var STORAGE_KEY = "expenses";

  var CATEGORIES = {
    cibo: { label: "Cibo", icon: "🍔", color: "#ff9f43" },
    trasporti: { label: "Trasporti", icon: "🚌", color: "#4b9cf5" },
    casa: { label: "Casa", icon: "🏠", color: "#34b978" },
    svago: { label: "Svago", icon: "🎉", color: "#b967f0" },
    altro: { label: "Altro", icon: "📦", color: "#8a90a6" }
  };

  var currencyFormatter = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  });

  // ---------- Storage ----------

  function loadExpenses() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }

  var expenses = loadExpenses();

  // ---------- Helpers ----------

  function formatAmount(value) {
    return currencyFormatter.format(value);
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function monthKey(dateStr) {
    return dateStr.slice(0, 7); // YYYY-MM
  }

  function monthLabel(key) {
    var parts = key.split("-");
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    var label = d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function categoryInfo(key) {
    return CATEGORIES[key] || CATEGORIES.altro;
  }

  function todayISO() {
    var d = new Date();
    var offset = d.getTimezoneOffset();
    var local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 10);
  }

  // ---------- Rendering: list ----------

  function renderList() {
    var listEl = document.getElementById("expense-list");
    var emptyEl = document.getElementById("empty-state");
    var countEl = document.getElementById("list-count");

    var sorted = expenses.slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.createdAt - a.createdAt;
    });

    listEl.innerHTML = "";

    if (sorted.length === 0) {
      emptyEl.classList.add("visible");
      countEl.textContent = "";
      return;
    }
    emptyEl.classList.remove("visible");
    countEl.textContent = sorted.length + (sorted.length === 1 ? " voce" : " voci");

    sorted.forEach(function (exp) {
      var cat = categoryInfo(exp.category);
      var li = document.createElement("li");
      li.className = "expense-item";
      li.innerHTML =
        '<div class="expense-cat-icon" style="background:' + cat.color + '22">' + cat.icon + "</div>" +
        '<div class="expense-info">' +
          '<div class="expense-category">' + cat.label + "</div>" +
          (exp.note ? '<div class="expense-note">' + escapeHtml(exp.note) + "</div>" : "") +
          '<div class="expense-date">' + formatDate(exp.date) + "</div>" +
        "</div>" +
        '<div class="expense-amount">' + formatAmount(exp.amount) + "</div>" +
        '<button class="expense-delete" data-id="' + exp.id + '" aria-label="Elimina spesa">✕</button>';
      listEl.appendChild(li);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Rendering: totals per category ----------

  function populateCategoryMonthFilter() {
    var select = document.getElementById("category-month-filter");
    var previousValue = select.value;

    var monthsSet = {};
    expenses.forEach(function (exp) {
      monthsSet[monthKey(exp.date)] = true;
    });
    var months = Object.keys(monthsSet).sort().reverse();

    select.innerHTML = "";
    var allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = "Tutti i mesi";
    select.appendChild(allOpt);

    months.forEach(function (m) {
      var opt = document.createElement("option");
      opt.value = m;
      opt.textContent = monthLabel(m);
      select.appendChild(opt);
    });

    if (previousValue && (previousValue === "all" || months.indexOf(previousValue) !== -1)) {
      select.value = previousValue;
    } else if (months.indexOf(monthKey(todayISO())) !== -1) {
      select.value = monthKey(todayISO());
    } else {
      select.value = "all";
    }
  }

  function renderCategoryTotals() {
    var select = document.getElementById("category-month-filter");
    var filterValue = select.value;

    var filtered = expenses.filter(function (exp) {
      return filterValue === "all" || monthKey(exp.date) === filterValue;
    });

    var totals = {};
    var grandTotal = 0;
    filtered.forEach(function (exp) {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
      grandTotal += exp.amount;
    });

    var listEl = document.getElementById("category-totals");
    var emptyEl = document.getElementById("category-empty");
    listEl.innerHTML = "";

    var keys = Object.keys(totals).sort(function (a, b) {
      return totals[b] - totals[a];
    });

    if (keys.length === 0) {
      emptyEl.classList.add("visible");
      return;
    }
    emptyEl.classList.remove("visible");

    keys.forEach(function (key) {
      var cat = categoryInfo(key);
      var amount = totals[key];
      var pct = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0;

      var li = document.createElement("li");
      li.className = "totals-item";
      li.innerHTML =
        '<div class="totals-row">' +
          '<div class="totals-label"><span class="totals-dot" style="background:' + cat.color + '"></span>' + cat.icon + " " + cat.label + "</div>" +
          '<div class="totals-value">' + formatAmount(amount) + "</div>" +
        "</div>" +
        '<div class="totals-bar-track"><div class="totals-bar-fill" style="width:' + pct + "%;background:" + cat.color + '"></div></div>';
      listEl.appendChild(li);
    });
  }

  // ---------- Rendering: totals per month ----------

  function renderMonthTotals() {
    var totals = {};
    expenses.forEach(function (exp) {
      var key = monthKey(exp.date);
      totals[key] = (totals[key] || 0) + exp.amount;
    });

    var listEl = document.getElementById("month-totals");
    var emptyEl = document.getElementById("month-empty");
    listEl.innerHTML = "";

    var keys = Object.keys(totals).sort().reverse();
    var maxTotal = keys.reduce(function (max, k) {
      return Math.max(max, totals[k]);
    }, 0);

    if (keys.length === 0) {
      emptyEl.classList.add("visible");
      return;
    }
    emptyEl.classList.remove("visible");

    keys.forEach(function (key) {
      var amount = totals[key];
      var pct = maxTotal > 0 ? Math.round((amount / maxTotal) * 100) : 0;

      var li = document.createElement("li");
      li.className = "totals-item";
      li.innerHTML =
        '<div class="totals-row">' +
          '<div class="totals-label">' + monthLabel(key) + "</div>" +
          '<div class="totals-value">' + formatAmount(amount) + "</div>" +
        "</div>" +
        '<div class="totals-bar-track"><div class="totals-bar-fill" style="width:' + pct + '%;background:var(--color-primary)"></div></div>';
      listEl.appendChild(li);
    });
  }

  // ---------- Render all ----------

  function renderAll() {
    renderList();
    populateCategoryMonthFilter();
    renderCategoryTotals();
    renderMonthTotals();
  }

  // ---------- Events ----------

  function initForm() {
    var form = document.getElementById("expense-form");
    var dateInput = document.getElementById("date");
    dateInput.value = todayISO();

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var amount = parseFloat(document.getElementById("amount").value);
      var category = document.getElementById("category").value;
      var date = document.getElementById("date").value;
      var note = document.getElementById("note").value.trim();

      if (!amount || amount <= 0 || !date) return;

      expenses.push({
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        amount: Math.round(amount * 100) / 100,
        category: category,
        date: date,
        note: note,
        createdAt: Date.now()
      });

      saveExpenses(expenses);
      form.reset();
      dateInput.value = todayISO();
      renderAll();
    });
  }

  function initListDelete() {
    document.getElementById("expense-list").addEventListener("click", function (e) {
      var btn = e.target.closest(".expense-delete");
      if (!btn) return;
      var id = btn.getAttribute("data-id");
      expenses = expenses.filter(function (exp) {
        return exp.id !== id;
      });
      saveExpenses(expenses);
      renderAll();
    });
  }

  function initCategoryFilter() {
    document.getElementById("category-month-filter").addEventListener("change", renderCategoryTotals);
  }

  function initNav() {
    var navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        navButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");

        document.querySelectorAll(".view").forEach(function (view) {
          view.classList.add("hidden");
        });
        document.getElementById(btn.getAttribute("data-view")).classList.remove("hidden");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initForm();
    initListDelete();
    initCategoryFilter();
    initNav();
    renderAll();
  });
})();
