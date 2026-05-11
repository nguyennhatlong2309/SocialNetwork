import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.jsx'

/**
 * QueryClient config:
 * - staleTime: 5 phút — data được coi là "tươi" trong 5 phút, không refetch khi navigate
 * - gcTime: 30 phút — giữ cache trong memory 30 phút sau khi component unmount
 * - retry: 1 — thử lại 1 lần nếu request lỗi
 * - refetchOnWindowFocus: true — tự động refetch khi user quay lại tab (SWR behavior)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* DevTools chỉ bundle trong development, tự động excluded khi build production */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
