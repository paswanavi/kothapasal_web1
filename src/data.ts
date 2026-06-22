import { supabase } from './supabaseClient'
import { Property, PropertyType, HostelSeaterOption } from './types'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'

function splitLocation(loc: string) {
  const parts = (loc || '').split(',').map(s => s.trim())
  if (parts.length >= 2) return { area: parts[0], city: parts[parts.length - 1] }
  return { area: loc || '', city: loc || '' }
}

function mapRoomType(rt: string): PropertyType {
  const t = (rt || '').toLowerCase()
  if (t.includes('studio')) return 'studio'
  if (t.includes('flat') || t.includes('apartment') || t.includes('bhk')) return 'flat'
  if (t.includes('shared') || t.includes('double')) return 'shared'
  return 'room'
}

async function ratingMap(type: string, ids: string[]) {
  if (!ids.length) return {} as Record<string, number>
  const { data } = await supabase.from('ratings').select('target_id, stars')
    .eq('target_type', type).in('target_id', ids)
  const grouped: Record<string, number[]> = {}
  ;(data || []).forEach((r: any) => { (grouped[r.target_id] ??= []).push(r.stars) })
  const out: Record<string, number> = {}
  for (const id in grouped) {
    const a = grouped[id]
    out[id] = parseFloat((a.reduce((s, n) => s + n, 0) / a.length).toFixed(1))
  }
  return out
}

export async function fetchProperties(): Promise<Property[]> {
  // ---- Rooms (listings) ----
  const { data: listings } = await supabase.from('listings').select('*').order('created_at', { ascending: false })
  const rooms = listings || []
  const roomRatings = await ratingMap('listing', rooms.map((r: any) => r.id))

  const roomProps: Property[] = rooms.map((r: any, idx: number) => {
    const { area, city } = splitLocation(r.location)
    const photos: string[] = Array.isArray(r.photos) ? r.photos : []
    const tenant = Array.isArray(r.preferred_tenants) ? r.preferred_tenants[0] : undefined
    return {
      id: r.id,
      title: r.title,
      description: r.description || `${r.room_type} in ${r.location}.`,
      price: Number(r.price) || 0,
      type: mapRoomType(r.room_type),
      city, area, district: city,
      rating: roomRatings[r.id] || 0,
      reviews: [],
      image: photos[0] || PLACEHOLDER,
      imagesList: photos.length ? photos : [PLACEHOLDER],
      amenities: Array.isArray(r.amenities) ? r.amenities : [],
      host: { name: 'Owner', phone: r.contact_phone || '', email: '', avatar: '' },
      verified: true,
      featured: idx < 4 || (roomRatings[r.id] || 0) >= 4,
      genderSpecific: tenant === 'Boys Only' ? 'boys' : tenant === 'Girls Only' ? 'girls' : undefined,
      dateAdded: r.created_at || new Date().toISOString(),
      creditsNeeded: 1,
    }
  })

  // ---- Hostels (buildings + their rooms) ----
  const { data: hostels } = await supabase.from('hostels').select('*').order('created_at', { ascending: false })
  const buildings = hostels || []
  const hostelRatings = await ratingMap('hostel', buildings.map((h: any) => h.id))
  let hostelRooms: any[] = []
  if (buildings.length) {
    const { data: hr } = await supabase.from('hostel_rooms').select('*').in('hostel_id', buildings.map((h: any) => h.id))
    hostelRooms = hr || []
  }

  const hostelProps: Property[] = buildings.map((h: any) => {
    const myRooms = hostelRooms.filter(r => r.hostel_id === h.id)
    const seaters: HostelSeaterOption[] = myRooms.map(r => ({ seater: r.accommodation, price: Number(r.price) || 0 }))
    const prices = myRooms.map(r => Number(r.price) || 0)
    const allPhotos = myRooms.flatMap(r => Array.isArray(r.photos) ? r.photos : [])
    return {
      id: h.id,
      title: h.name,
      description: `${h.hostel_type} located in ${h.location}.`,
      price: prices.length ? Math.min(...prices) : 0,
      type: 'hostel',
      ...splitLocation(h.location), district: splitLocation(h.location).city,
      rating: hostelRatings[h.id] || 0,
      reviews: [],
      image: h.cover_photo || allPhotos[0] || PLACEHOLDER,
      imagesList: [h.cover_photo, ...allPhotos].filter(Boolean).length ? [h.cover_photo, ...allPhotos].filter(Boolean) : [PLACEHOLDER],
      amenities: [...new Set(myRooms.flatMap(r => Array.isArray(r.amenities) ? r.amenities : []))],
      host: { name: 'Hostel Owner', phone: h.contact_phone || '', email: '', avatar: '' },
      verified: true,
      featured: false,
      genderSpecific: h.hostel_type === 'Boys Hostel' ? 'boys' : h.hostel_type === 'Girls Hostel' ? 'girls' : 'co-ed',
      hostelSeaterOptions: seaters.length ? seaters : undefined,
      dateAdded: h.created_at || new Date().toISOString(),
      creditsNeeded: 0,
    } as Property
  })

  return [...roomProps, ...hostelProps]
}
