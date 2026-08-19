import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useAuthContext } from "./AuthContext";
import { getApiBaseUrl } from "../utils/api";
import useConversation from "../zustand/useConversation";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const { authUser, setAuthUser } = useAuthContext();
  const socketRef = useRef(null);
  const connectionAttempted = useRef(false);
  const reconnectTimeoutRef = useRef(null);
  const currentSocketUrlRef = useRef(null);

  // Cleanup function for socket
  const cleanupSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      // Remove all listeners before disconnecting
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setSocket(null);
    connectionAttempted.current = false;
    currentSocketUrlRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;
    let connectionTimeout = null;

    if (!authUser) {
      cleanupSocket();
      return undefined;
    }

    // Check if we already have a valid connection
    if (socketRef.current?.connected && connectionAttempted.current) {
      console.log("Socket already connected, reusing existing connection");
      setSocket(socketRef.current);
      return undefined;
    }

    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      console.log("No valid token found");
      localStorage.removeItem("token");
      localStorage.removeItem("chat-user");
      setAuthUser(null);
      return undefined;
    }

    // Reset connection attempt if socket exists but is disconnected
    if (socketRef.current && !socketRef.current.connected) {
      connectionAttempted.current = false;
    }

    // Prevent multiple simultaneous connection attempts
    if (connectionAttempted.current) {
      console.log("Connection already attempted, waiting...");
      return undefined;
    }

    connectionAttempted.current = true;

    getApiBaseUrl()
      .then((socketUrl) => {
        if (cancelled) return;

        // Don't reconnect to the same URL if already connected
        if (currentSocketUrlRef.current === socketUrl && socketRef.current?.connected) {
          console.log("Already connected to this socket URL");
          connectionAttempted.current = false;
          setSocket(socketRef.current);
          return;
        }

        console.log(`Connecting to socket server at: ${socketUrl}`);
        currentSocketUrlRef.current = socketUrl;

        // Clean up existing socket before creating new one
        if (socketRef.current) {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
          socketRef.current = null;
        }

        const socketInstance = io(socketUrl, {
          auth: { token: token },
          transports: ["websocket", "polling"],
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000,
          randomizationFactor: 0.5,
        });

        // Connection timeout handler
        connectionTimeout = setTimeout(() => {
          if (!socketInstance.connected && !cancelled) {
            console.error("Socket connection timeout after 10 seconds");
            socketInstance.close();
            connectionAttempted.current = false;
            setSocket(null);
          }
        }, 10000);

        // Event handlers
        socketInstance.on("getOnlineUsers", (users) => {
          // Remove duplicates and filter out current user's ID
          const uniqueUsers = [...new Set(users)];
          const filteredUsers = uniqueUsers.filter(userId => userId !== authUser?._id);
          console.log("Online users updated:", filteredUsers.length);
          setOnlineUsers(filteredUsers);
        });

        socketInstance.on("userUpdated", (updatedUser) => {
          if (!updatedUser?._id) return;
          const { upsertConversation, selectedConversation, isGroupChat, setSelectedConversation } =
            useConversation.getState();
          upsertConversation(updatedUser);
          if (
            !isGroupChat &&
            selectedConversation &&
            String(selectedConversation._id) === String(updatedUser._id)
          ) {
            setSelectedConversation(
              {
                ...selectedConversation,
                fullName: updatedUser.fullName ?? selectedConversation.fullName,
                name: updatedUser.fullName ?? selectedConversation.name,
                username: updatedUser.username ?? selectedConversation.username,
                profilePic: updatedUser.profilePic ?? selectedConversation.profilePic,
                bio: updatedUser.bio ?? selectedConversation.bio,
              },
              false
            );
          }
        });

        socketInstance.on("connect", () => {
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
          console.log("Socket connected successfully with ID:", socketInstance.id);
          setSocket(socketInstance);
          connectionAttempted.current = true;
        });

        socketInstance.on("connect_error", (error) => {
          console.error("Socket connection error:", error.message);
          
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }

          connectionAttempted.current = false;
          setSocket(null);
          currentSocketUrlRef.current = null;

          // Handle authentication errors
          if (error?.message?.includes("Auth failed") || error?.message?.includes("authentication")) {
            console.log("Authentication failed, clearing local storage");
            localStorage.removeItem("token");
            localStorage.removeItem("chat-user");
            setAuthUser(null);
            cleanupSocket();
          }

          // Implement exponential backoff for reconnection
          if (socketInstance.io?.opts?.reconnectionAttempts > 0) {
            const delay = Math.min(1000 * Math.pow(1.5, socketInstance.io?.reconnectionAttempts || 1), 10000);
            console.log(`Will attempt to reconnect in ${delay}ms`);
          }
        });

        socketInstance.on("reconnect_attempt", (attemptNumber) => {
          console.log(`Reconnection attempt ${attemptNumber}`);
          // Refresh token before reconnection attempt
          const freshToken = localStorage.getItem("token");
          if (freshToken && freshToken !== "undefined" && freshToken !== "null") {
            socketInstance.auth = { token: freshToken };
          } else {
            console.log("No valid token available for reconnection");
            cleanupSocket();
            setAuthUser(null);
          }
        });

        socketInstance.on("reconnect", (attemptNumber) => {
          console.log(`Socket reconnected successfully after ${attemptNumber} attempts`);
          setSocket(socketInstance);
          connectionAttempted.current = true;
        });

        socketInstance.on("reconnect_failed", () => {
          console.error("Socket reconnection failed after maximum attempts");
          connectionAttempted.current = false;
          setSocket(null);
          currentSocketUrlRef.current = null;
        });

        socketInstance.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
          setSocket(null);
          currentSocketUrlRef.current = null;

          // Don't reset connectionAttempted for server-initiated disconnects
          if (reason === "io server disconnect") {
            // Server disconnected us, attempt manual reconnect
            console.log("Server initiated disconnect, attempting to reconnect");
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
              if (socketRef.current && !socketRef.current.connected) {
                socketRef.current.connect();
              }
              reconnectTimeoutRef.current = null;
            }, 1000);
          } else if (reason === "transport close" || reason === "transport error") {
            // Transport issues, reset connection attempt flag to allow reconnection
            connectionAttempted.current = false;
          }
        });

        socketInstance.on("error", (error) => {
          console.error("Socket error:", error);
          // Don't immediately disconnect on error, let reconnection logic handle it
        });

        socketRef.current = socketInstance;
      })
      .catch((error) => {
        console.error("Socket setup failed:", error.message);
        connectionAttempted.current = false;
        setSocket(null);
        currentSocketUrlRef.current = null;

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          if (authUser && !socketRef.current?.connected) {
            console.log("Retrying socket connection setup...");
            connectionAttempted.current = false;
            reconnectTimeoutRef.current = null;
          }
        }, 5000);
      });

    return () => {
      cancelled = true;
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      cleanupSocket();
    };
  }, [authUser, setAuthUser]);

  // Monitor online status and handle network changes
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network connection restored, checking socket...");
      if (authUser && socketRef.current && !socketRef.current.connected) {
        console.log("Attempting to reconnect socket after network restore");
        connectionAttempted.current = false;
        socketRef.current.connect();
      }
    };

    const handleOffline = () => {
      console.log("Network connection lost");
      // Don't disconnect, let socket handle it naturally
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};