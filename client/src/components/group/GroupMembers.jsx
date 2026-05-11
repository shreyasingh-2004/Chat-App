import { useState, useEffect } from "react";
import { X, User, Crown, UserMinus, UserPlus } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const GroupMembers = ({ group, isOpen, onClose, onMemberRemoved }) => {
  const { authUser } = useAuthContext();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = group?.creator?._id === authUser?._id || group?.creator === authUser?._id;

  useEffect(() => {
    if (group && group.members) {
      setMembers(group.members);
    }
  }, [group]);

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      const currentMemberIds = members.map(m => m.userId?._id || m.userId);
      const nonMembers = data.filter(u => !currentMemberIds.includes(u._id));
      setAllUsers(nonMembers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddMember = async (userId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/groups/${group._id}/add-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: [userId] })
      });

      if (res.ok) {
        toast.success("Member added successfully");
        fetchAllUsers();
        onMemberRemoved?.();
        // Refresh group data
        const updatedGroup = await res.json();
        setMembers(updatedGroup.members);
        setShowAddMember(false);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add member");
      }
    } catch (error) {
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!isAdmin) {
      toast.error("Only admin can remove members");
      return;
    }
    
    if (window.confirm(`Remove ${userName} from the group?`)) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/groups/${group._id}/remove-member/${userId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          toast.success("Member removed successfully");
          setMembers(members.filter(m => (m.userId?._id || m.userId) !== userId));
          onMemberRemoved?.();
        } else {
          const error = await res.json();
          toast.error(error.error || "Failed to remove member");
        }
      } catch (error) {
        toast.error("Failed to remove member");
      }
    }
  };

  const openAddMember = () => {
    fetchAllUsers();
    setShowAddMember(true);
  };

  if (!isOpen) return null;

  const filteredUsers = allUsers.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Group Members
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Add Member Button */}
        {isAdmin && !showAddMember && (
          <button
            onClick={openAddMember}
            className="w-full p-3 flex items-center justify-center gap-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        )}

        {/* Add Member Section */}
        {showAddMember && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Add Members</h3>
              <button
                onClick={() => setShowAddMember(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="max-h-48 overflow-y-auto mt-2 space-y-1">
              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  onClick={() => handleAddMember(user._id)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && searchTerm && (
                <p className="text-center text-gray-500 py-4 text-sm">No users found</p>
              )}
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {members.map((member) => {
            const userId = member.userId?._id || member.userId;
            const userName = member.userId?.fullName || member.fullName;
            const userRole = member.role;
            const isCreator = group?.creator?._id === userId || group?.creator === userId;
            
            return (
              <div
                key={userId}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {userName}
                      </p>
                      {isCreator && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {userRole === 'admin' ? 'Group Admin' : 'Member'}
                    </p>
                  </div>
                </div>
                
                {isAdmin && !isCreator && (
                  <button
                    onClick={() => handleRemoveMember(userId, userName)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 text-center">
            {members.length} member{members.length !== 1 ? 's' : ''} in this group
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupMembers;