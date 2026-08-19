import { useEffect, useState } from "react";
import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";
import useConversation from "../../zustand/useConversation";
import { useAuthContext } from "../../context/AuthContext";
import useNotifications from "../../hooks/useNotifications";
import { MessageSquare, Menu, X } from "lucide-react";

const Home = () => {
  const { authUser } = useAuthContext();
  const { selectedConversation } = useConversation();
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useNotifications();

  useEffect(() => {
    document.title = "RealTalk";
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Desktop layout - No gaps
  if (!isMobileView) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 overflow-hidden">
        <div className="flex h-full w-full gap-3 p-3">
          {/* Sidebar with glass effect */}
          <aside className="w-80 flex-shrink-0 glass-card overflow-hidden flex flex-col">
            <Sidebar />
          </aside>

          {/* Main chat area */}
          <main className="flex-1 glass-card overflow-hidden flex flex-col">
            {selectedConversation ? (
              <MessageContainer />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-sm animate-scale-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold gradient-text mb-3">
                    Welcome to RealTalk
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a conversation from the sidebar to start chatting
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 overflow-hidden">
      <div className="flex flex-col h-full w-full gap-3 p-3">
        {/* Mobile Header */}
        <div className="glass-card flex-shrink-0">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="icon-btn"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-gray-900 dark:text-white text-lg">RealTalk</h1>
            </div>
            <div className="w-9" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0">
          {!selectedConversation ? (
            <div className="h-full glass-card rounded-2xl flex items-center justify-center p-6">
              <div className="text-center animate-scale-in">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Chat Selected
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tap the menu to start a conversation
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full glass-card rounded-2xl overflow-hidden flex flex-col">
              <MessageContainer />
            </div>
          )}
        </div>

        {/* Mobile Sidebar Drawer */}
        {isMobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] animate-fade-in"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-80 glass-card rounded-r-2xl z-[100] animate-slide-up">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold gradient-text">Chats</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="icon-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-[calc(100%-73px)] overflow-y-auto custom-scroll">
                <Sidebar />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;