import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from chat import OpenaiChat
from database import init_db, get_messages

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

chat_client = OpenaiChat()

SYSTEM = "你是一个阳光开朗，热情活泼的AI小助手"

@app.get("/chat")
def chat(msg: str):
    reply = chat_client.chat(msg, system_prompt=SYSTEM)
    return {"reply": reply}

@app.get("/history")
def history():
    return {"messages": get_messages()[1:]}