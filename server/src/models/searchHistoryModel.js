const db = require('../db');
const { DatabaseError } = require('../utils/errors');

class SearchHistoryModel {
  async addToHistory(userId, searchData) {
    try {
      const { rows } = await db.query(
        `INSERT INTO search_history 
        (user_id, search_query, filters, results_count)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [userId, searchData.query, searchData.filters, searchData.resultsCount]
      );
      return rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to add search to history', error);
    }
  }

  async saveSearch(userId, searchData) {
    try {
      const { rows } = await db.query(
        `INSERT INTO saved_searches 
        (user_id, name, search_query, filters)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [userId, searchData.name, searchData.query, searchData.filters]
      );
      return rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to save search', error);
    }
  }

  async getUserHistory(userId, limit = 10) {
    try {
      const { rows } = await db.query(
        `SELECT * FROM search_history
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
        [userId, limit]
      );
      return rows;
    } catch (error) {
      throw new DatabaseError('Failed to get search history', error);
    }
  }

  async getSavedSearches(userId) {
    try {
      const { rows } = await db.query(
        `SELECT * FROM saved_searches
        WHERE user_id = $1
        ORDER BY created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw new DatabaseError('Failed to get saved searches', error);
    }
  }

  async deleteSavedSearch(userId, searchId) {
    try {
      const { rows } = await db.query(
        `DELETE FROM saved_searches
        WHERE id = $1 AND user_id = $2
        RETURNING *`,
        [searchId, userId]
      );
      return rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to delete saved search', error);
    }
  }
}

module.exports = new SearchHistoryModel(); 