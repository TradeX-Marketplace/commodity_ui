import React from 'react';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatbotPage() {
  return (
    <div className="chatbot-page">
      <div className="chatbot-page-layout">
        <div className="chat-main-area">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
