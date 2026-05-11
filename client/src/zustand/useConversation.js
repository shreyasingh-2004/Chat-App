import { create } from 'zustand';

const useConversation = create((set, get) => ({
  selectedConversation: null,
  selectedGroup: null,
  isGroupChat: false,
  messages: [],
  conversations: [],
  groups: [],
  removedGroups: [],
  
  setSelectedConversation: (conversation, isGroup = false) => {
    const currentConversation = get().selectedConversation;
    const currentIsGroup = get().isGroupChat;
    
    // Check if it's the same conversation
    const isSameConversation = currentConversation?._id === conversation?._id && currentIsGroup === isGroup;
    
    console.log("🔄 Switching conversation to:", conversation?.name || conversation?.fullName);
    
    if (isSameConversation) {
      console.log("Same conversation, keeping messages");
      set({ 
        selectedConversation: conversation,
        selectedGroup: isGroup ? conversation : null,
        isGroupChat: isGroup
      });
    } else {
      console.log("Different conversation, clearing messages");
      set({ 
        selectedConversation: conversation,
        selectedGroup: isGroup ? conversation : null,
        isGroupChat: isGroup,
        messages: [] // Clear messages for new conversation
      });
    }
  },
  
  setMessages: (messagesOrUpdater) => {
    if (typeof messagesOrUpdater === 'function') {
      set((state) => ({ messages: messagesOrUpdater(state.messages) }));
    } else {
      set({ messages: Array.isArray(messagesOrUpdater) ? messagesOrUpdater : [] });
    }
  },
  
  addMessage: (message) => {
    set((state) => ({ 
      messages: [...state.messages, message] 
    }));
  },
  
  setConversations: (conversations) => set({ conversations }),
  
  setGroups: (groups) => set({ groups }),
  
  addRemovedGroup: (groupId) => set((state) => ({ 
    removedGroups: [...state.removedGroups, groupId] 
  })),
  
  removeGroupFromCache: (groupId) => set((state) => ({
    groups: state.groups.filter((group) => String(group._id) !== String(groupId)),
    removedGroups: state.removedGroups.filter((id) => String(id) !== String(groupId))
  })),
  
  reset: () => set({
    selectedConversation: null,
    selectedGroup: null,
    isGroupChat: false,
    messages: [],
    conversations: [],
    groups: [],
    removedGroups: []
  })
}));

export default useConversation;