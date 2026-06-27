# AI 对话助手
基于 FastAPI 和 React 的简易 AI 聊天界面

## 整体思路
用户在前端打字 → 后端收到消息 → 后端调 AI 获取回答 → 存进数据库 → 返回前端显示，并且保留历史记录。

### 1. 后端

#### 1.main.py
```
启动服务（uvicorn）
        ↓
加载环境变量（load_dotenv）
        ↓
创建 FastAPI 实例（app = FastAPI()）
        ↓
添加 CORS 中间件（允许跨域）
        ↓
初始化数据库（init_db()）
        ↓
创建 AI 客户端实例（chat_client = OpenaiChat()）
        ↓
定义路由（/chat、/history）
        ↓
等待前端请求...
        ↓
收到 GET /chat?msg=xxx
        ↓
调用 chat_client.chat(msg, system_prompt=SYSTEM)
        ↓
返回 {"reply": 回复内容}
        ↓
收到 GET /history
        ↓
调用 get_messages()，去掉第一条系统消息
        ↓
返回 {"messages": 消息列表}
```

#### 2.database.py
##### 1.init_db()
```
连接数据库 chat.db
        ↓
执行 CREATE TABLE IF NOT EXISTS messages
        ↓
提交并关闭连接
##### 2.save_message(role, content)
连接数据库 chat.db
        ↓
执行 INSERT INTO messages (role, content) VALUES (?, ?)
        ↓
提交并关闭连接
```
##### 3.get_messages()
```
连接数据库 chat.db
        ↓
执行 SELECT role, content FROM messages
        ↓
获取所有行
        ↓
转换为 [{role: ..., content: ...}, ...]
        ↓
关闭连接
        ↓
返回列表
```

#### 3.chat.py
```
用户消息进来
        ↓
save_message("user", user_msg)      
        ↓
从数据库读取所有历史消息           
        ↓
构造请求，发给 DeepSeek API
        ↓
拿到 AI 回复
        ↓
save_message("assistant", reply)    
        ↓
返回回复给 main.py
```

### 2. 前端
```
页面加载
    ↓
useEffect → 请求 /history → 拿到历史消息 → 显示在页面上
    ↓
用户打字 → onChange → setText → 输入框更新
    ↓
用户点击“发送”
    ↓
用户消息立刻显示在页面上
    ↓
请求 /chat?msg=用户输入的内容
    ↓
等待后端返回 AI 回复
    ↓
AI 消息显示在页面上
    ↓
清空输入框
```