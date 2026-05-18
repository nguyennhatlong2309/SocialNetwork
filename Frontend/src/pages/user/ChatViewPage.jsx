import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, Video, MoreVertical, Plus, Smile, Send } from 'lucide-react';
import './ChatViewPage.css';

const CONTACTS = {
  1: { name: 'Elena Rostova', status: 'Active now', online: true, color: '#e05c8e' },
  2: { name: 'Marcus Vance', status: 'Last seen 1h ago', online: false, color: '#5c9cbf' },
  3: { name: 'The Collective', status: '4 members', online: false, color: '#bf7c5c' },
  4: { name: 'Jada Pink', status: 'Last seen yesterday', online: false, color: '#9b5cbf' },
};

const INITIAL_MESSAGES = [
  { id: 1, from: 'them', text: "Hey! I just saw the moodboard you sent over for the new campaign. It looks incredible! ✨", time: null },
  { id: 2, from: 'me', text: "Thanks Elena! I was trying to lean into that glassmorphic minimal vibe we discussed last week.", time: '10:42 AM' },
  { id: 3, from: 'them', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', time: null },
  { id: 4, from: 'them', text: 'I especially loved this abstract composition. Can we use something similar for the hero section?', time: null },
];

export default function ChatViewPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const contact = CONTACTS[conversationId] || CONTACTS[1];
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      from: 'me',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
    setTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-contact-info">
          <div className="conv-avatar-wrap">
            <div className="avatar-placeholder"
              style={{
                background: `linear-gradient(135deg, ${contact.color}, ${contact.color}88)`,
                width: 40, height: 40, fontSize: 16,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700
              }}>
              {contact.name[0]}
            </div>
            {contact.online && <span className="online-dot" />}
          </div>
          <div>
            <p className="chat-contact-name">{contact.name}</p>
            <p className="chat-contact-status">{contact.status}</p>
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
        <div className="date-divider"><span>Today</span></div>

        {messages.map(msg => (
          <div key={msg.id} className={`message-wrap ${msg.from === 'me' ? 'message-me' : 'message-them'}`}>
            {msg.from === 'them' && (
              <div className="avatar-placeholder"
                style={{
                  background: `linear-gradient(135deg, ${contact.color}, ${contact.color}88)`,
                  width: 32, height: 32, fontSize: 13,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, flexShrink: 0, alignSelf: 'flex-end'
                }}>
                {contact.name[0]}
              </div>
            )}

            <div className={`message-bubble ${msg.from === 'me' ? 'bubble-me' : 'bubble-them'}`}>
              {msg.image ? (
                <img src={msg.image} alt="" className="message-image" />
              ) : (
                <p>{msg.text}</p>
              )}
              {msg.time && (
                <span className="message-time">
                  {msg.time}
                  {msg.from === 'me' && ' ✓✓'}
                </span>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="message-wrap message-them">
            <div className="avatar-placeholder"
              style={{
                background: `linear-gradient(135deg, ${contact.color}, ${contact.color}88)`,
                width: 32, height: 32, fontSize: 13,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, flexShrink: 0, alignSelf: 'flex-end'
              }}>
              {contact.name[0]}
            </div>
            <div className="message-bubble bubble-them typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <button className="chat-icon-btn" id="attach-btn"><Plus size={18} /></button>
        <input
          id="chat-message-input"
          type="text"
          className="input-field chat-input"
          placeholder="Type a message..."
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
