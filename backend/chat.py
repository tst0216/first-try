import os
import requests
from dotenv import load_dotenv
from database import save_message, get_messages

load_dotenv()

class OpenaiChat:
    def __init__(self):
        self.base_url = "https://api.deepseek.com"
        self.api_key = os.getenv("API_KEY")
        self.model = os.getenv("MODEL")

    def parse_reply(self, data):
        return data["choices"][0]["message"]["content"]
    
    def build_headers(self):
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def build_payload(self, messages):
        return {
            "model": self.model,
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 256,
        }
    
    def send_request(self, messages):
        url = f"{self.base_url}/chat/completions"
        headers = self.build_headers()
        payload = self.build_payload(messages)

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()

    def chat(self, conversation_id: int, user_msg: str, system_prompt: str = None):
        save_message(conversation_id, "user", user_msg)

        messages = get_messages(conversation_id)

        if system_prompt:
            messages.insert(0, {"role": "system", "content": system_prompt})

        
        data = self.send_request(messages)
        reply = self.parse_reply(data)

        save_message(conversation_id, "assistant", reply)

        return reply