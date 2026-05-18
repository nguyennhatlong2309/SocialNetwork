import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import UserAvatar from '../ui/UserAvatar';
import './GlobalSearch.css';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await userService.searchUsers(query);
        setResults(response.data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectUser = (userId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="global-search-container" ref={wrapperRef}>
      <div className="global-search-input-wrapper">
        <Search size={16} className="global-search-icon" />
        <input
          type="text"
          className="global-search-input"
          placeholder="Search users..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.trim()) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim() && results.length > 0) setIsOpen(true);
          }}
        />
        {isLoading && <div className="global-search-spinner" />}
      </div>

      {isOpen && query.trim() && (
        <div className="global-search-dropdown">
          {results.length === 0 && !isLoading ? (
            <div className="global-search-empty">No users found</div>
          ) : (
            results.map((user) => (
              <div
                key={user.id}
                className="global-search-result-item"
                onClick={() => handleSelectUser(user.id)}
              >
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  name={user.fullName || user.username}
                  userId={user.id}
                  size="sm"
                />
                <div className="global-search-result-info">
                  <span className="global-search-result-name">
                    {user.fullName || user.username}
                    {user.isVerified && (
                      <span title="Verified" style={{ color: '#4285f4', fontSize: '12px' }}>✓</span>
                    )}
                  </span>
                  <span className="global-search-result-username">@{user.username}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
