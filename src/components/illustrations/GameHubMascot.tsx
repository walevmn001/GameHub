import { KittenMascot, type KittenPose } from '@/components/illustrations/KittenMascot';

/** Wrapper tương thích ngược cho mascot mèo SVG dùng xuyên suốt ứng dụng. */
export function GameHubMascot({
  className,
  uid = 'mascot',
  wink = false,
  pose,
}: {
  className?: string;
  uid?: string;
  wink?: boolean;
  pose?: KittenPose;
}) {
  return <KittenMascot className={className} uid={uid} pose={pose ?? (wink ? 'wink' : 'happy')} />;
}
