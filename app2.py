import os
from dotenv import load_dotenv
load_dotenv()
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
messages = [
    {"role": "system", "content": "你是一个阳光开朗，热情活泼的AI小助手"}
]

@app.get("/chat")
def chat(msg: str):
    messages.append({"role": "user", "content": msg})
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
    messages.append({"role": "assistant", "content": reply})
    return {"reply": reply}