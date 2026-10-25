const API_URL = "http://127.0.0.1:5000/expenses";

// ---------- 1. Find the elements on the page ----------
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");
const exportBtn = document.getElementById("export-btn");
const monthFilter = document.getElementById("month-filter");
const clearFilter = document.getElementById("clear-filter");

// allExpenses = everything from the server
// visibleExpenses = only what passes the month filter
let allExpenses = [];
let visibleExpenses = [];
let categoryChart = null;

// ---------- 2. Get all expenses from the server ----------
async function loadExpenses() {
  const response = await fetch(API_URL);
  allExpenses = await response.json();
  showExpenses();
}

// ---------- 3. Apply the filter and show the results ----------
function showExpenses() {
  const month = monthFilter.value;   // looks like "2026-10", or empty

  visibleExpenses = allExpenses.filter(function (expense) {
    return !month || expense.date.startsWith(month);
  });

  expenseList.innerHTML = "";
  let total = 0;

  visibleExpenses.forEach(function (expense) {
    total += expense.amount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${expense.title}</td>
      <td>${expense.category}</td>
      <td>${expense.date}</td>
      <td>₹${expense.amount}</td>
      <td><button onclick="deleteExpense(${expense.id})">Delete</button></td>
    `;
    expenseList.appendChild(row);
  });

  totalDisplay.textContent = total;
  drawChart();
}

// ---------- 4. Draw the pie chart ----------
function drawChart() {
  const totals = {};
  visibleExpenses.forEach(function (expense) {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
  });

  if (categoryChart) {
    categoryChart.destroy();
  }

  const canvas = document.getElementById("category-chart");
  categoryChart = new Chart(canvas, {
    type: "pie",
    data: {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals),
        backgroundColor: ["#e74c3c", "#3498db", "#f1c40f", "#2ecc71", "#9b59b6"]
      }]
    }
  });
}

// ---------- 5. Send a new expense to the server ----------
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const newExpense = {
    title: titleInput.value,
    amount: Number(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value
  };

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newExpense)
  });

  form.reset();
  loadExpenses();
});

// ---------- 6. Delete an expense ----------
async function deleteExpense(id) {
  await fetch(API_URL + "/" + id, { method: "DELETE" });
  loadExpenses();
}

// ---------- 7. Month filter controls ----------
monthFilter.addEventListener("change", showExpenses);

clearFilter.addEventListener("click", function () {
  monthFilter.value = "";
  showExpenses();
});

// ---------- 8. Download the visible expenses as CSV ----------
exportBtn.addEventListener("click", function () {
  if (visibleExpenses.length === 0) {
    alert("No expenses to export yet!");
    return;
  }

  let csv = "Title,Category,Date,Amount\n";
  visibleExpenses.forEach(function (expense) {
    const safeTitle = '"' + expense.title.replace(/"/g, '""') + '"';
    csv += `${safeTitle},${expense.category},${expense.date},${expense.amount}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expenses.csv";
  link.click();
});

// ---------- 9. Load expenses when the page first opens ----------
loadExpenses();