from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from chat import OpenaiChat
from database import (
    init_db, 
    get_messages,
    create_conversation, 
    get_conversations,
    update_conversation_title,
    delete_conversation,
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

chat_client = OpenaiChat()

SYSTEM = "你是一个阳光开朗,热情活泼的AI小助手"

@app.get("/chat")
def chat(conversation_id: int, msg: str):
    reply = chat_client.chat(conversation_id,msg, system_prompt=SYSTEM)
    return {"reply": reply}

@app.get("/history")
def history(conversation_id: int):
    return {"messages": get_messages(conversation_id)}

@app.get("/create_conversation")
def create_new_conversation():
    conversation_id = create_conversation()
    return {"conversation_id": conversation_id}

@app.get("/conversations")
def conversations():
    return {"conversations": get_conversations()}

@app.get("/update_conversation_title")
def update_title(conversation_id: int, title: str):
    update_conversation_title(conversation_id, title)
    return {"id": conversation_id, "title": title}

@app.get("/delete_conversation")
def delete_old_conversation(conversation_id: int):
    delete_conversation(conversation_id)
    return {"id": conversation_id}