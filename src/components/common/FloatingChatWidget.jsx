/**
 * Floating Chat Widget - Clean Layout
 * - Channels for group chat
 * - Direct Messages for one-on-one (separate view)
 * - Light and Dark mode support
 */
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import chatAPI from '../../api/chat';
import { initSocket, joinChannel, leaveChannel } from '../../utils/socket';
import toast from 'react-hot-toast';

export default function FloatingChatWidget() {
    const { user, token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [channels, setChannels] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null);
    const [activeDMUser, setActiveDMUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [view, setView] = useState('channels'); // 'channels' | 'users' | 'dm-chat'
    const messagesEndRef = useRef(null);
    const activeChannelRef = useRef(null);

    // Detect theme
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Initialize socket ONCE when token is available
    const socketRef = useRef(null);
    useEffect(() => {
        if (token && !socketRef.current) {
            const socket = initSocket(token);
            socketRef.current = socket;

            // Listen for new messages
            socket.off('new_message'); // Remove any existing listener first
            socket.on('new_message', ({ channelId, message: newMsg }) => {
                if (channelId === activeChannelRef.current?.id) {
                    setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
                } else {
                    setChannels(prev => prev.map(ch =>
                        ch.id === channelId ? { ...ch, unread_count: (ch.unread_count || 0) + 1 } : ch
                    ));
                }
            });
        }

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.off('new_message');
            }
        };
    }, [token]); // Only re-run when token changes

    useEffect(() => {
        const total = channels.reduce((acc, ch) => acc + (ch.unread_count || 0), 0);
        setUnreadTotal(total);
    }, [channels]);

    useEffect(() => {
        if (isOpen && channels.length === 0) {
            fetchChannels();
            fetchUsers();
        }
    }, [isOpen]);

    useEffect(() => { activeChannelRef.current = activeChannel; }, [activeChannel]);

    useEffect(() => {
        if (activeChannel) {
            fetchMessages(activeChannel.id);
            joinChannel(activeChannel.id);
            return () => leaveChannel(activeChannel.id);
        }
    }, [activeChannel?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchChannels = async () => {
        setLoading(true);
        try {
            const response = await chatAPI.getChannels();
            setChannels(response.data || []);
            const firstChannel = (response.data || []).find(c => c.type === 'channel');
            if (firstChannel && !activeChannel) setActiveChannel(firstChannel);
        } catch (error) {
            console.error('Failed to load channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await chatAPI.getUsers();
            setUsers((response.data || []).filter(u => u.id !== user?.id));
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const fetchMessages = async (channelId) => {
        try {
            const response = await chatAPI.getMessages(channelId);
            setMessages(response.data || []);
            setChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, unread_count: 0 } : ch));
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSend = async () => {
        if (!message.trim() || !activeChannel || sending) return;
        const messageText = message.trim();
        setMessage(''); // Clear input immediately
        setSending(true);
        try {
            const response = await chatAPI.sendMessage(activeChannel.id, messageText);
            // Add the sent message to the list immediately (optimistic update)
            if (response?.data) {
                setMessages(prev => prev.some(m => m.id === response.data.id) ? prev : [...prev, response.data]);
            }
        } catch (error) {
            toast.error('Failed to send');
            setMessage(messageText); // Restore message on error
        } finally {
            setSending(false);
        }
    };

    const startDM = async (targetUser) => {
        try {
            const response = await chatAPI.getOrCreateDM(targetUser.id);
            if (response?.data) {
                setActiveChannel(response.data);
                setActiveDMUser(targetUser);
                setView('dm-chat');
            }
        } catch (error) {
            toast.error('Could not start conversation');
        }
    };

    const goBackToUsers = () => {
        setView('users');
        setActiveDMUser(null);
    };

    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const getUserInitials = (firstName, lastName) => `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';

    return (
        <>
            {isOpen && (
                <div className={`fixed bottom-20 right-6 z-50 w-[400px] h-[520px] flex flex-col overflow-hidden rounded-2xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>

                    {/* Header */}
                    <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
                        <div className="flex items-center gap-3">
                            {view === 'dm-chat' && (
                                <button onClick={goBackToUsers} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center mr-1">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            {view === 'dm-chat' && activeDMUser ? (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm text-white font-bold">
                                        {getUserInitials(activeDMUser.firstName, activeDMUser.lastName)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-sm">{activeDMUser.firstName} {activeDMUser.lastName}</h3>
                                        <p className="text-xs text-white/70">{activeDMUser.isOnline ? 'Online' : 'Offline'}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-sm">Team Chat</h3>
                                        <p className="text-xs text-white/70">{channels.filter(c => c.type === 'channel').length} channels • {users.length} members</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs - only show when not in DM chat */}
                    {view !== 'dm-chat' && (
                        <div className={`flex border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <button
                                onClick={() => setView('channels')}
                                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${view === 'channels' ? 'text-indigo-600 border-b-2 border-indigo-600' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
                            >
                                Channels
                            </button>
                            <button
                                onClick={() => setView('users')}
                                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${view === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
                            >
                                Direct Messages
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 flex overflow-hidden">

                        {/* CHANNELS VIEW */}
                        {view === 'channels' && (
                            <>
                                <div className={`w-[130px] flex-shrink-0 overflow-y-auto py-2 border-r ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    {loading ? (
                                        <div className={`text-xs text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Loading...</div>
                                    ) : (
                                        channels.filter(c => c.type === 'channel').map(channel => (
                                            <button
                                                key={channel.id}
                                                onClick={() => { setActiveChannel(channel); setActiveDMUser(null); }}
                                                className={`w-full px-3 py-2 text-left flex items-center gap-2 ${activeChannel?.id === channel.id ? 'bg-indigo-600 text-white' : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                            >
                                                <span className={`font-bold ${activeChannel?.id === channel.id ? 'text-white/80' : 'text-indigo-500'}`}>#</span>
                                                <span className="text-xs truncate flex-1">{channel.name}</span>
                                                {channel.unread_count > 0 && (
                                                    <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{channel.unread_count > 9 ? '9+' : channel.unread_count}</span>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className={`px-3 py-2 border-b flex items-center gap-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                        <span className="text-indigo-500 font-bold">#</span>
                                        <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeChannel?.name || 'Select Channel'}</span>
                                    </div>
                                    {renderMessages()}
                                    {renderInput()}
                                </div>
                            </>
                        )}

                        {/* USERS LIST VIEW */}
                        {view === 'users' && (
                            <div className="flex-1 overflow-y-auto p-3">
                                <p className={`text-xs mb-3 pb-2 border-b ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>
                                    Select a team member to start a private chat
                                </p>
                                {users.length === 0 ? (
                                    <div className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <p className="text-sm">No team members found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-0">
                                        {users.map((u, idx) => (
                                            <div key={u.id}>
                                                <button
                                                    onClick={() => startDM(u)}
                                                    className={`w-full p-3 text-left transition-colors flex items-center gap-3 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm text-white font-bold relative">
                                                        {getUserInitials(u.firstName, u.lastName)}
                                                        {u.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></span>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.firstName} {u.lastName}</p>
                                                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{u.role || 'Team Member'}</p>
                                                    </div>
                                                    <svg className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                                {/* Divider line between users */}
                                                {idx < users.length - 1 && (
                                                    <div className={`mx-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DM CHAT VIEW - No sidebar, full width */}
                        {view === 'dm-chat' && (
                            <div className="flex-1 flex flex-col min-w-0">
                                {renderMessages()}
                                {renderInput()}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {unreadTotal > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unreadTotal > 9 ? '9+' : unreadTotal}</span>
                        )}
                    </>
                )}
            </button>
        </>
    );

    // Message list component
    function renderMessages() {
        return (
            <div className={`flex-1 overflow-y-auto px-3 py-2 space-y-3`}>
                {messages.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center h-full ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-xs">No messages yet</p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const isMine = msg.user_id === user?.id;
                        return (
                            <div key={msg.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${isMine ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                                    {getUserInitials(msg.firstName, msg.lastName)}
                                </div>
                                <div className="max-w-[75%]">
                                    <div className={`flex items-center gap-1 mb-0.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                                        <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{msg.firstName}</span>
                                        <span className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{formatTime(msg.created_at)}</span>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-xl text-sm ${isMine ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm' : isDark ? 'bg-slate-700 text-slate-200 rounded-bl-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                                        {msg.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
        );
    }

    // Input component
    function renderInput() {
        return (
            <div className={`p-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className={`flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-slate-100 text-slate-900 placeholder-slate-400'}`}
                        disabled={!activeChannel || sending}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!activeChannel || sending || !message.trim()}
                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 disabled:opacity-50"
                    >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }
}
