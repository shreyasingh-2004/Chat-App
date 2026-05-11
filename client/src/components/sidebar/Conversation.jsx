import { useSocketContext } from "../../context/SocketContext";
import { User, Circle } from "lucide-react";

const Conversation = ({ conversation, lastIdx, onSelectChat, isSelected }) => {
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers?.includes(conversation._id);

  const handleClick = () => {
    if (onSelectChat) {
      onSelectChat(conversation);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer ${
          isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
        }`}
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <Circle className={`absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{conversation.fullName}</h3>
          <p className="text-sm text-gray-500 truncate">@{conversation.username}</p>
        </div>
      </div>
      {!lastIdx && <div className="border-b border-gray-200 dark:border-gray-700 mx-4" />}
    </>
  );
};

export default Conversation;