export interface Url {
  id: number;
  short_code: string;
  original_url: string;
  click_count: number;
  created_at: Date;
  expires_at: Date | null;
}

export interface CreateUrlDto {
  originalUrl: string;
}
