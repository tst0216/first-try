import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const App = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);

  const messageListRef = useRef(null);

  useEffect(() => {
    const loadConversations = async () => {
    const response = await fetch(`${API_BASE_URL}/conversations`);
    const data = await response.json();

    setConversations(data.conversations);

    if (data.conversations.length > 0) {
      const firstConversation = data.conversations[0];

      setCurrentConversationId(firstConversation.id);

      const historyResponse = await fetch(
        `${API_BASE_URL}/history?conversation_id=${firstConversation.id}`
      );
      const historyData = await historyResponse.json();

      setMessages(historyData.messages);
    }

    else {
      const createResponse = await fetch(`${API_BASE_URL}/create_conversation`);
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
    `${API_BASE_URL}/history?conversation_id=${conversationId}`
  );
  const data = await response.json();
  setMessages(data.messages);
  };

  const handleCreateConversation = async () => {
    const response = await fetch(`${API_BASE_URL}/create_conversation`);
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
      `${API_BASE_URL}/delete_conversation?conversation_id=${conversationId}`
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

  const scrollToBottom = () => {
    const messageList = messageListRef.current;

    if (!messageList) {
      return;
    }

    messageList.scrollTo({
      top: messageList.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleClick = async () => {
    const isEmptyMessage = text.trim() === "" && imageFiles.length === 0;

    if (isEmptyMessage) {
      return;
    }

    setIsWaiting(true);

    try {
      const currentConversation = conversations.find(
        (conversation) => conversation.id === currentConversationId
      );

      if (currentConversation && currentConversation.title === "新话题") {
        const newTitle = text;

        await fetch(
          `${API_BASE_URL}/update_conversation_title?conversation_id=${currentConversationId}&title=${encodeURIComponent(newTitle)}`
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

      const response = await fetch(`${API_BASE_URL}/chat_with_images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("请求失败");
      }

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

      setMessages((oldMessages) => [...oldMessages, userMessage, aiMessage]);
      setText("");
      setImageFiles([]);
      setImagePreviews([]);
    } catch (error) {
      console.error(error);
      alert("发送失败，请稍后再试");
    } finally {
      setIsWaiting(false);
    }
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

      <div className="message-list" ref={messageListRef}>
        {messages.map((msg, index) => (
          <div className={`message-row ${msg.role}`} key={index}>
            <div className="message-bubble">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
              {msg.images && msg.images.map((imageUrl, imageIndex) => (
                <a
                  href={`${API_BASE_URL}${imageUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  key={imageUrl}
                >
                  <img
                    className="message-image"
                    src={`${API_BASE_URL}${imageUrl}`}
                    alt={`聊天图片 ${imageIndex + 1}`}
                  />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        className="scroll-bottom-button"
        onClick={scrollToBottom}
      >
        ↓
      </button>

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
        <textarea
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          rows={2}
        />

        <button 
          className="send-button"
          onClick={handleClick}
          disabled={isWaiting}
        >
          {isWaiting ? "回复中..." : "发送"}
        </button>
      </div>
    </div>
  </div>
);
};
export default App;