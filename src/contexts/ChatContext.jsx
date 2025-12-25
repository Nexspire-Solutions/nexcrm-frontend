/**
 * Chat Context - Global state for floating chat widget
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import chatAPI from '../api/chat';
import { initSocket, getSocket, joinChannel, leaveChannel, disconnectSocket } from '../utils/socket';
import toast from 'react-hot-toast';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
    const { user, token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [channels, setChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);

    // Initialize socket and fetch data
    useEffect(() => {
        if (user && token) {
            initSocket(token);
            fetchChannels();
            fetchUsers();

            const socket = getSocket();
            if (socket) {
                // Listen for new messages
                socket.on('new_message', handleNewMessage);
                socket.on('user_typing', handleUserTyping);
                socket.on('user_stop_typing', handleStopTyping);
            }

            return () => {
                if (socket) {
                    socket.off('new_message', handleNewMessage);
                    socket.off('user_typing', handleUserTyping);
                    socket.off('user_stop_typing', handleStopTyping);
                }
            };
        }
    }, [user, token]);

    // Handle new message
    const handleNewMessage = useCallback((message) => {
        if (message.channel_id === activeChannel?.id) {
            setMessages(prev => [...prev, message]);
        } else {
            // Increment unread count
            setUnreadCount(prev => prev + 1);
            // Show notification toast
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-slide-up' : 'animate-fade-out'} glass-card p-4 flex items-center gap-3`}>
                    <div className="avatar avatar-sm">
                        {message.sender_name?.[0] || '?'}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{message.sender_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{message.content}</p>
                    </div>
                </div>
            ), { position: 'bottom-right', duration: 3000 });
        }
    }, [activeChannel]);

    const handleUserTyping = useCallback((data) => {
        if (data.channelId === activeChannel?.id && data.userId !== user?.id) {
            setTypingUsers(prev => {
                if (!prev.includes(data.userName)) {
                    return [...prev, data.userName];
                }
                return prev;
            });
        }
    }, [activeChannel, user]);

    const handleStopTyping = useCallback((data) => {
        setTypingUsers(prev => prev.filter(name => name !== data.userName));
    }, []);

    // Fetch channels
    const fetchChannels = async () => {
        try {
            const data = await chatAPI.getChannels();
            setChannels(data);
            if (data.length > 0 && !activeChannel) {
                setActiveChannel(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch channels:', error);
        }
    };

    // Fetch users
    const fetchUsers = async () => {
        try {
            const data = await chatAPI.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    // Fetch messages for active channel
    const fetchMessages = async (channelId) => {
        if (!channelId) return;
        setIsLoading(true);
        try {
            const data = await chatAPI.getMessages(channelId);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Change active channel
    const changeChannel = useCallback((channel) => {
        if (activeChannel) {
            leaveChannel(activeChannel.id);
        }
        setActiveChannel(channel);
        joinChannel(channel.id);
        fetchMessages(channel.id);
        setUnreadCount(0); // Reset unread when opening chat
    }, [activeChannel]);

    // Send message
    const sendMessage = async (content, fileUrl = null) => {
        if (!activeChannel || !content.trim()) return;

        try {
            const message = await chatAPI.sendMessage(activeChannel.id, content, fileUrl);
            // Message will be added via socket event
            return message;
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
            throw error;
        }
    };

    // Toggle chat panel
    const toggleChat = () => {
        setIsOpen(prev => !prev);
        if (!isOpen && activeChannel) {
            fetchMessages(activeChannel.id);
            setUnreadCount(0);
        }
    };

    const value = {
        isOpen,
        setIsOpen,
        toggleChat,
        channels,
        activeChannel,
        changeChannel,
        messages,
        users,
        unreadCount,
        isLoading,
        typingUsers,
        sendMessage,
        fetchChannels,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}

export default ChatContext;
