export interface PodcastInfo {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  logo_image?: string;
  about_text?: string;
  about_image?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  favicon_image?: string;
  social_image?: string;
}

export interface Host {
  id: number;
  name: string;
  bio: string;
  image_url: string;
  twitter_url: string;
  instagram_url: string;
  email?: string;
}

export interface Episode {
  id: number;
  title: string;
  description: string;
  audio_url: string;
  published_at: string;
  is_hero: boolean;
  guid?: string;
  duration?: string;
  slug?: string;
  image_url?: string;
}

export interface Platform {
  id: number;
  name: string;
  url: string;
  icon_name: string;
  icon_url?: string;
  display_order?: number;
}
