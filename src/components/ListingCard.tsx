import React from 'react';
import { Star, MapPin, Heart, ShieldCheck, Home } from 'lucide-react';
import { Property } from '../types';

interface ListingCardProps {
  key?: string;
  property: Property;
  isFavorited: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectProperty: (property: Property) => void;
}

export default function ListingCard({
  property,
  isFavorited,
  onToggleFavorite,
  onSelectProperty
}: ListingCardProps) {
  
  // Format price cleanly
  const formattedPrice = property.price.toLocaleString('en-IN');

  const getReadableType = (type: string) => {
    switch (type) {
      case 'room': return 'Single Room';
      case 'flat': return 'Apt / Flat';
      case 'hostel': return 'Student Hostel';
      case 'studio': return 'Studio Room';
      case 'shared': return 'Shared Room';
      default: return type;
    }
  };

  return (
    <article 
      onClick={() => onSelectProperty(property)}
      className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg border border-gray-100 transition-all duration-300 flex flex-col group cursor-pointer relative"
    >
      {/* Listing image & badges */}
      <div className="relative p-2.5 pb-0">
        <div className="overflow-hidden rounded-xl h-48 w-full relative">
          <img 
            src={property.image} 
            alt={property.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Favorite Heart action */}
        <button
          onClick={(e) => onToggleFavorite(property.id, e)}
          className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center text-gray-700 hover:text-primary transition-colors cursor-pointer shadow-sm z-10 hover:scale-110 active:scale-95"
          title={isFavorited ? "Remove from saved" : "Save to favorites"}
        >
          <Heart 
            className={`w-5 h-5 ${isFavorited ? 'fill-primary text-primary' : 'text-gray-600'}`} 
          />
        </button>

        {/* Category sticker */}
        <div className="absolute bottom-2.5 left-4 flex gap-1.5 z-10">
          <span className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-700 shadow-xs border border-gray-100 uppercase tracking-wider">
            {getReadableType(property.type)}
          </span>
          {property.genderSpecific && (
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs uppercase tracking-wider ${
              property.genderSpecific === 'boys' 
                ? 'bg-blue-600 text-white' 
                : property.genderSpecific === 'girls'
                ? 'bg-pink-600 text-white'
                : 'bg-green-600 text-white'
            }`}>
              {property.genderSpecific}' Hostel
            </span>
          )}
        </div>

      </div>

      {/* Narrative & Details section */}
      <div className="p-4 flex-grow flex flex-col">
        
        {/* Rating and Title row */}
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="font-extrabold text-[15px] text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-700 shrink-0 font-mono text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>{property.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Location descriptor */}
        <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-3">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{property.area}, {property.city}</span>
        </p>

        {/* Predefined preview amenities */}
        <div className="flex flex-wrap gap-1 mb-4">
          {property.amenities.slice(0, 3).map((amenity) => (
            <span 
              key={amenity}
              className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-100"
            >
              {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-100">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Pricing footline */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center bg-transparent">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block leading-none mb-1">Rent Cost</span>
            <div className="flex items-baseline leading-none">
              <span className="text-primary font-black text-lg">Rs. {formattedPrice}</span>
              <span className="text-gray-400 text-xs font-semibold">/mo</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-secondary group-hover:text-primary group-hover:underline transition-all">
            See Details &rarr;
          </span>
        </div>

      </div>
    </article>
  );
}
