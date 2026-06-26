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

    def chat(self, user_msg: str,system_prompt: str = None):
        save_message("user", user_msg)

        messages = get_messages()

        if system_prompt:
            messages.insert(0, {"role": "system", "content": system_prompt})

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 256,
        }
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        reply = data["choices"][0]["message"]["content"]

        save_message("assistant", reply)

        return reply