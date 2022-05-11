const { Tweet, User } = require('../models')
const { getUser } = require('../_helpers')
const tweetsController = {
  getTweets: async (req, res, next) => {
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
      // TODO: topUsers 尚未完成，需要根據 like 術與 follower 數相加
      return res.render('index', { tweets, topUsers })
    } catch (err) {
      next(err)
    }
  },
  getTweet: (req, res, next) => {
    console.log('tweetController.getTweet')
  },
  addTweet: async (req, res, next) => {
    const { description } = req.body
    const UserId = getUser(req).id
    try {
      if (!description || description.trim().length === 0) throw new Error('不能發空白推！')
      if (description.length > 140) throw new Error('推文不能超過140字！')
      await Tweet.create({
        description,
        UserId
      })
      return res.redirect('/tweets')
    } catch (err) {
      next(err)
    }
  },
  createFakePage: (req, res, next) => {
    console.log('tweetController.createFakePage')
  },
  replyFakePage: (req, res, next) => {
    console.log('tweetController.replyFakePage')
  },
  addReply: (req, res, next) => {
    console.log('tweetController.addReply')
  }
}
module.exports = tweetsController
