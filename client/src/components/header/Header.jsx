import React from "react";
import { useAuthContext } from "../../context/AuthContext";
import { MessageCircle, Users, ChevronDown } from "lucide-react";

const Header = () => {
  const { authUser } = useAuthContext();

  if (!authUser) return null;

  return (
    <div className="glass-card rounded-t-2xl rounded-b-none border-b-0">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-lg">RealTalk</h1>
            <p className="text-xs text-cyan-600 dark:text-cyan-400">● Connected</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {authUser.friends?.length || 0} Friends
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {authUser.fullName?.split(" ")[0] || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                @{authUser.username}
              </p>
            </div>
            <div className="relative">
              <img
                src={authUser.profilePic || `https://ui-avatars.com/api/?name=${authUser.fullName}&background=6366f1&color=fff`}
                alt="Profile"
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cyan-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;