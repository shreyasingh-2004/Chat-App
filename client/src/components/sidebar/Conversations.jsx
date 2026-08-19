import useGetConversations from "../../hooks/useGetConversations";
import useConversation from "../../zustand/useConversation";
import Conversation from "./Conversation";
import { toChatPartnerConversation } from "../../utils/displayUser";

const Conversations = ({ onSelectChat, selectedChat }) => {
  const { loading, conversations } = useGetConversations();
  const { setSelectedConversation } = useConversation();

  const handleSelectChat = (conversation) => {
    const userConversation = toChatPartnerConversation(conversation);
    if (!userConversation) return;

    setSelectedConversation(userConversation);
    if (onSelectChat) {
      onSelectChat(userConversation);
    }
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-gray-500">No contacts found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Contacts ({conversations.length})
      </div>
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