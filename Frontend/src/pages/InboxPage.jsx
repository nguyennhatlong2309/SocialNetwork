import { useState, useRef, useEffect } from 'react';
import { Search, Edit, MessageSquare, Phone, Video, MoreVertical, Plus, Smile, Send, ArrowLeft } from 'lucide-react';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_USERS, simulateDelay } from '../api/mockData';
import { useInboxState } from '../contexts/PageStateContext';
import './InboxPage.css';
import './ChatViewPage.css';

// User hiện tại đang đăng nhập (giả lập = Alex Morgan, userId: 1)
const CURRENT_USER_ID = 1;

function formatTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Màu avatar cho từng user
const USER_COLORS = {
  1: '#e05c8e',
  2: '#5c9cbf',
  3: '#bf7c5c',
};

function getOtherParticipant(conv) {
  return conv.participants.find(p => p.userId !== CURRENT_USER_ID);
}

// ─── Inline ChatView ────────────────────────────────────────────────────────
function ChatView({ conversationId, onBack }) {
  const conv = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
  const other = conv ? getOtherParticipant(conv) : null;
  const otherUser = MOCK_USERS.find(u => u.userId === other?.userId);
  const color = USER_COLORS[other?.userId] || '#888';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Load messages khi đổi conversation
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setTyping(false);
    simulateDelay(350).then(() => {
      const msgs = (MOCK_MESSAGES[conversationId] || []).map(m => ({
        ...m,
        fromMe: m.senderId === CURRENT_USER_ID,
      }));
      setMessages(msgs);
      setLoading(false);
      // Giả lập "đang gõ" nếu có tin nhắn từ người kia
      const hasTheirMsg = msgs.some(m => !m.fromMe);
      if (hasTheirMsg) {
        setTimeout(() => setTyping(true), 800);
        setTimeout(() => setTyping(false), 3500);
      }
    });
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(),
      senderId: CURRENT_USER_ID,
      fromMe: true,
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Giả lập reply sau 1.5 giây
    setTimeout(() => setTyping(true), 800);
    setTimeout(() => {
      setTyping(false);
      const autoReplies = [
        'Sounds great! 👍',
        'Haha yeah, totally agree!',
        'Let me check and get back to you 🔍',
        'Awesome! 🚀',
        "That's interesting, tell me more...",
      ];
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        senderId: other?.userId,
        fromMe: false,
        content: reply,
        createdAt: new Date().toISOString(),
      }]);
    }, 2500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!conv || !other) return null;

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-contact-info">
          {/* Mobile back button */}
          <button className="chat-back-btn" onClick={onBack} id="chat-back-btn">
            <ArrowLeft size={18} />
          </button>

          <div className="conv-avatar-wrap">
            <div className="avatar-placeholder"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}88)`,
                width: 40, height: 40, fontSize: 16,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700,
              }}>
              {other.fullName[0]}
            </div>
            {/* Giả lập user 2 (Elena) đang online */}
            {other.userId === 2 && <span className="online-dot" />}
          </div>

          <div>
            <p className="chat-contact-name">{other.fullName}</p>
            <p className="chat-contact-status">
              {other.userId === 2 ? 'Active now' : `@${otherUser?.username || other.username}`}
            </p>
          </div>
        </div>

        <div className="chat-header-actions">
          <button className="chat-icon-btn" id="call-btn"><Phone size={18} /></button>
          <button className="chat-icon-btn" id="video-btn"><Video size={18} /></button>
          <button className="chat-icon-btn" id="more-btn"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        ) : (
          <>
            <div className="date-divider"><span>Today</span></div>

            {messages.map(msg => (
              <div key={msg.id} className={`message-wrap ${msg.fromMe ? 'message-me' : 'message-them'}`}>
                {!msg.fromMe && (
                  <div className="avatar-placeholder"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}88)`,
                      width: 32, height: 32, fontSize: 13,
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, flexShrink: 0, alignSelf: 'flex-end',
                    }}>
                    {other.fullName[0]}
                  </div>
                )}

                <div className={`message-bubble ${msg.fromMe ? 'bubble-me' : 'bubble-them'}`}>
                  <p>{msg.content}</p>
                  <span className="message-time">
                    {formatTime(msg.createdAt)}
                    {msg.fromMe && ' ✓✓'}
                  </span>
                </div>
              </div>
            ))}

            {typing && (
              <div className="message-wrap message-them">
                <div className="avatar-placeholder"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}88)`,
                    width: 32, height: 32, fontSize: 13,
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, flexShrink: 0, alignSelf: 'flex-end',
                  }}>
                  {other.fullName[0]}
                </div>
                <div className="message-bubble bubble-them typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <button className="chat-icon-btn" id="attach-btn"><Plus size={18} /></button>
        <input
          id="chat-message-input"
          type="text"
          className="input-field chat-input"
          placeholder={`Message ${other.fullName.split(' ')[0]}...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="chat-icon-btn" id="emoji-btn"><Smile size={18} /></button>
        <button
          className="btn btn-primary send-btn"
          onClick={sendMessage}
          disabled={!input.trim()}
          id="send-message-btn"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── InboxPage ──────────────────────────────────────────────────────────────
export default function InboxPage() {
  const [search, setSearch] = useState('');
  // Dùng context thay vì local state để selectedId tồn tại khi navigate ra ngoài và quay lại
  const { selectedId, setSelectedId } = useInboxState();

  // Lọc conversations theo search
  const filtered = MOCK_CONVERSATIONS.filter(conv => {
    const other = getOtherParticipant(conv);
    return other?.fullName.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  return (
    <div className={`inbox-page ${selectedId ? 'chat-open' : ''}`}>
      {/* Conversation list */}
      <div className={`conversation-list ${selectedId ? 'list-hidden-mobile' : ''}`}>
        <div className="inbox-header">
          <h2>Messages</h2>
          <button className="btn btn-ghost btn-sm" id="new-message-btn">
            <Edit size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="inbox-search">
          <Search size={14} className="search-icon" />
          <input
            id="inbox-search-input"
            type="text"
            className="input-field search-input"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="conversations">
          {filtered.map(conv => {
            const other = getOtherParticipant(conv);
            const color = USER_COLORS[other?.userId] || '#888';
            const isActive = selectedId === conv.id;

            return (
              <div
                key={conv.id}
                className={`conversation-item ${conv.unreadCount > 0 ? 'has-unread' : ''} ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(conv.id)}
                id={`conv-${conv.id}`}
              >
                <div className="conv-avatar-wrap">
                  <div
                    className="avatar-placeholder"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}88)`,
                      width: 44, height: 44, fontSize: 18,
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    {other?.fullName[0]}
                  </div>
                  {/* Elena (userId 2) giả lập online */}
                  {other?.userId === 2 && <span className="online-dot" />}
                  {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                </div>

                <div className="conv-info">
                  <div className="conv-name-row">
                    <span className="conv-name">{other?.fullName}</span>
                    <span className="conv-time">{formatTime(conv.lastMessage?.createdAt)}</span>
                  </div>
                  <p className="conv-last-msg">{conv.lastMessage?.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      {selectedId ? (
        <ChatView
          conversationId={selectedId}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <div className="inbox-empty">
          <div className="inbox-empty-icon">
            <MessageSquare size={48} color="var(--text-muted)" />
          </div>
          <h3>Your Messages</h3>
          <p>Select a conversation from the sidebar to start chatting, or compose a new message.</p>
          <button className="btn btn-secondary" id="new-message-empty-btn">
            New Message
          </button>
        </div>
      )}
    </div>
  );
}
