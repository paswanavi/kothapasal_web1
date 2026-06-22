export type PropertyType = 'room' | 'flat' | 'hostel' | 'studio' | 'shared';

export interface Host {
  name: string;
  phone: string;
  email: string;
  avatar: string;
}

export interface HostelSeaterOption {
  seater: string; // e.g. "1-Seater", "2-Seater"
  price: number;  // price in Rs.
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  text: string;
  date: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // For rooms/flats, the starting/base monthly rent in Rs.
  type: PropertyType;
  city: string;
  area: string;
  district: string;
  rating: number;
  reviews: Review[];
  image: string;
  imagesList: string[];
  amenities: string[];
  host: Host;
  verified: boolean;
  featured: boolean;
  genderSpecific?: 'boys' | 'girls' | 'co-ed'; // exclusively for hostels
  hostelSeaterOptions?: HostelSeaterOption[]; // pricing table for hostels
  dateAdded: string;
  creditsNeeded: number;
}

export interface UserState {
  credits: number;
  favorites: string[]; // List of property IDs
  myListings: Property[];
}
