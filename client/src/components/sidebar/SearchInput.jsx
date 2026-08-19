import { useState, useEffect } from "react";
import { Search, X, User } from "lucide-react";
import useConversation from "../../zustand/useConversation";
import { getDisplayName, getAboutSubtitle, toChatPartnerConversation } from "../../utils/displayUser";
import UserAvatar from "../common/UserAvatar";

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);
  const { setSelectedConversation, conversations: globalConversations } = useConversation();
  const [showResults, setShowResults] = useState(false);

  const allConversations = globalConversations || [];

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredConversations([]);
      setShowResults(false);
      return;
    }

    const q = searchTerm.toLowerCase();
    const filtered = allConversations
      .filter((conversation) => getDisplayName(conversation).toLowerCase().includes(q))
      .sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b), undefined, { sensitivity: "base" }));
    setFilteredConversations(filtered);
    setShowResults(true);
  }, [searchTerm, allConversations]);

  const handleSelectConversation = (conversation) => {
    const shaped = toChatPartnerConversation(conversation);
    if (shaped) setSelectedConversation(shaped);
    setSearchTerm("");
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-800/50 pl-10 pr-10 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-all hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {showResults && searchTerm && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl glass-card shadow-xl animate-slide-up">
          {filteredConversations.length > 0 ? (
            <div>
              <div className="border-b border-gray-200 dark:border-gray-700 px-3 py-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredConversations.length} contact{filteredConversations.length !== 1 ? "s" : ""} found
                </span>
              </div>
              {filteredConversations.map((conversation) => {
                const name = getDisplayName(conversation);
                const about = getAboutSubtitle(conversation);
                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <UserAvatar src={conversation.profilePic} name={name} size={40} />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-medium text-gray-900 dark:text-white">{name}</h4>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">{about}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No contacts found for "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;