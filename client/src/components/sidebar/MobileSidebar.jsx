import { useEffect } from "react";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";

const MobileSidebar = ({ isOpen, onClose }) => {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	return (
		<>
			{/* Backdrop */}
			<div
				className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300 lg:hidden ${
					isOpen ? "opacity-100 visible" : "opacity-0 invisible"
				}`}
				onClick={onClose}
			/>
			
			{/* Drawer */}
			<div
				className={`fixed left-0 top-0 h-full w-80 glass z-50 transform transition-transform duration-300 ease-out lg:hidden ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="p-4 border-b border-white/10 flex justify-between items-center">
					<h2 className="text-xl font-bold gradient-text">Chats</h2>
					<button
						onClick={onClose}
						className="p-2 rounded-xl hover:bg-white/10 transition-all"
					>
						<X className="w-5 h-5" />
					</button>
				</div>
				<div className="h-[calc(100%-73px)] overflow-y-auto">
					<Sidebar />
				</div>
			</div>
		</>
	);
};

export default MobileSidebar;