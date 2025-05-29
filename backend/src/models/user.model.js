import { BaseModel } from "./base.model.js";
import bcrypt from "bcryptjs";

export class User extends BaseModel {
  constructor() {
    super("users");
  }

  async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await this.pool.query(query, [email]);
    return result.rows[0];
  }

  async findByUsername(username) {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await this.pool.query(query, [username]);
    return result.rows[0];
  }

  async create(userData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const data = {
      ...userData,
      password: hashedPassword,
    };

    return super.create(data);
  }

  async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  async getRecentlyPlayed(userId) {
    const query = `
      SELECT s.*, rp.played_at
      FROM user_recently_played rp
      JOIN songs s ON s.id = rp.song_id
      WHERE rp.user_id = $1
      ORDER BY rp.played_at DESC
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async getFavoriteSongs(userId) {
    const query = `
      SELECT s.*
      FROM user_favorite_songs fs
      JOIN songs s ON s.id = fs.song_id
      WHERE fs.user_id = $1
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async getUserFavoriteAlbums(userId) {
    const query = `
      SELECT a.*
      FROM albums a
      JOIN user_favorite_albums ufa ON a.id = ufa.album_id
      WHERE ufa.user_id = $1
      ORDER BY ufa.created_at DESC
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async getFavoritePlaylists(userId) {
    const query = `
      SELECT p.*
      FROM user_favorite_playlists fp
      JOIN playlists p ON p.id = fp.playlist_id
      WHERE fp.user_id = $1
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async getFollowing(userId) {
    const query = `
      SELECT u.*
      FROM user_following f
      JOIN users u ON u.id = f.following_id
      WHERE f.follower_id = $1
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async getFollowers(userId) {
    const query = `
      SELECT u.*
      FROM user_following f
      JOIN users u ON u.id = f.follower_id
      WHERE f.following_id = $1
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }
}
