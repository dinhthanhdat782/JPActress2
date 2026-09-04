const Actor = require('../models/Actor');
const Series = require('../models/Series');
const User = require('../models/User');
const ActivityHistory = require('../models/ActivityHistory');

const getAdminAnalytics = async (req, res) => {
  try {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 6);
    since.setUTCHours(0, 0, 0, 0);

    const [actorCount, seriesCount, userCount, views, randomPicks, favoriteTotals, recentActors, recentSeries, dailyActivity, topActors] = await Promise.all([
      Actor.countDocuments(),
      Series.countDocuments(),
      User.countDocuments(),
      ActivityHistory.countDocuments({ action: 'view' }),
      ActivityHistory.countDocuments({ action: 'random' }),
      User.aggregate([
        { $project: { total: { $add: [{ $size: { $ifNull: ['$favoriteActors', []] } }, { $size: { $ifNull: ['$favoriteSeries', []] } }] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Actor.countDocuments({ createdAt: { $gte: since } }),
      Series.countDocuments({ createdAt: { $gte: since } }),
      ActivityHistory.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, action: '$action' }, count: { $sum: 1 } } },
        { $sort: { '_id.day': 1 } },
      ]),
      ActivityHistory.aggregate([
        { $match: { action: 'view', actor: { $ne: null } } },
        { $group: { _id: '$actor', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'actors', localField: '_id', foreignField: '_id', as: 'actor' } },
        { $unwind: '$actor' },
        { $project: { _id: 1, views: 1, name: '$actor.name', imageUrl: '$actor.imageUrl' } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          actors: actorCount,
          series: seriesCount,
          users: userCount,
          views,
          randomPicks,
          favorites: favoriteTotals[0]?.total || 0,
          recentActors,
          recentSeries,
        },
        dailyActivity,
        topActors,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminAnalytics };
