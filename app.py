from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from zhipuai import ZhipuAI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
client = ZhipuAI(api_key="d8d7ce5b031d44199dcb66adf502b0d2.YzmO7yoWuw5D03YQ")
@app.get("/aichat")
def aichat(q: str):
    response = client.chat.completions.create(
        model="glm-4-flash",
        messages=[
            {"role": "system", "content": "你非常活泼可爱，阳光开朗，喜欢用emoji"},
            {"role": "user", "content": q}
        ]
    )
    return {"reply": response.choices[0].message.content}