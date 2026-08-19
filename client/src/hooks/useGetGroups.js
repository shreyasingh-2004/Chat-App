import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";
import { useAuthContext } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";

const useGetGroups = () => {
  const { groups, setGroups, upsertGroup, removeGroupFromCache } = useConversation();
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();

  const refetch = async () => {
    if (fetchingRef.current) {
      console.log("Already fetching groups, skipping...");
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setGroups([]);
        return;
      }

      console.log("Fetching groups...");

      const res = await apiFetch("/api/groups/my-groups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!fetchingRef.current) {
      refetch();
    }
  }, []);

  useEffect(() => {
    if (!socket || !authUser?._id) return undefined;

    const isCurrentUserMember = (group) => {
      return group?.members?.some((member) => {
        const memberId = member.userId?._id || member.userId;
        return String(memberId) === String(authUser._id);
      });
    };

    const handleGroupCreated = (group) => {
      if (!group?._id || !isCurrentUserMember(group)) return;
      upsertGroup(group);
    };

    const handleMemberListUpdated = ({ group, action }) => {
      if (!group) return;
      const isMember = isCurrentUserMember(group);
      if (isMember) {
        upsertGroup(group);
        // Join the socket room immediately so we receive live messages
        if (action === "members_added" && socket) {
          socket.emit("joinGroupRoom", { groupId: group._id });
        }
      }
    };

    const removeGroup = ({ groupId }) => {
      removeGroupFromCache(groupId);
    };

    socket.on("groupCreated", handleGroupCreated);
    socket.on("memberListUpdated", handleMemberListUpdated);
    socket.on("removedFromGroup", removeGroup);
    socket.on("groupDeleted", removeGroup);

    return () => {
      socket.off("groupCreated", handleGroupCreated);
      socket.off("memberListUpdated", handleMemberListUpdated);
      socket.off("removedFromGroup", removeGroup);
      socket.off("groupDeleted", removeGroup);
    };
  }, [authUser?._id, removeGroupFromCache, socket, upsertGroup]);

  return { loading, groups, refetch };
};

export default useGetGroups;