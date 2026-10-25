// The address of your Flask server
const API_URL = "http://127.0.0.1:5000/expenses";

// ---------- 1. Find the elements on the page ----------
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");

// ---------- 2. Get expenses from the server and show them ----------
async function loadExpenses() {
  const response = await fetch(API_URL);
  const expenses = await response.json();

  expenseList.innerHTML = "";
  let total = 0;

  expenses.forEach(function (expense) {
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
}

// ---------- 3. Send a new expense to the server ----------
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

// ---------- 4. Ask the server to delete an expense ----------
async function deleteExpense(id) {
  await fetch(API_URL + "/" + id, { method: "DELETE" });
  loadExpenses();
}

// ---------- 5. Load expenses when the page first opens ----------
loadExpenses();