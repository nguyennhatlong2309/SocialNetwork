import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Search, Edit, MessageSquare } from 'lucide-react';
import './InboxPage.css';

const CONVERSATIONS = [
  {
    id: 1,
    name: 'Elena Rostova',
    lastMsg: "That sounds perfect! Let's meet at 8 then.",
    time: 'Just now',
    unread: 0,
    online: true,
    color: '#e05c8e',
  },
  {
    id: 2,
    name: 'Marcus Vance',
    lastMsg: 'Did you review the final renders?',
    time: '10:42 AM',
    unread: 3,
    online: false,
    color: '#5c9cbf',
  },
  {
    id: 3,
    name: 'The Collective (4)',
    lastMsg: "Sarah: I'll drop the link in a minute.",
    time: 'Yesterday',
    unread: 0,
    online: false,
    color: '#bf7c5c',
    isGroup: true,
  },
  {
    id: 4,
    name: 'Jada Pink',
    lastMsg: '✓✓ Sounds good.',
    time: 'Tue',
    unread: 0,
    online: false,
    color: '#9b5cbf',
  },
];

export default function InboxPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const isRoot = location.pathname === '/inbox' || location.pathname === '/inbox/';

  const filtered = CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="inbox-page">
      {/* Conversation list */}
      <div className="conversation-list">
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
          {filtered.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${conv.unread > 0 ? 'has-unread' : ''} ${location.pathname === '/inbox/' + conv.id ? 'active' : ''}`}
              onClick={() => navigate(`/inbox/${conv.id}`)}
              id={`conv-${conv.id}`}
            >
              <div className="conv-avatar-wrap">
                <div
                  className="avatar-placeholder"
                  style={{
                    background: `linear-gradient(135deg, ${conv.color}, ${conv.color}88)`,
                    width: 44, height: 44, fontSize: 18,
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, flexShrink: 0
                  }}
                >
                  {conv.name[0]}
                </div>
                {conv.online && <span className="online-dot" />}
                {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
              </div>

              <div className="conv-info">
                <div className="conv-name-row">
                  <span className="conv-name">{conv.name}</span>
                  <span className="conv-time">{conv.time}</span>
                </div>
                <p className="conv-last-msg">{conv.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state / chat area */}
      {isRoot ? (
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
      ) : (
        <Outlet />
      )}
    </div>
  );
}
