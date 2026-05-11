import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import { User, Check, CheckCheck } from "lucide-react";

const Message = ({ message, isGroupMessage = false }) => {
  const { authUser } = useAuthContext();
  
  if (!message || !authUser) return null;
  
  // FIX: Properly identify if message is from current user
  const messageSenderId = message.senderId?._id || message.senderId;
  const fromMe = messageSenderId === authUser._id;
  const senderName = message.senderId?.fullName;
  
  const StatusIcon = () => {
    if (!fromMe) return null;
    if (message.status === 'read') return <CheckCheck className="w-3 h-3 text-teal-500" />;
    if (message.status === 'delivered') return <CheckCheck className="w-3 h-3 text-gray-500" />;
    if (message.status === 'sending') return <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse" />;
    return <Check className="w-3 h-3 text-gray-500" />;
  };
  
  return (
    <div className={`flex ${fromMe ? 'justify-end' : 'justify-start'} mb-3`}>
      {/* Avatar for received messages in group */}
      {!fromMe && isGroupMessage && (
        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center mr-2 flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[70%] ${fromMe ? 'order-2' : 'order-1'}`}>
        {/* Sender name for group messages */}
        {isGroupMessage && !fromMe && senderName && (
          <div className="text-xs text-teal-500 mb-1 ml-1 font-medium">{senderName}</div>
        )}
        
        {/* Message bubble - Teal for sent, Gray for received */}
        <div className={`px-4 py-2 rounded-2xl ${
          fromMe 
            ? 'bg-teal-600 text-white rounded-tr-sm' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
        }`}>
          <p className="text-sm break-words whitespace-pre-wrap">{message.message}</p>
        </div>
        
        {/* Time and status */}
        <div className={`flex items-center gap-1 mt-1 ${fromMe ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-400">{extractTime(message.createdAt)}</span>
          <StatusIcon />
        </div>
      </div>
      
      {/* Avatar for sent messages in personal chat (optional) */}
      {fromMe && !isGroupMessage && (
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center ml-2 flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default Message;