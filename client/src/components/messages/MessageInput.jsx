import { useState } from "react";
import { useSocketContext } from "../../context/SocketContext";
import { useAuthContext } from "../../context/AuthContext";
import useConversation from "../../zustand/useConversation";
import useSendMessage from "../../hooks/useSendMessage";
import useSendGroupMessage from "../../hooks/useSendGroupMessage";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();
  const { isGroupChat, selectedConversation } = useConversation();
  const { sendMessage, loading: personalLoading } = useSendMessage();
  const { sendGroupMessage, loading: groupLoading } = useSendGroupMessage();

  const loading = personalLoading || groupLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    if (!selectedConversation) {
      toast.error("No conversation selected");
      return;
    }
    
    if (!socket) {
      toast.error("Not connected to server");
      return;
    }
    
    const messageText = message.trim();
    
    try {
      if (isGroupChat) {
        await sendGroupMessage(messageText, selectedConversation._id);
      } else {
        await sendMessage(messageText, selectedConversation._id);
      }
      setMessage("");
    } catch (error) {
      console.error("Failed to send:", error);
      toast.error(error.message || "Failed to send message");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isGroupChat ? "Type a group message..." : "Type a message..."}
          className="flex-1 input input-bordered input-primary"
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || !message.trim()}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Send"
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;