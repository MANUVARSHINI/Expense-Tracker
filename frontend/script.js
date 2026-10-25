// ---------- 1. Find the elements on the page ----------
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");

// ---------- 2. Load saved expenses (or start with an empty list) ----------
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// ---------- 3. Show everything on the page ----------
function showExpenses() {
  expenseList.innerHTML = "";   // clear the table first
  let total = 0;

  expenses.forEach(function (expense, index) {
    total += expense.amount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${expense.title}</td>
      <td>${expense.category}</td>
      <td>${expense.date}</td>
      <td>₹${expense.amount}</td>
      <td><button onclick="deleteExpense(${index})">Delete</button></td>
    `;
    expenseList.appendChild(row);
  });

  totalDisplay.textContent = total;
}

// ---------- 4. Add a new expense when the form is submitted ----------
form.addEventListener("submit", function (event) {
  event.preventDefault();   // stop the page from reloading

  const newExpense = {
    title: titleInput.value,
    amount: Number(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value
  };

  expenses.push(newExpense);
  localStorage.setItem("expenses", JSON.stringify(expenses));

  showExpenses();
  form.reset();   // clear the form fields
});

// ---------- 5. Delete an expense ----------
function deleteExpense(index) {
  expenses.splice(index, 1);   // remove 1 item at this position
  localStorage.setItem("expenses", JSON.stringify(expenses));
  showExpenses();
}

// ---------- 6. Show saved expenses when the page first opens ----------
showExpenses();