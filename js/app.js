(function () {
  "use strict";

  var EXPENSES_KEY = "budgetapp:expenses";
  var BALANCES_KEY = "budgetapp:initial-balances";
  var CYCLE_START_DAY = 27;
  var SAVINGS_GOAL = 600;

  var CATEGORIES = [
    {
      key: "bar_cene",
      label: "Bar e Cene/Pranzi",
      icon: "🧋",
      color: "pink",
      budget: 250,
      weekly: true,
      subcategories: [
        { key: "bar", label: "Bar", icon: "☕" },
        { key: "cene", label: "Cene/Pranzi", icon: "🍝" }
      ]
    },
    {
      key: "bellezza",
      label: "Bellezza",
      icon: "💅",
      color: "lilac",
      budget: 100,
      subcategories: [
        { key: "trucchi", label: "Trucchi", icon: "💄" },
        { key: "vestiti", label: "Vestiti", icon: "👗" },
        { key: "skincare", label: "Skincare", icon: "🧴" },
        { key: "capelli", label: "Capelli", icon: "💇‍♀️" }
      ]
    },
    { key: "affitto", label: "Affitto", icon: "🏡", color: "sky", budget: 390 },
    { key: "bollette", label: "Bollette", icon: "💡", color: "yellow", budget: 40 },
    { key: "spesa", label: "Spesa", icon: "🛒", color: "peach", budget: 130 },
    { key: "dentista", label: "Dentista", icon: "🦷", color: "pink", budget: 86 },
    { key: "benzina", label: "Benzina", icon: "⛽", color: "lilac", budget: 250 }
  ];

  var currencyFormatter = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

  // ---------- Storage ----------

  function loadExpenses() {
    try {
      var raw = localStorage.getItem(EXPENSES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveExpenses(list) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(list));
  }

  function loadBalances() {
    try {
      var raw = localStorage.getItem(BALANCES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveBalances(map) {
    localStorage.setItem(BALANCES_KEY, JSON.stringify(map));
  }

  var expenses = loadExpenses();
  var balances = loadBalances();

  // ---------- Date / cycle helpers ----------

  function todayDate() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function todayISO() {
    return toISODate(todayDate());
  }

  function parseISODate(str) {
    var parts = str.split("-");
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function toISODate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function addDays(d, n) {
    var r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  function daysBetweenInclusive(a, b) {
    return Math.round((b - a) / 86400000) + 1;
  }

  function cycleKeyForDate(d) {
    var year = d.getFullYear();
    var month = d.getMonth(); // 0-indexed
    if (d.getDate() < CYCLE_START_DAY) {
      month -= 1;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
    }
    return year + "-" + String(month + 1).padStart(2, "0");
  }

  function cycleBounds(cycleKey) {
    var parts = cycleKey.split("-");
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    var start = new Date(year, month, CYCLE_START_DAY);
    var end = new Date(year, month + 1, CYCLE_START_DAY - 1);
    return { start: start, end: end, totalDays: daysBetweenInclusive(start, end) };
  }

  function cycleLabel(cycleKey) {
    var b = cycleBounds(cycleKey);
    var startLabel = b.start.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
    var endLabel = b.end.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
    return "Ciclo " + startLabel + " – " + endLabel;
  }

  function isInCycle(dateStr, cycleKey) {
    var b = cycleBounds(cycleKey);
    var d = parseISODate(dateStr);
    return d >= b.start && d <= b.end;
  }

  var currentCycleKey = cycleKeyForDate(todayDate());

  // ---------- Derived data ----------

  function categoryInfo(key) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].key === key) return CATEGORIES[i];
    }
    return null;
  }

  function subInfo(cat, subKey) {
    if (!cat || !cat.subcategories) return null;
    for (var i = 0; i < cat.subcategories.length; i++) {
      if (cat.subcategories[i].key === subKey) return cat.subcategories[i];
    }
    return null;
  }

  function expensesInCycle(cycleKey) {
    return expenses.filter(function (exp) {
      return isInCycle(exp.date, cycleKey);
    });
  }

  function totalSpent(list) {
    return list.reduce(function (sum, exp) {
      return sum + exp.amount;
    }, 0);
  }

  function spentByCategory(cycleKey, catKey) {
    return totalSpent(
      expensesInCycle(cycleKey).filter(function (exp) {
        return exp.category === catKey;
      })
    );
  }

  function spentBySub(cycleKey, catKey, subKey) {
    return totalSpent(
      expensesInCycle(cycleKey).filter(function (exp) {
        return exp.category === catKey && exp.subcategory === subKey;
      })
    );
  }

  function totalBudgetResidue(cycleKey) {
    return CATEGORIES.reduce(function (sum, cat) {
      var spent = spentByCategory(cycleKey, cat.key);
      return sum + Math.max(cat.budget - spent, 0);
    }, 0);
  }

  // ---------- Rendering: home ----------

  function renderCycleLabel() {
    document.getElementById("cycle-label").textContent = cycleLabel(currentCycleKey);
  }

  function renderBalance() {
    var display = document.getElementById("initial-balance-display");
    var value = balances[currentCycleKey];
    if (value === undefined || value === null) {
      display.textContent = "da impostare 🌟";
      display.classList.add("muted");
    } else {
      display.textContent = currencyFormatter.format(value);
      display.classList.remove("muted");
    }
    document.getElementById("initial-balance-input").value = value !== undefined && value !== null ? value : "";
  }

  function renderStats() {
    var initial = balances[currentCycleKey];
    var spentTotal = totalSpent(expensesInCycle(currentCycleKey));
    var currentEl = document.getElementById("stat-current-balance");
    var savedEl = document.getElementById("stat-saved");

    if (initial === undefined || initial === null) {
      currentEl.textContent = "imposta il saldo 👆";
      savedEl.textContent = "—";
      renderGoal(null);
      return;
    }

    var currentBalance = initial - spentTotal;
    var residue = totalBudgetResidue(currentCycleKey);
    var saved = initial - spentTotal - residue;

    currentEl.textContent = currencyFormatter.format(currentBalance);
    savedEl.textContent = currencyFormatter.format(saved);

    renderGoal(saved);
  }

  function renderGoal(saved) {
    var fill = document.getElementById("goal-bar-fill");
    var amountEl = document.getElementById("goal-amount-left");
    var percentEl = document.getElementById("goal-percent");
    var messageEl = document.getElementById("goal-message");

    if (saved === null) {
      fill.style.width = "0%";
      amountEl.textContent = "";
      percentEl.textContent = "";
      messageEl.textContent = "Imposta il saldo iniziale per vedere i tuoi progressi 💫";
      return;
    }

    var pct = Math.max(0, Math.min(100, Math.round((saved / SAVINGS_GOAL) * 100)));
    fill.style.width = pct + "%";
    percentEl.textContent = pct + "%";

    if (saved >= SAVINGS_GOAL) {
      amountEl.textContent = "Obiettivo raggiunto!";
      messageEl.textContent = "🎉 Complimenti, hai raggiunto i tuoi 600 € di risparmio!";
    } else {
      var missing = SAVINGS_GOAL - saved;
      amountEl.textContent = "Mancano " + currencyFormatter.format(missing);
      messageEl.textContent = "✨ Continua così, ci sei quasi!";
    }
  }

  // ---------- Rendering: expense form ----------

  function populateCategorySelect() {
    var select = document.getElementById("category");
    select.innerHTML = "";
    CATEGORIES.forEach(function (cat) {
      var opt = document.createElement("option");
      opt.value = cat.key;
      opt.textContent = cat.icon + " " + cat.label;
      select.appendChild(opt);
    });
    updateSubcategoryField();
  }

  function updateSubcategoryField() {
    var catKey = document.getElementById("category").value;
    var cat = categoryInfo(catKey);
    var field = document.getElementById("subcategory-field");
    var select = document.getElementById("subcategory");

    if (!cat || !cat.subcategories) {
      field.classList.add("hidden");
      select.innerHTML = "";
      return;
    }

    field.classList.remove("hidden");
    select.innerHTML = "";
    cat.subcategories.forEach(function (sub) {
      var opt = document.createElement("option");
      opt.value = sub.key;
      opt.textContent = sub.icon + " " + sub.label;
      select.appendChild(opt);
    });
  }

  // ---------- Rendering: expense list ----------

  function formatDate(dateStr) {
    var d = parseISODate(dateStr);
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderList(newId) {
    var listEl = document.getElementById("expense-list");
    var emptyEl = document.getElementById("empty-state");
    var countEl = document.getElementById("list-count");

    var sorted = expensesInCycle(currentCycleKey).sort(function (a, b) {
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
      if (!cat) return;
      var sub = exp.subcategory ? subInfo(cat, exp.subcategory) : null;

      var li = document.createElement("li");
      li.className = "expense-item" + (exp.id === newId ? " new" : "");
      li.innerHTML =
        '<div class="expense-cat-icon">' + cat.icon + "</div>" +
        '<div class="expense-info">' +
          '<div class="expense-category">' + cat.label + "</div>" +
          (sub ? '<div class="expense-sub">' + sub.icon + " " + sub.label + "</div>" : "") +
          (exp.note ? '<div class="expense-note">' + escapeHtml(exp.note) + "</div>" : "") +
          '<div class="expense-date">' + formatDate(exp.date) + "</div>" +
        "</div>" +
        '<div class="expense-amount">' + currencyFormatter.format(exp.amount) + "</div>" +
        '<button class="expense-delete" data-id="' + exp.id + '" aria-label="Elimina spesa">✕</button>';
      listEl.appendChild(li);
    });
  }

  // ---------- Rendering: budget view ----------

  function weekInfoForToday(cycleKey) {
    var b = cycleBounds(cycleKey);
    var today = todayDate();
    var clampedToday = today > b.end ? b.end : (today < b.start ? b.start : today);
    var daysSinceStart = daysBetweenInclusive(b.start, clampedToday) - 1;
    var weekIndex = Math.floor(daysSinceStart / 7);
    var weekStart = addDays(b.start, weekIndex * 7);
    var weekEndMax = addDays(weekStart, 6);
    var weekEnd = weekEndMax > b.end ? b.end : weekEndMax;
    var totalWeeks = Math.ceil(b.totalDays / 7);
    return { weekStart: weekStart, weekEnd: weekEnd, totalWeeks: totalWeeks };
  }

  function spentInRange(cycleKey, catKey, start, end) {
    return totalSpent(
      expenses.filter(function (exp) {
        if (exp.category !== catKey) return false;
        var d = parseISODate(exp.date);
        return d >= start && d <= end;
      })
    );
  }

  function renderBudget() {
    var container = document.getElementById("budget-list");
    container.innerHTML = "";

    CATEGORIES.forEach(function (cat) {
      var spent = spentByCategory(currentCycleKey, cat.key);
      var pct = Math.round((spent / cat.budget) * 100);
      var barPct = Math.min(pct, 100);

      var card = document.createElement("div");
      card.className = "budget-card";

      var subchips = "";
      if (cat.subcategories) {
        subchips = '<div class="budget-subrow">' +
          cat.subcategories.map(function (sub) {
            var subSpent = spentBySub(currentCycleKey, cat.key, sub.key);
            return '<span class="budget-subchip">' + sub.icon + " " + sub.label + ": " + currencyFormatter.format(subSpent) + "</span>";
          }).join("") +
          "</div>";
      }

      var warning = "";
      if (spent > cat.budget) {
        warning = '<div class="budget-warning over">🚨 Hai sforato di ' + currencyFormatter.format(spent - cat.budget) + "!</div>";
      } else if (pct >= 100) {
        warning = '<div class="budget-warning warn">🎯 Budget esaurito, occhio alle prossime spese!</div>';
      } else if (pct >= 90) {
        warning = '<div class="budget-warning warn">⚠️ Stai per sforare, occhio!</div>';
      }

      var weekBlock = "";
      if (cat.weekly) {
        var w = weekInfoForToday(currentCycleKey);
        var weekSpent = spentInRange(currentCycleKey, cat.key, w.weekStart, w.weekEnd);
        var weeklyTarget = cat.budget / w.totalWeeks;
        var onTrack = weekSpent <= weeklyTarget;
        var weekStartLabel = w.weekStart.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
        var weekEndLabel = w.weekEnd.toLocaleDateString("it-IT", { day: "numeric", month: "short" });

        weekBlock =
          '<div class="budget-week">' +
            '<p class="budget-week-title">📅 Questa settimana (' + weekStartLabel + " – " + weekEndLabel + ")</p>" +
            '<div class="budget-week-row">' +
              '<span class="budget-week-amounts">' + currencyFormatter.format(weekSpent) + " di " + currencyFormatter.format(weeklyTarget) + "</span>" +
              '<span class="pace-pill ' + (onTrack ? "ontrack" : "behind") + '">' +
                (onTrack ? "🎉 Sei in linea!" : "⚠️ Sopra il ritmo") +
              "</span>" +
            "</div>" +
          "</div>";
      }

      card.innerHTML =
        '<div class="budget-card-header">' +
          '<div class="budget-icon" style="background:var(--' + cat.color + ')">' + cat.icon + "</div>" +
          '<div class="budget-title">' + cat.label + "</div>" +
          '<div class="budget-amounts">' + currencyFormatter.format(spent) + " / " + currencyFormatter.format(cat.budget) +
            '<div class="budget-percent">' + pct + "%</div>" +
          "</div>" +
        "</div>" +
        '<div class="budget-bar-track"><div class="budget-bar-fill" style="width:' + barPct + "%;background:var(--" + cat.color + "-strong)\"></div></div>" +
        warning +
        subchips +
        weekBlock;

      container.appendChild(card);
    });
  }

  // ---------- Render all ----------

  function renderAll(newId) {
    renderCycleLabel();
    renderBalance();
    renderStats();
    renderList(newId);
    renderBudget();
  }

  // ---------- Toast ----------

  var toastTimer = null;
  function showToast(message) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 1800);
  }

  // ---------- Events ----------

  function initBalanceForm() {
    var editBtn = document.getElementById("edit-balance-btn");
    var form = document.getElementById("balance-form");

    editBtn.addEventListener("click", function () {
      form.classList.toggle("hidden");
      if (!form.classList.contains("hidden")) {
        document.getElementById("initial-balance-input").focus();
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = parseFloat(document.getElementById("initial-balance-input").value);
      if (isNaN(value) || value < 0) return;
      balances[currentCycleKey] = Math.round(value * 100) / 100;
      saveBalances(balances);
      form.classList.add("hidden");
      showToast("Salvato! 💾");
      renderAll();
    });
  }

  function initExpenseForm() {
    var form = document.getElementById("expense-form");
    var dateInput = document.getElementById("date");
    dateInput.value = todayISO();

    document.getElementById("category").addEventListener("change", updateSubcategoryField);

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var amount = parseFloat(document.getElementById("amount").value);
      var category = document.getElementById("category").value;
      var date = document.getElementById("date").value;
      var note = document.getElementById("note").value.trim();
      var cat = categoryInfo(category);
      var subcategory = cat && cat.subcategories ? document.getElementById("subcategory").value : null;

      if (!amount || amount <= 0 || !date) return;

      var id = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      expenses.push({
        id: id,
        amount: Math.round(amount * 100) / 100,
        category: category,
        subcategory: subcategory,
        date: date,
        note: note,
        createdAt: Date.now()
      });

      saveExpenses(expenses);
      form.reset();
      dateInput.value = todayISO();
      updateSubcategoryField();
      showToast("Spesa aggiunta! ✨");
      renderAll(id);
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
    populateCategorySelect();
    initBalanceForm();
    initExpenseForm();
    initListDelete();
    initNav();
    renderAll();
  });
})();
