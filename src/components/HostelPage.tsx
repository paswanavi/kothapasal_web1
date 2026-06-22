import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Phone, BedDouble, Star } from 'lucide-react';
import { Property } from '../types';
import { supabase } from '../supabaseClient';

interface Props {
  hostel: Property;          // hostel.id === hostels.id
  onBack: () => void;
}

export default function HostelPage({ hostel, onBack }: Props) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('hostel_rooms').select('*')
        .eq('hostel_id', hostel.id).order('created_at', { ascending: false });
      setRooms(data || []);
      setLoading(false);
    })();
  }, [hostel.id]);

  return (
    <div className="w-full px-4 md:px-8 py-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-gray-600 hover:text-primary font-bold mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to Hostels
      </button>

      {/* Cover */}
      <div className="rounded-3xl overflow-hidden h-64 md:h-80 shadow-sm">
        <img src={hostel.image} alt={hostel.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>

      {/* Header */}
      <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{hostel.title}</h1>
          <p className="text-gray-500 font-semibold flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" /> {hostel.area}, {hostel.city}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="chip" style={{ background: 'color-mix(in srgb, var(--color-secondary) 16%, transparent)' }}>
              {hostel.genderSpecific === 'girls' ? 'Girls Hostel' : 'Boys Hostel'}
            </span>
            {hostel.rating > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {hostel.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setRevealed(true)}
          className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-md self-start"
        >
          <Phone className="w-4 h-4" />
          {revealed ? (hostel.host.phone || 'No phone') : 'Contact Hostel Owner'}
        </button>
      </div>

      {/* Amenities */}
      {hostel.amenities.length > 0 && (
        <div className="mt-6">
          <h3 className="font-black text-lg text-gray-800 mb-2">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {hostel.amenities.map(a => (
              <span key={a} className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Rooms */}
      <h3 className="font-black text-xl text-gray-800 mt-8 mb-4">Available Rooms ({rooms.length})</h3>
      {loading ? (
        <p className="text-gray-400">Loading rooms…</p>
      ) : rooms.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400 font-semibold">
          No rooms listed in this hostel yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {r.photos?.[0]
                ? <img src={r.photos[0]} className="w-full h-44 object-cover" referrerPolicy="no-referrer" />
                : <div className="w-full h-44 bg-gray-100 grid place-items-center text-3xl">🛏️</div>}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-primary font-black text-lg">Rs. {Math.round(r.price)}/mo</span>
                  {r.status === 'TAKEN' && <span className="badge taken">TAKEN</span>}
                </div>
                <h4 className="font-bold text-gray-800 mt-1">{r.title}</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><BedDouble className="w-4 h-4" /> {r.accommodation}</p>
                {Array.isArray(r.amenities) && r.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {r.amenities.slice(0, 4).map((a: string) => (
                      <span key={a} className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-100">{a}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
