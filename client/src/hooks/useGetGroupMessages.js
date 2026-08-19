import { useEffect, useState, useRef } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";

// groupIdOverride: passed explicitly from Messages.jsx so the hook
// always fetches the right group without reading stale zustand state.
const useGetGroupMessages = (groupIdOverride) => {
  const [loading, setLoading] = useState(false);
  const { selectedConversation, setMessages, isGroupChat } = useConversation();
  const isFetchingRef = useRef(false);
  const fetchingForIdRef = useRef(null);

  const groupId = groupIdOverride ?? (isGroupChat ? selectedConversation?._id : null);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    if (isFetchingRef.current && fetchingForIdRef.current === groupId) {
      return;
    }

    const getMessages = async () => {
      isFetchingRef.current = true;
      fetchingForIdRef.current = groupId;
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await apiFetch(`/api/messages/group/${groupId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        let messagesArray;
        if (Array.isArray(data)) {
          messagesArray = data;
        } else if (data.messages && Array.isArray(data.messages)) {
          messagesArray = data.messages;
        } else {
          throw new Error("Invalid response format");
        }

        // Sort oldest-first so scroll-to-bottom shows latest
        const sorted = [...messagesArray].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        console.log(`✅ Received ${sorted.length} group messages`);

        if (fetchingForIdRef.current === groupId) {
          setMessages(sorted);
        }
      } catch (error) {
        console.error("Error fetching group messages:", error);
        toast.error(error.message || "Failed to load group messages");
        if (fetchingForIdRef.current === groupId) {
          setMessages([]);
        }
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
      }
    };

    getMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  return { loading };
};

export default useGetGroupMessages;