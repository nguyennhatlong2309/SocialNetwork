import { useState, useRef, useEffect } from 'react';
import { Search, Edit, MessageSquare, Phone, Video, MoreVertical, Plus, Smile, Send, ArrowLeft } from 'lucide-react';
import { useInboxState } from '../../contexts/PageStateContext';
import { useConversations, useMessages, useSendMessage } from '../../hooks/useMessages';
import { useSignalR } from '../../contexts/SignalRContext';
import { useAuth } from '../../contexts/AuthContext';
import './InboxPage.css';
import './ChatViewPage.css';

// ─── Avatar color palette (consistent per userId) ────────────────────────────
const PALETTE = [
  '#e05c8e', '#5c9cbf', '#bf7c5c', '#7c5cbf',
  '#4285f4', '#34a853', '#ea4335', '#fbbc04',
];

function getColor(userId) {
  if (!userId) return '#888';
  return PALETTE[Number(userId) % PALETTE.length];
}

function formatTime(isoString) {
  if (!isoString) return '';

  // Đảm bảo JS luôn parse timestamp như UTC:
  // Backend dùng DateTime.UtcNow nhưng EF/serializer có thể bỏ suffix 'Z'
  // → "2026-05-15T13:54:27" bị JS hiểu là local time → lệch múi giờ
  // Fix: nếu không có 'Z' hay '+', tự thêm 'Z' trước khi parse
  const normalized = /[Zz]|[+-]\d{2}:?\d{2}$/.test(isoString)
    ? isoString
    : isoString + 'Z';

  const d = new Date(normalized);
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

// ─── Inline ChatView ─────────────────────────────────────────────────────────
function ChatView({ conversationId, otherUser, onBack, currentUserId }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { joinConversation, leaveConversation } = useSignalR();

  const color = getColor(otherUser?.userId);

  // Fetch messages
  const { data: messages = [], isLoading } = useMessages(conversationId, currentUserId);

  // Send message mutation
  const sendMutation = useSendMessage();

  // Join conversation group khi mở, leave khi đóng
  useEffect(() => {
    joinConversation(conversationId);
    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId, joinConversation, leaveConversation]);

  // Auto-scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending) return;

    sendMutation.mutate(
      { conversationId, content: trimmed, currentUserId },
      {
        onSuccess: () => setInput(''),
        onError: (err) => console.error('Send message failed:', err),
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!otherUser) return null;

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-contact-info">
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
              {(otherUser.fullName || otherUser.username || '?')[0].toUpperCase()}
            </div>
          </div>

          <div>
            <p className="chat-contact-name">{otherUser.fullName || otherUser.username}</p>
            <p className="chat-contact-status">@{otherUser.username}</p>
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
        {isLoading ? (
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
                    {(otherUser.fullName || '?')[0].toUpperCase()}
                  </div>
                )}

                <div className={`message-bubble ${msg.fromMe ? 'bubble-me' : 'bubble-them'} ${msg._optimistic ? 'optimistic' : ''}`}>
                  <p>{msg.content}</p>
                  <span className="message-time">
                    {formatTime(msg.createdAt)}
                    {msg.fromMe && ' ✓✓'}
                  </span>
                </div>
              </div>
            ))}

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
          placeholder={`Message ${(otherUser.fullName || 'them').split(' ')[0]}...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sendMutation.isPending}
        />
        <button className="chat-icon-btn" id="emoji-btn"><Smile size={18} /></button>
        <button
          className="btn btn-primary send-btn"
          onClick={handleSend}
          disabled={!input.trim() || sendMutation.isPending}
          id="send-message-btn"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── InboxPage ───────────────────────────────────────────────────────────────
export default function InboxPage() {
  const [search, setSearch] = useState('');
  const { selectedId, setSelectedId } = useInboxState();
  const { user } = useAuth();

  const currentUserId = user?.id ?? user?.userId ?? null;

  // Fetch conversations từ API thật
  const { data: conversations = [], isLoading: convsLoading } = useConversations(currentUserId);

  // Lọc theo search
  const filtered = conversations.filter(conv => {
    const name = conv.otherUser?.fullName ?? conv.otherUser?.username ?? '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  // Tìm conversation hiện tại để lấy otherUser cho ChatView
  const activeConv = conversations.find(c => c.id === selectedId);

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
          {convsLoading && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>
              Loading conversations...
            </p>
          )}
          {!convsLoading && filtered.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>
              No conversations found.
            </p>
          )}
          {filtered.map(conv => {
            const other = conv.otherUser;
            const color = getColor(other?.userId);
            const isActive = selectedId === conv.id;

            return (
              <div
                key={conv.id}
                className={`conversation-item ${conv.unreadCount > 0 ? 'has-unread' : ''} ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedId(conv.id)}
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
                    {(other?.fullName || other?.username || '?')[0].toUpperCase()}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>

                <div className="conv-info">
                  <div className="conv-name-row">
                    <span className="conv-name">{other?.fullName || other?.username}</span>
                    <span className="conv-time">{formatTime(conv.lastMessage?.createdAt)}</span>
                  </div>
                  <p className="conv-last-msg">
                    {conv.lastMessage?.content ?? 'No messages yet'}
                  </p>
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
          otherUser={activeConv?.otherUser}
          currentUserId={currentUserId}
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
