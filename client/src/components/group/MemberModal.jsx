import { useState, useEffect, useCallback } from "react";
import { X, Shield, UserMinus, Crown, Users, Search, AlertCircle, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import { apiFetch } from "../../utils/api";
import useConversation from "../../zustand/useConversation";
import UserAvatar from "../common/UserAvatar";

// Confirmation Modal Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
          >
            {loading ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MemberModal = ({ isOpen, onClose, group, onMemberUpdate }) => {
  const sid = (id) => (id != null ? String(id) : "");
  const [members, setMembers] = useState([]);
  const [nonMembers, setNonMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [addSearchTerm, setAddSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();
  const { removeGroupFromCache, setSelectedConversation } = useConversation();

  const isAdmin = members.some(
    (m) => sid(m._id) === sid(authUser?._id) && m.role === "admin"
  );
  const creatorId = group?.creator?._id ?? group?.creator;
  const isCreator = sid(creatorId) === sid(authUser?._id);
  const getDisplayName = (user) => user?.fullName || user?.name || user?.username || "Unknown user";

  const fetchMembers = useCallback(async () => {
    if (!group?._id) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching members for group:", group._id);
      
      const res = await apiFetch(`/api/groups/${group._id}/members`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Members received:", data.length);
      
      if (Array.isArray(data)) {
        setMembers(data);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [group?._id]);

  const fetchNonMembers = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const memberIdSet = new Set(members.map((m) => sid(m._id)));
        const nonMembersList = data.filter((user) => !memberIdSet.has(sid(user._id)));
        setNonMembers(nonMembersList);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [isAdmin, members]);

  // Initial fetch when modal opens
  useEffect(() => {
    if (isOpen && group?._id) {
      fetchMembers();
    }
  }, [isOpen, group?._id, fetchMembers]);

  // Fetch non-members when members change and admin is true
  useEffect(() => {
    if (isOpen && isAdmin && members.length > 0) {
      fetchNonMembers();
    }
  }, [isOpen, isAdmin, members, fetchNonMembers]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleMemberListUpdate = (data) => {
      console.log("Member list updated:", data.action);
      if (data.groupId === group?._id) {
        // Refresh members list
        fetchMembers();
        onMemberUpdate?.();
      }
    };

    const handleRemovedFromGroup = (data) => {
      console.log("Removed from group:", data);
      if (data.groupId === group?._id) {
        toast.info(`You were removed from ${data.groupName}`);
        onClose();
        onMemberUpdate?.();
      }
    };

    const handleUserCreated = (user) => {
      const isAlreadyMember = members.some((member) => String(member._id) === String(user._id));
      if (isAdmin && !isAlreadyMember) {
        setNonMembers((prevUsers) => {
          const exists = prevUsers.some((item) => String(item._id) === String(user._id));
          return exists ? prevUsers : [...prevUsers, user];
        });
      }
    };

    socket.on("memberListUpdated", handleMemberListUpdate);
    socket.on("removedFromGroup", handleRemovedFromGroup);
    socket.on("userCreated", handleUserCreated);

    return () => {
      socket.off("memberListUpdated", handleMemberListUpdate);
      socket.off("removedFromGroup", handleRemovedFromGroup);
      socket.off("userCreated", handleUserCreated);
    };
  }, [socket, isOpen, group?._id, fetchMembers, onMemberUpdate, onClose, isAdmin, members]);

  const handleRemoveClick = (userId) => {
    setSelectedMemberId(userId);
    setShowConfirm(true);
  };

  const confirmRemoveMember = async () => {
    if (!selectedMemberId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await apiFetch(`/api/groups/${group._id}/remove/${selectedMemberId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to remove member");
      }

      toast.success("Member removed successfully");
      setShowConfirm(false);
      setSelectedMemberId(null);
      await fetchMembers();
      
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error.message || "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId) => {
    setAddingMember(true);
    try {
      const token = localStorage.getItem("token");
      const response = await apiFetch(`/api/groups/${group._id}/add-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: [userId] })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Member added successfully");
        await fetchMembers();
      } else {
        throw new Error(data.error || "Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error(error.message);
    } finally {
      setAddingMember(false);
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiFetch(`/api/groups/${group._id}/make-admin/${userId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Admin status granted");
        await fetchMembers();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to make admin");
      }
    } catch (error) {
      console.error("Error making admin:", error);
      toast.error(error.message);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiFetch(`/api/groups/${group._id}/remove-admin/${userId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Admin status removed");
        await fetchMembers();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove admin");
      }
    } catch (error) {
      console.error("Error removing admin:", error);
      toast.error(error.message);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group?._id) return;

    const shouldLeave = window.confirm("Leave this group? You will no longer receive messages from it.");
    if (!shouldLeave) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await apiFetch(`/api/groups/${group._id}/leave`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to leave group");
      }

      toast.success("You left the group");
      removeGroupFromCache(group._id);
      setSelectedConversation(null, false);
      onMemberUpdate?.();
      onClose();
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error(error.message || "Failed to leave group");
    } finally {
      setLoading(false);
    }
  };

  const addQ = addSearchTerm.trim().toLowerCase();
  const filteredNonMembers = nonMembers
    .filter((user) => {
      if (!addQ) return true;
      const full = (user.fullName || "").toLowerCase();
      const un = (user.username || "").toLowerCase();
      return full.includes(addQ) || un.includes(addQ);
    })
    .sort((a, b) =>
      getDisplayName(a).localeCompare(getDisplayName(b), undefined, { sensitivity: "base" })
    );

  if (!isOpen) return null;

  if (loading && members.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Group Members
              </h2>
              <p className="text-sm text-gray-500">{members.length} members</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Members List */}
          <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
            {members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No members found</p>
              </div>
            ) : (
              members.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={member.profilePic} name={getDisplayName(member)} size={40} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{getDisplayName(member)}</p>
                      <div className="flex items-center gap-2">
                        {member.role === 'admin' && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Admin
                          </span>
                        )}
                        {sid(creatorId) === sid(member._id) && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full">
                            Creator
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {(isAdmin || isCreator) && sid(member._id) !== sid(authUser?._id) && (
                    <div className="flex items-center gap-2">
                      {member.role === 'admin' && sid(creatorId) !== sid(member._id) ? (
                        <button
                          onClick={() => handleRemoveAdmin(member._id)}
                          className="p-1 text-gray-500 hover:text-amber-600 transition-all"
                          title="Remove admin"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      ) : (
                        member.role !== 'admin' && isAdmin && (
                          <button
                            onClick={() => handleMakeAdmin(member._id)}
                            className="p-1 text-gray-500 hover:text-teal-600 transition-all"
                            title="Make admin"
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                        )
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveClick(member._id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-all"
                          title="Remove member"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Add Member Section - Only for admins */}
            {isAdmin && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add New Member
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={addSearchTerm}
                    onChange={(e) => setAddSearchTerm(e.target.value)}
                    placeholder="Search users to add..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredNonMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {addSearchTerm.trim() ? (
                        <>
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No users found matching &quot;{addSearchTerm.trim()}&quot;</p>
                        </>
                      ) : (
                        <>
                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No more users to add</p>
                          <p className="text-xs mt-1">All users are already members</p>
                        </>
                      )}
                    </div>
                  ) : (
                    filteredNonMembers.map(user => (
                      <div key={user._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center gap-3">
                          <UserAvatar src={user.profilePic} name={getDisplayName(user)} size={32} />
                          <div>
                          <p className="font-medium text-gray-900 dark:text-white">{getDisplayName(user)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddMember(user._id)}
                          disabled={addingMember}
                          className="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-all"
                        >
                          {addingMember ? "Adding..." : "Add"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLeaveGroup}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Leave
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedMemberId(null);
        }}
        onConfirm={confirmRemoveMember}
        title="Remove Member"
        message="Are you sure you want to remove this member from the group? They will no longer be able to send messages."
        loading={loading}
      />
    </>
  );
};

export default MemberModal;
