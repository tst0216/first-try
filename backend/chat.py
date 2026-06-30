import os
import requests

from dotenv import load_dotenv

load_dotenv()

class OpenaiChat:
    def __init__(self):
        self.base_url = os.getenv("BASE_URL")
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
    
    def chat_with_messages(self, messages):
        data = self.send_request(messages)
        return self.parse_reply(data)