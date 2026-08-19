import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

export const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token is valid on app load
    const checkAuth = async () => {
      const user = localStorage.getItem("chat-user");
      const token = localStorage.getItem("token");
      
      if (!user || !token) {
        setAuthUser(null);
        setLoading(false);
        return;
      }

      // Optional: Verify token with backend
      try {
        const response = await apiFetch("/api/auth/verify", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setAuthUser(JSON.parse(user));
        } else if (response.status === 401) {
          localStorage.removeItem("chat-user");
          localStorage.removeItem("token");
          setAuthUser(null);
        } else {
          setAuthUser(JSON.parse(user));
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        // Preserve auth state on temporary network/server issues
        setAuthUser(JSON.parse(user));
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
