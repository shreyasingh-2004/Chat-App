import useGetConversations from "../../hooks/useGetConversations";
import useConversation from "../../zustand/useConversation";
import Conversation from "./Conversation";

const Conversations = ({ onSelectChat, selectedChat }) => {
  const { loading, conversations } = useGetConversations();
  const { setSelectedConversation } = useConversation();

  const handleSelectChat = (conversation) => {
    if (!conversation || !conversation._id) return;
    
    const userConversation = {
      _id: conversation._id,
      name: conversation.fullName,
      fullName: conversation.fullName,
      username: conversation.username,
      profilePic: conversation.profilePic,
      type: 'user',
      chatType: 'user'
    };
    
    setSelectedConversation(userConversation);
    if (onSelectChat) {
      onSelectChat(userConversation);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-gray-500">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {conversations.map((conversation, idx) => (
        <Conversation
          key={conversation._id}
          conversation={conversation}
          lastIdx={idx === conversations.length - 1}
          onSelectChat={handleSelectChat}
          isSelected={selectedChat === conversation._id}
        />
      ))}
    </div>
  );
};

export default Conversations;