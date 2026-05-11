import { useEffect, useRef } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";

const useMarkAsRead = () => {
  const { socket } = useSocketContext();
  const { selectedConversation, messages, setMessages } = useConversation();
  const markedRef = useRef(new Set());

  useEffect(() => {
    if (!socket || !selectedConversation || !messages.length) return;
    
    // Find unread messages from other user
    const unreadMessages = messages.filter(
      msg => msg.status !== 'read' && 
             msg.status !== 'sending' &&
             msg.senderId === selectedConversation.id
    );
    
    if (unreadMessages.length === 0) return;
    
    unreadMessages.forEach(message => {
      if (markedRef.current.has(message._id)) return;
      markedRef.current.add(message._id);
      
      socket.emit("markAsRead", {
        messageId: message._id,
        senderId: message.senderId
      });
      
      // Update local status
      setMessages(prev => prev.map(msg =>
        msg._id === message._id ? { ...msg, status: 'read' } : msg
      ));
    });
    
  }, [socket, selectedConversation, messages, setMessages]);
};

export default useMarkAsRead;