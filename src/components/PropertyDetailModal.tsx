import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  X,
  MapPin,
  Star,
  ShieldCheck,
  Wifi,
  Utensils,
  Droplet,
  Eye,
  Zap,
  Sun,
  Car,
  Coins,
  Phone,
  Heart,
  ThumbsUp,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Property, Review } from '../types';
import { IMAGES } from '../mockData';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  isFavorited: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  userCredits: number;
  onDeductCredit: (propertyId: string) => Promise<boolean>; // resolves true if reveal succeeded
  onNeedPlan: () => void; // out of credits → go buy a plan
  isUnlocked?: boolean; // already unlocked previously
  onAddReview: (propertyId: string, review: Review) => void;
}

export default function PropertyDetailModal({
  property,
  onClose,
  isFavorited,
  onToggleFavorite,
  userCredits,
  onDeductCredit,
  onNeedPlan,
  isUnlocked,
  onAddReview
}: PropertyDetailModalProps) {
  const [revealed, setRevealed] = useState(!!isUnlocked);
  const [revealing, setRevealing] = useState(false);
  const [outOfCredit, setOutOfCredit] = useState(false);
  const photos: string[] = (property.imagesList && property.imagesList.length)
    ? property.imagesList
    : (property.image ? [property.image] : []);
  const [imgIdx, setImgIdx] = useState(0);
  const goImg = (dir: 1 | -1) =>
    setImgIdx(i => (i + dir + photos.length) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (photos.length < 2) return;
      if (e.key === 'ArrowRight') setImgIdx(i => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setImgIdx(i => (i - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photos.length]);

  // Live rating from Supabase
  const [myStars, setMyStars] = useState(0);
  const [ratingAgg, setRatingAgg] = useState<{ avg: number; count: number }>({ avg: property.rating || 0, count: 0 });

  const ratingType = property.type === 'hostel' ? 'hostel' : 'listing';

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('ratings').select('stars').eq('target_type', ratingType).eq('target_id', property.id);
      const arr = (data || []).map((r: any) => r.stars);
      if (arr.length) setRatingAgg({ avg: arr.reduce((a: number, b: number) => a + b, 0) / arr.length, count: arr.length });
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user?.id;
      if (uid) {
        const { data: mine } = await supabase.from('ratings').select('stars').eq('target_type', ratingType).eq('target_id', property.id).eq('user_id', uid).maybeSingle();
        if (mine) setMyStars(mine.stars);
      }
    })();
  }, [property.id]);

  const submitStars = async (n: number) => {
    setMyStars(n);
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user?.id;
    if (!uid) { alert('Please sign in to rate.'); return; }
    await supabase.from('ratings').upsert(
      { user_id: uid, target_type: ratingType, target_id: property.id, stars: n },
      { onConflict: 'user_id,target_type,target_id' }
    );
    const { data } = await supabase.from('ratings').select('stars').eq('target_type', ratingType).eq('target_id', property.id);
    const arr = (data || []).map((r: any) => r.stars);
    if (arr.length) setRatingAgg({ avg: arr.reduce((a: number, b: number) => a + b, 0) / arr.length, count: arr.length });
  };
  
  // Review form states
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  const handleRevealContact = async () => {
    if (revealed || revealing) return;
    setRevealing(true);
    const success = await onDeductCredit(property.id);
    setRevealing(false);
    if (success) {
      setRevealed(true);
    } else {
      setOutOfCredit(true);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || !newReviewName.trim()) return;

    const addedReview: Review = {
      id: `rev-dyn-${Date.now()}`,
      reviewerName: newReviewName,
      reviewerAvatar: IMAGES.avatarDefault,
      rating: newReviewRating,
      text: newReviewText,
      date: new Date().toISOString().split('T')[0]
    };

    onAddReview(property.id, addedReview);
    setNewReviewText('');
    setNewReviewName('');
    setNewReviewRating(5);
    setReviewSubmitSuccess(true);
    setTimeout(() => setReviewSubmitSuccess(false), 3000);
  };

  // Maps amenity strings to beautiful Lucide icons
  const getAmenityIcon = (name: string) => {
    const clean = name.toLowerCase();
    if (clean.includes('wifi') || clean.includes('internet')) return <Wifi className="w-5 h-5 text-tertiary" />;
    if (clean.includes('mess') || clean.includes('food') || clean.includes('meal')) return <Utensils className="w-5 h-5 text-tertiary" />;
    if (clean.includes('water')) return <Droplet className="w-5 h-5 text-tertiary" />;
    if (clean.includes('security') || clean.includes('cctv')) return <Eye className="w-5 h-5 text-tertiary" />;
    if (clean.includes('power') || clean.includes('backup')) return <Zap className="w-5 h-5 text-tertiary" />;
    if (clean.includes('solar') || clean.includes('heater')) return <Sun className="w-5 h-5 text-tertiary" />;
    if (clean.includes('parking')) return <Car className="w-5 h-5 text-tertiary" />;
    return <Award className="w-5 h-5 text-tertiary" />;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-[1040px] max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button absolute top */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/95 text-gray-700 hover:text-primary hover:scale-105 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all border border-gray-100"
          id="btn-close-modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero visual header */}
        <div className="p-4 md:p-8 bg-gray-50 border-b border-gray-100 flex flex-col gap-4">
          
          {/* Action Row */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold border border-emerald-200/50 uppercase tracking-wide py-1.5 h-7">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Listing
            </span>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={(e) => onToggleFavorite(property.id, e)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs cursor-pointer transition-all border ${
                  isFavorited 
                    ? 'bg-red-50 text-primary border-primary' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-primary text-primary' : ''}`} />
                <span>{isFavorited ? 'Saved in Wishlist' : 'Save to Favorites'}</span>
              </button>
            </div>
          </div>

          <h2 className="font-sans font-black text-2xl md:text-3xl text-gray-800 tracking-tight leading-tight">
            {property.title}
          </h2>
          <div className="flex items-center gap-2 text-sm text-secondary font-semibold">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{property.area}, {property.city} (District: {property.district}), Nepal</span>
          </div>
        </div>

        {/* Photo carousel — arrows + keyboard nav */}
        <div className="p-4 md:p-8">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 h-[300px] md:h-[440px] group">
            {photos.length > 0 ? (
              <img
                src={photos[imgIdx]}
                alt={`Photo ${imgIdx + 1}`}
                className="w-full h-full object-contain transition-all"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-5xl text-white/40">🏠</div>
            )}

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goImg(-1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2.5 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => goImg(1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2.5 transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {imgIdx + 1} / {photos.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {photos.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setImgIdx(idx)}
                  className={`relative shrink-0 w-20 h-16 overflow-hidden rounded-xl cursor-pointer transition-all bg-gray-900 ${
                    imgIdx === idx
                      ? 'ring-3 ring-primary ring-offset-2'
                      : 'opacity-70 hover:opacity-100 border border-gray-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Double Column content layout */}
        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Description, Amenities, Location */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <div>
              <h3 className="font-extrabold text-lg text-gray-800 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                {property.description}
              </p>
            </div>

            {/* Hostel detailed Seater selection if it's a hostel */}
            {property.type === 'hostel' && property.hostelSeaterOptions && (
              <div className="bg-red-50/40 border border-primary/10 rounded-2xl p-5">
                <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-3">
                  Hostel Accommodation Options
                </h4>
                <div className="divide-y divide-gray-100 text-sm">
                  {property.hostelSeaterOptions.map((opt, idx) => (
                    <div key={`${opt.seater}-${idx}`} className="flex justify-between py-2.5 items-center">
                      <span className="font-semibold text-gray-700">{opt.seater} Room</span>
                      <span className="font-black text-primary">Rs. {opt.price.toLocaleString('en-IN')}/month</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ratings (synced to Supabase) */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="font-extrabold text-gray-800">Ratings</span>
                <span className="ml-2 text-sm text-gray-500">
                  {ratingAgg.count > 0 ? `★ ${ratingAgg.avg.toFixed(1)} (${ratingAgg.count})` : 'No ratings yet'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 font-semibold mr-1">Rate:</span>
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} onClick={() => submitStars(i)} className="text-2xl leading-none"
                    style={{ color: i <= myStars ? '#f5b400' : '#d1d5db' }}>★</button>
                ))}
              </div>
            </div>

            {/* Amenities Grid */}
            <div>
              <h3 className="font-extrabold text-lg text-gray-800 mb-4">Amenities Included</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map(name => (
                  <div 
                    key={name}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="p-1.5 bg-white rounded-lg shadow-2xs border border-gray-100 shrink-0">
                      {getAmenityIcon(name)}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{name}</span>
                  </div>
                ))}
              </div>
            </div>


          </div>

          {/* Right Column: Sticky billing / details checkout */}
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md space-y-6 sticky top-28">
              
              {/* Rent label pricing info */}
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Monthly Rent</span>
                <div className="flex items-baseline">
                  <span className="text-primary font-black text-3xl">Rs. {property.price.toLocaleString('en-IN')}</span>
                  <span className="text-gray-500 font-semibold text-sm">/month</span>
                </div>
              </div>

              {/* Verified Badge info or Warning */}
              <div className="p-3.5 bg-yellow-50/50 border border-yellow-200/50 rounded-xl flex gap-2">
                <Coins className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800 leading-relaxed font-medium">
                  <p className="font-bold">Privacy Protection Policy</p>
                  <p className="mt-0.5">We use {property.creditsNeeded} credit to reveal owner's genuine Nepalese contact phone / email to avoid spam.</p>
                </div>
              </div>

              {/* Reveal owner action / Revealed block */}
              {revealed ? (
                <div className="space-y-4 pt-2 animate-in fade-in duration-300">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-3">
                    <div>
                      <p className="text-xs text-primary font-bold uppercase tracking-wider">Property Owner</p>
                      <h4 className="font-extrabold text-gray-800 text-base mt-0.5">{property.host.name}</h4>
                    </div>
                    <a
                      href={`tel:${property.host.phone}`}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-150 rounded-lg hover:text-primary transition-all shadow-2xs text-xs font-semibold text-gray-700"
                    >
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{property.host.phone}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRevealContact}
                  disabled={revealing}
                  className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-full transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Phone className="w-4 h-4" />
                  {revealing ? 'Revealing…' : 'Reveal Host Information'}
                </button>
              )}

              {/* Close helper button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 hover:bg-gray-50 text-gray-500 font-bold text-xs rounded-full transition-colors text-center border border-gray-100 cursor-pointer block"
              >
                Go Back to Search
              </button>

            </div>
          </div>

        </div>


      </div>

      {/* Out of Credit modal */}
      {outOfCredit && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setOutOfCredit(false)}>
          <div className="bg-white rounded-3xl max-w-sm w-full p-7 shadow-2xl text-center animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-amber-50 grid place-items-center mx-auto">
              <Coins className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-black text-xl text-gray-900 mt-5">You're out of credits</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Buy a plan to keep unlocking room owner contacts. Credits are valid through your subscription period.
            </p>
            <button
              type="button"
              onClick={() => { setOutOfCredit(false); onNeedPlan(); }}
              className="mt-6 w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-full transition-colors"
            >
              View Plans
            </button>
            <button
              type="button"
              onClick={() => setOutOfCredit(false)}
              className="mt-2 w-full py-2.5 text-gray-500 hover:text-gray-700 font-bold text-sm rounded-full"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
