import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Bed, 
  Coins, 
  PlusCircle, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  ChevronRight, 
  User, 
  Building2, 
  TrendingUp, 
  Compass, 
  BookOpen, 
  Trash2,
  PhoneCall,
  Map,
  ListFilter,
  Star,
  Home
} from 'lucide-react';

import { Property, Review, PropertyType } from './types';
import { IMAGES, NEPAL_DISTRICTS } from './mockData';
import { fetchProperties } from './data';
import { supabase, uploadImage } from './supabaseClient';
import TopNavBar from './components/TopNavBar';
import LeftFilterSidebar from './components/LeftFilterSidebar';
import ListingCard from './components/ListingCard';
import PropertyDetailModal from './components/PropertyDetailModal';
import ListPropertyForm from './components/ListPropertyForm';
import Login from './components/Login';
import HostelManager from './components/HostelManager';
import HostelPage from './components/HostelPage';
import { useNavigate, useLocation } from 'react-router-dom';

export default function App() {
  // Main states
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  // URL-driven tabs (real sub-directories, refresh-safe)
  const navigate = useNavigate();
  const location = useLocation();
  const PATH_TO_TAB: Record<string, string> = {
    '/': 'home', '/explore': 'explore', '/hostels': 'hostels',
    '/list': 'list_property', '/saved': 'saved', '/profile': 'profile', '/unlocked': 'unlocked',
  };
  const TAB_TO_PATH: Record<string, string> = {
    home: '/', explore: '/explore', hostels: '/hostels',
    list_property: '/list', saved: '/saved', profile: '/profile', unlocked: '/unlocked',
  };
  const hostelMatch = location.pathname.match(/^\/hostel\/(.+)$/);
  const hostelIdParam = hostelMatch ? decodeURIComponent(hostelMatch[1]) : null;
  const currentTab = hostelIdParam ? 'hostels' : (PATH_TO_TAB[location.pathname] || 'home');
  const setCurrentTab = (t: string) => navigate(TAB_TO_PATH[t] || '/');

  // User states
  const [credits, setCredits] = useState<number>(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Auth (Supabase)
  const [session, setSession] = useState<any>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>(null);
  const [myListingIds, setMyListingIds] = useState<string[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [listMode, setListMode] = useState<'room' | 'hostel'>('room');
  const [profEditing, setProfEditing] = useState(false);
  const [profName, setProfName] = useState('');
  const [profBusy, setProfBusy] = useState(false);

  const onAvatarFile = async (file?: File) => {
    if (!file || !session?.user?.id) return;
    setProfBusy(true);
    try {
      const url = await uploadImage('avatars', file);
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', session.user.id);
      await loadProfile(session.user.id);
    } catch (e: any) { alert('Upload failed: ' + e.message); }
    setProfBusy(false);
  };

  const saveProfileName = async () => {
    if (!session?.user?.id) return;
    setProfBusy(true);
    await supabase.from('profiles').update({ full_name: profName }).eq('id', session.user.id);
    await loadProfile(session.user.id);
    setProfEditing(false); setProfBusy(false);
  };

  const loadProfile = async (uid?: string) => {
    if (!uid) { setProfile(null); setMyListingIds([]); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data);
    if (data) setCredits(data.credits ?? 0);
    const { data: mine } = await supabase.from('listings').select('id').eq('landlord_id', uid);
    setMyListingIds((mine || []).map((r: any) => r.id));
    const { data: sl } = await supabase.from('saved_listings').select('listing_id').eq('user_id', uid);
    if (sl) setFavorites(sl.map((s: any) => s.listing_id));
    const { data: ul } = await supabase.from('unlocked_listings').select('listing_id').eq('user_id', uid);
    setUnlockedIds((ul || []).map((u: any) => u.listing_id));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setAuthReady(true); loadProfile(data.session?.user?.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); loadProfile(s?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load real data from Supabase (replaces hardcoded INITIAL_PROPERTIES)
  useEffect(() => {
    let active = true;
    fetchProperties()
      .then(props => { if (active) setProperties(props); })
      .catch(err => console.error('Load failed:', err))
      .finally(() => { if (active) setLoadingData(false); });
    // Optional: if logged in, load credits + favorites from Supabase
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid) return;
      const { data: prof } = await supabase.from('profiles').select('credits').eq('id', uid).single();
      if (prof) setCredits(prof.credits ?? 0);
      const { data: sl } = await supabase.from('saved_listings').select('listing_id').eq('user_id', uid);
      if (sl) setFavorites(sl.map((s: any) => s.listing_id));
    })();
    return () => { active = false; };
  }, []);
  
  // Search parameters states (synchronized across pages)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Interactive detail overlay
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Home search bar entries (local to home but updates filters on click)
  const [homeLocation, setHomeLocation] = useState<string>('');
  const [homeType, setHomeType] = useState<string>('');
  const [homeBudget, setHomeBudget] = useState<string>('');

  // Hostels segment gender filter
  const [hostelGenderFilter, setHostelGenderFilter] = useState<'boys' | 'girls'>('boys');

  // Map view overlay simulation
  const [showMapOverlay, setShowMapOverlay] = useState<boolean>(false);

  // Helper dynamic handlers
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const has = favorites.includes(id);
    setFavorites(has ? favorites.filter(f => f !== id) : [...favorites, id]);
    // Persist to Supabase
    (async () => {
      const uid = session?.user?.id;
      if (!uid) return;
      if (has) await supabase.from('saved_listings').delete().eq('user_id', uid).eq('listing_id', id);
      else await supabase.from('saved_listings').upsert({ user_id: uid, listing_id: id }, { onConflict: 'user_id,listing_id' });
    })();
  };

  const handleAddCredits = () => {
    setCredits(prev => prev + 10);
    alert("✓ Simulated Transaction successful! Placed +10 credits inside your wallet.");
  };

  const handleDeductCredit = (propertyId: string): boolean => {
    // Check if property is already revealed or if user has credits
    if (credits < 1) {
      return false;
    }
    setCredits(prev => prev - 1);
    return true;
  };

  const handleAddReview = (propertyId: string, review: Review) => {
    setProperties(prev => prev.map(prop => {
      if (prop.id === propertyId) {
        const updatedReviews = [review, ...prop.reviews];
        // Calculate newly updated aggregate rating based on reviews
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newRating = totalRating / updatedReviews.length;
        return {
          ...prop,
          reviews: updatedReviews,
          rating: parseFloat(newRating.toFixed(1))
        };
      }
      return prop;
    }));
  };

  const handleAddProperty = (newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev]);
    // Persist to Supabase if the user is signed in (rooms only)
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid || newProperty.type === 'hostel') return;
      try {
        await supabase.from('listings').insert({
          landlord_id: uid,
          title: newProperty.title,
          price: newProperty.price,
          location: `${newProperty.area}, ${newProperty.city}`,
          room_type: newProperty.type,
          amenities: newProperty.amenities,
          preferred_tenants: newProperty.genderSpecific === 'boys' ? ['Boys Only'] : newProperty.genderSpecific === 'girls' ? ['Girls Only'] : ['Any'],
          photos: newProperty.imagesList,
          status: 'AVAILABLE',
          contact_phone: newProperty.host.phone,
        });
      } catch (e) { console.error('Listing insert failed', e); }
    })();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('all');
    setSelectedRoomType('all');
    setMinPrice('');
    setMaxPrice('');
    setSelectedAmenities([]);
    setSortBy('newest');
  };

  const toggleAmenityInFilter = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  // Run the Home search trigger
  const handleHomeSearchSubmit = () => {
    // Bind home values to filter parameters
    if (homeLocation.trim()) {
      setSearchQuery(homeLocation);
    }
    
    if (homeType) {
      setSelectedRoomType(homeType);
    } else {
      setSelectedRoomType('all');
    }

    if (homeBudget) {
      if (homeBudget === '5k') {
        setMinPrice('');
        setMaxPrice('5000');
      } else if (homeBudget === '10k') {
        setMinPrice('5000');
        setMaxPrice('10000');
      } else if (homeBudget === '15k+') {
        setMinPrice('10000');
        setMaxPrice('');
      }
    } else {
      setMinPrice('');
      setMaxPrice('');
    }

    setCurrentTab('explore');
  };

  // Filter properties algorithmically
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {

      // 0. Rooms only — hostels live in their own tab
      if (prop.type === 'hostel') return false;

      // 1. Text Search matching title, area, city, district
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = prop.title.toLowerCase().includes(query);
        const matchArea = prop.area.toLowerCase().includes(query);
        const matchCity = prop.city.toLowerCase().includes(query);
        const matchDistrict = prop.district.toLowerCase().includes(query);
        if (!matchTitle && !matchArea && !matchCity && !matchDistrict) return false;
      }

      // 2. Specific District select
      if (selectedDistrict !== 'all') {
        if (prop.district !== selectedDistrict) return false;
      }

      // 3. Room Type select
      if (selectedRoomType !== 'all') {
        if (prop.type !== selectedRoomType) return false;
      }

      // 4. Price bottom limit
      if (minPrice.trim()) {
        const min = parseInt(minPrice);
        if (!isNaN(min) && prop.price < min) return false;
      }

      // 5. Price top limit
      if (maxPrice.trim()) {
        const max = parseInt(maxPrice);
        if (!isNaN(max) && prop.price > max) return false;
      }

      // 6. Amenities checklists (all checked amenities must exist in property)
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every(a => prop.amenities.includes(a));
        if (!hasAllAmenities) return false;
      }

      return true;
    }).sort((a, b) => {
      // 7. Dynamic sorting
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      // default: newest
      return b.dateAdded.localeCompare(a.dateAdded);
    });
  }, [properties, searchQuery, selectedDistrict, selectedRoomType, minPrice, maxPrice, selectedAmenities, sortBy]);

  // Filtered lists specifically for student hostels tab
  const filteredHostels = useMemo(() => {
    return properties.filter(prop => {
      return prop.type === 'hostel' && prop.genderSpecific === hostelGenderFilter;
    });
  }, [properties, hostelGenderFilter]);

  // Featured lists for Home view slider
  const featuredKathmandu = useMemo(() => {
    return properties.filter(p => p.featured);
  }, [properties]);

  if (!authReady) return null;
  if (!session) return <Login />;
  if (hostelIdParam) return (
    <div className="min-h-screen bg-surface-bg">
      <HostelPage hostelId={hostelIdParam} onBack={() => navigate('/hostels')} />
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8 text-gray-800 bg-surface-bg flex flex-col font-sans transition-colors pt-20">
      
      {/* Top Header Section */}
      <TopNavBar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        credits={credits}
        onAddCredits={handleAddCredits}
        avatar={profile?.avatar_url || IMAGES.avatarDefault}
      />

      {/* Primary content router */}
      <main className="flex-grow w-full">
        
        {/* VIEW 1: HOME DASHBOARD */}
        {currentTab === 'home' && (
          <div className="space-y-16 pb-12">
            
            {/* Elegant Hero segment with custom Nepalese backdrop */}
            <section className="relative min-h-[580px] flex flex-col justify-center items-center px-4 md:px-8 pt-12 pb-20">
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  alt="Neat Nepali house cozy bedroom room with views of mountains" 
                  className="w-full h-full object-cover opacity-85 brightness-95" 
                  src={IMAGES.heroBg}
                  referrerPolicy="no-referrer"
                />
                {/* Visual gradient overlay matching 'Namaste Warmth' */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-surface-bg/40 to-surface-bg" />
              </div>

              <div className="relative z-10 w-full max-w-4xl mx-auto text-center mt-6 rounded-3xl bg-white/35 backdrop-blur-xl border border-white/40 shadow-[0_8px_40px_rgba(0,0,0,0.12)] px-6 py-10 md:px-12 md:py-12">
                <h1 className="font-sans text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-none mb-4">
                  Find your perfect{' '}
                  <span
                    className="text-primary"
                    style={{
                      WebkitTextStroke: '1.5px #1B3A5B',
                      textShadow: '2px 3px 4px rgba(27,58,91,0.35)'
                    }}
                  >kotha</span>{' '}in Nepal
                </h1>
                <p className="font-sans font-medium text-base sm:text-lg text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Verified student hostels, single rooms, sharing plans, and spacious apartments. List free or find verified hosts today.
                </p>

                {/* Styled Search Bar layout */}
                <div className="bg-white p-3 md:p-2 rounded-2xl md:rounded-full shadow-xl flex flex-col md:flex-row items-center gap-3 max-w-3xl mx-auto border border-gray-150 animate-in slide-in-from-bottom-3 duration-300">
                  
                  {/* Location field */}
                  <div className="flex-1 flex items-center w-full px-4 py-2 md:py-0 border-b md:border-b-0 md:border-r border-gray-150">
                    <MapPin className="text-secondary w-5 h-5 mr-2 shrink-0" />
                    <select
                      value={homeLocation}
                      onChange={(e) => setHomeLocation(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-semibold text-gray-800 p-0 cursor-pointer appearance-none"
                    >
                      <option value="">All Cities</option>
                      {NEPAL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Room status selector */}
                  <div className="flex-1 flex items-center w-full px-4 py-2 md:py-0 border-b md:border-b-0 md:border-r border-gray-150">
                    <Bed className="text-secondary w-5 h-5 mr-2 shrink-0" />
                    <select 
                      value={homeType}
                      onChange={(e) => setHomeType(e.target.value)}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-semibold text-gray-750 p-0 cursor-pointer appearance-none"
                    >
                      <option value="">Any Kotha Type</option>
                      <option value="room">Single Rooms</option>
                      <option value="flat">Apartments & Flats</option>
                      <option value="hostel">Student Hostel</option>
                    </select>
                  </div>

                  {/* Pricing segment */}
                  <div className="flex-1 flex items-center w-full px-4 py-2 md:py-0">
                    <Coins className="text-secondary w-5 h-5 mr-2 shrink-0" />
                    <select 
                      value={homeBudget}
                      onChange={(e) => setHomeBudget(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-750 p-0 cursor-pointer appearance-none"
                    >
                      <option value="">Monthly Budget</option>
                      <option value="5k">Under Rs. 5,000</option>
                      <option value="10k">Rs. 5,000 - 10,000</option>
                      <option value="15k+">Rs. 10,000+</option>
                    </select>
                  </div>

                  {/* Trigger buttons */}
                  <button 
                    onClick={handleHomeSearchSubmit}
                    className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white font-bold text-xs px-8 py-3.5 rounded-xl md:rounded-full transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer hover:shadow-lg hover:scale-[1.01]"
                  >
                    <Search className="w-4 h-4" />
                    Search Rooms
                  </button>
                </div>

              </div>
            </section>

            {/* Quick Categories Bento shortcuts */}
            <section className="w-full px-4 md:px-8">
              <h2 className="font-sans font-black text-xl text-gray-800 mb-6 text-center md:text-left flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                Find Rentals by Category
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <button
                  type="button"
                  onClick={() => { setSelectedRoomType('room'); setCurrentTab('explore'); }}
                  className="p-5 bg-white hover:bg-red-50/10 border border-gray-100 hover:border-primary rounded-2xl shadow-2xs hover:shadow-md transition-all text-center flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-red-50 text-primary rounded-full flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                    <Bed className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-[14px] text-gray-800 block">Single Kotha</span>
                  <span className="text-[11px] text-gray-400 font-medium mt-1">Starting from Rs. 4,500</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedRoomType('shared'); setCurrentTab('explore'); }}
                  className="p-5 bg-white hover:bg-red-50/10 border border-gray-100 hover:border-primary rounded-2xl shadow-2xs hover:shadow-md transition-all text-center flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                    <Bed className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-[14px] text-gray-800 block">Double Kotha</span>
                  <span className="text-[11px] text-gray-400 font-medium mt-1">Shared / twin rooms</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedRoomType('flat'); setCurrentTab('explore'); }}
                  className="p-5 bg-white hover:bg-red-50/10 border border-gray-100 hover:border-primary rounded-2xl shadow-2xs hover:shadow-md transition-all text-center flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-[14px] text-gray-800 block">Flats & Apartments</span>
                  <span className="text-[11px] text-gray-400 font-medium mt-1">Starting from Rs. 15,000</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setCurrentTab('hostels'); }}
                  className="p-5 bg-white hover:bg-red-50/10 border border-gray-100 hover:border-primary rounded-2xl shadow-2xs hover:shadow-md transition-all text-center flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-sky-50 text-sky-800 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-[14px] text-gray-800 block">Student Hostels</span>
                  <span className="text-[11px] text-gray-400 font-medium mt-1">Food + Laundry included</span>
                </button>


              </div>
            </section>

            {/* Horizontal featured slider line */}
            <section className="w-full px-4 md:px-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="font-sans font-black text-xl text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Featured Listings in Kathmandu & Patan
                  </h2>
                  <p className="text-gray-450 text-xs font-semibold mt-1">Handpicked verified kothas with excellent facilities</p>
                </div>
                <button 
                  onClick={() => { handleResetFilters(); setCurrentTab('explore'); }}
                  className="text-xs font-bold text-primary hover:underline flex items-center cursor-pointer"
                >
                  View All Rooms <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Horizontal Scroll area */}
              <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
                {featuredKathmandu.map((prop) => (
                  <div key={prop.id} className="min-w-[290px] w-[290px] md:w-[320px] shrink-0 snap-center">
                    <ListingCard 
                      property={prop}
                      isFavorited={favorites.includes(prop.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectProperty={setSelectedProperty}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Ad Banner Slot */}
            <section className="w-full px-4 md:px-8">
              <div className="w-full bg-gray-100 rounded-2xl flex items-center justify-center min-h-[100px] border border-gray-200 shadow-inner relative overflow-hidden p-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center">
                  📢 Sponsorship Banner: Top Colleges and hostels associate programs. Contact support to sponsor.
                </span>
              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: EXPLORE / SEARCH RESULTS */}
        {currentTab === 'explore' && (
          <div className="w-full px-4 md:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Left side Filter sticky sidebar */}
              <div className="w-full md:w-72 shrink-0">
                <LeftFilterSidebar 
                  district={selectedDistrict}
                  setDistrict={setSelectedDistrict}
                  roomType={selectedRoomType}
                  setRoomType={setSelectedRoomType}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  selectedAmenities={selectedAmenities}
                  toggleAmenity={toggleAmenityInFilter}
                  resetFilters={handleResetFilters}
                  totalFilteredCount={filteredProperties.length}
                />
              </div>

              {/* Right side Property listings grid */}
              <div className="flex-1 space-y-6">
                
                {/* Search / Sort Results header row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                  <div>
                    <h2 className="font-sans font-black text-xl text-gray-800 leading-none">
                      Rooms & Flats Available
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1.5">
                      Showing {filteredProperties.length} verified listings match
                    </p>
                  </div>
                  
                  {/* Sorting & Map simulation toggle */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-xs font-bold py-2 px-3 bg-gray-55/40 border border-gray-200 outline-none rounded-xl text-gray-700 cursor-pointer"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Sort: Top Rated</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowMapOverlay(!showMapOverlay)}
                      className={`text-xs font-bold px-3 py-2 border rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                        showMapOverlay 
                          ? 'border-primary bg-red-50 text-primary' 
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Map className="w-4 h-4" />
                      <span>{showMapOverlay ? "List View" : "Map View"}</span>
                    </button>
                  </div>
                </div>

                {/* Subtext keyword input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                    placeholder="Type neighborhood name or district e.g. Patan Dhoka, Kirtipur, Kathmandu..."
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-gray-400 hover:text-primary"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Map Overlay dynamic simulation */}
                {showMapOverlay ? (
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md text-center space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border h-96">
                      <img 
                        src={IMAGES.mapPatanRepresent} 
                        alt="Simulated live Map lookup" 
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      {/* Place markers dynamic */}
                      {filteredProperties.slice(0, 5).map((prop, index) => (
                        <div 
                          key={prop.id}
                          onClick={() => setSelectedProperty(prop)}
                          className="absolute bg-primary text-white font-extrabold text-xs px-2.5 py-1.5 rounded-full shadow-lg border hover:scale-110 cursor-pointer animate-bounce group"
                          style={{
                            top: `${40 + index * 10}%`,
                            left: `${30 + index * 12}%`
                          }}
                        >
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 fill-white text-primary" />
                            Rs. {prop.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Interactive Map Simulation. Click on price tags markers to inspect kothas details.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Listings grid */}
                    {filteredProperties.length === 0 ? (
                      <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl space-y-4">
                        <p className="text-gray-400 text-sm font-semibold">
                          Oops! No verified kothas match your strict filter parameters.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="py-2.5 px-6 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
                        >
                          Reset Filters & Search everywhere
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                        {filteredProperties.map((prop) => (
                          <ListingCard 
                            key={prop.id}
                            property={prop}
                            isFavorited={favorites.includes(prop.id)}
                            onToggleFavorite={handleToggleFavorite}
                            onSelectProperty={setSelectedProperty}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: HOSTELS TAB */}
        {currentTab === 'hostels' && (
          <div className="w-full px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-300">
            
            {/* Tab header toggles */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-150">
              <div>
                <h2 className="font-sans font-black text-2xl text-gray-800 leading-none">
                  Student Hostels Finder
                </h2>
              </div>

              {/* Gender Preference Pill selectors */}
              <div className="bg-gray-100 p-1 rounded-full flex shrink-0 shadow-inner">
                <button
                  type="button"
                  onClick={() => setHostelGenderFilter('boys')}
                  className={`px-6 py-2 rounded-full font-bold text-xs transition-all uppercase tracking-wider cursor-pointer ${
                    hostelGenderFilter === 'boys'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Boys Hostels
                </button>
                <button
                  type="button"
                  onClick={() => setHostelGenderFilter('girls')}
                  className={`px-6 py-2 rounded-full font-bold text-xs transition-all uppercase tracking-wider cursor-pointer ${
                    hostelGenderFilter === 'girls'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Girls Hostels
                </button>
              </div>
            </div>

            {/* Hostels listings grid */}
            {filteredHostels.length === 0 ? (
              <div className="text-center py-16 bg-white border rounded-3xl text-gray-400 text-xs font-medium">
                No custom {hostelGenderFilter} hostels posted yet. Click "List Property" to post!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHostels.map((prop) => (
                  <div
                    key={prop.id}
                    onClick={() => navigate(`/hostel/${prop.id}`)}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg overflow-hidden flex flex-col group cursor-pointer transition-all pb-4 relative"
                  >
                    
                    {/* Header Image */}
                    <div className="h-52 relative p-2.5 pb-0">
                      <div className="rounded-2xl overflow-hidden h-full">
                        <img 
                          src={prop.image} 
                          alt={prop.title} 
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {(prop.hostelSeaterOptions?.length ?? 0) > 0 && (
                        <span className="absolute bottom-4 left-6 bg-white/95 px-3 py-1 rounded-xl text-[10.5px] font-bold text-gray-700 shadow-md border border-gray-50 uppercase tracking-widest flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {prop.hostelSeaterOptions!.length} Available Room{prop.hostelSeaterOptions!.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Meta details */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-lg text-gray-800 tracking-tight leading-snug group-hover:text-primary transition-colors">
                          {prop.title}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {prop.area}, {prop.city}
                        </p>

                        {/* Amenities tags */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {prop.amenities.map(name => (
                            <span 
                              key={`${prop.id}-${name}`}
                              className="text-[9.5px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 uppercase"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Seaters table representation */}
                      {prop.hostelSeaterOptions && (
                        <div className="pt-4 border-t border-gray-100 mt-5 space-y-2 leading-none">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pricing Matrix:</p>
                          <div className="space-y-1.5 text-xs text-gray-600 font-semibold pt-1">
                            {prop.hostelSeaterOptions.map((opt, i) => (
                              <div key={`${opt.seater}-${i}`} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100 shadow-3xs">
                                <span>{opt.seater} Accommodation</span>
                                <span className="font-bold text-primary">Rs. {opt.price.toLocaleString('en-IN')}/mo</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Bottom detail trigger */}
                    <div className="px-5 pt-3 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-700 font-mono text-xs font-bold leading-none">
                        <Star className="w-3" />
                        <span>{prop.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs font-bold text-primary group-hover:underline uppercase tracking-wide">
                        Contact Warden &rarr;
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW 4: LIST PROPERTY FORM */}
        {currentTab === 'list_property' && (
          <div className="w-full px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-300">
            <div className="inline-flex bg-white border border-gray-200 rounded-full p-1 gap-1">
              <button onClick={() => setListMode('room')}
                className={`px-5 py-2 rounded-full text-sm font-bold ${listMode === 'room' ? 'bg-primary text-white' : 'text-gray-500'}`}>
                List a Room
              </button>
              <button onClick={() => setListMode('hostel')}
                className={`px-5 py-2 rounded-full text-sm font-bold ${listMode === 'hostel' ? 'bg-primary text-white' : 'text-gray-500'}`}>
                Manage a Hostel
              </button>
            </div>
            {listMode === 'room' ? (
              <ListPropertyForm
                onAddProperty={handleAddProperty}
                userAvatar={profile?.avatar_url || IMAGES.avatarDefault}
              />
            ) : (
              <HostelManager userId={session.user.id} />
            )}
          </div>
        )}

        {/* VIEW 5: SAVED PROPERTIES */}
        {currentTab === 'saved' && (
          <div className="w-full px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="font-sans font-black text-2xl text-gray-800 leading-none">
                Saved Wishlist
              </h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                Your private shortlist of bookmarked rooms, flats, or student hostels
              </p>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl space-y-4">
                <p className="text-gray-450 text-sm font-semibold">Your saved list is currently empty.</p>
                <button
                  type="button"
                  onClick={() => setCurrentTab('explore')}
                  className="py-2.5 px-6 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full shadow-md shrink-0 cursor-pointer"
                >
                  Explore Rooms Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties
                  .filter(prop => favorites.includes(prop.id))
                  .map(prop => (
                    <ListingCard 
                      key={prop.id}
                      property={prop}
                      isFavorited={favorites.includes(prop.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectProperty={setSelectedProperty}
                    />
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* UNLOCKED ROOMS */}
        {currentTab === 'unlocked' && (
          <div className="w-full px-4 md:px-8 py-8 space-y-6 animate-in fade-in duration-300">
            <h2 className="font-black text-2xl text-gray-800">Unlocked Rooms</h2>
            {properties.filter(p => unlockedIds.includes(p.id)).length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400 font-semibold">
                No unlocked rooms yet. Spend a credit on a room to reveal the owner's contact.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.filter(p => unlockedIds.includes(p.id)).map(p => (
                  <ListingCard
                    key={p.id}
                    property={p}
                    isFavorited={favorites.includes(p.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={() => setSelectedProperty(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: USER PROFILE DASHBOARD */}
        {currentTab === 'profile' && (
          <div className="w-full px-4 md:px-8 py-8 space-y-6 animate-in fade-in duration-300 ">

            {/* Profile header card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm flex items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <label className="relative cursor-pointer group">
                  <img
                    src={profile?.avatar_url || IMAGES.avatarDefault}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover ring-2 ring-primary/30"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">Change</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onAvatarFile(e.target.files?.[0])} />
                </label>
                <div>
                  {profEditing ? (
                    <input
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="text-2xl font-black text-gray-800 border-b-2 border-primary focus:outline-none bg-transparent"
                    />
                  ) : (
                    <h3 className="font-black text-3xl text-gray-800">{profile?.full_name || 'Add your name'}</h3>
                  )}
                  <p className="text-sm text-gray-500 font-medium mt-1">{session?.user?.phone ? '+' + session.user.phone : ''}</p>
                  <button
                    onClick={() => { if (profEditing) saveProfileName(); else { setProfName(profile?.full_name || ''); setProfEditing(true); } }}
                    disabled={profBusy}
                    className="mt-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm px-5 py-2 rounded-full transition disabled:opacity-50"
                  >
                    {profBusy ? 'Saving…' : profEditing ? 'Save Profile' : 'Edit Profile'}
                  </button>
                </div>
              </div>
              <button onClick={() => supabase.auth.signOut()} className="hidden md:block border border-gray-300 hover:border-red-400 hover:text-red-500 text-gray-600 font-bold text-sm px-4 py-2 rounded-xl transition">Log Out</button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-8 text-center">
                <div className="text-4xl">⭐</div>
                <div className="text-3xl font-black text-gray-800 mt-2">{credits}</div>
                <div className="text-sm text-gray-400 font-semibold mt-1">Credits Left</div>
              </div>
              <button onClick={() => setCurrentTab('unlocked')} className="bg-white rounded-3xl border border-gray-100 shadow-sm py-8 text-center cursor-pointer hover:shadow-md transition">
                <div className="text-4xl">🔑</div>
                <div className="text-3xl font-black text-gray-800 mt-2">{unlockedIds.length}</div>
                <div className="text-sm text-gray-400 font-semibold mt-1">Unlocked</div>
              </button>
            </div>

            {/* Menu rows */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
              <button onClick={() => setCurrentTab('list_property')} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="font-bold text-gray-800 flex-1">My Listings</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button onClick={() => setCurrentTab('saved')} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left">
                <Heart className="w-5 h-5 text-primary" />
                <span className="font-bold text-gray-800 flex-1">Saved List</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-50 transition text-left">
                <User className="w-5 h-5 text-red-500" />
                <span className="font-bold text-red-500 flex-1">Log Out</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* My listings manager */}
            {myListingIds.length > 0 && (
              <div>
                <h4 className="font-black text-lg text-gray-800 mb-4">My Custom Listings Manager</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.filter(p => myListingIds.includes(p.id)).map((myProp) => (
                    <ListingCard
                      key={myProp.id}
                      property={myProp}
                      isFavorited={favorites.includes(myProp.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onClick={() => setSelectedProperty(myProp)}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Property Details Dialog overlay */}
      {selectedProperty && (
        <PropertyDetailModal 
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          isFavorited={favorites.includes(selectedProperty.id)}
          onToggleFavorite={handleToggleFavorite}
          userCredits={credits}
          onDeductCredit={handleDeductCredit}
          onAddReview={handleAddReview}
        />
      )}

      {/* Bottom Sticky Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4 md:px-8 w-full w-full mt-12 mb-16 md:mb-0">
        <div className="flex flex-col md:flex-row justify-between gap-8 items-center text-center md:text-left">
          <div className="space-y-2">
            <span className="font-sans font-black text-lg text-primary">Kotha Pasal</span>
            <p className="text-xs text-gray-400 font-medium">
              © 2026 Kotha Pasal. Verified room lookup and student hostel finder covering all 77 districts of Nepal.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-gray-500">
            <button onClick={() => setCurrentTab('home')} className="hover:text-primary">Home</button>
            <button onClick={() => setCurrentTab('explore')} className="hover:text-primary">Explore Rooms</button>
            <button onClick={() => setCurrentTab('hostels')} className="hover:text-primary">Hostels</button>
            <button onClick={() => setCurrentTab('list_property')} className="hover:text-primary">List Property</button>
            <button onClick={() => setCurrentTab('saved')} className="hover:text-primary">Saved List</button>
          </div>
        </div>
      </footer>


    </div>
  );
}
