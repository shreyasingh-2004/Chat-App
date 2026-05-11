import { useEffect, useState } from "react";
import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";
import { useAuthContext } from "../../context/AuthContext";
import useConversation from "../../zustand/useConversation";
import { MessageSquare } from "lucide-react";

const Home = () => {
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation(); // Get from Zustand
	const [isMobileView, setIsMobileView] = useState(false);

	useEffect(() => {
		document.title = "RealTalk";
		
		const handleResize = () => {
			setIsMobileView(window.innerWidth < 768);
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Desktop layout
	if (!isMobileView) {
		return (
			<div className="h-screen w-screen flex overflow-hidden bg-white dark:bg-gray-900">
				{/* Sidebar */}
				<div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
					<Sidebar />
				</div>
				
				{/* Chat Area */}
				<div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
					{selectedConversation ? (
						<MessageContainer />
					) : (
						<div className="flex-1 flex flex-col items-center justify-center">
							<div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
								<MessageSquare className="w-10 h-10 text-teal-600 dark:text-teal-400" />
							</div>
							<h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">RealTalk</h2>
							<p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Mobile layout
	return (
		<div className="h-screen w-screen flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
			{!selectedConversation ? (
				<>
					<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
						<h1 className="text-xl font-semibold text-gray-900 dark:text-white">RealTalk</h1>
					</div>
					<div className="flex-1 overflow-hidden">
						<Sidebar />
					</div>
				</>
			) : (
				<MessageContainer />
			)}
		</div>
	);
};

export default Home;