import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Globe, MapPin, AtSign, Send } from 'lucide-react';
import './CreatePostPage.css';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [mode, setMode] = useState('feed');
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleShare = () => {
    // Navigate back after sharing
    navigate('/feed');
  };

  return (
    <div className="create-page">
      <div className="create-container card animate-fade-in">
        {/* Header */}
        <div className="create-header">
          <div className="post-author">
            <div className="avatar-placeholder avatar-md" style={{ background: 'linear-gradient(135deg, #7c5cbf, #9b7fe8)' }}>
              A
            </div>
            <div>
              <p className="create-post-label">Create new post</p>
              <div className="visibility-badge">
                <Globe size={12} />
                <span>Public</span>
              </div>
            </div>
          </div>
        </div>

        {/* Text area */}
        <textarea
          id="post-content-input"
          className="create-textarea"
          placeholder="What's inspiring you today..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
        />

        {/* Media upload */}
        {!preview ? (
          <div
            className={`media-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            id="media-drop-zone"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
            <div className="media-drop-icon">
              <Upload size={24} color="var(--text-muted)" />
            </div>
            <p className="media-drop-label">Drag photos &amp; videos here</p>
            <p className="media-drop-sub">or click to browse from your device</p>
          </div>
        ) : (
          <div className="media-preview">
            <img src={preview} alt="preview" />
            <button className="remove-media-btn" onClick={() => setPreview(null)}>✕</button>
          </div>
        )}

        {/* Footer */}
        <div className="create-footer">
          <div className="create-mode-tabs">
            <button
              className={`mode-tab ${mode === 'feed' ? 'active' : ''}`}
              onClick={() => setMode('feed')}
              id="post-to-feed-btn"
            >
              Post to Feed
            </button>
            <button
              className={`mode-tab ${mode === 'story' ? 'active' : ''}`}
              onClick={() => setMode('story')}
              id="add-to-story-btn"
            >
              Add to Story
            </button>
          </div>

          <div className="create-actions">
            <button className="create-action-icon" title="Location" id="location-btn">
              <MapPin size={18} />
            </button>
            <button className="create-action-icon" title="Mention" id="mention-btn">
              <AtSign size={18} />
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleShare}
              disabled={!content && !preview}
              id="share-btn"
            >
              Share <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
