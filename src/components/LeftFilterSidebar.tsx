import React from 'react';
import { Filter, RotateCcw, X } from 'lucide-react';
import { NEPAL_DISTRICTS } from '../mockData';

interface LeftFilterSidebarProps {
  district: string;
  setDistrict: (val: string) => void;
  roomType: string;
  setRoomType: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  selectedAmenities: string[];
  toggleAmenity: (amenity: string) => void;
  resetFilters: () => void;
  totalFilteredCount: number;
}

export default function LeftFilterSidebar({
  district,
  setDistrict,
  roomType,
  setRoomType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedAmenities,
  toggleAmenity,
  resetFilters,
  totalFilteredCount
}: LeftFilterSidebarProps) {
  
  const amenitiesList = [
    "WiFi", 
    "Water 24/7", 
    "Kitchen", 
    "Balcony", 
    "Attached Bath", 
    "Parking", 
    "Power Backup",
    "Solar Water"
  ];

  const categories = [
    { id: 'all', label: 'All Property Types' },
    { id: 'room', label: 'Single Rooms' },
    { id: 'flat', label: 'Flats & Apartments' }
  ];

  return (
    <aside className="w-full md:w-72 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-[100px] h-fit">
      
      {/* Sidebar Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
        <h3 className="font-sans font-extrabold text-lg text-gray-800 flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Filter Listings
        </h3>
        <button
          onClick={resetFilters}
          className="text-xs text-secondary font-bold hover:text-primary flex items-center gap-1 cursor-pointer transition-colors"
          title="Reset both filters and searching queries"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* City or District selector */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          District / Location
        </label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-100 rounded-xl text-sm font-medium transition-all"
        >
          <option value="all">Everywhere in Nepal</option>
          {NEPAL_DISTRICTS.map(dist => (
            <option key={dist} value={dist}>{dist}</option>
          ))}
        </select>
      </div>

      {/* Rent price limits */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Monthly Budget (Rs.)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:outline-none"
          />
          <span className="text-gray-400 font-bold">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 focus:outline-none"
          />
        </div>
      </div>

      {/* Property Type Radio checklist */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Accommodation Category
        </label>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="sidebar-category"
                checked={roomType === cat.id}
                onChange={() => setRoomType(cat.id)}
                className="rounded-full text-primary focus:ring-primary w-4 h-4 border-gray-200 cursor-pointer"
              />
              <span className={`text-[13.5px] font-medium transition-colors group-hover:text-primary ${
                roomType === cat.id ? 'text-primary font-bold' : 'text-gray-600'
              }`}>
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities Tags Checklist */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Amenities Desired
        </label>
        <div className="flex flex-wrap gap-1.5">
          {amenitiesList.map((amenity) => {
            const isChecked = selectedAmenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isChecked
                    ? 'border-primary bg-red-50 text-primary'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {isChecked ? '✓ ' : ''}{amenity}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtering summary stats */}
      <div className="border-t border-gray-100 pt-4 mt-6">
        <div className="text-xs text-gray-400 font-semibold mb-2">
          Available matching results
        </div>
        <div className="font-extrabold text-gray-800 text-sm">
          {totalFilteredCount} matching listings
        </div>
      </div>

    </aside>
  );
}
