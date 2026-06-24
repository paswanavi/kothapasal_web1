import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Props {
  kind: 'success' | 'failure';
  onDone: () => void; // refresh profile + return to subscription
}

export default function PaymentResult({ kind, onDone }: Props) {
  const [state, setState] = useState<'verifying' | 'ok' | 'failed'>(kind === 'failure' ? 'failed' : 'verifying');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (kind !== 'success') return;
    (async () => {
      // eSewa appends ?data=<base64 JSON>
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('data');
      let txUuid = params.get('transaction_uuid') || '';
      if (raw) {
        try {
          const decoded = JSON.parse(atob(raw));
          txUuid = decoded.transaction_uuid || txUuid;
        } catch { /* ignore */ }
      }
      if (!txUuid) { setState('failed'); setMsg('Missing transaction reference.'); return; }

      const { data, error } = await supabase.functions.invoke('esewa-verify', { body: { transaction_uuid: txUuid } });
      if (error || !data?.ok) {
        setState('failed');
        setMsg(data?.status ? `Payment ${data.status}.` : 'Could not verify payment.');
        return;
      }
      setState('ok');
      setMsg(`${String(data.plan).replace('_', ' ')} activated — ${data.credits} credits.`);
    })();
  }, [kind]);

  return (
    <div className="min-h-screen bg-surface-bg grid place-items-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12 max-w-md w-full text-center">
        {state === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
            <h2 className="font-black text-2xl text-gray-900 mt-5">Verifying payment…</h2>
            <p className="text-gray-500 mt-2">Confirming with eSewa. One moment.</p>
          </>
        )}
        {state === 'ok' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h2 className="font-black text-2xl text-gray-900 mt-5">Payment Successful</h2>
            <p className="text-gray-500 mt-2">{msg}</p>
          </>
        )}
        {state === 'failed' && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto" />
            <h2 className="font-black text-2xl text-gray-900 mt-5">Payment Not Completed</h2>
            <p className="text-gray-500 mt-2">{msg || 'Your payment was cancelled or failed. No credits were added.'}</p>
          </>
        )}
        {state !== 'verifying' && (
          <button onClick={onDone} className="mt-7 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-2xl">
            Back to Subscription
          </button>
        )}
      </div>
    </div>
  );
}
