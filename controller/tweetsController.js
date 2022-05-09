const { Tweet, User, Like, Reply } = require('../models')

const tweetsController = {
  getTweets: async (req, res, next) => {
    console.log(res.locals.user)
    // 載入所有的 tweets (這裡先 query)
    try {
      const tweets = await Tweet.findAll({
        include: User,
        raw: true,
        nest: true
      })
      console.log(tweets)
      return res.render('index', { tweets })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = tweetsController
