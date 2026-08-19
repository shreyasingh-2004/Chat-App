import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import { apiFetch, getAuthHeaders } from "../utils/api";
import useConversation from "../zustand/useConversation";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuthContext();
  const { conversations, setConversations } = useConversation();

  useEffect(() => {
    if (!authUser) {
      setConversations([]);
      return;
    }

    const getConversations = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        if (!token || token === "undefined" || token === "null") {
          setConversations([]);
          return;
        }

        const res = await apiFetch("/api/users", {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("chat-user");
          setConversations([]);
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.status}`);
        }

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const sortedUsers = Array.isArray(data)
          ? [...data].sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""))
          : [];

        setConversations(sortedUsers);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load contacts");
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    getConversations();
  }, [authUser, setConversations]);

  return { loading, conversations };
};

export default useGetConversations;
