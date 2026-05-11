import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

const getSocketUrl = () => {
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  // Use env variable or default to localhost:5000
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
};

export const SocketContextProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const { authUser, setAuthUser } = useAuthContext();
  const socketRef = useRef(null);
  const connectionAttempted = useRef(false);

  useEffect(() => {
    if (!authUser) {
      if (socketRef.current) {
        console.log("Disconnecting socket - no auth user");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      connectionAttempted.current = false;
      return;
    }

    // Don't create multiple connections
    if (connectionAttempted.current && socketRef.current?.connected) {
      console.log("Socket already connected, reusing existing connection");
      setSocket(socketRef.current);
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      console.log("No valid token found");
      localStorage.removeItem("token");
      localStorage.removeItem("chat-user");
      setAuthUser(null);
      return;
    }

    // Reset connection flag if socket is disconnected
    if (socketRef.current && !socketRef.current.connected) {
      connectionAttempted.current = false;
    }

    if (connectionAttempted.current) {
      console.log("Connection already attempted, waiting...");
      return;
    }

    connectionAttempted.current = true;
    const socketUrl = getSocketUrl();
    console.log(`🔌 Connecting to socket server at: ${socketUrl}`);

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    socketInstance.on("getOnlineUsers", (users) => {
      console.log("📡 Online users updated:", users.length);
      setOnlineUsers(users);
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected successfully!");
      setSocket(socketInstance);
      connectionAttempted.current = true;
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      console.error("Make sure backend is running on port 5000");
      connectionAttempted.current = false;
      setSocket(null);
      if (error && error.message && error.message.includes("Auth failed")) {
        console.log("Auth failed, clearing local storage");
        localStorage.removeItem("token");
        localStorage.removeItem("chat-user");
        setAuthUser(null);
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setSocket(null);
      if (reason === "io server disconnect") {
        // Server disconnected, attempt to reconnect
        socketInstance.connect();
      }
      connectionAttempted.current = false;
    });

    socketRef.current = socketInstance;

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      connectionAttempted.current = false;
    };
  }, [authUser, setAuthUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};