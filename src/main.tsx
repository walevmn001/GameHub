import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ShopProvider } from '@/contexts/ShopContext';
import { RoomChatProvider } from '@/contexts/RoomChatContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { RoomsProvider } from '@/contexts/RoomsContext';

/**
 * HashRouter được chọn để đảm bảo hoạt động trên mọi môi trường tĩnh
 * và khi đóng gói bằng Capacitor (WebView) mà không cần cấu hình server.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <ShopProvider>
            <RoomChatProvider>
              <SocialProvider>
                <RoomsProvider>
                  <App />
                </RoomsProvider>
              </SocialProvider>
            </RoomChatProvider>
          </ShopProvider>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>,
);
