import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, MapPin, Phone, BedDouble, Star, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Props {
  hostelId: string;
  onBack: () => void;
}

export default function HostelPage({ hostelId, onBack }: Props) {
  const [hostel, setHostel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [room, setRoom] = useState<any>(null);

  // Card-level photo index per room
  const [cardPhotoIdx, setCardPhotoIdx] = useState<Record<string, number>>({});

  // Fullscreen lightbox state
  const [lightbox, setLightbox] = useState<{ photos: string[]; idx: number } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: h } = await supabase.from('hostels').select('*').eq('id', hostelId).single();
      setHostel(h);
      const { data } = await supabase.from('hostel_rooms').select('*')
        .eq('hostel_id', hostelId).order('created_at', { ascending: false });
      setRooms(data || []);
      setLoading(false);
    })();
  }, [hostelId]);

  // Keyboard nav for lightbox
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!lightbox) return;
    if (e.key === 'ArrowRight') setLightbox(lb => lb ? { ...lb, idx: (lb.idx + 1) % lb.photos.length } : lb);
    if (e.key === 'ArrowLeft') setLightbox(lb => lb ? { ...lb, idx: (lb.idx - 1 + lb.photos.length) % lb.photos.length } : lb);
    if (e.key === 'Escape') setLightbox(null);
  }, [lightbox]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const openLightbox = (photos: string[], idx: number) => setLightbox({ photos, idx });

  const cardPhoto = (r: any) => {
    const photos: string[] = Array.isArray(r.photos) ? r.photos : [];
    const idx = cardPhotoIdx[r.id] ?? 0;
    return { photos, idx, current: photos[idx] };
  };

  const shiftCard = (e: React.MouseEvent, r: any, dir: 1 | -1) => {
    e.stopPropagation();
    const photos: string[] = Array.isArray(r.photos) ? r.photos : [];
    if (photos.length < 2) return;
    setCardPhotoIdx(prev => {
      const cur = prev[r.id] ?? 0;
      return { ...prev, [r.id]: (cur + dir + photos.length) % photos.length };
    });
  };

  if (loading && !hostel) return <div className="w-full text-center py-24 text-gray-400">Loading hostel…</div>;
  if (!hostel) return (
    <div className="w-full text-center py-24">
      <p className="text-gray-500 mb-4">Hostel not found.</p>
      <button onClick={onBack} className="text-primary font-bold">← Back to Hostels</button>
    </div>
  );

  return (
    <div className="w-full px-4 md:px-8 py-8 animate-in fade-in duration-300">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-gray-600 hover:text-primary font-bold mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to Hostels
      </button>

      {/* Cover — object-contain so full photo shows */}
      <div className="rounded-3xl overflow-hidden h-64 md:h-80 shadow-sm bg-gray-900 cursor-pointer"
        onClick={() => hostel.cover_photo && openLightbox([hostel.cover_photo], 0)}>
        {hostel.cover_photo
          ? <img src={hostel.cover_photo} alt={hostel.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          : <div className="w-full h-full grid place-items-center text-5xl">🏢</div>}
      </div>

      {/* Header */}
      <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{hostel.name}</h1>
          <p className="text-gray-500 font-semibold flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" /> {hostel.location}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="chip" style={{ background: 'color-mix(in srgb, var(--color-secondary) 16%, transparent)' }}>
              {hostel.hostel_type}
            </span>
          </div>
        </div>
        <button
          onClick={() => setRevealed(true)}
          className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-md self-start"
        >
          <Phone className="w-4 h-4" />
          {revealed ? (hostel.contact_phone || 'No phone') : 'Contact Hostel Owner'}
        </button>
      </div>

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
          {rooms.map(r => {
            const { photos, idx, current } = cardPhoto(r);
            return (
              <div key={r.id} onClick={() => setRoom(r)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition group flex flex-col">
                {/* Photo with arrows */}
                <div className="relative bg-gray-900 h-56 w-full overflow-hidden">
                  {current
                    ? <img src={current} className="w-full h-full object-contain" referrerPolicy="no-referrer"
                        onClick={e => { e.stopPropagation(); openLightbox(photos, idx); }} />
                    : <div className="w-full h-full grid place-items-center text-4xl">🛏️</div>}

                  {photos.length > 1 && (
                    <>
                      <button onClick={e => shiftCard(e, r, -1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={e => shiftCard(e, r, 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {photos.map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
                        ))}
                      </div>
                    </>
                  )}

                  {r.status === 'TAKEN' && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Taken</span>
                  )}
                </div>

                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-primary font-black text-xl">Rs. {Math.round(r.price)}/mo</span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-base">{r.title}</h4>
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
            );
          })}
        </div>
      )}

      {/* Room detail modal */}
      {room && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setRoom(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {room.photos?.length ? (
              <div className="relative bg-gray-900 h-72">
                <img src={room.photos[cardPhotoIdx[room.id] ?? 0]} className="w-full h-full object-contain cursor-pointer" referrerPolicy="no-referrer"
                  onClick={() => openLightbox(room.photos, cardPhotoIdx[room.id] ?? 0)} />
                {room.photos.length > 1 && (
                  <>
                    <button onClick={e => shiftCard(e, room, -1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={e => shiftCard(e, room, 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {room.photos.map((_: string, i: number) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === (cardPhotoIdx[room.id] ?? 0) ? 'bg-white' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : <div className="h-72 bg-gray-100 grid place-items-center text-4xl">🛏️</div>}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-primary font-black text-2xl">Rs. {Math.round(room.price)}/mo</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${room.status === 'TAKEN' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{room.status}</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 mt-1">{room.title}</h3>
              <p className="text-gray-500 flex items-center gap-1 mt-1"><BedDouble className="w-4 h-4" /> {room.accommodation}</p>
              {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {room.amenities.map((a: string) => (
                    <span key={a} className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">{a}</span>
                  ))}
                </div>
              )}
              <button
                onClick={() => { const ph = (hostel.contact_phone || '').replace(/\s/g, ''); if (ph) window.location.href = `tel:${ph}`; }}
                className="mt-6 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-full inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Contact Hostel Owner
              </button>
              <button onClick={() => setRoom(null)} className="mt-2 w-full text-gray-500 font-semibold py-2">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2" onClick={() => setLightbox(null)}>
            <X className="w-6 h-6" />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3"
            onClick={e => { e.stopPropagation(); setLightbox(lb => lb ? { ...lb, idx: (lb.idx - 1 + lb.photos.length) % lb.photos.length } : lb); }}>
            <ChevronLeft className="w-7 h-7" />
          </button>
          <img src={lightbox.photos[lightbox.idx]} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer"
            onClick={e => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3"
            onClick={e => { e.stopPropagation(); setLightbox(lb => lb ? { ...lb, idx: (lb.idx + 1) % lb.photos.length } : lb); }}>
            <ChevronRight className="w-7 h-7" />
          </button>
          {lightbox.photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {lightbox.photos.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLightbox(lb => lb ? { ...lb, idx: i } : lb); }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === lightbox.idx ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
          )}
          <p className="absolute bottom-6 right-6 text-white/50 text-xs font-bold">{lightbox.idx + 1} / {lightbox.photos.length}</p>
        </div>
      )}
    </div>
  );
}
