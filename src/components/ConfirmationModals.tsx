import { useCallback, useEffect, useState } from 'react';
import { Home, PartyPopper, BellRing, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient';

/**
 * Double-handshake + heartbeat confirmation popups for the web.
 *
 * Mirrors the iOS ConfirmationManager: on login (and when the tab regains focus)
 * we poll `notifications` for unread rows of three types, then surface a blocking
 * modal for each. Actions call the existing Supabase RPCs — no schema changes.
 *
 *   MOVE_IN_CHECK (tenant)  → "Did you get this room?"      → confirm_moving_in(unlock, bool)
 *   MOVING_IN     (landlord)→ "[Tenant] is moving in!"      → landlord_mark_taken(listing)
 *   HEARTBEAT     (landlord)→ "Is this room still available?"→ landlord_confirm_available(listing, bool)
 *
 * Push delivery is handled server-side via APNs (iOS only). The web has no VAPID/
 * service-worker pipeline, so it relies on login + foreground polling to intercept.
 */

const HANDSHAKE_TYPES = ['MOVE_IN_CHECK', 'MOVING_IN', 'HEARTBEAT'];

interface NotifRow {
  id: string;
  type: string;
  title: string;
  message: string;
  data: { unlock_id?: string; listing_id?: string; tenant_name?: string } | null;
}

interface ListingLite {
  title: string;
  location: string;
  price: number;
  photo?: string;
}

export default function ConfirmationModals({ userId }: { userId?: string }) {
  const [queue, setQueue] = useState<NotifRow[]>([]);
  const [listing, setListing] = useState<ListingLite | null>(null);
  const [busy, setBusy] = useState(false);

  const current = queue[0] ?? null;

  const fetchPending = useCallback(async () => {
    if (!userId) { setQueue([]); return; }
    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, message, data')
      .eq('user_id', userId)
      .eq('is_read', false)
      .in('type', HANDSHAKE_TYPES)
      .order('created_at', { ascending: true });
    setQueue((data as NotifRow[]) || []);
  }, [userId]);

  // Intercept on login + whenever the tab regains focus.
  useEffect(() => {
    fetchPending();
    const onFocus = () => { if (document.visibilityState === 'visible') fetchPending(); };
    document.addEventListener('visibilitychange', onFocus);
    return () => document.removeEventListener('visibilitychange', onFocus);
  }, [fetchPending]);

  // Load the room details for the current prompt.
  useEffect(() => {
    const lid = current?.data?.listing_id;
    if (!lid) { setListing(null); return; }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('listings')
        .select('title, location, price, photos')
        .eq('id', lid)
        .single();
      if (active && data) {
        setListing({
          title: data.title,
          location: data.location,
          price: data.price,
          photo: Array.isArray(data.photos) ? data.photos[0] : undefined,
        });
      }
    })();
    return () => { active = false; };
  }, [current?.id]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const advance = (id: string) => setQueue((q) => q.filter((n) => n.id !== id));

  // Resolve the current prompt: run RPC (if any), mark the notification read, advance.
  const resolve = async (rpc?: { fn: string; args: Record<string, unknown> }) => {
    if (!current || busy) return;
    setBusy(true);
    try {
      if (rpc) {
        const { error } = await supabase.rpc(rpc.fn, rpc.args);
        if (error) { alert('Could not save your response: ' + error.message); setBusy(false); return; }
      }
      await markRead(current.id);
      advance(current.id);
    } finally {
      setBusy(false);
    }
  };

  if (!current) return null;

  const roomLine = listing && (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-3 mt-5 text-left">
      <div className="w-14 h-14 rounded-xl bg-gray-200 overflow-hidden shrink-0 grid place-items-center text-2xl">
        {listing.photo ? <img src={listing.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : '🏠'}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-800 truncate">{listing.title}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 shrink-0" /> {listing.location}</p>
        <p className="text-xs font-bold text-primary mt-0.5">Rs. {Math.round(listing.price)}/mo</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-7 shadow-2xl text-center animate-in zoom-in-95 duration-200">

        {current.type === 'MOVE_IN_CHECK' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 grid place-items-center mx-auto"><Home className="w-8 h-8 text-primary" /></div>
            <h3 className="font-black text-xl text-gray-900 mt-5">Did you get this room?</h3>
            <p className="text-sm text-gray-500 mt-2">Are you moving in there?</p>
            {roomLine}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button disabled={busy} onClick={() => resolve({ fn: 'confirm_moving_in', args: { p_unlock_id: current.data?.unlock_id, p_moving_in: false } })}
                className="py-3 rounded-full border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-60">No, not yet</button>
              <button disabled={busy} onClick={() => resolve({ fn: 'confirm_moving_in', args: { p_unlock_id: current.data?.unlock_id, p_moving_in: true } })}
                className="py-3 rounded-full bg-primary hover:bg-primary-hover text-white font-bold disabled:opacity-60">Yes, moving in</button>
            </div>
          </>
        )}

        {current.type === 'MOVING_IN' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 grid place-items-center mx-auto"><PartyPopper className="w-8 h-8 text-emerald-500" /></div>
            <h3 className="font-black text-xl text-gray-900 mt-5">{current.data?.tenant_name || 'A tenant'} is moving in! 🎉</h3>
            <p className="text-sm text-gray-500 mt-2">Mark this property as taken?</p>
            {roomLine}
            <button disabled={busy} onClick={() => resolve({ fn: 'landlord_mark_taken', args: { p_listing_id: current.data?.listing_id } })}
              className="mt-6 w-full py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold disabled:opacity-60">Mark as Taken</button>
            <button disabled={busy} onClick={() => resolve()}
              className="mt-2 w-full py-2.5 text-gray-500 hover:text-gray-700 font-bold text-sm rounded-full">Not yet</button>
          </>
        )}

        {current.type === 'HEARTBEAT' && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 grid place-items-center mx-auto"><BellRing className="w-8 h-8 text-amber-500" /></div>
            <h3 className="font-black text-xl text-gray-900 mt-5">Is this room still available?</h3>
            <p className="text-sm text-gray-500 mt-2">Keep your listing accurate for renters.</p>
            {roomLine}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button disabled={busy} onClick={() => resolve({ fn: 'landlord_confirm_available', args: { p_listing_id: current.data?.listing_id, p_still_available: false } })}
                className="py-3 rounded-full border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-60">It's Taken</button>
              <button disabled={busy} onClick={() => resolve({ fn: 'landlord_confirm_available', args: { p_listing_id: current.data?.listing_id, p_still_available: true } })}
                className="py-3 rounded-full bg-primary hover:bg-primary-hover text-white font-bold disabled:opacity-60">Still Available</button>
            </div>
          </>
        )}

        {queue.length > 1 && (
          <p className="text-[11px] text-gray-400 font-semibold mt-4">{queue.length - 1} more to review</p>
        )}
      </div>
    </div>
  );
}
