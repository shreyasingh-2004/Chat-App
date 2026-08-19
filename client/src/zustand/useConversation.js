import { create } from 'zustand';

const useConversation = create((set, get) => ({
  selectedConversation: null,
  selectedGroup: null,
  isGroupChat: false,
  messages: [],
  replyTo: null,
  conversations: [],
  groups: [],
  removedGroups: [],
  mutedConversationIds: JSON.parse(localStorage.getItem('realtalk-muted-conversations') || '[]'),
  // unreadCounts: { [conversationId]: { count, type } }
  unreadCounts: {},

  // ── Unread badge actions ──────────────────────────────────────────────────
  incrementUnread: (conversationId, type) =>
    set((state) => {
      const id   = String(conversationId);
      const prev = state.unreadCounts[id] || { count: 0, type: type || 'dm' };
      return {
        unreadCounts: {
          ...state.unreadCounts,
          [id]: { count: prev.count + 1, type: type || prev.type },
        },
      };
    }),

  clearUnread: (conversationId) =>
    set((state) => {
      const id     = String(conversationId);
      const counts = { ...state.unreadCounts };
      delete counts[id];
      return { unreadCounts: counts };
    }),

  // ── Conversation selection ────────────────────────────────────────────────
  setSelectedConversation: (conversation, isGroup = false) => {
    const currentConversation = get().selectedConversation;
    const currentIsGroup      = get().isGroupChat;

    const currentId = currentConversation?._id ? String(currentConversation._id) : null;
    const newId     = conversation?._id        ? String(conversation._id)        : null;
    const isSame    = currentId === newId && currentIsGroup === isGroup;

    // Keep existing messages only when switching to the same conversation
    // that already has messages loaded — avoids flicker on minor re-renders.
    // In all other cases clear so useGetMessages / useGetGroupMessages re-fetch.
    const currentMessages    = get().messages;
    const shouldKeepMessages = isSame && currentMessages.length > 0;

    // Clear unread for the newly selected conversation
    const counts = { ...(get().unreadCounts) };
    if (newId) delete counts[newId];

    set({
      selectedConversation: conversation,
      selectedGroup:        isGroup ? conversation : null,
      isGroupChat:          isGroup,
      messages:             shouldKeepMessages ? currentMessages : [],
      unreadCounts:         counts,
    });
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  setMessages: (messagesOrUpdater) => {
    if (typeof messagesOrUpdater === 'function') {
      set((state) => ({ messages: messagesOrUpdater(state.messages) }));
    } else {
      set({ messages: Array.isArray(messagesOrUpdater) ? messagesOrUpdater : [] });
    }
  },

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  // ── Reply ─────────────────────────────────────────────────────────────────
  setReplyTo:  (message) => set({ replyTo: message }),
  clearReplyTo: ()       => set({ replyTo: null }),

  // ── Mute ─────────────────────────────────────────────────────────────────
  toggleMuteConversation: (conversationId) => set((state) => {
    const id = String(conversationId);
    const mutedConversationIds = state.mutedConversationIds.includes(id)
      ? state.mutedConversationIds.filter((item) => item !== id)
      : [...state.mutedConversationIds, id];
    localStorage.setItem('realtalk-muted-conversations', JSON.stringify(mutedConversationIds));
    return { mutedConversationIds };
  }),

  // ── Contacts (1:1) ───────────────────────────────────────────────────────
  setConversations: (conversations) => set({ conversations }),

  upsertConversation: (conversation) => set((state) => {
    if (!conversation?._id) return state;
    const exists = state.conversations.some((item) => String(item._id) === String(conversation._id));
    const conversations = exists
      ? state.conversations.map((item) => String(item._id) === String(conversation._id) ? conversation : item)
      : [...state.conversations, conversation];
    return {
      conversations: conversations.sort((a, b) =>
        (a.fullName || a.username || "").localeCompare(b.fullName || b.username || "")
      ),
    };
  }),

  // ── Groups ───────────────────────────────────────────────────────────────
  setGroups: (groups) => set({ groups }),

  upsertGroup: (group) => set((state) => {
    if (!group?._id) return state;
    const exists = state.groups.some((item) => String(item._id) === String(group._id));
    const groups = exists
      ? state.groups.map((item) => String(item._id) === String(group._id) ? group : item)
      : [group, ...state.groups];
    return { groups };
  }),

  addRemovedGroup: (groupId) => set((state) => ({
    removedGroups: [...state.removedGroups, groupId],
  })),

  removeGroupFromCache: (groupId) => set((state) => {
    const isSelectedGroup =
      state.isGroupChat && String(state.selectedConversation?._id) === String(groupId);
    return {
      groups:              state.groups.filter((g) => String(g._id) !== String(groupId)),
      removedGroups:       state.removedGroups.filter((id) => String(id) !== String(groupId)),
      selectedConversation: isSelectedGroup ? null : state.selectedConversation,
      selectedGroup:        isSelectedGroup ? null : state.selectedGroup,
      isGroupChat:          isSelectedGroup ? false : state.isGroupChat,
      messages:             isSelectedGroup ? [] : state.messages,
    };
  }),

  // ── Reset (logout) ────────────────────────────────────────────────────────
  reset: () => set({
    selectedConversation: null,
    selectedGroup:        null,
    isGroupChat:          false,
    messages:             [],
    replyTo:              null,
    conversations:        [],
    groups:               [],
    removedGroups:        [],
    unreadCounts:         {},
  }),
}));

export default useConversation;