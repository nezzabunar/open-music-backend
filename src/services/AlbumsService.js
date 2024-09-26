const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { InvariantError } = require('../exceptions/InvariantError');
const { NotFoundError } = require('../exceptions/NotFoundError');
const { mapDBToModel } = require('../utils');
const { rows } = require('pg/lib/defaults');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBToModel);
  }

  async getAlbumById(id) {
    const Albumquery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const ResultAlbum = await this._pool.query(Albumquery);

    if (!ResultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = ResultAlbum.rows[rows];
    const Songquery = {
      text: 'SELECT * FROM Songs WHERE album_id = $1',
      values: [album.id],
    };

    const SongResult = await this._pool.query(Songquery);
    const songs = SongResult.rows;

    const FinalResultAlbum = {
      id: album.id,
      name: album.name,
      year: album.year,
      songs: songs.map((song) => ({
        id: song.id,
        title: song.title,
        performer: song.performer,
      })),
    };
    return FinalResultAlbum;
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = { AlbumsService };