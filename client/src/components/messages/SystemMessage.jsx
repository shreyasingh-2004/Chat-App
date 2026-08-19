import { Info, UserPlus, UserMinus, LogOut, Crown, Shield, Users } from "lucide-react";

const SystemMessage = ({ message }) => {
  const getDisplayName = (user, fallback = "Someone") => {
    if (!user) return fallback;
    return user.fullName || user.name || user.username || fallback;
  };

  const actorName = getDisplayName(message.senderId);
  const affectedName = getDisplayName(message.affectedUser, "a member");

  const getMessageText = () => {
    if (message.message && !message.message.includes("undefined")) {
      return message.message;
    }

    if (message.systemMessageType === "member_removed") return `${actorName} removed ${affectedName}`;
    if (message.systemMessageType === "member_added") return `${actorName} added ${affectedName}`;
    if (message.systemMessageType === "member_left") return `${actorName} left the group`;
    if (message.systemMessageType === "admin_promoted") return `${actorName} made ${affectedName} an admin`;
    if (message.systemMessageType === "admin_demoted") return `${actorName} removed ${affectedName} as admin`;

    return message.message || "Group updated";
  };

  const getIcon = () => {
    if (message.systemMessageType === 'member_added') return <UserPlus className="w-3 h-3" />;
    if (message.systemMessageType === 'member_removed') return <UserMinus className="w-3 h-3" />;
    if (message.systemMessageType === 'member_left') return <LogOut className="w-3 h-3" />;
    if (message.systemMessageType === 'admin_promoted') return <Crown className="w-3 h-3" />;
    if (message.systemMessageType === 'admin_demoted') return <Shield className="w-3 h-3" />;
    if (message.systemMessageType === 'group_created') return <Users className="w-3 h-3" />;
    return <Info className="w-3 h-3" />;
  };

  return (
    <div className="flex justify-center my-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs">
        {getIcon()}
        <span>{getMessageText()}</span>
      </div>
    </div>
  );
};

export default SystemMessage;
