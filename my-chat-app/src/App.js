import { useState } from "react";
import "./App.css";
const App = () => {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const handleClick = async () => {
    const response = await fetch(
      `http://127.0.0.1:8000/chat?msg=${encodeURIComponent(text)}`
    );
    const data = await response.json();
    setReply(data.reply);
  };
  return (
    <div className="chat-page">
      <h1 className="title"> 你好呀，我是AI小助手 </h1>
      <input
        className = "chat-input" 
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="send-button" onClick={handleClick}>
        发送
      </button>
      <p className="reply-box">
        AI 回复：{reply}
      </p>
    </div>
  );
};
export default App;