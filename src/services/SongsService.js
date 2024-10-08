const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { InvariantError } = require('../exceptions/InvariantError');
const { NotFoundError } = require('../exceptions/NotFoundError');
const { mapDBSongToModel, mapDBSongsToModel } = require('../utils');
const { rows } = require('pg/lib/defaults');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Songs gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let ResultQuery = await this._pool.query('SELECT * FROM songs');

    if (title) {
      const query = {
        text: 'SELECT * FROM songs WHERE LOWER(title) LIKE LOWER (\'%\' || $1 ||  \'%\')',
        values: [title]
      };
      ResultQuery = await this._pool.query(query);
    }

    if (performer) {
      const query = {
        text: 'SELECT * FROM songs WHERE LOWER(performer) LIKE LOWER (\'%\' || $1 ||  \'%\')',
        values: [performer]
      };
      ResultQuery = await this._pool.query(query);
    }
    if (title && performer) {
      const query = {
        text: 'SELECT * FROM songs WHERE LOWER(title) LIKE LOWER (\'%\' || $1 ||  \'%\') AND LOWER(performer) LIKE LOWER (\'%\' || $2 ||  \'%\')',
        values: [title, performer]
      };
      ResultQuery = await this._pool.query(query);
    }

    return ResultQuery.rows.map(mapDBSongsToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Songs tidak ditemukan');

    }
    return result.rows.map(mapDBSongToModel, mapDBSongsToModel)[rows];
  }

  async editSongById(id, { title, year, performer, genre, duration }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = { SongsService };