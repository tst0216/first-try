import { useEffect, useState } from "react";
import "./App.css";

const App = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const response = await fetch("http://127.0.0.1:8000/history");
      const data = await response.json();
      setMessages(data.messages);
    };

    loadHistory();
  }, []);

  const handleClick = async () => {
    const userMessage = {
      role: "user",
      content: text,
    };

    setMessages((oldMessages) => [...oldMessages, userMessage]);

    const response = await fetch(
      `http://127.0.0.1:8000/chat?msg=${encodeURIComponent(text)}`
    );

    const data = await response.json();

    const aiMessage = {
      role: "assistant",
      content: data.reply,
    };

    setMessages((oldMessages) => [...oldMessages, aiMessage]);
    setText("");
  };

  return (
  <div className="chat-page">
    <h1 className="title">你好呀，我是 AI 小助手(´∩｡• ᵕ •｡∩`)</h1>

    <div className="message-list">
      {messages.map((msg, index) => (
        <div className={`message-row ${msg.role}`} key={index}>
          <div className="message-bubble">
            {msg.content}
          </div>
        </div>
      ))}
    </div>

    <div className="input-row">
      <input
        className="chat-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button className="send-button" onClick={handleClick}>
        发送
      </button>
    </div>
  </div>
 );
};
export default App;