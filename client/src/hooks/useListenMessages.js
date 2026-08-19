import { useEffect, useRef } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext";
 
const normalizeId = (id) => {
  if (!id) return null;
  if (typeof id === "string") return id;
  if (typeof id === "object") {
    if (id._id) return String(id._id);
    if (id.toString) return id.toString();
  }
  return null;
};
 
const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { setMessages, selectedConversation, isGroupChat, incrementUnread } = useConversation();
  const { authUser } = useAuthContext();
  const processedMessageIds = useRef(new Set());
 
  // Refs so socket callbacks always see latest values without re-registering
  const selectedConversationRef = useRef(selectedConversation);
  const isGroupChatRef = useRef(isGroupChat);
 
  useEffect(() => { selectedConversationRef.current = selectedConversation; }, [selectedConversation]);
  useEffect(() => { isGroupChatRef.current = isGroupChat; }, [isGroupChat]);
 
  useEffect(() => {
    if (!socket) return;
 
    // ─────────────────────────────────────────────
    // NEW GROUP MESSAGE
    // ─────────────────────────────────────────────
    const handleNewGroupMessage = (newMessage) => {
      const messageId = normalizeId(newMessage._id);
      if (!messageId) return;
 
      const isFromCurrentUser =
        normalizeId(newMessage.senderId?._id || newMessage.senderId) === normalizeId(authUser?._id);
      const isSystemMsg = newMessage.isSystemMessage === true;
 
      // Skip own messages (already added optimistically) unless system message
      if (isFromCurrentUser && !isSystemMsg) return;
 
      // Dedup guard
      if (processedMessageIds.current.has(messageId)) return;
      processedMessageIds.current.add(messageId);
      setTimeout(() => processedMessageIds.current.delete(messageId), 5000);
 
      const currentConversationId = normalizeId(selectedConversationRef.current?._id);
      const messageGroupId = normalizeId(newMessage.groupId);
      const isViewingThisGroup =
        isGroupChatRef.current && messageGroupId === currentConversationId;
 
      if (isViewingThisGroup) {
        // Currently viewing this group — append to messages
        setMessages((prev) => {
          if (prev.some((m) => normalizeId(m._id) === messageId)) return prev;
          return [...prev, newMessage];
        });
      } else {
        // Background group — increment unread badge
        if (messageGroupId) {
          incrementUnread(messageGroupId, "group");
        }
      }
    };
 
    // ─────────────────────────────────────────────
    // NEW DIRECT MESSAGE
    // ─────────────────────────────────────────────
    const handleNewMessage = (newMessage) => {
      const messageId = normalizeId(newMessage._id);
      if (!messageId) return;
 
      const messageSenderId = normalizeId(newMessage.senderId?._id || newMessage.senderId);
      const currentUserId = normalizeId(authUser?._id);
 
      // Skip own messages (already added optimistically)
      if (messageSenderId === currentUserId) return;
 
      // Dedup guard
      if (processedMessageIds.current.has(messageId)) return;
      processedMessageIds.current.add(messageId);
      setTimeout(() => processedMessageIds.current.delete(messageId), 5000);
 
      const currentConversationId = normalizeId(selectedConversationRef.current?._id);
      const messageReceiverId = normalizeId(newMessage.receiverId?._id || newMessage.receiverId);
 
      const isViewingThisChat =
        !isGroupChatRef.current &&
        currentConversationId &&
        (
          (messageSenderId === currentConversationId && messageReceiverId === currentUserId) ||
          (messageReceiverId === currentConversationId && messageSenderId === currentUserId)
        );
 
      if (isViewingThisChat) {
        // Currently viewing this DM — append to messages
        setMessages((prev) => {
          if (prev.some((m) => normalizeId(m._id) === messageId)) return prev;
          return [...prev, newMessage];
        });
      } else {
        // Background DM — increment unread badge on the sender
        if (messageSenderId) {
          incrementUnread(messageSenderId, "dm");
        }
      }
    };
 
    // ─────────────────────────────────────────────
    // MESSAGE EDITED
    // ─────────────────────────────────────────────
    const handleMessageEdited = (updatedMessage) => {
      const messageId = normalizeId(updatedMessage._id);
      if (!messageId) return;
      setMessages((prev) =>
        prev.map((m) => normalizeId(m._id) === messageId ? updatedMessage : m)
      );
    };
 
    // ─────────────────────────────────────────────
    // MESSAGE DELETED
    // ─────────────────────────────────────────────
    const handleMessageDeleted = ({ messageId, mode, userId, message }) => {
      const normalizedMsgId = normalizeId(messageId);
      const normalizedUserId = normalizeId(userId);
      const normalizedAuthId = normalizeId(authUser?._id);
 
      setMessages((prev) => {
        if (mode === "me") {
          // ✅ FIX: Only hide for the user who deleted it — was backwards before
          if (normalizedUserId === normalizedAuthId) {
            return prev.filter((item) => normalizeId(item._id) !== normalizedMsgId);
          }
          return prev; // Don't change anything for other users
        }
 
        // "everyone" — replace with the updated (deleted) message object
        return prev.map((item) =>
          normalizeId(item._id) === normalizedMsgId ? message : item
        );
      });
    };
 
    // ─────────────────────────────────────────────
    // MESSAGES SEEN — update status ticks
    // ─────────────────────────────────────────────
    const handleMessagesSeen = ({ by }) => {
      const byId = normalizeId(by);
      const currentUserId = normalizeId(authUser?._id);
 
      setMessages((prev) =>
        prev.map((m) => {
          const senderId = normalizeId(m.senderId?._id || m.senderId);
          // Update status only for messages sent by current user to the person who saw them
          if (senderId === currentUserId && normalizeId(m.receiverId) === byId) {
            return { ...m, status: "seen" };
          }
          return m;
        })
      );
    };
 
    socket.on("newGroupMessage", handleNewGroupMessage);
    socket.on("newMessage",      handleNewMessage);
    socket.on("messageEdited",   handleMessageEdited);
    socket.on("messageDeleted",  handleMessageDeleted);
    socket.on("messagesSeen",    handleMessagesSeen);
 
    return () => {
      socket.off("newGroupMessage", handleNewGroupMessage);
      socket.off("newMessage",      handleNewMessage);
      socket.off("messageEdited",   handleMessageEdited);
      socket.off("messageDeleted",  handleMessageDeleted);
      socket.off("messagesSeen",    handleMessagesSeen);
      processedMessageIds.current.clear();
    };
  }, [socket, authUser, setMessages, incrementUnread]);
 
  return null;
};
 
export default useListenMessages;