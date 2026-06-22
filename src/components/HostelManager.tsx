import { useEffect, useState } from 'react';
import { supabase, uploadImage } from '../supabaseClient';
import { Building2, PlusCircle, BedDouble, Phone } from 'lucide-react';

const CITIES = ['Kathmandu','Lalitpur','Bhaktapur','Kaski','Chitwan','Morang','Rupandehi','Sunsari','Jhapa','Makwanpur'];
const SHARING = ['1 Seater','2 Seater','3 Seater'];
const AMENITIES = ['Wi-Fi','Attached Bathroom','Kitchen','Parking','Water Supply','Furnished','Balcony','Security','Laundry'];

export default function HostelManager({ userId }: { userId: string }) {
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Record<string, any[]>>({});
  const [creating, setCreating] = useState(false);
  const [activeHostel, setActiveHostel] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: hs } = await supabase.from('hostels').select('*').eq('owner_id', userId).order('created_at', { ascending: false });
    setHostels(hs || []);
    if (hs?.length) {
      const { data: rs } = await supabase.from('hostel_rooms').select('*').in('hostel_id', hs.map(h => h.id));
      const map: Record<string, any[]> = {};
      (rs || []).forEach(r => { (map[r.hostel_id] ??= []).push(r); });
      setRooms(map);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-2xl text-gray-800 flex items-center gap-2"><Building2 className="w-6 h-6 text-primary" /> Manage Hostels</h2>
          <p className="text-sm text-gray-500">Create a hostel, then add rooms under it.</p>
        </div>
        <button onClick={() => setCreating(true)} className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-full inline-flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Create New Hostel
        </button>
      </div>

      {creating && <CreateHostel userId={userId} onDone={() => { setCreating(false); load(); }} onCancel={() => setCreating(false)} />}

      {hostels.length === 0 && !creating && (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400 font-semibold">
          No hostels yet. Click "Create New Hostel" to start.
        </div>
      )}

      {hostels.map(h => (
        <div key={h.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-4">
            {h.cover_photo
              ? <img src={h.cover_photo} className="w-20 h-20 rounded-xl object-cover" />
              : <div className="w-20 h-20 rounded-xl bg-gray-100 grid place-items-center text-2xl">🏢</div>}
            <div className="flex-1">
              <h3 className="font-black text-lg text-gray-800">{h.name}</h3>
              <p className="text-sm text-gray-500">📍 {h.location} · {h.hostel_type}</p>
              <p className="text-xs text-gray-400">{(rooms[h.id]?.length || 0)} room(s) listed</p>
            </div>
            <button onClick={() => setActiveHostel(activeHostel === h.id ? null : h.id)}
              className="text-primary font-bold text-sm inline-flex items-center gap-1">
              <PlusCircle className="w-4 h-4" /> Add Room
            </button>
          </div>

          {(rooms[h.id]?.length > 0) && (
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {rooms[h.id].map(r => (
                <div key={r.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                  {r.photos?.[0] && <img src={r.photos[0]} className="w-14 h-14 rounded-lg object-cover" />}
                  <div className="text-sm">
                    <div className="font-bold text-gray-800">{r.title}</div>
                    <div className="text-gray-500">{r.accommodation} · Rs. {Math.round(r.price)}/mo</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeHostel === h.id && (
            <AddRoom hostelId={h.id} userId={userId} onDone={() => { setActiveHostel(null); load(); }} />
          )}
        </div>
      ))}
    </div>
  );
}

function CreateHostel({ userId, onDone, onCancel }: { userId: string; onDone: () => void; onCancel: () => void }) {
  const [f, setF] = useState({ name: '', phone: '', city: 'Kathmandu', area: '', type: 'Boys Hostel' });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }));
  const valid = f.name && f.phone.length === 10 && f.area;

  async function create() {
    setBusy(true);
    try {
      let cover = '';
      if (file) cover = await uploadImage('room_photos', file);
      await supabase.from('hostels').insert({
        owner_id: userId, name: f.name, location: `${f.area}, ${f.city}`,
        hostel_type: f.type, contact_phone: f.phone, cover_photo: cover,
      });
      onDone();
    } catch (e: any) { alert(e.message); }
    setBusy(false);
  }

  return (
    <div className="bg-white border-2 border-primary/20 rounded-2xl p-5 space-y-3">
      <h3 className="font-black text-lg">New Hostel</h3>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm" />
      <input className="w-full border rounded-xl px-4 py-2.5" placeholder="Hostel Name" value={f.name} onChange={e => set('name', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <select className="border rounded-xl px-4 py-2.5" value={f.city} onChange={e => set('city', e.target.value)}>{CITIES.map(c => <option key={c}>{c}</option>)}</select>
        <input className="border rounded-xl px-4 py-2.5" placeholder="Area" value={f.area} onChange={e => set('area', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select className="border rounded-xl px-4 py-2.5" value={f.type} onChange={e => set('type', e.target.value)}>
          <option>Boys Hostel</option><option>Girls Hostel</option>
        </select>
        <input className="border rounded-xl px-4 py-2.5" placeholder="Phone (10 digits)" inputMode="numeric"
          value={f.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
      </div>
      <div className="flex gap-3">
        <button disabled={!valid || busy} onClick={create} className="bg-primary text-white font-bold px-5 py-2.5 rounded-full disabled:opacity-50">{busy ? 'Creating…' : 'Create Hostel'}</button>
        <button onClick={onCancel} className="text-gray-500 font-semibold px-4">Cancel</button>
      </div>
    </div>
  );
}

function AddRoom({ hostelId, userId, onDone }: { hostelId: string; userId: string; onDone: () => void }) {
  const [f, setF] = useState({ title: '', sharing: '1 Seater', price: '' });
  const [files, setFiles] = useState<File[]>([]);
  const [amen, setAmen] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }));
  const valid = f.title && f.price && files.length >= 1;

  async function add() {
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of files.slice(0, 3)) urls.push(await uploadImage('room_photos', file));
      await supabase.from('hostel_rooms').insert({
        hostel_id: hostelId, title: f.title, price: parseFloat(f.price) || 0,
        accommodation: f.sharing, amenities: [...amen], photos: urls, status: 'AVAILABLE',
      });
      onDone();
    } catch (e: any) { alert(e.message); }
    setBusy(false);
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
      <h4 className="font-bold text-sm flex items-center gap-1"><BedDouble className="w-4 h-4 text-primary" /> Add a room</h4>
      <input type="file" accept="image/*" multiple onChange={e => setFiles([...(e.target.files || [])].slice(0, 3))} className="text-sm" />
      <div className="grid grid-cols-3 gap-3">
        <input className="border rounded-xl px-3 py-2 col-span-2" placeholder="Room title" value={f.title} onChange={e => set('title', e.target.value)} />
        <select className="border rounded-xl px-3 py-2" value={f.sharing} onChange={e => set('sharing', e.target.value)}>{SHARING.map(s => <option key={s}>{s}</option>)}</select>
      </div>
      <input className="border rounded-xl px-3 py-2 w-full" placeholder="Monthly rent (Rs.)" inputMode="numeric" value={f.price} onChange={e => set('price', e.target.value.replace(/\D/g, ''))} />
      <div className="flex flex-wrap gap-2">
        {AMENITIES.map(a => (
          <button key={a} onClick={() => { const n = new Set(amen); n.has(a) ? n.delete(a) : n.add(a); setAmen(n); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${amen.has(a) ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'}`}>
            {a}
          </button>
        ))}
      </div>
      <button disabled={!valid || busy} onClick={add} className="bg-primary text-white font-bold px-5 py-2.5 rounded-full disabled:opacity-50">{busy ? 'Adding…' : 'Add Room'}</button>
    </div>
  );
}
