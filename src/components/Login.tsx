import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Phone, ShieldCheck, MapPin, Bolt } from 'lucide-react';

const COUNTRIES = [
  { name: 'Nepal', flag: '🇳🇵', dial: '+977', len: 10 },
  { name: 'USA', flag: '🇺🇸', dial: '+1', len: 10 },
];

export default function Login() {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const full = country.dial + phone;

  async function sendOtp() {
    setErr(''); setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: full });
    setBusy(false);
    if (error) setErr(error.message); else setSent(true);
  }
  async function verify() {
    setErr(''); setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ phone: full, token: otp, type: 'sms' });
    setBusy(false);
    if (error) setErr(error.message);
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel — top band on mobile, left half on desktop */}
      <div className="flex flex-col justify-center lg:justify-between w-full lg:w-1/2 px-8 py-10 lg:p-14 text-white relative overflow-hidden text-center lg:text-left"
           style={{ background: 'linear-gradient(135deg,#69A132,#3f6b1f)' }}>
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -left-16 bottom-10 w-72 h-72 rounded-full bg-white/5 hidden lg:block" />
        <div className="hidden lg:flex items-center gap-2 text-2xl font-black relative z-10">
          <span className="bg-white/20 rounded-xl px-3 py-1">🏠</span> Kotha Pasal
        </div>
        <div className="relative z-10">
          <div className="lg:hidden text-3xl font-black mb-3">🏠 Kotha Pasal</div>
          <h1 className="hidden lg:block text-5xl font-black leading-tight tracking-tight">Find your<br/>perfect kotha.</h1>
          <p className="lg:mt-4 text-white/90 text-base lg:text-lg max-w-md mx-auto lg:mx-0">Verified rooms & student hostels across all 77 districts of Nepal — direct from owners.</p>
        </div>
        <p className="hidden lg:block relative z-10 text-white/60 text-sm">© 2026 Kotha Pasal</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-bg">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-3xl font-black text-gray-800">{sent ? 'Verify code' : 'Welcome 👋'}</h2>
            <p className="text-gray-500 mt-1 mb-7">
              {sent ? `Enter the 6-digit code sent to ${full}` : 'Sign in or create an account with your phone.'}
            </p>

            {!sent ? (
              <>
                <div className="flex gap-3 mb-4">
                  <select value={country.dial}
                    onChange={e => setCountry(COUNTRIES.find(c => c.dial === e.target.value)!)}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {COUNTRIES.map(c => <option key={c.dial} value={c.dial}>{c.flag} {c.dial}</option>)}
                  </select>
                  <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4">
                    <Phone className="w-4 h-4 text-primary" />
                    <input className="flex-1 bg-transparent py-3.5 focus:outline-none font-semibold"
                      placeholder="Phone number" inputMode="numeric" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, country.len))} />
                  </div>
                </div>
                <button onClick={sendOtp} disabled={phone.length !== country.len || busy}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50">
                  {busy ? 'Sending…' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <input className="w-full text-center text-3xl font-black tracking-[0.5em] rounded-xl border border-gray-200 bg-gray-50 py-4 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="000000" inputMode="numeric" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                <button onClick={verify} disabled={otp.length < 6 || busy}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50">
                  {busy ? 'Verifying…' : 'Verify & Continue'}
                </button>
                <button onClick={() => { setSent(false); setOtp(''); }}
                  className="w-full mt-3 text-gray-500 font-semibold text-sm">← Change number</button>
              </>
            )}
            {err && <p className="text-red-600 text-sm mt-4">{err}</p>}
            <p className="text-gray-400 text-xs mt-6 text-center">We text a one-time code. Standard rates may apply.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
