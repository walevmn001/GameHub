import { useState } from 'react';
import { Check, Clock, MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui';
import { useSocial } from '@/contexts/SocialContext';
import type { ChatContact } from '@/contexts/SocialContext';

interface FriendButtonProps {
  contact: ChatContact;
  /** Chỉ hiển thị biểu tượng (dùng cho ghế đối thủ trong bàn chơi). */
  compact?: boolean;
  className?: string;
}

/**
 * Nút hành động xã hội tự thích ứng theo quan hệ hiện tại:
 * kết bạn / đã gửi lời mời / chấp nhận lời mời / nhắn tin.
 */
export function FriendButton({ contact, compact = false, className }: FriendButtonProps) {
  const social = useSocial();
  const [busy, setBusy] = useState(false);

  if (!social.enabled) return null;
  const relation = social.relationTo(contact.id);
  if (relation === 'self') return null;

  if (relation === 'friend') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={className}
        icon={<MessageSquare className="h-4 w-4" />}
        onClick={() => social.openChat(contact)}
      >
        {compact ? null : 'Nhắn tin'}
      </Button>
    );
  }

  if (relation === 'outgoing') {
    return (
      <Button variant="ghost" size="sm" className={className} icon={<Clock className="h-4 w-4" />} disabled>
        {compact ? null : 'Đã gửi lời mời'}
      </Button>
    );
  }

  if (relation === 'incoming') {
    const request = social.incoming.find((r) => r.user.id === contact.id);
    return (
      <Button
        variant="success"
        size="sm"
        className={className}
        loading={busy}
        icon={<Check className="h-4 w-4" />}
        onClick={async () => {
          if (!request) return;
          setBusy(true);
          await social.acceptRequest(request.id);
          setBusy(false);
        }}
      >
        {compact ? null : 'Chấp nhận'}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className={className}
      loading={busy}
      icon={<UserPlus className="h-4 w-4" />}
      onClick={async () => {
        setBusy(true);
        await social.sendRequest(contact.id);
        setBusy(false);
      }}
    >
      {compact ? null : 'Kết bạn'}
    </Button>
  );
}
