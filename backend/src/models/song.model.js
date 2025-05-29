import { BaseModel } from "./base.model.js";

export class Song extends BaseModel {
  constructor() {
    super("songs");
  }

  async findByAlbum(albumId) {
    const query =
      "SELECT * FROM songs WHERE album_id = $1 ORDER BY track_number";
    const result = await this.pool.query(query, [albumId]);
    return result.rows;
  }

  async findByArtist(artistId) {
    const query = `
      SELECT s.*
      FROM songs s
      JOIN albums a ON a.id = s.album_id
      WHERE a.artist_id = $1
      ORDER BY a.release_date DESC, s.track_number
    `;
    const result = await this.pool.query(query, [artistId]);
    return result.rows;
  }

  async search(query) {
    const searchQuery = `
      SELECT s.*, a.title as album_title, ar.name as artist_name
      FROM songs s
      JOIN albums a ON a.id = s.album_id
      JOIN artists ar ON ar.id = a.artist_id
      WHERE s.title ILIKE $1
      OR a.title ILIKE $1
      OR ar.name ILIKE $1
    `;
    const result = await this.pool.query(searchQuery, [`%${query}%`]);
    return result.rows;
  }

  async getMostPlayed(limit = 10) {
    const query = `
      SELECT s.*, COUNT(rp.id) as play_count
      FROM songs s
      LEFT JOIN user_recently_played rp ON rp.song_id = s.id
      GROUP BY s.id
      ORDER BY play_count DESC
      LIMIT $1
    `;
    const result = await this.pool.query(query, [limit]);
    return result.rows;
  }
}
