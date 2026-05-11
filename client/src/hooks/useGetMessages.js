import { useEffect, useState, useRef } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useGetMessages = (shouldFetch = true) => {
  const [loading, setLoading] = useState(false);
  const { selectedConversation, setMessages } = useConversation();
  const fetchedRef = useRef(false);
  const conversationIdRef = useRef(null);

  useEffect(() => {
    if (!shouldFetch || !selectedConversation?._id) {
      return;
    }
    
    // Don't fetch if already fetched for this conversation
    if (fetchedRef.current && conversationIdRef.current === selectedConversation._id) {
      console.log("Already fetched messages for this conversation, skipping");
      return;
    }
    
    // Reset fetch flag when conversation changes
    if (conversationIdRef.current !== selectedConversation._id) {
      fetchedRef.current = false;
      conversationIdRef.current = selectedConversation._id;
    }
    
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const getMessages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        
        console.log(`📥 Fetching messages for ${selectedConversation._id}`);
        
        const response = await fetch(`/api/messages/${selectedConversation._id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error("Server response:", errorData);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        
        console.log(`✅ Received ${data.length} messages`);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error(error.message || "Failed to load messages");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    getMessages();

    return () => {
      // Don't reset on cleanup - keep fetched flag
    };
  }, [shouldFetch, selectedConversation?._id, setMessages]);

  return { loading };
};

export default useGetMessages;