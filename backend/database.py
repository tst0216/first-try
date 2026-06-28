import sqlite3

from datetime import datetime

DB_PATH = "chat.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        created_at TEXT,
        updated_at TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER,
        role TEXT,
        content TEXT
    )
    """)
    conn.commit()
    conn.close()

def create_conversation(title="新话题"):
    conn = get_connection()
    cursor = conn.cursor()
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    updated_at = created_at
    cursor.execute(
        "INSERT INTO conversations (title, created_at, updated_at) VALUES (?, ?, ?)",
        (title, created_at, updated_at)
    )
    conversation_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return conversation_id

def get_conversations():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, title, created_at, updated_at
    FROM conversations
    ORDER BY updated_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": row[0], 
            "title": row[1],
            "created_at": row[2],
            "updated_at": row[3],
        }
        for row in rows
    ]

def save_message(conversation_id, role, content):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (conversation_id,role, content) VALUES (?, ?, ?)",
        (conversation_id, role, content)
    )
    updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute(
        "UPDATE conversations SET updated_at = ? WHERE id = ?",
        (updated_at, conversation_id)
    )
    conn.commit()
    conn.close()

def get_messages(conversation_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT role, content
        FROM messages
        WHERE conversation_id = ?
        ORDER BY id
        """,
        (conversation_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [{"role": row[0], "content": row[1]} for row in rows]

def update_conversation_title(conversation_id, title):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE conversations SET title = ? WHERE id = ?",
        (title, conversation_id)
    )
    conn.commit()
    conn.close()
