import { useEffect, useRef } from "react";
import Message from "./Message";
import SystemMessage from "./SystemMessage";
import useGetMessages from "../../hooks/useGetMessages";
import useGetGroupMessages from "../../hooks/useGetGroupMessages";
import useListenMessages from "../../hooks/useListenMessages";
import useConversation from "../../zustand/useConversation";

const Messages = () => {
  const { selectedConversation, messages, isGroupChat, clearUnread } = useConversation();

  const conversationId = selectedConversation?._id;
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isFirstLoad = useRef(true);

  // Only one hook fetches at a time based on chat type
  const { loading: personalLoading } = useGetMessages(!isGroupChat && !!conversationId);
  const { loading: groupLoading } = useGetGroupMessages(isGroupChat ? conversationId : null);
  useListenMessages();

  // Reset first-load flag and clear unread badge whenever conversation changes
  useEffect(() => {
    isFirstLoad.current = true;
    if (conversationId) {
      clearUnread(conversationId);
    }
  }, [conversationId, clearUnread]);

  // Scroll to bottom — instant jump on first load, smooth for new messages
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || messages.length === 0) return;

    if (isFirstLoad.current) {
      // Jump instantly to the latest message when conversation opens
      el.scrollTop = el.scrollHeight;
      isFirstLoad.current = false;
    } else {
      // Smooth scroll when a new message arrives
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, conversationId]);

  const isLoading = isGroupChat ? groupLoading : personalLoading;

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading messages…</p>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="font-medium text-gray-600 dark:text-gray-400">No messages yet</p>
        <p className="mt-1 text-sm text-gray-400">
          {isGroupChat ? "Start the group conversation! 💬" : "Say hello! 👋"}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="min-h-0 flex-1 overflow-y-auto p-4 space-y-1"
    >
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