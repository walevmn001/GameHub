import { useEffect, useState, type ReactNode } from 'react';
import { CalendarDays, Coins, Gamepad2, Trophy } from 'lucide-react';
import { Avatar, Button, Modal } from '@/components/ui';
import { FriendButton } from '@/components/social/FriendButton';
import { useSocial } from '@/contexts/SocialContext';
import type { ChatContact } from '@/contexts/SocialContext';
import type { PublicPlayerProfile } from '@/types';
import { socialService } from '@/services/SocialService';
import { formatCoins, formatDateTime, formatDuration } from '@/utils/format';

interface PlayerProfileButtonProps {
  contact: ChatContact;
  children: ReactNode;
  summary?: string;
  disableSocial?: boolean;
}

/** Mở hồ sơ công khai và hành động xã hội khi bấm vào avatar. */
export function PlayerProfileButton({
  contact,
  children,
  summary,
  disableSocial = false,
}: PlayerProfileButtonProps) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<PublicPlayerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const social = useSocial();

  useEffect(() => {
    if (!open || !social.enabled || disableSocial) return;
    let cancelled = false;
    setLoading(true);
    setProfileError('');
    void socialService.playerProfile(contact.id).then((result) => {
      if (cancelled) return;
      if (result.ok) setProfile(result.data);
      else setProfileError(result.error);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [contact.id, disableSocial, open, social.enabled]);

  return (
    <>
      <button
        type="button"
        title={`Xem thông tin ${contact.displayName}`}
        aria-label={`Xem thông tin ${contact.displayName}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="relative inline-flex p-0 cursor-pointer rounded-full transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
      >
        {children}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Hồ sơ người chơi"
        size="sm"
        footer={
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Đóng
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar
            src={profile?.avatar || contact.avatar}
            name={profile?.displayName || contact.displayName}
            size="lg"
          />
          <div>
            <p className="text-base font-bold text-slate-100">
              {profile?.displayName || contact.displayName}
            </p>
            {profile?.username && <p className="mt-1 text-xs text-slate-400">@{profile.username}</p>}
            {summary && <p className="mt-1 text-xs text-slate-400">{summary}</p>}
            <p className="mt-1 break-all font-mono text-[11px] text-slate-500">
              ID: {contact.id}
            </p>
            {!disableSocial && (
              <FriendButton
                contact={contact}
                className="mt-2 h-8 rounded-lg px-3 text-[11px] shadow-md shadow-purple-500/20 hover:shadow-purple-500/30"
              />
            )}
          </div>

          {loading && <p className="text-xs text-slate-400">Đang tải hồ sơ…</p>}
          {profileError && <p role="alert" className="text-xs text-rose-600">{profileError}</p>}
          {profile && (
            <div className="w-full space-y-3 text-left">
              <div className="grid grid-cols-3 gap-2">
                <ProfileStat icon={<Coins className="h-3.5 w-3.5" />} label="Xu" value={formatCoins(profile.coins)} />
                <ProfileStat icon={<Gamepad2 className="h-3.5 w-3.5" />} label="Ván" value={formatCoins(profile.stats.matches)} />
                <ProfileStat icon={<Trophy className="h-3.5 w-3.5" />} label="Thắng" value={formatCoins(profile.stats.wins)} />
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />
                Tham gia {formatDateTime(profile.createdAt)}
              </p>
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-300">Trận đấu gần đây</p>
                {profile.history.length === 0 ? (
                  <p className="rounded-lg bg-ink/[0.03] p-3 text-xs text-slate-500">Chưa có trận đấu nào.</p>
                ) : (
                  <ul className="max-h-40 space-y-1.5 overflow-y-auto">
                    {profile.history.slice(0, 5).map((match) => (
                      <li key={match.id} className="flex items-center justify-between gap-2 rounded-lg bg-ink/[0.03] px-3 py-2 text-xs">
                        <span className="min-w-0 truncate text-slate-300">
                          {match.gameName} · {match.placement === 1 ? 'Thắng' : `Hạng ${match.placement}`}
                        </span>
                        <span className="shrink-0 text-slate-500">{formatDuration(match.durationMs)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

function ProfileStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/5 bg-base-900/60 p-2">
      <div className="flex items-center gap-1 text-[10px] text-slate-500">{icon}{label}</div>
      <p className="mt-1 text-sm font-bold text-slate-100">{value}</p>
    </div>
  );
}
