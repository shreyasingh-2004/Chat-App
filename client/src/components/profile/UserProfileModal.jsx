import { X, User, Calendar } from "lucide-react";
import UserAvatar from "../common/UserAvatar";
import { getDisplayName } from "../../utils/displayUser";

const UserProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const displayName = getDisplayName(user);
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Unknown";

  return (
    <>
      <div
        className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full
          max-h-[90vh] overflow-y-auto animate-scale-in
          border border-gray-200/80 dark:border-gray-700/60">

          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-500 to-cyan-500 p-6 text-white">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/20 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative flex flex-col items-center">
              <div className="ring-4 ring-white/80 rounded-full shadow-xl">
                <UserAvatar src={user.profilePic} name={displayName} size={96} />
              </div>
              <h2 className="mt-4 text-2xl font-bold drop-shadow-sm">{displayName}</h2>
              <p className="text-indigo-100 text-sm">@{user.username}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-3">
            {user.bio && (
              <InfoCard label="About">
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{user.bio}</p>
              </InfoCard>
            )}
            <InfoRow icon={User} label="Username" value={`@${user.username}`} />
            <InfoRow icon={User} label="Full Name" value={user.fullName || displayName} />
            {user.age && <InfoRow icon={Calendar} label="Age" value={`${user.age} years`} />}
            <InfoRow icon={Calendar} label="Member Since" value={joinedDate} />
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200/80 dark:border-gray-700/50 p-4">
            <button onClick={onClose} className="w-full btn-primary">Close</button>
          </div>
        </div>
      </div>
    </>
  );
};

const InfoCard = ({ label, children }) => (
  <div className="rounded-xl border border-gray-200/80 dark:border-gray-700/50
    bg-gray-50 dark:bg-gray-800/50 p-4">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-400 mb-2">{label}</h3>
    {children}
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 dark:border-gray-700/50
    bg-gray-50 dark:bg-gray-800/50 p-3">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg
      bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/30 dark:to-cyan-900/30">
      <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</p>
    </div>
  </div>
);

export default UserProfileModal;