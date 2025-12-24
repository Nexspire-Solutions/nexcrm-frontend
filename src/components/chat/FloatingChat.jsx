/**
 * Floating Chat Widget - Main Component
 * Includes the chat bubble and expandable panel
 */
import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

// Icons
const ChatIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const MinimizeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const SendIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const HashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
);

export default function FloatingChat() {
    const { user } = useAuth();
    const {
        isOpen,
        toggleChat,
        channels,
        activeChannel,
        changeChannel,
        messages,
        unreadCount,
        isLoading,
        typingUsers,
        sendMessage
    } = useChat();

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle send message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await sendMessage(newMessage);
            setNewMessage('');
        } finally {
            setIsSending(false);
        }
    };

    // Format time
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Get user initials
    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
    };

    if (!user) return null;

    return (
        <>
            {/* Floating Chat Bubble */}
            <button
                onClick={toggleChat}
                className="chat-bubble group"
                aria-label="Toggle chat"
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}

                {/* Unread Badge */}
                {!isOpen && unreadCount > 0 && (
                    <span className="chat-bubble-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}

                {/* Tooltip */}
                <span className="tooltip -top-12 right-0 group-hover:opacity-100">
                    {isOpen ? 'Close Chat' : 'Team Chat'}
                </span>
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="chat-panel">
                    {/* Header */}
                    <div className="chat-panel-header">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <ChatIcon />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Team Chat</h3>
                                <p className="text-xs text-white/70">
                                    {activeChannel?.name || 'Select a channel'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={toggleChat}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <MinimizeIcon />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="chat-panel-body">
                        {/* Channels Sidebar */}
                        <div className="chat-channels scrollbar-thin">
                            <div className="p-2 space-y-1">
                                {Array.isArray(channels) && channels.length > 0 ? channels.map((channel) => (
                                    <button
                                        key={channel.id}
                                        onClick={() => changeChannel(channel)}
                                        className={`w-full p-2 rounded-xl flex flex-col items-center gap-1 transition-all text-xs
                                            ${activeChannel?.id === channel.id
                                                ? 'bg-teal-500 text-white'
                                                : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}
                                        title={channel.name}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                            <HashIcon />
                                        </div>
                                        <span className="truncate w-full text-center text-[10px] font-medium">
                                            {channel.name?.slice(0, 6)}
                                        </span>
                                    </button>
                                )) : (
                                    <div className="p-3 text-center text-xs text-slate-400">
                                        No channels
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="chat-messages">
                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                            <ChatIcon />
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            No messages yet
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            Start the conversation!
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isOwn = msg.sender_id === user?.id;
                                        return (
                                            <div
                                                key={msg.id || idx}
                                                className={`chat-message ${isOwn ? 'chat-message-own' : 'chat-message-other'}`}
                                            >
                                                {!isOwn && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="avatar avatar-sm text-xs">
                                                            {getInitials(msg.sender_first_name, msg.sender_last_name)}
                                                        </span>
                                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                            {msg.sender_first_name}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="chat-message-bubble">
                                                    {msg.content}
                                                </div>
                                                <div className={`text-[10px] text-slate-400 mt-1 ${isOwn ? 'text-right' : ''}`}>
                                                    {formatTime(msg.created_at)}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Typing Indicator */}
                            {typingUsers.length > 0 && (
                                <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                                </div>
                            )}

                            {/* Message Input */}
                            <div className="chat-input-container">
                                <form onSubmit={handleSend} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none"
                                        disabled={!activeChannel}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending || !activeChannel}
                                        className="btn-primary btn-icon disabled:opacity-50"
                                    >
                                        <SendIcon />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
