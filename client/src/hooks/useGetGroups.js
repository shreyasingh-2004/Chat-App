import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

const useGetGroups = () => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const fetchedRef = useRef(false);

  const refetch = async () => {
    // Prevent multiple simultaneous fetches
    if (fetchedRef.current) {
      console.log("Already fetching groups, skipping...");
      return;
    }
    
    fetchedRef.current = true;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setGroups([]);
        return;
      }

      console.log("Fetching groups...");
      
      const res = await fetch("/api/groups/my-groups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Groups API error:", errorData);
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Groups received:", data.length);
      
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
      setGroups([]);
    } finally {
      setLoading(false);
      // Reset fetch flag after delay
      setTimeout(() => {
        fetchedRef.current = false;
      }, 1000);
    }
  };

  // Only fetch once when component mounts
  useEffect(() => {
    if (!fetchedRef.current) {
      refetch();
    }
  }, []);

  return { loading, groups, refetch };
};

export default useGetGroups;