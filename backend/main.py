import os
import uuid
import base64

from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
from chat import OpenaiChat
from database import (
    init_db, 
    get_messages,
    get_text_messages,
    save_message,
    save_message_image,
    create_conversation, 
    get_conversations,
    update_conversation_title,
    delete_conversation,
)

app = FastAPI()
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

chat_client = OpenaiChat()

SYSTEM = "你是一个阳光开朗,热情活泼的AI小助手"

def build_ai_image_url(image_bytes, content_type):
    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:{content_type};base64,{base64_image}"

def save_image_file(image_bytes, original_filename):
    file_extension = original_filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join("uploads", file_name)

    with open(file_path, "wb") as f:
        f.write(image_bytes)

    return f"/uploads/{file_name}"

def build_text_content(msg):
    return {
        "type": "text",
        "text": msg if msg else "分析一下图片内容"
    }

def build_image_content(ai_image_url):
    return {
        "type": "image_url",
        "image_url": {"url": ai_image_url}
    }

def build_ai_messages(system_prompt, old_messages, content):
    return [
        {
            "role": "system",
            "content": system_prompt
        },
        *old_messages,
        {
            "role": "user",
            "content": content
        }
    ]

def save_user_message_with_images(conversation_id, msg, image_urls):
    user_content = msg if msg else "发送了图片"
    message_id = save_message(conversation_id, "user", user_content)

    for image_url in image_urls:
        save_message_image(message_id, image_url)

@app.post("/chat_with_images")
async def chat_with_images(
    conversation_id: int = Form(...),
    msg: str = Form(""),
    images: List[UploadFile] = File([]),
):
    content = [build_text_content(msg)]

    saved_image_urls = []

    for image in images:
        image_bytes = await image.read()

        ai_image_url = build_ai_image_url(image_bytes, image.content_type)
        saved_image_url = save_image_file(image_bytes, image.filename)

        saved_image_urls.append(saved_image_url)

        content.append(build_image_content(ai_image_url))

    old_messages = get_text_messages(conversation_id)
    
    messages = build_ai_messages(SYSTEM, old_messages, content)

    save_user_message_with_images(conversation_id, msg, saved_image_urls)

    reply = chat_client.chat_with_messages(messages)

    save_message(conversation_id, "assistant", reply)

    return {
        "reply": reply,
        "images": saved_image_urls
    }

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
    image_urls = delete_conversation(conversation_id)

    for image_url in image_urls:
        file_name = image_url.replace("/uploads/", "")
        file_path = os.path.join("uploads", file_name)
  
        if os.path.exists(file_path):
            os.remove(file_path)
    return {"id": conversation_id}