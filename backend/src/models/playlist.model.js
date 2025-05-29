import { BaseModel } from './base.model.js';

export class Playlist extends BaseModel {
  constructor() {
    super('playlists');
  }

  async findByUser(userId) {
    const query = 'SELECT * FROM playlists WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async getWithSongs(playlistId) {
    const query = `
      SELECT p.*, s.*, ps.position
      FROM playlists p
      LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
      LEFT JOIN songs s ON s.id = ps.song_id
      WHERE p.id = $1
      ORDER BY ps.position
    `;
    const result = await this.pool.query(query, [playlistId]);
    
    if (result.rows.length === 0) return null;
    
    const playlist = {
      ...result.rows[0],
      songs: result.rows
        .filter(row => row.song_id)
        .map(row => ({
          id: row.song_id,
          title: row.title,
          duration: row.duration,
          file_path: row.file_path,
          position: row.position
        }))
    };
    
    return playlist;
  }

  async addSong(playlistId, songId, position) {
    const query = `
      INSERT INTO playlist_songs (playlist_id, song_id, position)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await this.pool.query(query, [playlistId, songId, position]);
    return result.rows[0];
  }

  async removeSong(playlistId, songId) {
    const query = `
      DELETE FROM playlist_songs
      WHERE playlist_id = $1 AND song_id = $2
      RETURNING *
    `;
    const result = await this.pool.query(query, [playlistId, songId]);
    return result.rows[0];
  }

  async reorderSongs(playlistId, songPositions) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const { songId, position } of songPositions) {
        await client.query(
          'UPDATE playlist_songs SET position = $1 WHERE playlist_id = $2 AND song_id = $3',
          [position, playlistId, songId]
        );
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
} 