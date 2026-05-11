import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import useConversation from "../../zustand/useConversation";
import useGetConversations from "../../hooks/useGetConversations";

const SearchInput = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredConversations, setFilteredConversations] = useState([]);
	const { setSelectedConversation, conversations: globalConversations } = useConversation();
	const { conversations } = useGetConversations();
	const [showResults, setShowResults] = useState(false);

	// Get all conversations
	const allConversations = conversations || globalConversations || [];

	// Filter conversations based on search term
	useEffect(() => {
		if (searchTerm.trim() === "") {
			setFilteredConversations([]);
			setShowResults(false);
			return;
		}

		const filtered = allConversations.filter(conversation =>
			conversation.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			conversation.username?.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredConversations(filtered);
		setShowResults(true);
	}, [searchTerm, allConversations]);

	const handleSelectConversation = (conversation) => {
		setSelectedConversation(conversation);
		setSearchTerm("");
		setShowResults(false);
	};

	const clearSearch = () => {
		setSearchTerm("");
		setShowResults(false);
	};

	return (
		<div className="relative">
			<div className="relative">
				<input
					type="text"
					placeholder="Search or start new chat"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full px-4 py-2 pl-10 pr-10 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
				/>
				<Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
				{searchTerm && (
					<button
						onClick={clearSearch}
						className="absolute right-3 top-2.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5 transition-all"
					>
						<X className="w-4 h-4 text-gray-400" />
					</button>
				)}
			</div>

			{/* Search Results Dropdown */}
			{showResults && searchTerm && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-80 overflow-y-auto">
					{filteredConversations.length > 0 ? (
						<div>
							<div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
								{filteredConversations.length} contact{filteredConversations.length !== 1 ? 's' : ''} found
							</div>
							{filteredConversations.map((conversation) => (
								<div
									key={conversation._id}
									onClick={() => handleSelectConversation(conversation)}
									className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all"
								>
									<div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
										<span className="text-white font-medium text-sm">
											{conversation.fullName?.charAt(0).toUpperCase()}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
											{conversation.fullName}
										</h4>
										<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
											@{conversation.username}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
							No contacts found for "{searchTerm}"
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default SearchInput;