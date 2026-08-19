import { useEffect, useState } from "react";
import { createPortal } from "react-dom"; // ✅ ADD THIS
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import useLogout from "../../hooks/useLogout";
import useConversation from "../../zustand/useConversation";
import { LogOut, Moon, Sun, MessageCircle, Users, UserPlus } from "lucide-react";
import SearchInput from "./SearchInput";
import Conversations from "./Conversations";
import GroupsList from "./GroupsList";
import CreateGroupModal from "../group/CreateGroupModal";
import ProfileModal from "./ProfileModal";
import UserAvatar from "../common/UserAvatar";

const Sidebar = ({ onSelectChat, selectedChat }) => {
  const { logout, loading } = useLogout();
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();
  const [isDark, setIsDark] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("chats");
  const { upsertConversation, upsertGroup, removeGroupFromCache } = useConversation();

  useEffect(() => {
    const isDarkMode = localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (!socket || !authUser?._id) return undefined;

    const isCurrentUserMember = (group) =>
      group?.members?.some((member) => {
        const memberId = member.userId?._id || member.userId;
        return String(memberId) === String(authUser._id);
      });

    const handleGroupUpsert = (group) => {
      if (isCurrentUserMember(group)) upsertGroup(group);
    };

    const handleMemberListUpdated = ({ group }) => {
      handleGroupUpsert(group);
    };

    const handleGroupRemoved = ({ groupId }) => {
      removeGroupFromCache(groupId);
    };

    const handleUserCreated = (user) => {
      if (String(user?._id) !== String(authUser._id)) {
        upsertConversation(user);
      }
    };

    socket.on("groupCreated", handleGroupUpsert);
    socket.on("memberListUpdated", handleMemberListUpdated);
    socket.on("removedFromGroup", handleGroupRemoved);
    socket.on("groupDeleted", handleGroupRemoved);
    socket.on("userCreated", handleUserCreated);

    return () => {
      socket.off("groupCreated", handleGroupUpsert);
      socket.off("memberListUpdated", handleMemberListUpdated);
      socket.off("removedFromGroup", handleGroupRemoved);
      socket.off("groupDeleted", handleGroupRemoved);
      socket.off("userCreated", handleUserCreated);
    };
  }, [authUser?._id, removeGroupFromCache, socket, upsertConversation, upsertGroup]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", !isDark ? "dark" : "light");
  };

  const handleSelectChat = (conversation) => {
    if (onSelectChat) onSelectChat(conversation);
  };

  const handleSelectGroup = (group) => {
    if (onSelectChat) onSelectChat(group);
  };

  const handleGroupCreated = (newGroup) => {
    setActiveTab("groups");
    handleSelectGroup(newGroup);
  };

  return (
    <>
      <div className="flex h-full w-full flex-col bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 group flex-1"
            >
              <div className="relative">
                <UserAvatar src={authUser?.profilePic} name={authUser?.fullName} size={48} />
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 bg-green-500 animate-pulse-ring" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {authUser?.fullName?.split(" ")[0] || "User"}
                </h3>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">● Online</p>
              </div>
            </button>

            <div className="flex gap-1">
              <button
                onClick={() => setShowCreateGroup(true)}
                className="p-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all group"
                title="Create New Group"
              >
                <UserPlus className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all group"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                )}
              </button>
              <button
                onClick={logout}
                disabled={loading}
                className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all group"
              >
                <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700/50">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2
              ${activeTab === "chats"
                ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chats</span>
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2
              ${activeTab === "groups"
                ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Groups</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <SearchInput />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          {activeTab === "chats" ? (
            <Conversations onSelectChat={handleSelectChat} selectedChat={selectedChat} />
          ) : (
            <GroupsList onSelectGroup={handleSelectGroup} />
          )}
        </div>
      </div>

      {/* ✅ Modals rendered via Portal directly on document.body — outside sidebar's backdrop-filter */}
      {createPortal(
        <>
          <CreateGroupModal
            isOpen={showCreateGroup}
            onClose={() => setShowCreateGroup(false)}
            onGroupCreated={handleGroupCreated}
          />
          <ProfileModal
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
          />
        </>,
        document.body
      )}
    </>
  );
};

export default Sidebar;