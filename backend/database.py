import sqlite3

DB_PATH = "chat.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT,
        content TEXT
    )
    """)
    conn.commit()
    conn.close()

def save_message(role, content):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (role, content) VALUES (?, ?)",
        (role, content)
    )
    conn.commit()
    conn.close()

def get_messages():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT role, content FROM messages")
    rows = cursor.fetchall()
    conn.close()
    return [{"role": row[0], "content": row[1]} for row in rows]