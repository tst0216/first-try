import { useEffect, useState } from "react";
import "./App.css";

const App = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  useEffect(() => {
    const loadConversations = async () => {
    const response = await fetch("http://127.0.0.1:8000/conversations");
    const data = await response.json();

    setConversations(data.conversations);

    if (data.conversations.length > 0) {
      const firstConversation = data.conversations[0];

      setCurrentConversationId(firstConversation.id);

      const historyResponse = await fetch(
        `http://127.0.0.1:8000/history?conversation_id=${firstConversation.id}`
      );
      const historyData = await historyResponse.json();

      setMessages(historyData.messages);
    }

    else {
      const createResponse = await fetch("http://127.0.0.1:8000/create_conversation");
      const createData = await createResponse.json();

      const newConversation = {
      id: createData.conversation_id,
      title: "新话题",
     };
     setConversations([newConversation]);
     setCurrentConversationId(createData.conversation_id);
     setMessages([]);
    } 
  };

  loadConversations();
}, []);

  const handleSelectConversation = async (conversationId) => {
  setCurrentConversationId(conversationId);
  const response = await fetch(
    `http://127.0.0.1:8000/history?conversation_id=${conversationId}`
  );
  const data = await response.json();
  setMessages(data.messages);
  };

  const handleCreateConversation = async () => {
    const response = await fetch("http://127.0.0.1:8000/create_conversation");
    const data = await response.json();

    const newConversation = {
      id: data.conversation_id,
      title: "新话题",
    };

    setConversations((oldConversations) => [newConversation,...oldConversations,]);

    setCurrentConversationId(data.conversation_id);
    setMessages([]);
  };

  const handleDeleteConversation = async (conversationId) => {
    await fetch(
      `http://127.0.0.1:8000/delete_conversation?conversation_id=${conversationId}`
    );

    const newConversations = conversations.filter(
      (conversation) => conversation.id !== conversationId
    );

    setConversations(newConversations);
  };

  const handleClick = async () => {
    const userMessage = {
      role: "user",
      content: text,
    };

    setMessages((oldMessages) => [...oldMessages, userMessage]);

  const currentConversation = conversations.find(
    (conversation) => conversation.id === currentConversationId
  );

  if (currentConversation && currentConversation.title === "新话题") {
    const newTitle = text;

    await fetch(
      `http://127.0.0.1:8000/update_conversation_title?conversation_id=${currentConversationId}&title=${encodeURIComponent(newTitle)}`
    );

    setConversations((oldConversations) =>
    oldConversations.map((conversation) =>
      conversation.id === currentConversationId
        ? { ...conversation, title: newTitle }
        : conversation
    )
  );
}

    const response = await fetch(
      `http://127.0.0.1:8000/chat?conversation_id=${currentConversationId}&msg=${encodeURIComponent(text)}`
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
  <div className="app-layout">
    <div className="sidebar">
      <button className="new-chat-button" onClick={handleCreateConversation}>
        新建话题
      </button>

      <div className="conversation-list">
        {conversations.map((conversation) => (
          <div className="conversation-item" key={conversation.id}>
            <button
              className="conversation-title-button"
              onClick={() => handleSelectConversation(conversation.id)}
            >
              {conversation.title}
            </button>

            <button
              className="delete-conversation-button"
              onClick={() => handleDeleteConversation(conversation.id)}
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>

    <div className="chat-page">
      <h1 className="title">你好呀，我是 AI 小助手 (´∩｡• ᵕ •｡∩`)</h1>

      <div className="message-list">
        {messages.map((msg, index) => (
          <div className={`message-row ${msg.role}`} key={index}>
            <div className="message-bubble">{msg.content}</div>
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
  </div>
);
};
export default App;