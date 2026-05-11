import { createContext, useContext, useRef, useState } from 'react';

// ─── Feed Scroll Context ─────────────────────────────────────────────────────
const FeedScrollContext = createContext(null);

export function FeedScrollProvider({ children }) {
  // Lưu scrollTop của feed container bằng ref (không trigger re-render)
  const scrollRef = useRef(0);
  return (
    <FeedScrollContext.Provider value={scrollRef}>
      {children}
    </FeedScrollContext.Provider>
  );
}

export function useFeedScroll() {
  return useContext(FeedScrollContext);
}

// ─── Inbox State Context ─────────────────────────────────────────────────────
const InboxStateContext = createContext(null);

export function InboxStateProvider({ children }) {
  // Lưu selectedConversationId của InboxPage
  const [selectedId, setSelectedId] = useState(null);
  return (
    <InboxStateContext.Provider value={{ selectedId, setSelectedId }}>
      {children}
    </InboxStateContext.Provider>
  );
}

export function useInboxState() {
  return useContext(InboxStateContext);
}
