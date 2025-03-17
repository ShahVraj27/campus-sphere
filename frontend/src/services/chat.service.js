import api from './api';

// Chat service functions for API calls
const chatService = {
  // Get all chats for current user
  getUserChats: async () => {
    return api.get('/chats/');
  },
  
  // Get chat by ID
  getChatById: async (id) => {
    return api.get(`/chats/${id}/`);
  },
  
  // Get chat messages
  getChatMessages: async (id) => {
    return api.get(`/chats/${id}/messages/`);
  },
  
  // Create direct chat
  createDirectChat: async (participantId) => {
    return api.post('/chats/', {
      participants: [participantId],
      is_group_chat: false
    });
  },
  
  // Create group chat
  createGroupChat: async (name, participantIds) => {
    return api.post('/chats/', {
      participants: participantIds,
      is_group_chat: true,
      group_name: name
    });
  },
  
  // Add participant to group chat
  addParticipant: async (chatId, userId) => {
    return api.post(`/chats/${chatId}/add_participant/`, {
      user_id: userId
    });
  },
  
  // Remove participant from group chat
  removeParticipant: async (chatId, userId) => {
    return api.post(`/chats/${chatId}/remove_participant/`, {
      user_id: userId
    });
  },
  
  // Leave group chat
  leaveChat: async (chatId) => {
    return api.post(`/chats/${chatId}/leave/`);
  },
  
  // Delete chat
  deleteChat: async (id) => {
    return api.delete(`/chats/${id}/`);
  },
  
  // Send message
  sendMessage: async (chatId, content) => {
    return api.post('/messages/', {
      chat: chatId,
      content
    });
  },
  
  // Get all messages
  getAllMessages: async () => {
    return api.get('/messages/');
  },
  
  // Get message by ID
  getMessageById: async (id) => {
    return api.get(`/messages/${id}/`);
  },
  
  // Update message
  updateMessage: async (id, content) => {
    return api.put(`/messages/${id}/`, { content });
  },
  
  // Delete message
  deleteMessage: async (id) => {
    return api.delete(`/messages/${id}/`);
  },
  
  // Mark messages as read
  markMessagesAsRead: async (messageIds) => {
    return api.post('/messages/mark_read/', { message_ids: messageIds });
  },
  
  // Get group chat details
  getGroupChatDetails: async (chatId) => {
    return api.get(`/group-chats/${chatId}/`);
  },
  
  // Update group chat
  updateGroupChat: async (chatId, name) => {
    return api.put(`/group-chats/${chatId}/`, { name });
  },
  
  // Transfer group chat admin
  transferGroupChatAdmin: async (chatId, newAdminId) => {
    return api.post(`/group-chats/${chatId}/transfer_admin/`, {
      new_admin_id: newAdminId
    });
  },
};

export default chatService;