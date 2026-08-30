import pool from "../configs/db";
import { Url } from "../types";

export const urlRepository  = {
  async insert (shortCode : string, originalUrl : string) : Promise<Url> {
    const {rows} = await pool.query('INSERT INTO urls (short_code, original_url) VALUES ($1, $2) RETURNING *', [shortCode, originalUrl]);
    return rows[0];
  },
  async findByCode (shortCode : string) : Promise<Url | null> {
    const {rows} = await pool.query('SELECT FROM urls WHERE short_code = $1 LIMIT 1', [shortCode])
    return rows[0] ?? null;
  },
  async incrementClicks(shortCode : string, count :number) : Promise<void>{
    await pool.query('UPDATE urls SET click_count + $1 WHERE short_code = $2',[shortCode, count])
  }
}
