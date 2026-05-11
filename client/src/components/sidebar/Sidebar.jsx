import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import useLogout from "../../hooks/useLogout";
import useConversation from "../../zustand/useConversation";
import { 
  LogOut, 
  User, 
  Moon, 
  Sun, 
  MessageCircle,
  Users,
  UserPlus
} from "lucide-react";
import SearchInput from "./SearchInput";
import Conversations from "./Conversations";
import GroupsList from "./GroupsList";
import CreateGroupModal from "../group/CreateGroupModal";

const Sidebar = ({ onSelectChat, selectedChat }) => {
  const { logout, loading } = useLogout();
  const { authUser } = useAuthContext();
  const [isDark, setIsDark] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab, setActiveTab] = useState("chats");
  const { setSelectedConversation } = useConversation();

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleSelectChat = (conversation) => {
    console.log("📌 Selecting conversation:", conversation.fullName);
    setSelectedConversation(conversation, false);
    if (onSelectChat) onSelectChat(conversation);
  };

  const handleSelectGroup = (group) => {
    console.log("📌 Selecting group:", group.name);
    setSelectedConversation(group, true);
    if (onSelectChat) onSelectChat(group);
  };

  const handleGroupCreated = (newGroup) => {
    console.log("Group created:", newGroup);
    setActiveTab("groups");
    handleSelectGroup(newGroup);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                {authUser?.fullName?.split(' ')[0] || 'User'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Now</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCreateGroup(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              title="Create New Group"
            >
              <UserPlus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            <button
              onClick={logout}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 py-3 text-sm font-medium transition-all ${
            activeTab === "chats"
              ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>Chats</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex-1 py-3 text-sm font-medium transition-all ${
            activeTab === "groups"
              ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-600"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            <span>Groups</span>
          </div>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <SearchInput />
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chats" ? (
          <Conversations onSelectChat={handleSelectChat} selectedChat={selectedChat} />
        ) : (
          <GroupsList />
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};

export default Sidebar;