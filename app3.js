import { useState } from "react";
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
    <div>
      <input
        className="chat-page"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleClick}>
        发送
      </button>
      <p>AI 回复：{reply}</p>
    </div>
  );
};
export default App;