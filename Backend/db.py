import sqlite3
from flask import Flask, request, redirect, url_for, render_template, jsonify
import re

# Initialize the database
def init_db():
    conn = sqlite3.connect('history.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS history
                 (id INTEGER PRIMARY KEY, input TEXT)''')
    conn.commit()
    conn.close()

# Validate the input
def is_valid_input(user_input):
    ip_pattern = re.compile(r'^\d{1,3}(\.\d{1,3}){3}$')
    domain_pattern = re.compile(r'^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    return ip_pattern.match(user_input) or domain_pattern.match(user_input)

# Store the input in the database
def store_input():
    user_input = request.form['search']
    # Check if the input already exists in the database
    conn = sqlite3.connect('history.db')
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM history WHERE input = ?", (user_input,))
    count = c.fetchone()[0]

    if count == 0:  # Only insert if the input doesn't already exist
        c.execute("INSERT INTO history (input) VALUES (?)", (user_input,))
        conn.commit()
    conn.close()

    # Return updated history as JSON
    return jsonify({"history": get_history()})

# Format the input with brackets around periods
def format_input(input):
    return re.sub(r'\.', '[.]', input)

# Fetch the history from the database and format it
def get_history():
    conn = sqlite3.connect('history.db')
    c = conn.cursor()
    c.execute("SELECT input FROM history")
    history = c.fetchall()
    conn.close()
    return [format_input(item[0]) for item in history]