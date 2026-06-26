import os
from dotenv import load_dotenv
load_dotenv()

import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import sqlite3

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_URL = "https://api.deepseek.com"
API_KEY = os.getenv("API_KEY")
MODEL = os.getenv("MODEL")

def init_db():
    conn = sqlite3.connect("chat.db")
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

init_db()

def save_message(role, content):
    conn = sqlite3.connect("chat.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (role, content) VALUES (?, ?)",
        (role, content)
    )
    conn.commit()
    conn.close()

def get_messages():
    conn = sqlite3.connect("chat.db")
    cursor = conn.cursor()
    cursor.execute("SELECT role, content FROM messages")
    rows = cursor.fetchall()
    conn.close()
    history = [
        {"role": "system", "content": "你是一个阳光开朗，热情活泼的AI小助手"}
    ]
    for role, content in rows:
        history.append({
            "role": role,
            "content": content
        })
    return history

@app.get("/chat")
def chat(msg: str):
    save_message("user", msg)
    messages = get_messages()

    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.5,
        "max_tokens": 1024,
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()

    reply = data["choices"][0]["message"]["content"]
    save_message("assistant", reply)

    return {"reply": reply}

@app.get("/history")
def history():
    return {"messages": get_messages()[1:]}