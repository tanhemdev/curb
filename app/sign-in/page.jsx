import { Suspense } from 'react';
import SignIn from '../../components/auth/SignIn.jsx';

export const metadata = { title: 'Sign in · Curb' };

export default function SignInPage() {
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <SignIn />
    </Suspense>
  );
}
