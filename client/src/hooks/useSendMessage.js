import { useState } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();
  const { messages, setMessages, selectedConversation } = useConversation();

  const sendMessage = async (message, receiverId) => {
    if (!socket || !receiverId) {
      toast.error("Not connected to chat");
      return false;
    }

    setLoading(true);
    
    // Create a temporary message for optimistic update
    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      senderId: {
        _id: authUser?._id,
        fullName: authUser?.fullName || "You",
        username: authUser?.username || "you"
      },
      receiverId: receiverId,
      message: message,
      status: "sending",
      createdAt: new Date(),
      isSystemMessage: false
    };

    // Optimistically add message to UI
    setMessages((prevMessages) => [...prevMessages, tempMessage]);

    try {
      const response = await new Promise((resolve, reject) => {
        socket.emit("sendMessage", { 
          receiverId, 
          message 
        }, (response) => {
          if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || "Failed to send"));
          }
        });
      });

      // Replace temp message with real message
      setMessages((prevMessages) => 
        prevMessages.map(msg =>
          msg._id === tempId ? response.message : msg
        )
      );
      
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove failed message
      setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== tempId));
      toast.error(error.message || "Failed to send message");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};

export default useSendMessage;