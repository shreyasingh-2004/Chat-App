import { useEffect, useState } from "react";
import useConversation from "../../zustand/useConversation";
import Messages from "./Messages";
import MessageInput from "./MessageInput";
import MemberModal from "../group/MemberModal";
import UserProfileModal from "../profile/UserProfileModal";
import {
  ArrowLeft,
  Phone,
  Video,
  Bell,
  BellOff,
  Users,
} from "lucide-react";
import { useSocketContext } from "../../context/SocketContext";
import {
  getDisplayName,
  getAboutSubtitle,
} from "../../utils/displayUser";
import UserAvatar from "../common/UserAvatar";

const MessageContainer = () => {
  const {
    selectedConversation,
    isGroupChat,
    setSelectedConversation,
    mutedConversationIds,
    toggleMuteConversation,
  } = useConversation();

  const { onlineUsers, socket } = useSocketContext();

  const [showMembers, setShowMembers] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Typing state
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // Reset typing state when switching chats
  useEffect(() => {
    setIsPartnerTyping(false);
  }, [selectedConversation?._id]);

  // Listen for typing / stopTyping events
  useEffect(() => {
    if (!socket) return;

    const belongsToThisChat = (senderId, groupId) =>
      isGroupChat
        ? String(groupId) === String(selectedConversation?._id)
        : String(senderId) === String(selectedConversation?._id);

    const handleTyping = ({ senderId, groupId }) => {
      if (belongsToThisChat(senderId, groupId)) {
        setIsPartnerTyping(true);
      }
    };

    const handleStopTyping = ({ senderId, groupId }) => {
      if (belongsToThisChat(senderId, groupId)) {
        setIsPartnerTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, isGroupChat, selectedConversation]);

  // Mark direct messages as seen
  useEffect(() => {
    if (!selectedConversation || isGroupChat || !socket) return;

    socket.emit("markAsSeen", {
      chatUserId: selectedConversation._id,
    });
  }, [selectedConversation, socket, isGroupChat]);

  if (!selectedConversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400 dark:text-gray-500">
          Select a conversation
        </p>
      </div>
    );
  }

  const displayName = isGroupChat
    ? selectedConversation.name || "Group"
    : getDisplayName(selectedConversation);

  const partnerId =
    !isGroupChat && selectedConversation._id != null
      ? String(selectedConversation._id)
      : "";

  const isOnline =
    !isGroupChat &&
    partnerId &&
    onlineUsers?.some((u) => String(u) === partnerId);

  // Typing takes priority over Online/Offline
  const subtitle = isGroupChat
    ? "Click to view members"
    : isPartnerTyping
      ? "typing..."
      : isOnline
        ? "Online"
        : "Offline";

  const aboutLine = !isGroupChat
    ? getAboutSubtitle(selectedConversation)
    : null;

  const dmPic = !isGroupChat
    ? selectedConversation.profilePic
    : null;

  const groupPic = isGroupChat
    ? selectedConversation.avatar
    : null;

  const isMuted = mutedConversationIds.includes(
    String(selectedConversation._id),
  );

  const handleHeaderClick = () => {
    if (isGroupChat) {
      setShowMembers(true);
    } else {
      setShowUserProfile(true);
    }
  };

  const handleBack = () => {
    setSelectedConversation(null, false);
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-50/50 dark:bg-gray-900/50">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between 
          border-b border-gray-200/80 dark:border-gray-700/50 
          bg-white/90 dark:bg-gray-800/90 backdrop-blur-md 
          px-4 py-3 cursor-pointer 
          transition-colors duration-150 
          hover:bg-indigo-50/60 dark:hover:bg-indigo-900/10"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile Back Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleBack();
            }}
            className="icon-btn -ml-2 md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Avatar */}
          {isGroupChat ? (
            groupPic ? (
              <UserAvatar
                src={groupPic}
                name={displayName}
                size={40}
              />
            ) : (
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full 
                bg-gradient-to-br from-indigo-500 to-cyan-500 
                shadow-md shadow-indigo-500/25"
              >
                <Users className="h-5 w-5 text-white" />
              </div>
            )
          ) : (
            <div className="relative flex-shrink-0">
              <UserAvatar
                src={dmPic}
                name={displayName}
                size={40}
              />

              {/* Online indicator */}
              {isOnline && (
                <div
                  className="absolute bottom-0 right-0 h-3 w-3 rounded-full 
                  border-2 border-white dark:border-gray-800 
                  bg-cyan-500"
                />
              )}
            </div>
          )}

          {/* Name + Status */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {displayName}
            </h3>

            <p
              className={`text-xs truncate ${
                isPartnerTyping
                  ? "text-cyan-500 font-medium"
                  : isOnline && !isGroupChat
                    ? "text-cyan-500 font-medium"
                    : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {subtitle}
            </p>

            {/* About text */}
            {aboutLine && !isGroupChat && !isPartnerTyping && (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {aboutLine}
              </p>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isGroupChat && (
            <>
              <button
                type="button"
                className="icon-btn"
                onClick={(e) => e.stopPropagation()}
                aria-label="Video call"
              >
                <Video className="h-5 w-5" />
              </button>

              <button
                type="button"
                className="icon-btn"
                onClick={(e) => e.stopPropagation()}
                aria-label="Voice call"
              >
                <Phone className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Mute */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMuteConversation(
                String(selectedConversation._id),
              );
            }}
            className="icon-btn"
            aria-label={
              isMuted
                ? "Unmute conversation"
                : "Mute conversation"
            }
          >
            {isMuted ? (
              <BellOff className="h-5 w-5 text-indigo-400" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Messages />
      </div>

      {/* Message Input */}
      <MessageInput />

      {/* Group Members Modal */}
      {isGroupChat && (
        <MemberModal
          isOpen={showMembers}
          onClose={() => setShowMembers(false)}
          group={selectedConversation}
        />
      )}

      {/* User Profile Modal */}
      {!isGroupChat && (
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          user={selectedConversation}
        />
      )}
    </div>
  );
};

export default MessageContainer;