/** Shown under the name when the user has not set a bio */
export const DEFAULT_USER_ABOUT = "Hey there! I'm using RealTalk.";

export function getDisplayName(user) {
  if (!user) return "Unknown user";
  const n = (user.fullName || user.name || user.username || "").trim();
  return n || "Unknown user";
}

export function getAboutSubtitle(user) {
  const raw = (user?.bio ?? "").trim();
  return raw || DEFAULT_USER_ABOUT;
}

/** Same shape as `Conversations.jsx` uses for 1:1 chat */
export function toChatPartnerConversation(conversation) {
  if (!conversation?._id) return null;
  return {
    _id: conversation._id,
    name: conversation.fullName,
    fullName: conversation.fullName,
    username: conversation.username,
    profilePic: conversation.profilePic,
    bio: conversation.bio,
    type: "user",
    chatType: "user",
  };
}

/** Returns a safe image URL for avatars, or null to fall back to the default icon */
export function safeAvatarSrc(url) {
  if (typeof url !== "string" || !url.trim()) return null;
  const u = url.trim();
  if (u.includes("avatar.iran.liara.run")) return null;
  return u;
}