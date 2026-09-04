const Actor = require('../models/Actor');
const Series = require('../models/Series');

const getFavoriteField = (type) => {
  if (type === 'actor') return 'favoriteActors';
  if (type === 'series') return 'favoriteSeries';
  return null;
};

const getFavorites = async (req, res) => {
  try {
    const user = await req.user.populate([
      { path: 'favoriteActors', options: { sort: { name: 1 } } },
      { path: 'favoriteSeries', options: { sort: { name: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        actors: user.favoriteActors || [],
        series: user.favoriteSeries || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { type, id } = req.body;
    const field = getFavoriteField(type);

    if (!field || !id) {
      return res.status(400).json({ success: false, message: 'Favorite type and id are required' });
    }

    const Model = type === 'actor' ? Actor : Series;
    const item = await Model.findById(id).select('_id');
    if (!item) {
      return res.status(404).json({ success: false, message: `${type} not found` });
    }

    const favorites = req.user[field] || [];
    const alreadyFavorite = favorites.some((favoriteId) => favoriteId.toString() === id);

    if (alreadyFavorite) {
      req.user[field] = favorites.filter((favoriteId) => favoriteId.toString() !== id);
    } else {
      req.user[field].push(id);
    }

    await req.user.save();

    res.json({
      success: true,
      data: { type, id, favorited: !alreadyFavorite },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getFavorites, toggleFavorite };
