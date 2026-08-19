import { useState, useEffect } from "react";
import { X, Search, Users, Check } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../../utils/api";
import { useSocketContext } from "../../context/SocketContext";

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { socket } = useSocketContext();

  // Inline validation errors — matching Login/SignUp pattern
  const [errors, setErrors] = useState({ groupName: "", members: "" });

  useEffect(() => {
    if (isOpen) fetchUsers();
  }, [isOpen]);

  useEffect(() => {
    if (!socket || !isOpen) return undefined;
    const handleUserCreated = (user) => {
      setAllUsers((prev) => {
        const exists = prev.some((item) => String(item._id) === String(user._id));
        return exists ? prev : [...prev, user];
      });
    };
    socket.on("userCreated", handleUserCreated);
    return () => socket.off("userCreated", handleUserCreated);
  }, [isOpen, socket]);

  const fetchUsers = async () => {
    setSearching(true);
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/users", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setAllUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const filteredUsers = allUsers.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const getDisplayName = (user) => user?.fullName || user?.name || user?.username || "Unknown user";

  const toggleUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
      if (errors.members) setErrors((prev) => ({ ...prev, members: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { groupName: "", members: "" };
    let isValid = true;
    if (!groupName.trim()) {
      newErrors.groupName = "Group name is required";
      isValid = false;
    } else if (groupName.trim().length < 2) {
      newErrors.groupName = "Group name must be at least 2 characters";
      isValid = false;
    } else if (groupName.trim().length > 50) {
      newErrors.groupName = "Group name must be 50 characters or less";
      isValid = false;
    }
    if (selectedUsers.length === 0) {
      newErrors.members = "Please select at least one member";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleCreateGroup = async () => {
    setErrors({ groupName: "", members: "" });
    if (!validateForm()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: groupName, memberIds: selectedUsers.map((u) => u._id) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Group created successfully!");
        onGroupCreated?.(data);
        handleClose();
      } else {
        throw new Error(data.error || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGroupName("");
    setSearchTerm("");
    setSelectedUsers([]);
    setErrors({ groupName: "", members: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Group</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Group Name */}
          <div>
            <label className="label p-0 mb-1">
              <span className="text-base label-text text-gray-700 dark:text-gray-300">Group Name</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (errors.groupName) setErrors((prev) => ({ ...prev, groupName: "" }));
              }}
              placeholder="Enter group name"
              className={`w-full input input-bordered h-10 ${errors.groupName ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {errors.groupName && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.groupName}</p>
            )}
          </div>

          {/* Search Users */}
          <div>
            <label className="label p-0 mb-1">
              <span className="text-base label-text text-gray-700 dark:text-gray-300">Add Members</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 input input-bordered h-10"
              />
            </div>
            {errors.members && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.members}</p>
            )}
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="label p-0 mb-1">
                <span className="text-sm label-text text-gray-700 dark:text-gray-300">Selected ({selectedUsers.length})</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <span
                    key={user._id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-700"
                  >
                    {getDisplayName(user)}
                    <button onClick={() => toggleUser(user)} className="hover:text-blue-900 dark:hover:text-blue-100">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {searching ? (
              <div className="text-center py-4 text-gray-500 text-sm">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">No users found</div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUsers.some((u) => u._id === user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => toggleUser(user)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-600"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{getDisplayName(user)}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={loading}
            className="flex-1 rounded-lg hover:bg-blue-600 bg-blue-500 text-white font-medium py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-xs"></span>
                Creating...
              </span>
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
