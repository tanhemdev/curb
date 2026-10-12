import { Suspense } from 'react';
import Messages from '../../components/chat/Messages.jsx';

export const metadata = { title: 'Messages · Curb' };

export default function MessagesPage() {
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <Messages />
    </Suspense>
  );
}
