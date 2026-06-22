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
  Mail, 
  Heart, 
  MessageSquare,
  ThumbsUp,
  Award,
  Send
} from 'lucide-react';
import { Property, Review } from '../types';
import { IMAGES } from '../mockData';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  isFavorited: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  userCredits: number;
  onDeductCredit: (propertyId: string) => boolean; // returns true if succeeded
  onAddReview: (propertyId: string, review: Review) => void;
}

export default function PropertyDetailModal({
  property,
  onClose,
  isFavorited,
  onToggleFavorite,
  userCredits,
  onDeductCredit,
  onAddReview
}: PropertyDetailModalProps) {
  const [revealed, setRevealed] = useState(false);
  const [activeImage, setActiveImage] = useState(property.image);

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

  // Message host state
  const [messageHostText, setMessageHostText] = useState('');
  const [messageHostSuccess, setMessageHostSuccess] = useState(false);

  const handleRevealContact = () => {
    if (revealed) return;
    const success = onDeductCredit(property.id);
    if (success) {
      setRevealed(true);
    } else {
      alert("Insufficient credits! Please click 'Replenish' on the top bar or profile tab to add credits.");
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageHostText.trim()) return;
    setMessageHostSuccess(true);
    setMessageHostText('');
    setTimeout(() => setMessageHostSuccess(false), 4000);
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

        {/* Bento Image Gallery */}
        <div className="p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 h-[280px] md:h-[350px]">
            {/* Main Active Image (Left side 3cols) */}
            <div className="md:col-span-3 h-full relative overflow-hidden rounded-2xl group border border-gray-200 bg-gray-100">
              <img 
                src={activeImage} 
                alt="Active Preview" 
                className="w-full h-full object-cover transition-all"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Thumbnails list on the right */}
            <div className="md:col-span-2 grid grid-cols-4 md:grid-cols-2 gap-2 h-full">
              {property.imagesList.slice(0, 4).map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative overflow-hidden rounded-xl h-full w-full cursor-pointer transition-all ${
                    activeImage === img 
                      ? 'ring-4 ring-primary ring-offset-2' 
                      : 'hover:opacity-90 border border-gray-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {idx === 3 && property.imagesList.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                      +{property.imagesList.length - 4} Photos
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
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
                    <img 
                      src={property.host.avatar} 
                      alt={property.host.name} 
                      className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-primary ring-offset-2" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs text-primary font-bold uppercase tracking-wider">Property Owner</p>
                      <h4 className="font-extrabold text-gray-800 text-base mt-0.5">{property.host.name}</h4>
                    </div>
                    <div className="space-y-2 text-xs font-semibold text-gray-700 pt-1">
                      <a 
                        href={`tel:${property.host.phone}`} 
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-150 rounded-lg hover:text-primary transition-all shadow-2xs"
                      >
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{property.host.phone}</span>
                      </a>
                      <a 
                        href={`mailto:${property.host.email}`}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-150 rounded-lg hover:text-primary transition-all shadow-2xs"
                      >
                        <Mail className="w-4 h-4 text-tertiary shrink-0" />
                        <span>{property.host.email}</span>
                      </a>
                    </div>
                  </div>

                  {/* Private chat helper */}
                  <form onSubmit={handleSendMessage} className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Viber / WhatsApp Inquiry
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={messageHostText}
                        onChange={(e) => setMessageHostText(e.target.value)}
                        placeholder="Say: Hello, is this kotha still available?" 
                        className="w-full text-xs font-semibold py-2.5 pl-3 pr-10 border border-gray-200 hover:border-gray-300 rounded-xl focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                      <button 
                        type="submit"
                        className="absolute right-1.5 top-1.5 p-1 bg-primary text-white hover:bg-primary-hover rounded-lg transition-colors cursor-pointer"
                        title="Submit Inquiry"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {messageHostSuccess && (
                      <p className="text-[11px] text-emerald-600 font-bold leading-tight animate-pulse">
                        ✓ Message dispatched! The landlord Ramesh was alerted via Viber.
                      </p>
                    )}
                  </form>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRevealContact}
                  className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-full transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  Reveal Host Information
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
    </div>
  );
}
