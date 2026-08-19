import { useEffect, useState, useRef } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";
 
const useGetMessages = (shouldFetch = true) => {
  const [loading, setLoading] = useState(false);
  const { selectedConversation, setMessages } = useConversation();
 
  // Track the conversation ID we last COMPLETED a fetch for
  // This prevents re-fetching the same conversation and overwriting optimistic updates
  const lastFetchedIdRef = useRef(null);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);
 
  useEffect(() => {
    const convId = selectedConversation?._id ? String(selectedConversation._id) : null;
 
    // Nothing to fetch
    if (!shouldFetch || !convId) {
      setLoading(false);
      return;
    }
 
    // ✅ KEY FIX: Don't re-fetch the same conversation we already loaded
    // This stops the fetch from overwriting optimistically added messages
    if (lastFetchedIdRef.current === convId) {
      return;
    }
 
    // Already fetching this conversation — don't double-fetch
    if (isFetchingRef.current) {
      return;
    }
 
    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
 
    const getMessages = async () => {
      isFetchingRef.current = true;
      setLoading(true);
 
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
 
        console.log(`📥 Fetching messages for ${convId}`);
 
        const response = await apiFetch(`/api/messages/${convId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: abortControllerRef.current?.signal,
        });
 
        if (!response.ok) {
          const errorData = await response.text();
          console.error("Server response:", errorData);
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
 
        console.log(`✅ Received ${messagesArray.length} messages`);
 
        // Only update state if we're still on the same conversation
        if (String(selectedConversation?._id) === convId) {
          setMessages(messagesArray);
          lastFetchedIdRef.current = convId; // ✅ Mark this conversation as fetched
        }
 
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch aborted for conversation:", convId);
          return;
        }
        console.error("❌ Error fetching messages:", error);
        toast.error(error.message || "Failed to load messages");
        if (String(selectedConversation?._id) === convId) {
          setMessages([]);
        }
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
      }
    };
 
    getMessages();
 
    // ✅ Reset the lastFetchedId when conversation changes so next switch re-fetches
    return () => {
      lastFetchedIdRef.current = null;
      isFetchingRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [shouldFetch, selectedConversation?._id]);  // eslint-disable-line react-hooks/exhaustive-deps
 
  return { loading };
};
 
export default useGetMessages;