import { useEffect, useState, useRef } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useGetGroupMessages = (groupId) => {
  const [loading, setLoading] = useState(false);
  const { setMessages, messages } = useConversation();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!groupId) return;
    
    // Check if we already have messages for this group
    const hasMessagesForThisGroup = messages.length > 0 && messages[0]?.groupId === groupId;
    
    if (hasMessagesForThisGroup) {
      console.log("Already have messages for group:", groupId);
      return;
    }
    
    if (fetchedRef.current) {
      console.log("Already fetched messages for group:", groupId);
      return;
    }
    
    fetchedRef.current = true;

    const getMessages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        console.log(`📥 Fetching messages for group ${groupId}`);
        
        const res = await fetch(`/api/messages/group/${groupId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        console.log(`📨 Received ${data.length} messages for group`);
        
        const sortedMessages = data.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        setMessages(sortedMessages);
      } catch (error) {
        console.error("Error fetching group messages:", error);
        toast.error("Failed to load messages");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    getMessages();
    
    // Reset fetched flag when groupId changes
    return () => {
      fetchedRef.current = false;
    };
  }, [groupId, setMessages, messages]);

  return { loading };
};

export default useGetGroupMessages;