import { BaseModel } from "./base.model.js";

export class Album extends BaseModel {
  constructor() {
    super("albums");
  }

  async findByArtist(artistId) {
    const query =
      "SELECT * FROM albums WHERE artist_id = $1 ORDER BY release_date DESC";
    const result = await this.pool.query(query, [artistId]);
    return result.rows;
  }

  async getWithSongs(albumId) {
    const query = `
      SELECT a.*, s.*
      FROM albums a
      LEFT JOIN songs s ON s.album_id = a.id
      WHERE a.id = $1
      ORDER BY s.track_number
    `;
    const result = await this.pool.query(query, [albumId]);

    if (result.rows.length === 0) return null;

    const album = {
      ...result.rows[0],
      songs: result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        duration: row.duration,
        file_path: row.file_path,
        track_number: row.track_number,
      })),
    };

    return album;
  }

  async search(query) {
    const searchQuery = `
      SELECT a.*, ar.name as artist_name
      FROM albums a
      JOIN artists ar ON ar.id = a.artist_id
      WHERE a.title ILIKE $1
      OR ar.name ILIKE $1
      OR a.genre ILIKE $1
    `;
    const result = await this.pool.query(searchQuery, [`%${query}%`]);
    return result.rows;
  }
}
