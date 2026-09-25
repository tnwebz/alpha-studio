export type ServiceSlug = 
  | 'birthday' 
  | 'hindu_wedding' 
  | 'christian_wedding'
  | 'naming_ceremony'
  | 'engagement'
  | 'housewarming'
  | 'puberty'
  | 'aldhi'
  | 'reception'
  | 'bangle_ceremony'
  | 'salangai_poojai'
  | 'maternity'
  | 'model_shoot'
  | 'gift_items'
  | 'outdoor'
  | 'candid'
  | 'events'
  | 'others'
  | 'candid_videos'
  | 'drone_videos';

export type GalleryCategory = 'outdoor' | 'candid' | 'events' | 'others' | 'candid_videos' | 'drone_videos';

export const SERVICE_META: Record<
  ServiceSlug,
  { title: string; description: string; image: string }
> = {
  birthday: {
    title: 'Birthday Party',
    description:
      'We provide a professional photography service and have many years of experience capturing joyous celebrations.',
    image: '/SAMPLE PICS/SAMPLE PICS/006 BIRTHDAY/0 (1) (website).jpg',
  },
  hindu_wedding: {
    title: 'Hindu Wedding',
    description:
      'We believe wedding photography should be unscripted, fun, and timeless.',
    image: '/SAMPLE PICS/SAMPLE PICS/002 HINDU WEDDING/0 (1).jpg',
  },
  christian_wedding: {
    title: 'Christian Wedding',
    description:
      'Beautifully capturing the sacred vows and cherished moments of your special day.',
    image: '/chr1.png',
  },
  naming_ceremony: {
    title: 'Naming Ceremony',
    description:
      'Welcoming your little one with joy, blessings, and unforgettable family moments.',
    image: '/SAMPLE PICS/SAMPLE PICS/005A NAMING CEREMONY/0 (1) (website).jpg',
  },
  engagement: {
    title: 'Engagement Ceremony',
    description:
      'Celebrate the beginning of your forever with stunning and intimate portraits.',
    image: '/SAMPLE PICS/SAMPLE PICS/003 ENGAGEMENT/0 (1) (website).jpg',
  },
  housewarming: {
    title: 'Housewarming Ceremony',
    description:
      'Capturing the warmth and joy of stepping into your new home.',
    image: '/SAMPLE PICS/SAMPLE PICS/011 HOUSE WARMING/0 (1) (website).jpg',
  },
  puberty: {
    title: 'Puberty Ceremony',
    description:
      'Honoring milestone traditions with vibrant and heartfelt photography.',
    image: '/SAMPLE PICS/SAMPLE PICS/012 PUBERTY CEREMONY/0 (1) (website).jpg',
  },
  aldhi: {
    title: 'Aldhi',
    description:
      'Capturing the vibrant moments, joy, and laughter of your traditional Aldhi ceremony.',
    image: '/SAMPLE PICS/SAMPLE PICS/004 ALDHI/001 (website).jpg',
  },
  reception: {
    title: 'Reception',
    description:
      'Capturing the elegance, celebrations, and joyous moments of your wedding reception.',
    image: '/SAMPLE PICS/SAMPLE PICS/001 RECEPTION/0 (1).jpg',
  },
  bangle_ceremony: {
    title: 'Bangle Ceremony',
    description:
      'Celebrating love, expectations, and motherly blessings with beautiful, traditional bangle ceremony portraits.',
    image: '/SAMPLE PICS/SAMPLE PICS/005 BANGLE CEREMONY/0 (1) (website).jpg',
  },
  salangai_poojai: {
    title: 'Salangai Poojai',
    description:
      'Documenting the auspicious musical milestone and expressive dance performances with grace and focus.',
    image: '/SAMPLE PICS/SAMPLE PICS/014 SALANGAI POOJAI/013 copy (website).jpg',
  },
  maternity: {
    title: 'Maternity Photography',
    description:
      'Celebrate the beauty of motherhood with elegant, heartfelt portraits in a relaxed and comfortable session.',
    image: '/SAMPLE PICS/SAMPLE PICS/005 BANGLE CEREMONY/0 (6) (website).jpg',
  },
  model_shoot: {
    title: 'Model Shoot',
    description:
      'High-fashion, portfolio, and commercial modeling shoots crafted with studio lighting and editorial flair.',
    image: '/SAMPLE PICS/SAMPLE PICS/015 MODEL SHOOT/DSC04595 (website).JPG',
  },
  gift_items: {
    title: 'GIFT Items',
    description:
      'Customized photo gifts, personalized keepsakes, frames, and memorable merchandise.',
    image: '/SAMPLE PICS/SAMPLE PICS/016 GIFT ITEMS/0 (1) (website).jpg',
  },
  outdoor: {
    title: 'Outdoor Photography',
    description:
      'Captivating outdoor portraits, scenic pre-wedding shoots, and natural light photography.',
    image: '/SAMPLE PICS/SAMPLE PICS/009 OUTDOOR/0 (10) (website).jpg',
  },
  candid: {
    title: 'Candid Moments',
    description:
      'Unscripted moments, genuine smiles, and heartfelt emotional captures.',
    image: '/SAMPLE PICS/SAMPLE PICS/003 ENGAGEMENT/0 (2) (website).jpg',
  },
  events: {
    title: 'Events & Celebrations',
    description:
      'Celebratory gatherings, grand receptions, cultural milestones, and party moments.',
    image: '/SAMPLE PICS/SAMPLE PICS/001 RECEPTION/0 (6).jpg',
  },
  others: {
    title: 'Modeling & Gift Collections',
    description:
      'Fashion modeling shoots, commercial portfolios, customized gifts, and special projects.',
    image: '/SAMPLE PICS/SAMPLE PICS/015 MODEL SHOOT/DSC05120 (website).JPG',
  },
  candid_videos: {
    title: 'Candid Videos',
    description:
      'Cinematic wedding films, candid highlight teasers, and high-definition video coverage.',
    image: '/cand.png',
  },
  drone_videos: {
    title: 'Drone Videos',
    description:
      'Breathtaking 4K aerial videography, cinematic venue flythroughs, and stunning landscape perspectives.',
    image: '/dr.png',
  },
};
