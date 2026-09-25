const SAMPLE_IMAGES_MAP: Record<string, string[]> = {
  birthday: [],
  hindu_wedding: [],
  christian_wedding: [],
  naming_ceremony: [],
  engagement: [],
  housewarming: [],
  puberty: [],
  aldhi: [],
  reception: [],
  bangle_ceremony: [],
  salangai_poojai: [],
  maternity: [],
  model_shoot: [],
  gift_items: [],
  outdoor: [],
  candid: [],
  events: [],
  others: [],
  candid_videos: [],
  drone_videos: [],
  drone_shorts: [],
};

/**
 * Lazy load sample images on-demand for a specific category only.
 * This prevents the home page from pre-loading all gallery images upfront.
 */
export async function getSampleImagesForCategory(category: string): Promise<string[]> {
  return Promise.resolve(SAMPLE_IMAGES_MAP[category] || []);
}
