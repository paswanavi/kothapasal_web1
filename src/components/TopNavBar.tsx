import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Building2, 
  Heart, 
  User, 
  Bell, 
  Coins, 
  PlusCircle,
  Menu,
  X
} from 'lucide-react';

interface TopNavBarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  credits: number;
  onAddCredits: () => void;
  avatar: string;
}

export default function TopNavBar({ 
  currentTab, 
  setCurrentTab, 
  credits, 
  onAddCredits, 
  avatar 
}: TopNavBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore Rooms', icon: Search },
    { id: 'hostels', label: 'Hostels', icon: Building2 },
    { id: 'list_property', label: 'List Property', icon: PlusCircle },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all h-20">
      <div className="max-w-[1240px] h-full mx-auto px-4 md:px-8 flex justify-between items-center">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => { setCurrentTab('home'); setShowMobileMenu(false); }}
        >
          <div className="bg-primary w-10 h-10 rounded-2xl shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
              <path d="M12 3 3 10.5V11h2v8h5v-5h4v5h5v-8h2v-.5L12 3Zm3 5.2a1 1 0 1 1 2 0V10h-2V8.2Z"/>
            </svg>
          </div>
          <span className="font-sans text-2xl font-black text-primary tracking-tight">
            Kotha <span className="text-secondary">Pasal</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 py-2 text-[15px] font-semibold transition-all cursor-pointer hover:text-primary ${
                  isActive 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Panel: Credits, Notifications, and User Profile */}
        <div className="flex items-center gap-3">
          
          {/* Credit balance visual pill */}
          <button 
            type="button"
            onClick={onAddCredits}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 rounded-full text-amber-800 transition-colors text-xs font-bold cursor-pointer shadow-xs"
            title="Click to replenish credits (Demo)"
          >
            <Coins className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{credits} Credits</span>
          </button>

          {/* Notifications button */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-full transition-colors cursor-pointer relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>

            {/* Notification drop-down */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl py-4 px-4 z-50 animate-in fade-in-50 duration-200">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h4 className="font-bold text-sm text-gray-800">Notifications</h4>
                  <button className="text-xs text-primary font-semibold hover:underline">Mark read</button>
                </div>
                <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
                  <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border-l-4 border-primary">
                    <p className="font-bold text-gray-800">Welcome to Kotha Pasal! 🇳🇵</p>
                    <p className="mt-1">Successfully greeted with 12 free renter credits to search listings.</p>
                  </div>
                  <div className="text-xs text-gray-600 p-2.5 hover:bg-gray-50 rounded-lg">
                    <p className="font-bold text-gray-800">New verified attic room listing!</p>
                    <p className="mt-1">In Naya Bazaar, Kirtipur is now active.</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">1 hour ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Favorites shortcut */}
          <button
            onClick={() => setCurrentTab('saved')}
            className={`hidden sm:flex p-2 rounded-full transition-colors cursor-pointer ${
              currentTab === 'saved' ? 'bg-red-50 text-primary' : 'text-gray-500 hover:text-primary hover:bg-gray-50'
            }`}
            title="Saved Favorites"
          >
            <Heart className="w-5 h-5" />
          </button>

          {/* Divider */}
          <span className="hidden sm:inline w-px h-6 bg-gray-200" />

          {/* Profile Quick entry */}
          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex items-center gap-2 p-1 rounded-full transition-colors cursor-pointer border ${
              currentTab === 'profile' ? 'border-primary ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img 
              src={avatar} 
              alt="User" 
              className="w-8 h-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Hamburger menu for mobile navigation */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-600 hover:text-primary cursor-pointer hover:bg-gray-50 rounded-lg"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-lg px-4 py-4 space-y-2 z-40 animate-in slide-in-from-top-4 duration-200">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-red-50 text-primary' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-5 h-5 text-gray-500" />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              setCurrentTab('saved');
              setShowMobileMenu(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              currentTab === 'saved' ? 'bg-red-50 text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className="w-5 h-5 text-gray-500" />
            Saved Listings
          </button>
          <button
            onClick={() => {
              setCurrentTab('profile');
              setShowMobileMenu(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              currentTab === 'profile' ? 'bg-red-50 text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-5 h-5 text-gray-500" />
            My Dashboard
          </button>
        </div>
      )}
    </header>
  );
}
