import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";
import toast from "react-hot-toast";

const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();
  const { socket } = useSocketContext();

  const logout = async () => {
    setLoading(true);
    try {
      // Disconnect socket
      if (socket) {
        socket.disconnect();
      }
      
      // Call logout API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Clear local storage
      localStorage.removeItem("chat-user");
      localStorage.removeItem("token");
      localStorage.removeItem("realtalk-storage");
      
      // Clear auth state
      setAuthUser(null);
      
      toast.success("Logged out successfully");
      
      // Redirect to login page
      window.location.href = "/login";
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
};

export default useLogout;