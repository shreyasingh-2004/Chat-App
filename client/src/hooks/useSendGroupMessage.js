import { useState, useRef } from "react";
import useConversation from "../zustand/useConversation";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const ACK_TIMEOUT_MS = 15000;

const useSendGroupMessage = () => {
  const [loading, setLoading] = useState(false);
  const { setMessages, removedGroups } = useConversation();
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();
  const timeoutRef = useRef(null);

  const sendGroupMessage = (messageText, groupId, options = {}) => {
    return new Promise((resolve, reject) => {
      if ((!messageText.trim() && !options.attachment?.url) || !groupId) {
        reject(new Error("Invalid message or group"));
        return;
      }

      const gid = String(groupId);
      if (removedGroups.some((id) => String(id) === gid)) {
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
        attachment: options.attachment || undefined,
        replyTo: options.replyTo || null,
        senderId: {
          _id: authUser?._id,
          fullName: authUser?.fullName || "You",
          username: authUser?.username || "you",
          profilePic: authUser?.profilePic,
        },
        groupId: groupId,
        createdAt: new Date(),
        status: "sending",
      };

      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

      const finish = (fn) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setLoading(false);
        fn();
      };

      timeoutRef.current = setTimeout(() => {
        finish(() => {
          setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
          toast.error("Send timed out — check your connection");
          reject(new Error("Ack timeout"));
        });
      }, ACK_TIMEOUT_MS);

      socket.emit(
        "sendGroupMessage",
        {
          groupId: groupId,
          message: messageText,
          attachment: options.attachment,
          replyTo: options.replyTo,
          tempId,
        },
        (response) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setLoading(false);

          if (response?.success) {
            setMessages((prevMessages) =>
              prevMessages.map((msg) => (msg._id === tempId ? response.message : msg))
            );
            resolve(response.message);
          } else {
            setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== tempId));
            const errorMsg = response?.error || "Failed to send message";
            toast.error(errorMsg);
            reject(new Error(errorMsg));
          }
        }
      );
    });
  };

  return { sendGroupMessage, loading };
};

export default useSendGroupMessage;