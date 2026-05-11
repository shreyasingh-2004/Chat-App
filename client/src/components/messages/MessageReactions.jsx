import { useState } from 'react';

const MessageReactions = ({ messageId, onReact }) => {
  const [showPicker, setShowPicker] = useState(false);
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  
  return (
    <div className="relative">
      <button onClick={() => setShowPicker(!showPicker)} className="text-xs opacity-50 hover:opacity-100">
        😊
      </button>
      {showPicker && (
        <div className="absolute bottom-full left-0 bg-gray-800 rounded-lg p-2 flex gap-2 shadow-xl mb-2">
          {reactions.map(emoji => (
            <button 
              key={emoji}
              onClick={() => {
                onReact(messageId, emoji);
                setShowPicker(false);
              }}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};