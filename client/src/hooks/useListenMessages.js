import { useEffect, useRef } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext";

const normalizeId = (id) => {
  if (!id) return null;
  if (typeof id === 'string') return id;
  if (typeof id === 'object') {
    if (id._id) return String(id._id);
    if (id.toString) return id.toString();
  }
  return null;
};

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { setMessages, selectedConversation, isGroupChat } = useConversation();
  const { authUser } = useAuthContext();
  const processedMessageIds = useRef(new Set());
  const listenersAttached = useRef(false);

  useEffect(() => {
    if (!socket) return;
    
    if (listenersAttached.current) return;
    listenersAttached.current = true;

    const currentConversationId = normalizeId(selectedConversation?._id);

    const handleNewGroupMessage = (newMessage) => {
      const messageId = newMessage._id;
      
      // Check if this message is from the current user
      const isFromCurrentUser = newMessage.senderId?._id === authUser?._id ||
                                newMessage.senderId === authUser?._id;
      
      // For system messages, always show them (they have isSystemMessage flag)
      const isSystemMsg = newMessage.isSystemMessage === true;
      
      // Skip if message is from current user and not a system message
      if (isFromCurrentUser && !isSystemMsg) {
        console.log("Skipping own group message (already added)");
        return;
      }
      
      if (processedMessageIds.current.has(messageId)) {
        console.log("Duplicate group message skipped:", messageId);
        return;
      }
      processedMessageIds.current.add(messageId);
      
      console.log("📨 New GROUP message received:", newMessage.message, isSystemMsg ? "(System)" : "");
      const messageGroupId = normalizeId(newMessage.groupId);
      
      if (currentConversationId && messageGroupId === currentConversationId && isGroupChat) {
        setMessages((prevMessages) => {
          const exists = prevMessages.some(msg => msg._id === messageId);
          if (exists) return prevMessages;
          return [...prevMessages, newMessage];
        });
      }
      
      setTimeout(() => {
        processedMessageIds.current.delete(messageId);
      }, 3000);
    };

    const handleNewMessage = (newMessage) => {
      const messageId = newMessage._id;
      
      // Check if this message is from the current user
      const isFromCurrentUser = newMessage.senderId === authUser?._id;
      
      // Skip if message is from current user
      if (isFromCurrentUser) {
        console.log("Skipping own personal message (already added)");
        return;
      }
      
      if (processedMessageIds.current.has(messageId)) {
        console.log("Duplicate personal message skipped:", messageId);
        return;
      }
      processedMessageIds.current.add(messageId);
      
      console.log("📨 New PERSONAL message received:", newMessage.message);
      
      if (!currentConversationId || isGroupChat) return;

      const messageSenderId = normalizeId(newMessage.senderId);
      const messageReceiverId = normalizeId(newMessage.receiverId);

      const isCorrectConversation = messageSenderId === currentConversationId || messageReceiverId === currentConversationId;

      if (isCorrectConversation) {
        setMessages((prevMessages) => {
          const exists = prevMessages.some(msg => msg._id === messageId);
          if (exists) return prevMessages;
          return [...prevMessages, newMessage];
        });
      }
      
      setTimeout(() => {
        processedMessageIds.current.delete(messageId);
      }, 3000);
    };

    // Remove existing listeners first to be safe
    socket.off("newGroupMessage");
    socket.off("newMessage");
    
    socket.on("newGroupMessage", handleNewGroupMessage);
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newGroupMessage", handleNewGroupMessage);
      socket.off("newMessage", handleNewMessage);
      listenersAttached.current = false;
      processedMessageIds.current.clear();
    };
  }, [socket, setMessages, selectedConversation, isGroupChat, authUser]);

  return null;
};

export default useListenMessages;