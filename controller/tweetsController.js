const { Tweet, User } = require('../models')

const tweetsController = {
  getTweets: async (req, res, next) => {
    console.log(res.locals.user)
    // 載入所有的 tweets (這裡先 query)
    // TODO: like 與 replies 數量
    try {
      const tweets = await Tweet.findAll({
        include: {
          model: User,
          attributes: ['name', 'account', 'avatar']
        },
        raw: true,
        nest: true
      })
      const topUsers = await User.findAll({ raw: true })
      return res.render('index', { tweets, topUsers })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = tweetsController
