import { BaseModel } from "./base.model.js";

export class UserPreferences extends BaseModel {
  constructor() {
    super("user_preferences");
  }

  async findByUserId(userId) {
    const query = "SELECT * FROM user_preferences WHERE user_id = $1";
    const result = await this.pool.query(query, [userId]);
    return result.rows[0];
  }

  async createOrUpdate(userId, preferences) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Check if preferences exist for user
      const existingPrefs = await this.findByUserId(userId);

      if (existingPrefs) {
        // Update existing preferences
        const query = `
          UPDATE user_preferences
          SET 
            theme = $1,
            language = $2,
            autoplay = $3,
            explicit_content = $4,
            audio_quality = $5,
            crossfade = $6,
            gapless_playback = $7,
            show_activity = $8,
            show_recently_played = $9,
            show_favorites = $10,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $11
          RETURNING *
        `;

        const values = [
          preferences.theme || existingPrefs.theme,
          preferences.language || existingPrefs.language,
          preferences.autoplay ?? existingPrefs.autoplay,
          preferences.explicit_content ?? existingPrefs.explicit_content,
          preferences.audio_quality || existingPrefs.audio_quality,
          preferences.crossfade ?? existingPrefs.crossfade,
          preferences.gapless_playback ?? existingPrefs.gapless_playback,
          preferences.show_activity ?? existingPrefs.show_activity,
          preferences.show_recently_played ??
            existingPrefs.show_recently_played,
          preferences.show_favorites ?? existingPrefs.show_favorites,
          userId,
        ];

        const result = await client.query(query, values);
        await client.query("COMMIT");
        return result.rows[0];
      } else {
        // Create new preferences
        const query = `
          INSERT INTO user_preferences (
            user_id,
            theme,
            language,
            autoplay,
            explicit_content,
            audio_quality,
            crossfade,
            gapless_playback,
            show_activity,
            show_recently_played,
            show_favorites
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;

        const values = [
          userId,
          preferences.theme || "dark",
          preferences.language || "en",
          preferences.autoplay ?? true,
          preferences.explicit_content ?? false,
          preferences.audio_quality || "medium",
          preferences.crossfade ?? 0,
          preferences.gapless_playback ?? true,
          preferences.show_activity ?? true,
          preferences.show_recently_played ?? true,
          preferences.show_favorites ?? true,
        ];

        const result = await client.query(query, values);
        await client.query("COMMIT");
        return result.rows[0];
      }
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async resetToDefaults(userId) {
    const defaultPreferences = {
      theme: "dark",
      language: "en",
      autoplay: true,
      explicit_content: false,
      audio_quality: "medium",
      crossfade: 0,
      gapless_playback: true,
      show_activity: true,
      show_recently_played: true,
      show_favorites: true,
    };

    return this.createOrUpdate(userId, defaultPreferences);
  }
}
