import { useState } from 'react';

const mockChannels = [
    { id: 1, name: 'General', type: 'channel', unread: 0 },
    { id: 2, name: 'Sales Team', type: 'channel', unread: 3 },
    { id: 3, name: 'Support', type: 'channel', unread: 0 },
];

const mockDirectMessages = [
    { id: 1, name: 'Jane Admin', status: 'online', unread: 2 },
    { id: 2, name: 'Mike Sales', status: 'offline', unread: 0 },
    { id: 3, name: 'Sarah Support', status: 'away', unread: 0 },
];

const mockMessages = [
    { id: 1, user: 'Jane Admin', avatar: 'JA', message: 'Hey team, just closed a big deal with TechCorp!', time: '10:30 AM', isMine: false },
    { id: 2, user: 'Mike Sales', avatar: 'MS', message: 'Congrats! What was the final deal size?', time: '10:32 AM', isMine: false },
    { id: 3, user: 'Jane Admin', avatar: 'JA', message: '$35,000 annual contract. They also mentioned they might expand to other departments.', time: '10:35 AM', isMine: false },
    { id: 4, user: 'You', avatar: 'YO', message: 'That\'s great news! We should schedule a kickoff meeting soon.', time: '10:40 AM', isMine: true },
];

export default function TeamChat() {
    const [activeChat, setActiveChat] = useState('channel_2');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(mockMessages);

    const handleSend = () => {
        if (!message.trim()) return;
        setMessages(prev => [...prev, {
            id: Date.now(),
            user: 'You',
            avatar: 'YO',
            message: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMine: true
        }]);
        setMessage('');
    };

    const getStatusColor = (status) => {
        const colors = { online: 'bg-emerald-500', away: 'bg-amber-500', offline: 'bg-slate-400' };
        return colors[status] || 'bg-slate-400';
    };

    return (
        <div className="h-[calc(100vh-180px)] flex gap-6">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 card flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Team Chat</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    {/* Channels */}
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Channels</p>
                        <div className="space-y-1">
                            {mockChannels.map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => setActiveChat(`channel_${channel.id}`)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors ${activeChat === `channel_${channel.id}` ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-slate-400">#</span>
                                        {channel.name}
                                    </span>
                                    {channel.unread > 0 && (
                                        <span className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white">{channel.unread}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Direct Messages */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Direct Messages</p>
                        <div className="space-y-1">
                            {mockDirectMessages.map(dm => (
                                <button
                                    key={dm.id}
                                    onClick={() => setActiveChat(`dm_${dm.id}`)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors ${activeChat === `dm_${dm.id}` ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${getStatusColor(dm.status)}`}></span>
                                        {dm.name}
                                    </span>
                                    {dm.unread > 0 && (
                                        <span className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white">{dm.unread}</span>
                                    )}
                                </button>
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
                        <h3 className="font-semibold text-slate-900 dark:text-white">Sales Team</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn-ghost p-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button className="btn-ghost p-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.isMine ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${msg.isMine ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}>
                                {msg.avatar}
                            </div>
                            <div className={`max-w-md ${msg.isMine ? 'text-right' : ''}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    {!msg.isMine && <span className="text-sm font-medium text-slate-900 dark:text-white">{msg.user}</span>}
                                    <span className="text-xs text-slate-400">{msg.time}</span>
                                </div>
                                <div className={`px-4 py-2 rounded-2xl ${msg.isMine ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    }`}>
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="input flex-1"
                        />
                        <button onClick={handleSend} className="btn-primary">
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
