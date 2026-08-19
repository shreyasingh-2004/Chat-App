import useGetGroups from "../../hooks/useGetGroups";
import useConversation from "../../zustand/useConversation";
import { Users, Plus } from "lucide-react";

const GroupsList = ({ onSelectGroup }) => {
  const { loading, groups } = useGetGroups();
  const { setSelectedConversation, selectedConversation, isGroupChat, unreadCounts } = useConversation();

  const handleSelectGroup = (group) => {
    if (!group || !group._id) return;
    if (selectedConversation?._id === group._id && isGroupChat) return;

    const groupConversation = {
      _id: group._id,
      name: group.name,
      type: "group",
      chatType: "group",
      members: group.members || [],
      creator: group.creator,
      description: group.description || "",
      avatar: group.avatar || null,
    };
    setSelectedConversation(groupConversation, true);
    if (onSelectGroup) onSelectGroup(groupConversation);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading groups...</p>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-indigo-500" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Groups Yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Create a group to chat with multiple friends
        </p>
        <button className="btn-primary btn-modern text-sm px-4 py-2">
          <Plus className="w-4 h-4" />
          Create Your First Group
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      <div className="px-4 py-2">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Your Groups ({groups.length})
        </span>
      </div>
      {groups.map((group) => {
        const isSelected = selectedConversation?._id === group._id && isGroupChat;
        const groupIdStr = String(group._id);
        const unreadCount = unreadCounts[groupIdStr]?.count || 0;

        return (
          <div
            key={group._id}
            onClick={() => handleSelectGroup(group)}
            className={`flex items-center gap-3 px-4 py-3 transition-all cursor-pointer group
              ${isSelected 
                ? "bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20" 
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold truncate ${
                  unreadCount > 0 ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                }`}>
                  {group.name}
                </h3>
                {unreadCount > 0 ? (
                  <span className="ml-2 flex-shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold leading-none animate-scale-in">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : (
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                    Group
                  </span>
                )}
              </div>
              <p className={`text-xs ${
                unreadCount > 0 ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-500 dark:text-gray-400"
              }`}>
                {group.members?.length || 0} members
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupsList;