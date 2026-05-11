import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const getConversations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        const res = await fetch(`${apiUrl}/api/users`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("chat-user");
          window.location.href = "/login";
          return;
        }
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load conversations");
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    getConversations();
  }, []);

  return { loading, conversations };
};

export default useGetConversations;