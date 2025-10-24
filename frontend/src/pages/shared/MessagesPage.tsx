import { useState, useEffect, useMemo } from 'react';
import { useUserContext, Conversation } from '../../contexts/UserContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical,
  Circle,
  Phone,
  Video
} from 'lucide-react';

function MessagesPage() {
  const { 
    conversations, 
    sendMessage, 
    markMessageAsRead, 
    getConversationMessages 
  } = useUserContext();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Get messages for selected conversation
  const conversationMessages = useMemo(() => {
    return selectedConversation 
      ? getConversationMessages(selectedConversation)
      : [];
  }, [selectedConversation, getConversationMessages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const unreadMessages = conversationMessages.filter(msg => 
        !msg.read && msg.receiverId === 'user-1' // Would use actual user ID
      );
      unreadMessages.forEach(msg => markMessageAsRead(msg.id));
    }
  }, [selectedConversation, conversationMessages, markMessageAsRead]);

  const filteredConversations = conversations.filter(conv => 
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.id !== 'user-1' // Would use actual user ID
    )
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation) {
      // Find the other participant to send to
      const conversation = conversations.find(c => c.id === selectedConversation);
      const otherParticipant = conversation?.participants.find(p => p.id !== 'user-1'); // Would use actual user ID
      
      if (otherParticipant) {
        sendMessage(otherParticipant.id, otherParticipant.name, otherParticipant.role, newMessage);
        setNewMessage('');
      }
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== 'user-1'); // Would use actual user ID
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)] bg-white rounded-lg shadow-sm border flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              if (!otherParticipant) return null;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-primary-50 border-r-2 border-r-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {otherParticipant.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {otherParticipant.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : ''}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 capitalize mb-1">
                        {otherParticipant.role.replace('-', ' ')}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <div className="mt-2">
                          <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                            {conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getOtherParticipant(conversations.find(c => c.id === selectedConversation)!)?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {getOtherParticipant(conversations.find(c => c.id === selectedConversation)!)?.name}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {getOtherParticipant(conversations.find(c => c.id === selectedConversation)!)?.role.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                      <Video className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.map((message) => {
                  const isFromCurrentUser = message.senderId === 'user-1'; // Would use actual user ID
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${
                        isFromCurrentUser
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      } rounded-lg px-4 py-2`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isFromCurrentUser ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Circle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                <p className="text-gray-500">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MessagesPage;
