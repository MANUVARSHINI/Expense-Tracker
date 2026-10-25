from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# The database file will be created inside the backend folder
DB_PATH = os.path.join(os.path.dirname(__file__), "expenses.db")


# ---------- 1. Database helpers ----------
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row   # lets us read columns by name
    return conn


def create_table():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


# ---------- 2. Get all expenses ----------
@app.route("/expenses", methods=["GET"])
def get_expenses():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM expenses ORDER BY date DESC").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


# ---------- 3. Add a new expense ----------
@app.route("/expenses", methods=["POST"])
def add_expense():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO expenses (title, amount, category, date) VALUES (?, ?, ?, ?)",
        (data["title"], data["amount"], data["category"], data["date"])
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({"id": new_id, "message": "Expense added"}), 201


# ---------- 4. Delete an expense ----------
@app.route("/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    conn = get_connection()
    conn.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Expense deleted"})


# ---------- 5. Start the server ----------
if __name__ == "__main__":
    create_table()
    app.run(debug=True)