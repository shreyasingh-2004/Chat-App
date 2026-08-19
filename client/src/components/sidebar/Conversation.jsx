import { useAuthContext } from "../../context/AuthContext";
import useConversation from "../../zustand/useConversation";
import { getDisplayName, getAboutSubtitle } from "../../utils/displayUser";
import UserAvatar from "../common/UserAvatar";

const Conversation = ({ conversation, lastIdx, onSelectChat, isSelected }) => {
  const { authUser } = useAuthContext();
  const { unreadCounts } = useConversation();

  const name = getDisplayName(conversation);
  const about = getAboutSubtitle(conversation);
  const unreadCount = unreadCounts[conversation._id]?.count || 0;
  const isOnline = conversation?.isOnline || false;

  return (
    <>
      <div
        onClick={() => onSelectChat(conversation)}
        className={`flex items-center gap-3 px-4 py-3 transition-all cursor-pointer group
          ${isSelected
            ? "bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20"
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
      >
        <div className="relative flex-shrink-0">
          <UserAvatar src={conversation.profilePic} name={name} size={48} />
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 bg-cyan-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold truncate ${unreadCount > 0 ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
              {name}
            </h3>
            {unreadCount > 0 && (
              <span className="flex-shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold leading-none animate-scale-in">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <p className={`text-sm truncate ${unreadCount > 0 ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
            {about}
          </p>
        </div>
      </div>
      {!lastIdx && <div className="border-b border-gray-100 dark:border-gray-800 mx-4" />}
    </>
  );
};

export default Conversation;