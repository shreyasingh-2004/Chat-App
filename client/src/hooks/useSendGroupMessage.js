import { useState } from "react";
import useConversation from "../zustand/useConversation";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const useSendGroupMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, removedGroups } = useConversation();
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();

  const sendGroupMessage = (messageText, groupId) => {
    return new Promise((resolve, reject) => {
      if (!messageText.trim() || !groupId) {
        reject(new Error("Invalid message or group"));
        return;
      }
      
      if (removedGroups.includes(groupId)) {
        toast.error("You can no longer send messages here");
        reject(new Error("Removed from group"));
        return;
      }
      
      if (!socket || !socket.connected) {
        toast.error("Not connected");
        reject(new Error("Socket not connected"));
        return;
      }

      setLoading(true);
      
      const tempId = Date.now().toString();
      
      const optimisticMessage = {
        _id: tempId,
        message: messageText,
        senderId: {
          _id: authUser?._id,
          fullName: authUser?.fullName || "You",
          username: authUser?.username || "you"
        },
        groupId: groupId,
        createdAt: new Date(),
        status: "sending"
      };
      
      // Add optimistic message
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
      
      console.log(`📤 Sending group message to ${groupId}: ${messageText}`);
      
      socket.emit("sendGroupMessage", { 
        groupId: groupId, 
        message: messageText,
        tempId
      }, (response) => {
        setLoading(false);
        
        if (response?.success) {
          console.log(`✅ Group message sent successfully`);
          // Replace temp message with real message
          setMessages((prevMessages) => 
            prevMessages.map(msg => msg._id === tempId ? response.message : msg)
          );
          resolve(response.message);
        } else {
          console.error(`❌ Failed to send group message:`, response?.error);
          // Remove failed message
          setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== tempId));
          const errorMsg = response?.error || "Failed to send message";
          toast.error(errorMsg);
          reject(new Error(errorMsg));
        }
      });
    });
  };

  return { sendGroupMessage, loading };
};

export default useSendGroupMessage;