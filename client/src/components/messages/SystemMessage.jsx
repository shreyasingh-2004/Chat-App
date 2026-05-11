import { Info, UserPlus, UserMinus, LogOut, Crown, Shield, Users } from "lucide-react";

const SystemMessage = ({ message }) => {
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
        <span>{message.message}</span>
        <span className="text-gray-400 text-[10px]">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default SystemMessage;