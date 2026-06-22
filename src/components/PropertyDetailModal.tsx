import React, { useState } from 'react';
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

            {/* Map Placeholder */}
            <div>
              <h3 className="font-extrabold text-lg text-gray-800 mb-3">Approximate Location</h3>
              <div className="h-64 rounded-2xl relative overflow-hidden border border-gray-200 shadow-xs bg-gray-100">
                <img 
                  src={IMAGES.mapPatanRepresent} 
                  alt="Nepal map location representation" 
                  className="w-full h-full object-cover opacity-85"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-red-900/5 hover:bg-transparent transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Floating Bounce Map Pin */}
                  <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                    <MapPin className="w-7 h-7" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-md border border-gray-100 max-w-xs">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Search Target</p>
                  <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">{property.area}, {property.city}</p>
                </div>
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

        {/* Reviews segment */}
        <div className="p-4 md:p-8 bg-gray-50 border-t border-gray-100">
          <h3 className="font-sans font-black text-xl text-gray-800 mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            Inquiries & Landlord Reviews ({property.reviews.length})
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Reviews list (Col-span 2) */}
            <div className="lg:col-span-2 space-y-4">
              {property.reviews.length === 0 ? (
                <div className="text-center py-8 bg-white border border-gray-150 rounded-2xl text-gray-400 text-xs font-medium">
                  No public reviews posted yet. Be the first to leave a feedback or query!
                </div>
              ) : (
                property.reviews.map((rev) => (
                  <div key={rev.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={rev.reviewerAvatar || IMAGES.avatarDefault} 
                          alt="Reviewer" 
                          className="w-9 h-9 rounded-full object-cover border border-gray-200" 
                        />
                        <div>
                          <h5 className="font-extrabold text-sm text-gray-800">{rev.reviewerName}</h5>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{rev.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-700 font-mono text-xs font-bold leading-none">
                        <Star className="w-3" />
                        <span>{rev.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3 leading-relaxed font-semibold">
                      {rev.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Submit review sidebar */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs h-fit">
              <h4 className="font-extrabold text-sm text-gray-800 mb-4">Post a Review / Query</h4>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                
                {/* Full name */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <input 
                    type="text" 
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    required
                    placeholder="E.g. Ashish Ghimire" 
                    className="w-full text-xs font-semibold py-2.5 px-3 bg-gray-50 border border-gray-250 focus:outline-none focus:ring-1 focus:ring-primary rounded-xl"
                  />
                </div>

                {/* Rating selection digits */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Overall Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`${star}-option`}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs scale-90 hover:scale-100 transition-transform ${
                          star <= newReviewRating 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {star} ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question description area */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Your Review / Query
                  </label>
                  <textarea 
                    rows={3}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    required
                    placeholder="Write details about rent water schedule, electricity sub-meter, deposits, etc."
                    className="w-full text-xs font-semibold p-3 bg-gray-50 border border-gray-250 focus:outline-none focus:ring-1 focus:ring-primary rounded-xl"
                  />
                </div>

                {/* Actions button */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-secondary hover:bg-opacity-90 text-white font-bold text-xs rounded-full transition-all cursor-pointer shadow-sm text-center"
                >
                  Publish Public Review
                </button>

                {reviewSubmitSuccess && (
                  <p className="text-[11px] text-emerald-600 font-bold text-center leading-normal mt-2 animate-bounce">
                    ✓ Feedback posted successfully! Placed on room listing stream.
                  </p>
                )}

              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
