import { Route, Routes } from 'react-router-dom';
import { GameLayout, MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { GamesPage } from '@/pages/GamesPage';
import { RoomsPage } from '@/pages/RoomsPage';
import { RoomLobbyPage } from '@/pages/RoomLobbyPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PlayGamePage } from '@/pages/PlayGamePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<GameLayout />}>
        <Route path="/play/:gameId" element={<PlayGamePage />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:roomId" element={<RoomLobbyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
