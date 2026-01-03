import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import chatAPI from '../../api/chat';
import { initSocket, getSocket, joinChannel, leaveChannel, disconnectSocket } from '../../utils/socket';
import toast from 'react-hot-toast';

export default function TeamChat() {
    const { user, token } = useAuth();
    const [channels, setChannels] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState(new Map());
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const activeChannelRef = useRef(null); // Track active channel for socket listeners
    const fileInputRef = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        if (token) {
            const socket = initSocket(token);

            // Listen for new messages
            socket.on('new_message', ({ channelId, message: newMsg }) => {
                const currentChannel = activeChannelRef.current;
                if (channelId === currentChannel?.id) {
                    // Check if message already exists (avoid duplicates from own sends)
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
                // Update unread count for other channels
                setChannels(prev => prev.map(ch =>
                    ch.id === channelId && ch.id !== currentChannel?.id
                        ? { ...ch, unread_count: (ch.unread_count || 0) + 1 }
                        : ch
                ));
            });

            // Listen for online/offline status
            socket.on('user_online', ({ userId }) => {
                setOnlineUsers(prev => new Set([...prev, userId]));
            });

            socket.on('user_offline', ({ userId }) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            });

            // Listen for typing indicators
            socket.on('user_typing', ({ userId, channelId, isTyping }) => {
                const currentChannel = activeChannelRef.current;
                if (channelId === currentChannel?.id) {
                    setTypingUsers(prev => {
                        const newMap = new Map(prev);
                        if (isTyping) {
                            newMap.set(userId, true);
                        } else {
                            newMap.delete(userId);
                        }
                        return newMap;
                    });
                }
            });

            return () => {
                disconnectSocket();
            };
        }
    }, [token]);

    // Fetch channels and users on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [channelsRes, usersRes] = await Promise.all([
                    chatAPI.getChannels(),
                    chatAPI.getUsers()
                ]);
                setChannels(channelsRes.data || []);
                setUsers(usersRes.data || []);

                // Select first channel by default
                if (channelsRes.data?.length > 0) {
                    setActiveChannel(channelsRes.data[0]);
                }
            } catch (error) {
                console.error('Failed to load chat data:', error);
                toast.error('Failed to load chat');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Keep activeChannelRef in sync with activeChannel state
    useEffect(() => {
        activeChannelRef.current = activeChannel;
    }, [activeChannel]);

    // Fetch messages when channel changes
    useEffect(() => {
        if (activeChannel) {
            const fetchMessages = async () => {
                try {
                    const response = await chatAPI.getMessages(activeChannel.id);
                    setMessages(response.data || []);

                    // Join socket room
                    joinChannel(activeChannel.id);

                    // Clear unread count
                    setChannels(prev => prev.map(ch =>
                        ch.id === activeChannel.id ? { ...ch, unread_count: 0 } : ch
                    ));
                } catch (error) {
                    console.error('Failed to load messages:', error);
                }
            };

            fetchMessages();

            return () => {
                leaveChannel(activeChannel.id);
            };
        }
    }, [activeChannel?.id]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle sending message
    const handleSend = async () => {
        if ((!message.trim() && !selectedFile) || !activeChannel || sending) return;

        const messageText = message.trim() || (selectedFile ? `📎 ${selectedFile.name}` : '');
        const fileToSend = selectedFile;

        setSending(true);
        setMessage(''); // Clear input immediately for better UX
        setSelectedFile(null); // Clear file selection

        try {
            const response = await chatAPI.sendMessage(activeChannel.id, messageText, fileToSend);

            // If socket isn't connected or message wasn't received via socket, add it directly
            // This ensures the message appears even if WebSocket is failing
            if (response.data) {
                setMessages(prev => {
                    // Check if message already exists (from socket broadcast)
                    if (prev.some(m => m.id === response.data.id)) return prev;
                    return [...prev, response.data];
                });
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
            // Restore message and file on failure
            setMessage(messageText);
            setSelectedFile(fileToSend);
        } finally {
            setSending(false);
        }
    };

    // Handle typing indicator
    const handleTyping = () => {
        const socket = getSocket();
        if (socket && activeChannel) {
            socket.emit('typing', { channelId: activeChannel.id, isTyping: true });

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing after 2 seconds of no input
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { channelId: activeChannel.id, isTyping: false });
            }, 2000);
        }
    };

    const getStatusColor = (status) => {
        const colors = { online: 'bg-emerald-500', away: 'bg-amber-500', offline: 'bg-slate-400' };
        return colors[status] || 'bg-slate-400';
    };

    const getUserInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-180px)] flex items-center justify-center">
                <div className="text-slate-500 dark:text-slate-400">Loading chat...</div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-180px)] flex gap-6">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 card flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Team Chat</h3>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
                    {/* Channels */}
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Channels</p>
                        <div className="space-y-1">
                            {channels.filter(c => c.type === 'channel').map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => setActiveChannel(channel)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors ${activeChannel?.id === channel.id ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-slate-400">#</span>
                                        {channel.name}
                                    </span>
                                    {channel.unread_count > 0 && (
                                        <span className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white">{channel.unread_count}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Direct Messages */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Team Members</p>
                        <div className="space-y-1">
                            {users.map(usr => (
                                <div
                                    key={usr.id}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
                                >
                                    <span className={`w-2 h-2 rounded-full ${onlineUsers.has(usr.id) || usr.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                    {usr.firstName} {usr.lastName}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 card flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-lg text-slate-400">#</span>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            {activeChannel?.name || 'Select a channel'}
                        </h3>
                    </div>
                    {activeChannel?.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{activeChannel.description}</p>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map(msg => {
                            const isMine = msg.user_id === user?.id;
                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isMine ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                        }`}>
                                        {getUserInitials(msg.firstName, msg.lastName)}
                                    </div>
                                    <div className={`max-w-md ${isMine ? 'text-right' : ''}`}>
                                        <div className={`flex items-center gap-2 mb-1 ${isMine ? 'justify-end' : ''}`}>
                                            {!isMine && <span className="text-sm font-medium text-slate-900 dark:text-white">{msg.firstName} {msg.lastName}</span>}
                                            <span className="text-xs text-slate-400">{formatTime(msg.created_at)}</span>
                                        </div>
                                        <div className={`px-4 py-2 rounded-2xl ${isMine ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}>
                                            <p className="text-sm">{msg.message}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Typing indicator */}
                    {typingUsers.size > 0 && (
                        <div className="text-sm text-slate-400 dark:text-slate-500 italic">
                            Someone is typing...
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    {/* Selected File Preview */}
                    {selectedFile && (
                        <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{selectedFile.name}</span>
                                <span className="text-slate-500 text-xs">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    // Check file size (max 5MB)
                                    if (file.size > 5 * 1024 * 1024) {
                                        toast.error('File size must be less than 5MB');
                                        return;
                                    }
                                    setSelectedFile(file);
                                }
                            }}
                            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                        />
                        {/* Attachment Button */}
                        <button
                            type="button"
                            className={`p-2 rounded-lg transition-colors ${selectedFile
                                ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title="Attach file"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>

                        {/* Emoji Button */}
                        <div className="relative">
                            <button
                                type="button"
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Add emoji"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>

                            {/* Emoji Picker Dropdown */}
                            {showEmojiPicker && (
                                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 w-72">
                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Frequently Used</div>
                                    <div className="grid grid-cols-8 gap-1">
                                        {['😀', '😂', '😍', '🥰', '😊', '🤔', '😅', '😎', '👍', '👏', '🎉', '❤️', '🔥', '✨', '💯', '🙏', '👋', '🤝', '💪', '🚀', '⭐', '✅', '👀', '💡'].map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-xl transition-colors"
                                                onClick={() => {
                                                    setMessage(prev => prev + emoji);
                                                    setShowEmojiPicker(false);
                                                }}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3 mb-2">Smileys</div>
                                    <div className="grid grid-cols-8 gap-1">
                                        {['😀', '😃', '😄', '😁', '😆', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋'].map((emoji) => (
                                            <button
                                                key={emoji + '_smileys'}
                                                type="button"
                                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-xl transition-colors"
                                                onClick={() => {
                                                    setMessage(prev => prev + emoji);
                                                    setShowEmojiPicker(false);
                                                }}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={activeChannel ? `Message #${activeChannel.name}...` : 'Select a channel...'}
                            className="input flex-1"
                            disabled={!activeChannel || sending}
                        />

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            className="btn-primary"
                            disabled={!activeChannel || sending || !message.trim()}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
