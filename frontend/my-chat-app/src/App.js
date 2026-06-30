import { useEffect, useState } from "react";
import "./App.css";

const App = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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

  const addImageFile = (file) => {
    setImageFiles((oldFiles) => [...oldFiles, file]);
    setImagePreviews((oldPreviews) => [
      ...oldPreviews,
      URL.createObjectURL(file),
    ]);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        addImageFile(file);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const files = e.dataTransfer.files;

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        addImageFile(file);
      }
    }
  };

const handleClick = async () => {
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

    const formData = new FormData();

    formData.append("conversation_id", currentConversationId);
    formData.append("msg", text);

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch("http://127.0.0.1:8000/chat_with_images", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    const userMessage = {
      role: "user",
      content: text || "发送了图片",
      images: data.images,
    };

    const aiMessage = {
      role: "assistant",
      content: data.reply,
    };

    setMessages((oldMessages) => [...oldMessages,  userMessage, aiMessage]);
    setText("");
    setImageFiles([]);
    setImagePreviews([]);
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

    <div 
      className="chat-page"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >

      <h1 className="title">你好呀，我是 AI 小助手 (´∩｡• ᵕ •｡∩`)</h1>

      <div className="message-list">
        {messages.map((msg, index) => (
          <div className={`message-row ${msg.role}`} key={index}>
            <div className="message-bubble">
              <div>{msg.content}</div>
              {msg.images && msg.images.map((imageUrl, imageIndex) => (
                <a
                  href={`http://127.0.0.1:8000${imageUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  key={imageUrl}
                >
                  图片 {imageIndex + 1}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {imagePreviews.length > 0 && (
        <div className="image-preview-list">
          {imagePreviews.map((preview, index) => (
            <img
              className="image-preview"
              src={preview}
              alt={`粘贴的图片 ${index + 1}`}
              key={preview}
            />
          ))}
        </div>
      )}

      <div className="input-row">
        <input
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
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