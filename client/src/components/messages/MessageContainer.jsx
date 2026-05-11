import { useEffect, useState } from "react";
import useConversation from "../../zustand/useConversation";
import useListenMessages from "../../hooks/useListenMessages";
import Messages from "./Messages";
import MessageInput from "./MessageInput";
import MemberModal from "../group/MemberModal";
import { ArrowLeft, User, Phone, Video, MoreVertical, Users } from "lucide-react";

const MessageContainer = () => {
  const { selectedConversation, isGroupChat, setSelectedConversation } = useConversation();
  const [showMembers, setShowMembers] = useState(false);
  
  useListenMessages();

  useEffect(() => {
    console.log("MessageContainer - selectedConversation:", selectedConversation);
    console.log("MessageContainer - isGroupChat:", isGroupChat);
  }, [selectedConversation, isGroupChat]);

  if (!selectedConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a conversation</p>
      </div>
    );
  }

  const displayName = isGroupChat 
    ? selectedConversation.name 
    : selectedConversation.fullName;

  const handleHeaderClick = () => {
    if (isGroupChat) {
      setShowMembers(true);
    }
  };

  const handleBack = () => {
    setSelectedConversation(null, false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div 
        className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between ${
          isGroupChat ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all' : ''
        }`}
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleBack();
            }}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isGroupChat 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
              : 'bg-teal-600'
          }`}>
            {isGroupChat ? (
              <Users className="w-5 h-5 text-white" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {displayName}
            </h3>
            <p className="text-xs text-gray-500">
              {isGroupChat ? 'Click to view members' : 'Online'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <Phone className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <Video className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <Messages />
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <MessageInput />
      </div>

      {/* Member Modal */}
      {isGroupChat && (
        <MemberModal
          isOpen={showMembers}
          onClose={() => setShowMembers(false)}
          group={selectedConversation}
          onMemberUpdate={() => {
            console.log("Member updated");
          }}
        />
      )}
    </div>
  );
};

export default MessageContainer;