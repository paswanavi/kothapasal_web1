import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Trash2, 
  HelpCircle, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  PlusCircle, 
  Building2,
  FileText,
  BadgeCent,
  Camera
} from 'lucide-react';
import { Property, HostelSeaterOption, PropertyType } from '../types';
import { NEPAL_CITIES, AMENITIES, IMAGES } from '../mockData';
import { uploadImage } from '../supabaseClient';

interface ListPropertyFormProps {
  onAddProperty: (newProp: Property) => void;
  userAvatar: string;
  onManageHostel?: () => void;
}

export default function ListPropertyForm({ onAddProperty, userAvatar, onManageHostel }: ListPropertyFormProps) {
  // Wizard steps
  const [step, setStep] = useState(1); // 1: Chooser (Room vs Hostel), 2: Pricing tiers, 3: Form Details, 4: Success state
  
  // Property type state
  const [isListingHostel, setIsListingHostel] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'standard' | 'premium'>('standard');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('10000');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [district, setDistrict] = useState(NEPAL_CITIES[0]);
  const [customType, setCustomType] = useState<PropertyType>('room');
  const [contactPhone, setContactPhone] = useState('');
  
  // Amenities checkbox states
  const [amenities, setAmenities] = useState<string[]>([
    "WiFi", "Water"
  ]);

  // Specific Hostel States
  const [hostelGender, setHostelGender] = useState<'boys' | 'girls' | 'co-ed'>('boys');
  const [seaterOptions, setSeaterOptions] = useState<HostelSeaterOption[]>([
    { seater: "1-Seater", price: 12000 },
    { seater: "2-Seater", price: 8000 }
  ]);
  const [seaterInputName, setSeaterInputName] = useState('3-Seater');
  const [seaterInputPrice, setSeaterInputPrice] = useState('6500');

  // Visual Image Selector presets
  const roomPresets = [
    { name: 'Attic Room', url: IMAGES.roomAttic },
    { name: 'Patan Studio', url: IMAGES.livingPatanTactile },
    { name: 'Traditional Twin', url: IMAGES.roomDoubleTraditional },
    { name: 'Cozy Guest Room', url: IMAGES.roomCozyNepalese },
    { name: 'Family Apartment', url: IMAGES.familyAptLazimpat }
  ];

  const hostelPresets = [
    { name: 'Baneshwor Exterior', url: IMAGES.hostelBoysBaneshwor },
    { name: 'Annapurna Green Exterior', url: IMAGES.hostelBoysAnnapurna },
    { name: 'Hostel Shared Kitchen', url: IMAGES.hostelGirlsKitchen }
  ];

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const addPhotos = (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 6 - photoFiles.length);
    setPhotoFiles(prev => [...prev, ...arr].slice(0, 6));
    setPhotoPreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))].slice(0, 6));
  };
  const removePhoto = (i: number) => {
    setPhotoFiles(prev => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const amenitiesOptions = AMENITIES;

  const handleToggleAmenity = (name: string) => {
    if (amenities.includes(name)) {
      setAmenities(amenities.filter(item => item !== name));
    } else {
      setAmenities([...amenities, name]);
    }
  };

  const handleAddSeaterOption = () => {
    if (!seaterInputName || !seaterInputPrice) return;
    const priceVal = parseInt(seaterInputPrice);
    if (isNaN(priceVal)) return;

    setSeaterOptions([...seaterOptions, {
      seater: seaterInputName,
      price: priceVal
    }]);
    setSeaterInputName('');
    setSeaterInputPrice('');
  };

  const handleRemoveSeaterOption = (idx: number) => {
    setSeaterOptions(seaterOptions.filter((_, i) => i !== idx));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    addPhotos(e.dataTransfer.files);
  };

  const handleSelectPropertyType = (hostelSelection: boolean) => {
    setIsListingHostel(hostelSelection);
    setCustomType(hostelSelection ? 'hostel' : 'room');
    setStep(3);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !city.trim() || !area.trim()) {
      alert("Please fill in the title, city, and neighborhood area!");
      return;
    }
    if (photoFiles.length === 0) {
      alert("Please upload at least one photo of your property!");
      return;
    }

    const priceNum = parseInt(price);
    if (!isListingHostel && (isNaN(priceNum) || priceNum <= 0)) {
      alert("Please specify a valid rent amount!");
      return;
    }

    // Determine finalized base price (either input rent or the cheapest seater option for hostels)
    const finalPrice = isListingHostel
      ? (seaterOptions.length > 0 ? Math.min(...seaterOptions.map(o => o.price)) : 8000)
      : priceNum;

    // Upload photos to Supabase Storage
    let uploadedUrls: string[] = [];
    setUploading(true);
    try {
      for (const f of photoFiles) uploadedUrls.push(await uploadImage('room_photos', f));
    } catch (err: any) {
      setUploading(false);
      alert('Photo upload failed: ' + err.message);
      return;
    }
    setUploading(false);

    const newlyCreatedProperty: Property = {
      id: `prop-dyn-${Date.now()}`,
      title,
      description: description.trim() || `Beautiful, comfortable ${customType} located in ${area}, ${city}. Features pristine surroundings and reliable Nepalese utility access.`,
      price: finalPrice,
      type: isListingHostel ? 'hostel' : customType,
      city,
      area,
      district,
      rating: 5.0, // newly added start perfect
      verified: selectedPlan === 'premium' || selectedPlan === 'standard', // Paid listings are pre-approved
      featured: selectedPlan === 'premium',
      image: uploadedUrls[0],
      imagesList: uploadedUrls,
      amenities: amenities.length > 0 ? amenities : ["WiFi", "Water"],
      host: {
        name: "Owner",
        phone: contactPhone,
        email: "",
        avatar: userAvatar
      },
      reviews: [],
      genderSpecific: isListingHostel ? hostelGender : undefined,
      hostelSeaterOptions: isListingHostel ? seaterOptions : undefined,
      dateAdded: new Date().toISOString().split('T')[0],
      creditsNeeded: selectedPlan === 'premium' ? 0 : 1 // Premium allows prospective tenants to contact free of credit
    };

    onAddProperty(newlyCreatedProperty);
    setStep(4);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('10000');
    setCity('');
    setArea('');
    setAmenities(["WiFi", "Water"]);
    setStep(1);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-xs max-w-4xl mx-auto">
      
      {/* Step Progress indicators */}
      {step < 4 && (
        <div className="flex justify-between items-center mb-10 max-w-md mx-auto">
          {[1, 3].map((num) => (
            <div key={num} className="flex items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === num 
                    ? 'bg-primary text-white scale-110 shadow-md' 
                    : step > num 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > num ? '✓' : num}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${
                step === num ? 'text-primary' : 'text-gray-400'
              }`}>
                {num === 1 ? 'Chooser' : 'Details'}
              </span>
              {num === 1 && <div className="w-12 h-0.5 bg-gray-100" />}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: PROPERTY TYPE CHOOSER */}
      {step === 1 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="font-sans font-black text-2xl text-gray-800 leading-tight">
              What kind of kotha are you listing?
            </h2>
            <p className="text-gray-500 text-sm font-semibold mt-2">
              Find verified tenants or students across all 77 districts of Nepal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Option 1: Single Room / Flat */}
            <button
              onClick={() => handleSelectPropertyType(false)}
              className="p-8 rounded-3xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-red-50/10 text-center transition-all cursor-pointer group flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                <PlusCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-800">I want to list a Room / Flat</h3>
                <p className="text-xs text-gray-400 font-medium max-w-xs mt-2 leading-relaxed">
                  Perfect for single independent rooms, entire flats, family apartments, or compact studios.
                </p>
              </div>
            </button>

            {/* Option 2: Hostel */}
            <button
              onClick={() => onManageHostel ? onManageHostel() : handleSelectPropertyType(true)}
              className="p-8 rounded-3xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-red-50/10 text-center transition-all cursor-pointer group flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-800">I want to manage a Hostel</h3>
                <p className="text-xs text-gray-400 font-medium max-w-xs mt-2 leading-relaxed">
                  Ideal for boys or girls hostel wardens managing multiple seater rooms with full mess food packages included.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PRICING PLANS */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="text-center">
            <h2 className="font-sans font-black text-2xl text-gray-800">
              Select Your Advertising Plan
            </h2>
            <p className="text-gray-500 text-sm font-semibold mt-1">
              Stand out in our local Nepalese search results. Only pay if you choose premium visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Plan 1: Free */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="space-y-4">
                <div>
                  <h4 className="font-extrabold text-base text-gray-800">Free Tier</h4>
                  <div className="flex items-baseline mt-1.5">
                    <span className="text-primary font-black text-2xl">Rs. 0</span>
                  </div>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <ul className="space-y-2.5 text-xs font-semibold text-gray-600">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> Standard search index
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> 3 tenant inquiries
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> Standard 1-month visibility
                  </li>
                </ul>
              </div>
              <button
                onClick={() => { setSelectedPlan('free'); setStep(3); }}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-full transition-colors cursor-pointer mt-6"
              >
                Select Free
              </button>
            </div>

            {/* Plan 2: Standard (Recommended) */}
            <div className="bg-white border-2 border-primary rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-shadow relative overflow-hidden transform md:-translate-y-4 shadow-md">
              <div className="absolute top-0 right-0 bg-primary text-white font-bold text-[9px] uppercase tracking-wider px-3.5 py-1 rounded-bl-xl leading-none h-5 flex items-center">
                Popular
              </div>
              <div className="space-y-4">
                <div className="mt-2">
                  <h4 className="font-extrabold text-base text-gray-800">Standard Tier</h4>
                  <div className="flex items-baseline mt-1.5">
                    <span className="text-primary font-black text-2xl">Rs. 250</span>
                  </div>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <ul className="space-y-2.5 text-xs font-semibold text-gray-600">
                  <li className="flex items-center gap-1.5 text-primary">
                    <span className="font-bold">✓</span> HIGHER SEARCH RANKING
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> Verified Sticker on Listing
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> 15 prospective inquiries
                  </li>
                </ul>
              </div>
              <button
                onClick={() => { setSelectedPlan('standard'); setStep(3); }}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full transition-colors cursor-pointer mt-6 h-9"
              >
                Select Standard
              </button>
            </div>

            {/* Plan 3: Premium */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="space-y-4">
                <div>
                  <h4 className="font-extrabold text-base text-gray-800">Premium Exposure</h4>
                  <div className="flex items-baseline mt-1.5">
                    <span className="text-primary font-black text-2xl">Rs. 350</span>
                  </div>
                </div>
                <div className="w-full h-px bg-gray-100" />
                <ul className="space-y-2.5 text-xs font-semibold text-gray-600">
                  <li className="flex items-center gap-1.5 text-yellow-600">
                    <span className="font-bold">✓</span> FEATURED BANNER ON TOP
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-700 animate-pulse">
                    <span className="font-bold">✓</span> UNLIMITED TENANT VIEWS
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> Top matching for 7 days
                  </li>
                </ul>
              </div>
              <button
                onClick={() => { setSelectedPlan('premium'); setStep(3); }}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-850 text-white font-bold text-xs rounded-full transition-colors cursor-pointer mt-6"
              >
                Select Premium
              </button>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="text-xs text-gray-400 font-bold hover:text-gray-650 cursor-pointer block mx-auto text-center hover:underline"
          >
            &larr; Back to Property Chooser
          </button>
        </div>
      )}

      {/* STEP 3: LISTING DETAIL FORM */}
      {step === 3 && (
        <form onSubmit={handleFormSubmit} className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h2 className="font-sans font-black text-2xl text-gray-800 leading-none">
              List Details of Your Accommodation
            </h2>
            <p className="text-gray-400 text-xs font-semibold mt-2 uppercase tracking-wider">
              {isListingHostel ? 'Student Hostel Building' : 'Room or Flat Apartment'} &bull; Plan selecion: {selectedPlan.toUpperCase()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Hand Form side */}
            <div className="space-y-5">
              
              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Listing Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isListingHostel ? "E.g. Everest Boys Hostel Baneshwor" : "E.g. Sunny Single Room near Lalitpur"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold truncate"
                />
              </div>

              {/* City & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <select
                    value={city || district}
                    onChange={(e) => { setCity(e.target.value); setDistrict(e.target.value); }}
                    className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                  >
                    <option value="">Select city…</option>
                    {NEPAL_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Area / Neighborhood *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. New Baneshwor"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>



              {/* Conditionally render: hostel vs standard pricing */}
              {isListingHostel ? (
                <div className="space-y-4 p-4.5 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Hostel Seater Price Catalog</h4>
                  
                  {/* Seater options dynamic list */}
                  <div className="space-y-2 text-xs font-semibold">
                    {seaterOptions.map((opt, i) => (
                      <div key={`${opt.seater}-${i}`} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 shadow-3xs">
                        <span className="text-gray-700">{opt.seater}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-bold">Rs. {opt.price.toLocaleString('en-IN')}/mo</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSeaterOption(i)}
                            className="text-gray-400 hover:text-primary p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add seater form inline */}
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="e.g. 3-Seater" 
                      value={seaterInputName}
                      onChange={(e) => setSeaterInputName(e.target.value)}
                      className="w-1/2 py-2 px-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold"
                    />
                    <input 
                      type="number" 
                      placeholder="Price Rs" 
                      value={seaterInputPrice}
                      onChange={(e) => setSeaterInputPrice(e.target.value)}
                      className="w-1/2 py-2 px-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleAddSeaterOption}
                      className="px-3 py-2 bg-secondary hover:bg-opacity-95 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Gender bias selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Gender Classification
                    </label>
                    <div className="flex gap-2">
                      {['boys', 'girls', 'co-ed'].map((sex) => (
                        <button
                          key={sex}
                          type="button"
                          onClick={() => setHostelGender(sex as any)}
                          className={`flex-1 py-1 px-3 rounded-lg border text-xs font-bold uppercase tracking-wide cursor-pointer text-center ${
                            hostelGender === sex 
                              ? 'border-primary bg-red-50 text-primary shadow-2xs' 
                              : 'border-gray-200 bg-white text-gray-550 hover:bg-gray-50'
                          }`}
                        >
                          {sex}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Rent (Monthly Rs) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="E.g. 15000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Accommodation Room Type
                    </label>
                    <select
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value as PropertyType)}
                      className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                    >
                      <option value="room">Single Room (Single Kotha)</option>
                      <option value="double">Double Room (Double Kotha)</option>
                      <option value="threebhk">3BHK</option>
                      <option value="flat">Flat / Apartment</option>
                      <option value="studio">Studio</option>
                      <option value="office">Office Space</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Description box */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Detailed Room Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Mention key highlights: sub-meters details, waste management timings, nearby bus stations, security deposits amount, drinking water schedules, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

            </div>

            {/* Right Hand Form side: Presets, drag-upload & checkboxes */}
            <div className="space-y-5">
              
              {/* Photo uploader — user uploads real images (stored in Supabase) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Upload Photos * (up to 6)
                </label>

                <label
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all min-h-[120px] flex flex-col justify-center items-center cursor-pointer ${
                    isDragOver ? 'border-primary bg-green-50/20' : 'border-gray-200 bg-gray-50 hover:bg-gray-100/50'
                  }`}
                >
                  <Camera className="w-8 h-8 text-primary mb-2" />
                  <p className="text-xs font-bold text-gray-700">Drag & drop or click to upload</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-medium">JPG / PNG — your own property photos</p>
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => addPhotos(e.target.files)} />
                </label>

                {photoPreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} className="w-20 h-20 rounded-xl object-cover border" />
                        <button type="button" onClick={() => removePhoto(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs font-bold">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact phone */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Phone *</label>
                <input type="tel" inputMode="numeric" placeholder="98XXXXXXXX" value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none" />
              </div>

              {/* Amenities list Checklist */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                  Select Features & Amenities Included
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                  {amenitiesOptions.map((opt) => {
                    const isChecked = amenities.includes(opt);
                    return (
                      <button
                        key={`${opt}-form`}
                        type="button"
                        onClick={() => handleToggleAmenity(opt)}
                        className={`text-[11px] font-semibold py-2 px-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-primary/5 text-primary border-primary font-bold' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span>{opt}</span>
                        {isChecked && <span className="text-primary font-bold text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Form Actions bottom */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-gray-500 font-bold hover:text-gray-700 cursor-pointer hover:underline"
            >
              &larr; Go Back to Pricing Tiers
            </button>

            <button
              type="submit"
              className="py-3 px-8 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto text-center justify-center h-10"
            >
              List Property Live Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: SUCCESS OVERLAY */}
      {step === 4 && (
        <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-200 max-w-xl mx-auto">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-4 ring-emerald-100 animate-pulse">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="font-sans font-black text-2xl text-gray-800 leading-tight">
              Congratulations! Your listing is now live! 🇳🇵
            </h2>
            <p className="text-emerald-700 font-semibold text-sm">
              Successfully listing published on Kotha Pasal.
            </p>
            <p className="text-gray-550 text-xs font-normal max-w-md mx-auto pt-2 leading-relaxed">
              Based on the <strong>{selectedPlan.toUpperCase()}</strong> plan choose, your kotha will benefit from standard verification search flags to attract thousands of students and tenants in Kathmandu, Patan, and across Nepal.
            </p>
          </div>

          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={resetForm}
              className="py-2.5 px-6 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer transition-colors"
            >
              List Another Property
            </button>
            <button
              onClick={() => window.location.reload()}
              className="py-2.5 px-6 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs cursor-pointer shadow-sm shadow-red-200 transition-all h-9"
            >
              Go to Search Results
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
