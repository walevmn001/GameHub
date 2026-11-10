import { useState, type ReactNode } from 'react';
import { Avatar, Button, Modal } from '@/components/ui';
import { FriendButton } from '@/components/social/FriendButton';
import type { ChatContact } from '@/contexts/SocialContext';

interface PlayerProfileButtonProps {
  contact: ChatContact;
  children: ReactNode;
  summary?: string;
  disableSocial?: boolean;
}

/** Mở thông tin người chơi và hành động xã hội khi bấm vào avatar. */
export function PlayerProfileButton({
  contact,
  children,
  summary,
  disableSocial = false,
}: PlayerProfileButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title={`Xem thông tin ${contact.displayName}`}
        aria-label={`Xem thông tin ${contact.displayName}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-full transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
      >
        {children}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Thông tin người chơi"
        size="sm"
        footer={
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Đóng
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar src={contact.avatar} name={contact.displayName} size="lg" />
          <div>
            <p className="text-base font-bold text-slate-100">{contact.displayName}</p>
            {summary && <p className="mt-1 text-xs text-slate-400">{summary}</p>}
            <p className="mt-1 break-all font-mono text-[11px] text-slate-500">
              ID: {contact.id}
            </p>
          </div>
          {!disableSocial && <FriendButton contact={contact} />}
        </div>
      </Modal>
    </>
  );
}