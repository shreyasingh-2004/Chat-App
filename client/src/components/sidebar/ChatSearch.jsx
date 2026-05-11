import { useState } from 'react';
import useConversation from '../../zustand/useConversation';

const ChatSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setSelectedConversation, conversations } = useConversation();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filtered = conversations.filter(conv => 
      conv.fullName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    
    if (filtered.length === 1) {
      setSelectedConversation(filtered[0]);
    }
  };

  return (
    <div className="p-2">
      <input
        type="text"
        placeholder="🔍 Search chats..."
        value={searchTerm}
        onChange={handleSearch}
        className="input input-bordered w-full input-sm bg-gray-700 text-white"
      />
    </div>
  );
};