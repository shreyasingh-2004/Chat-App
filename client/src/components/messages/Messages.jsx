import { useEffect, useRef } from "react";
import Message from "./Message";
import SystemMessage from "./SystemMessage";
import useGetMessages from "../../hooks/useGetMessages";
import useGetGroupMessages from "../../hooks/useGetGroupMessages";
import useListenMessages from "../../hooks/useListenMessages";
import useConversation from "../../zustand/useConversation";

const Messages = () => {
  const { selectedConversation, messages, isGroupChat } = useConversation();
  
  const conversationId = selectedConversation?._id;
  const messagesEndRef = useRef();
  
  // Always fetch when conversation changes (store handles preventing duplicate fetches)
  const shouldFetchPersonal = !isGroupChat && conversationId;
  const shouldFetchGroup = isGroupChat && conversationId;
  
  const { loading: personalLoading } = useGetMessages(shouldFetchPersonal);
  const { loading: groupLoading } = useGetGroupMessages(shouldFetchGroup ? conversationId : null);
  useListenMessages();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const isLoading = isGroupChat ? groupLoading : personalLoading;

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4 text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-gray-500">No messages yet</p>
        <p className="text-gray-400 text-sm mt-2">
          {isGroupChat ? "Start the group conversation! 💬" : "Send a message to start chatting! 💬"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message, index) => {
        const uniqueKey = message._id ? `${message._id}-${index}` : `msg-${index}`;
        
        return message.isSystemMessage ? (
          <SystemMessage key={uniqueKey} message={message} />
        ) : (
          <Message key={uniqueKey} message={message} isGroupMessage={isGroupChat} />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;