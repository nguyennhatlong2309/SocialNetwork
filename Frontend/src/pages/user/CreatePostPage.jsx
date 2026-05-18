import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Globe, MapPin, AtSign, Send, X, Loader2 } from 'lucide-react';
import { useCreatePost } from '../../hooks/usePosts';
import './CreatePostPage.css';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [mode, setMode] = useState('feed');
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState([]); // [{ file: File, url: string }]
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const { mutate: createPost, isPending } = useCreatePost();

  // Xử lý thêm file (append, không replace)
  const handleFiles = (newFiles) => {
    const allowed = Array.from(newFiles).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (allowed.length === 0) return;

    const newPreviews = allowed.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isVideo: file.type.startsWith('video/'),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePreview = (index) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url); // Giải phóng memory
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleShare = () => {
    setError(null);

    // Validate
    if (!content.trim() && previews.length === 0) {
      setError('Vui lòng nhập nội dung hoặc chọn ít nhất 1 ảnh/video.');
      return;
    }

    createPost(
      {
        content: content.trim(),
        visibility: 'public',
        mediaFiles: previews.map((p) => p.file),
      },
      {
        onSuccess: () => {
          // Giải phóng object URLs trước khi navigate
          previews.forEach((p) => URL.revokeObjectURL(p.url));
          navigate('/feed');
        },
        onError: (err) => {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            'Đã xảy ra lỗi. Vui lòng thử lại.';
          setError(message);
        },
      }
    );
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

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(220,53,69,0.12)',
            border: '1px solid rgba(220,53,69,0.3)',
            color: '#ff6b7a',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '12px',
          }}>
            {error}
          </div>
        )}

        {/* Text area */}
        <textarea
          id="post-content-input"
          className="create-textarea"
          placeholder="What's inspiring you today..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          disabled={isPending}
        />

        {/* Multi-file previews */}
        {previews.length > 0 ? (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {previews.map((p, idx) => (
              <div key={idx} className="media-preview" style={{ position: 'relative', width: '100px', height: '100px' }}>
                {p.isVideo ? (
                  <video src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <img src={p.url} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                )}
                <button
                  className="remove-media-btn"
                  onClick={() => removePreview(idx)}
                  disabled={isPending}
                  style={{ position: 'absolute', top: '4px', right: '4px' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {/* Nút thêm ảnh nữa */}
            <div
              onClick={() => !isPending && fileRef.current?.click()}
              style={{
                width: '100px', height: '100px',
                border: '2px dashed var(--border)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isPending ? 'not-allowed' : 'pointer',
                color: 'var(--text-muted)',
                fontSize: '24px',
              }}
            >
              +
            </div>
          </div>
        ) : (
          /* Drop zone khi chưa có file */
          <div
            className={`media-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isPending && fileRef.current?.click()}
            id="media-drop-zone"
          >
            <div className="media-drop-icon">
              <Upload size={24} color="var(--text-muted)" />
            </div>
            <p className="media-drop-label">Drag photos &amp; videos here</p>
            <p className="media-drop-sub">or click to browse from your device</p>
          </div>
        )}

        {/* Hidden file input — multiple */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />

        {/* Footer */}
        <div className="create-footer">
          <div className="create-mode-tabs">
            <button
              className={`mode-tab ${mode === 'feed' ? 'active' : ''}`}
              onClick={() => setMode('feed')}
              id="post-to-feed-btn"
              disabled={isPending}
            >
              Post to Feed
            </button>
            <button
              className={`mode-tab ${mode === 'story' ? 'active' : ''}`}
              onClick={() => setMode('story')}
              id="add-to-story-btn"
              disabled={isPending}
            >
              Add to Story
            </button>
          </div>

          <div className="create-actions">
            <button className="create-action-icon" title="Location" id="location-btn" disabled={isPending}>
              <MapPin size={18} />
            </button>
            <button className="create-action-icon" title="Mention" id="mention-btn" disabled={isPending}>
              <AtSign size={18} />
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleShare}
              disabled={isPending || (!content.trim() && previews.length === 0)}
              id="share-btn"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="spin" /> Uploading...
                </>
              ) : (
                <>Share <Send size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
