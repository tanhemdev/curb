import { Suspense } from 'react';
import ListingDetail from '../../components/listing/ListingDetail.jsx';

// /listing?id=... : a query parameter instead of /listing/[id], so the app
// can be exported as static files.
export default function ListingPage() {
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <ListingDetail />
    </Suspense>
  );
}
