import { useEffect } from "react";
import useGetGroups from "../../hooks/useGetGroups";
import useConversation from "../../zustand/useConversation";
import { Users } from "lucide-react";

const GroupsList = () => {
  const { loading, groups } = useGetGroups(); // Remove refetch from destructuring
  const { setSelectedConversation, selectedConversation, isGroupChat } = useConversation();

  // Remove the useEffect that was calling refetch - useGetGroups already fetches on mount

  const handleSelectGroup = (group) => {
    if (!group || !group._id) {
      console.error("Invalid group:", group);
      return;
    }
    
    // Check if already selected - prevent re-selecting same group
    if (selectedConversation?._id === group._id && isGroupChat) {
      console.log("Group already selected, skipping:", group.name);
      return;
    }
    
    console.log("📌 Selecting group:", group.name);
    
    const groupConversation = {
      _id: group._id,
      name: group.name,
      type: 'group',
      chatType: 'group',
      members: group.members || [],
      creator: group.creator,
      description: group.description || '',
      avatar: group.avatar || null
    };
    
    setSelectedConversation(groupConversation, true);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-32 gap-2">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500">Loading groups...</p>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <Users className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-gray-900 dark:text-white font-medium mb-2">No Groups Yet</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Click the + icon above to create your first group
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {groups.map((group) => {
        const isSelected = selectedConversation?._id === group._id && isGroupChat;
        
        return (
          <div
            key={group._id}
            onClick={() => handleSelectGroup(group)}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer ${
              isSelected ? 'bg-gray-100 dark:bg-gray-700 border-l-4 border-teal-500' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {group.name}
                </h3>
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full">
                  Group
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{group.members?.length || 0} members</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupsList;