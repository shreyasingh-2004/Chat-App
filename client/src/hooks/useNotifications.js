import { useEffect, useRef } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext";

// ---------------------------------------------------------------------------
// Two-tone WhatsApp-like chime using Web Audio API (no file needed)
// ---------------------------------------------------------------------------
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    [
      { freq: 880,  start: 0,    dur: 0.12 },
      { freq: 1100, start: 0.14, dur: 0.18 },
    ].forEach(({ freq, start, dur }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + start + 0.02);
      gain.gain.linearRampToValueAtTime(0,    ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime  + start + dur + 0.02);
    });
  } catch (_) { /* silently ignore if audio is blocked */ }
};

// ---------------------------------------------------------------------------
// Browser push notification (asks permission once)
// ---------------------------------------------------------------------------
const sendBrowserNotification = (title, body) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/vite.svg", silent: true });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
};

// ---------------------------------------------------------------------------
// Main hook — always active while logged in
// ---------------------------------------------------------------------------
const useNotifications = () => {
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();

  // Use refs so socket callbacks always read the latest state WITHOUT
  // needing to re-register listeners every time state changes.
  const selectedConversationRef = useRef(null);
  const mutedRef = useRef([]);
  const incrementUnreadRef = useRef(null);

  const { selectedConversation, mutedConversationIds, incrementUnread } = useConversation();

  useEffect(() => { selectedConversationRef.current = selectedConversation; },  [selectedConversation]);
  useEffect(() => { mutedRef.current = mutedConversationIds; },                 [mutedConversationIds]);
  useEffect(() => { incrementUnreadRef.current = incrementUnread; },            [incrementUnread]);

  useEffect(() => {
    if (!socket || !authUser) return;

    const shouldNotify = (conversationId) => {
      if (mutedRef.current.includes(conversationId)) return false;
      const active = selectedConversationRef.current;
      if (active && String(active._id) === conversationId) return false;
      return true;
    };

    const handleNewMessage = (msg) => {
      const senderId = String(msg.senderId?._id || msg.senderId);
      if (senderId === String(authUser._id)) return;

      if (shouldNotify(senderId)) {
        incrementUnreadRef.current?.(senderId, "dm");
        playNotificationSound();
        const name = msg.senderId?.fullName || msg.senderId?.username || "Someone";
        sendBrowserNotification(name, msg.message || "Sent an attachment");
      }
    };

    const handleNewGroupMessage = (msg) => {
      const senderId = String(msg.senderId?._id || msg.senderId);
      if (senderId === String(authUser._id)) return;
      if (msg.isSystemMessage) return;

      const groupId = String(msg.groupId);
      if (shouldNotify(groupId)) {
        incrementUnreadRef.current?.(groupId, "group");
        playNotificationSound();
        const name = msg.senderId?.fullName || "Someone";
        sendBrowserNotification(name, msg.message || "Sent a message in group");
      }
    };

    socket.on("newMessage",      handleNewMessage);
    socket.on("newGroupMessage", handleNewGroupMessage);

    return () => {
      socket.off("newMessage",      handleNewMessage);
      socket.off("newGroupMessage", handleNewGroupMessage);
    };
  }, [socket, authUser]); // only re-register when socket or user changes
};

export default useNotifications;