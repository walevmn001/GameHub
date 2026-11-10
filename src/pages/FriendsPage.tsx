import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Coins, MessageSquare, Search, UserMinus, UserRound, Users } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  FullPageLoader,
  Input,
  Modal,
  SectionHeader,
  Surface,
} from '@/components/ui';
import { NoticeBanner } from '@/components/common/NoticeBanner';
import { FriendButton } from '@/components/social/FriendButton';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { formatCoins } from '@/utils/format';
import type { DirectoryUser } from '@/types';

/** Trang Bạn bè: quản lý lời mời, tìm người chơi và trò chuyện riêng. */
export function FriendsPage() {
  const { user, initializing } = useAuth();
  const social = useSocial();
  const [query, setQuery] = useState('');
  const [unfriendTarget, setUnfriendTarget] = useState<DirectoryUser | null>(null);

  const { search, enabled } = social;

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => void search(query), 300);
    return () => clearTimeout(timer);
  }, [query, enabled, search]);

  if (initializing) return <FullPageLoader label="Đang tải…" />;
  if (!user) return <Navigate to="/login" replace />;

  if (!social.enabled) {
    return (
      <div className="flex flex-col gap-5">
        <SectionHeader title="Bạn bè" icon={<Users className="h-5 w-5" />} />
        <NoticeBanner variant="warning" title="Cần backend trực tuyến">
          Tính năng kết bạn và trò chuyện riêng cần máy chủ trực tuyến. Hãy cấu hình biến môi trường
          <code className="mx-1 rounded bg-white/10 px-1">VITE_API_URL</code> trỏ tới backend rồi tải
          lại ứng dụng.
        </NoticeBanner>
      </div>
    );
  }

  const handleUnfriend = async () => {
    if (!unfriendTarget) return;
    await social.unfriend(unfriendTarget.id);
    setUnfriendTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Bạn bè"
        subtitle="Kết bạn, quản lý lời mời và trò chuyện riêng"
        icon={<Users className="h-5 w-5" />}
      />

      {/* Lời mời kết bạn */}
      {(social.incoming.length > 0 || social.outgoing.length > 0) && (
        <section>
          <SectionHeader
            title="Lời mời kết bạn"
            subtitle={
              social.incoming.length > 0
                ? `${social.incoming.length} lời mời đang chờ bạn xử lý`
                : 'Lời mời bạn đã gửi'
            }
          />
          <div className="flex flex-col gap-2">
            {social.incoming.map((request) => (
              <Surface key={request.id} className="flex items-center gap-3 p-3">
                <Avatar
                  src={request.user.avatar}
                  name={request.user.displayName}
                  size="sm"
                  status={request.user.online ? 'online' : 'offline'}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    {request.user.displayName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">@{request.user.username}</p>
                </div>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => void social.acceptRequest(request.id)}
                >
                  Chấp nhận
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void social.rejectRequest(request.id)}
                >
                  Từ chối
                </Button>
              </Surface>
            ))}
            {social.outgoing.map((request) => (
              <Surface key={request.id} className="flex items-center gap-3 p-3">
                <Avatar src={request.user.avatar} name={request.user.displayName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    {request.user.displayName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">Đang chờ chấp nhận…</p>
                </div>
                <Badge tone="neutral">Đã gửi</Badge>
              </Surface>
            ))}
          </div>
        </section>
      )}

      {/* Tìm người chơi */}
      <section>
        <SectionHeader
          title="Khám phá người chơi"
          subtitle="Tìm theo tên đăng nhập hoặc tên hiển thị rồi gửi lời mời"
          icon={<Search className="h-5 w-5" />}
        />
        <Input
          placeholder="Nhập tên để tìm…"
          icon={<Search className="h-4 w-4" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-3">
          {social.searching ? (
            <p className="text-xs text-slate-500">Đang tìm…</p>
          ) : social.searchResults.length === 0 ? (
            <p className="text-xs text-slate-500">Không tìm thấy người chơi phù hợp.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {social.searchResults.map((candidate) => (
                <Surface key={candidate.id} className="flex items-center gap-3 p-3">
                  <Avatar
                    src={candidate.avatar}
                    name={candidate.displayName}
                    size="sm"
                    status={candidate.online ? 'online' : 'offline'}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {candidate.displayName}
                      {candidate.role === 'admin' && (
                        <Badge tone="purple" className="ml-2">
                          Quản trị
                        </Badge>
                      )}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">@{candidate.username}</p>
                  </div>
                  <span className="hidden items-center gap-1 text-xs font-semibold text-amber-300 sm:inline-flex">
                    <Coins className="h-3.5 w-3.5" />
                    {formatCoins(candidate.coins)}
                  </span>
                  <FriendButton
                    contact={{ id: candidate.id, displayName: candidate.displayName, avatar: candidate.avatar }}
                  />
                </Surface>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Danh sách bạn bè */}
      <section>
        <SectionHeader
          title={`Bạn bè của bạn (${social.friends.length})`}
          icon={<UserRound className="h-5 w-5" />}
        />
        {social.friends.length === 0 ? (
          <Surface>
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="Chưa có bạn bè"
              description="Gửi lời mời kết bạn tới người chơi khác hoặc kết bạn ngay trong phòng chơi."
              className="border-0 bg-transparent"
            />
          </Surface>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {social.friends.map((friend) => (
              <Surface key={friend.id} className="flex items-center gap-3 p-3">
                <Avatar
                  src={friend.avatar}
                  name={friend.displayName}
                  size="sm"
                  status={friend.online ? 'online' : 'offline'}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    {friend.displayName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {friend.online ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<MessageSquare className="h-4 w-4" />}
                  onClick={() =>
                    social.openChat({
                      id: friend.id,
                      displayName: friend.displayName,
                      avatar: friend.avatar,
                    })
                  }
                >
                  <span className="hidden sm:inline">Nhắn tin</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setUnfriendTarget(friend)}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                  aria-label="Huỷ kết bạn"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              </Surface>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={Boolean(unfriendTarget)}
        onClose={() => setUnfriendTarget(null)}
        title="Huỷ kết bạn?"
        description={
          unfriendTarget
            ? `${unfriendTarget.displayName} sẽ bị xoá khỏi danh sách bạn bè và không thể nhắn tin cho bạn.`
            : ''
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUnfriendTarget(null)}>
              Huỷ
            </Button>
            <Button variant="danger" onClick={() => void handleUnfriend()}>
              Huỷ kết bạn
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-400">Bạn có thể gửi lại lời mời kết bạn sau này.</p>
      </Modal>
    </div>
  );
}
