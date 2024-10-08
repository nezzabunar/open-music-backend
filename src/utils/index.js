const mapDBToModel = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
});

const mapDBSongsToModel = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapDBSongToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

module.exports = { mapDBToModel, mapDBSongToModel, mapDBSongsToModel };