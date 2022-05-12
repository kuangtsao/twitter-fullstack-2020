const bcrypt = require('bcryptjs')
const { Tweet, User, Like, Reply, Followship } = require('../models')
const { Op } = require('sequelize')
const helpers = require('../_helpers')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    const { account, name, email, password, passwordCheck } = req.body
    const errors = []
    if (!account || !name || !email || !password || !passwordCheck) {
      errors.push({ message: '所有欄位都是必填。' })
    }
    if (password !== passwordCheck) {
      errors.push({ message: '密碼與確認密碼不相符！' })
    }
    if (name.length > 50) {
      errors.push({ message: '名稱上限為50字！' })
    }
    if (errors.length) {
      return res.render('signup', {
        errors,
        name,
        email,
        account
      })
    }

    User.findOne({
      where: {
        [Op.or]: [{ account }, { email }]
      }
    }).then(user => {
      if (user) {
        if (user.account === account) {
          errors.push({ message: 'account 已重複註冊！' })
        } else {
          errors.push({ message: 'email 已重複註冊！' })
        }
        return res.render('signup', {
          errors,
          account,
          name,
          email,
          password,
          passwordCheck
        })
      } else {
        req.flash('success_messages', '註冊成功!')
        return User.create({
          account,
          name,
          email,
          avatar: 'https://i.pinimg.com/474x/ff/4f/c3/ff4fc37f314916957e1103a2035a11fa.jpg',
          password: bcrypt.hashSync(
            req.body.password,
            bcrypt.genSaltSync(10),
            null
          ),
          role: 'user'
        }).then(user => {
          res.redirect('/signin')
        })
      }
    })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/tweets')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: async (req, res, next) => {
    try {
      const userId = req.params.id
      const paramsUser = await User.findByPk(userId, {
        include: [
          { model: Tweet, include: Reply },
          { model: Reply, include: User },
          { model: Like },
          { model: User, as: 'Followings' },
          { model: User, as: 'Followers' }
        ]
      })
      if (!paramsUser) throw new Error("user didn't exist!")
      // console.log('passport_user:', helpers.getUser(req).Followings)
      const isFollowed = helpers.getUser(req).Followings && helpers.getUser(req).Followings.some(f => f.id === Number(userId))
      return res.render('user', {
        user: paramsUser.toJSON(),
        isFollowed
      })
    } catch (err) {
      next(err)
    }
  },
  getLikes: async (req, res, next) => {
    try {
      const userId = req.params.id
      const user = await User.findByPk(userId, {
        include: [
          { model: Like, include: [{ model: Tweet, include: [Reply] }] }
        ],
        order: [
          ['updatedAt', 'DESC']
        ]
      })
      if (!user) throw new Error("user didn't exist!")
      const tweets = user.toJSON().Likes.map(tweet => ({
        ...tweet,
        isLiked: true
      }))
      return res.render('likes', {
        tweets
      })
    } catch (err) {
      next(err)
    }
  },
  getUserTweets: async (req, res, next) => {
    try {
      const userId = req.params.id
      const user = await User.findByPk(userId, {
        include: [
          { model: Tweet, include: [Reply, Like] }
        ],
        order: [
          [Tweet, 'updatedAt', 'DESC']
        ]
      })
      if (!user) throw new Error("user didn't exist!")

      return res.render('tweets', {
        tweets: user.toJSON().Tweets
      })
    } catch (err) {
      next(err)
    }
  },
  getReplies: async (req, res, next) => {
    try {
      const userId = req.params.id
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Reply,
            include: [{
              model: Tweet,
              include: [{
                model: User,
                attributes: ['name']
              }]
            }]
          }
        ],
        order: [
          [Reply, 'updatedAt', 'DESC']
        ]
      })
      if (!user) throw new Error("user didn't exist!")
      return res.render('replies', {
        user: user.toJSON()
      })
    } catch (err) {
      next(err)
    }
  },
  addLike: (req, res, next) => {
    const { tweetId } = req.params
    return Promise.all([
      Tweet.findByPk(tweetId),
      Like.findOne({
        where: {
          userId: helpers.getUser(req).id,
          tweetId
        }
      })
    ])
      .then(([tweet, like]) => {
        if (!tweet) throw new Error("Tweet didn't exist!")
        if (like) throw new Error('You have already liked')
        return Like.create({
          userId: helpers.getUser(req).id,
          tweetId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    return Like.findOne({
      where: {
        userId: helpers.getUser(req).id,
        tweetId: req.params.tweetId
      }
    })
      .then(like => {
        if (!like) throw new Error("You haven't liked ")
        return like.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  addFollowing: async (req, res, next) => {
    try {
      const { id } = req.params
      if (Number(id) === (helpers.getUser(req) && helpers.getUser(req).id)) throw new Error("CAN'T DO THAT SHIT")
      const user = await User.findByPk(id)
      if (!user) throw new Error("User didn't exist!")
      const followship = await Followship.findOne({
        where: {
          followerId: helpers.getUser(req).id,
          followingId: req.params.id
        }
      })
      if (followship) throw new Error('You are already following this user!')
      await Followship.create({
        followerId: helpers.getUser(req).id,
        followingId: id
      })
      return res.redirect('back')
    } catch (err) {
      next(err)
    }
  },
  removeFollowing: async (req, res, next) => {
    try {
      const followship = await Followship.findOne({
        where: {
          followerId: helpers.getUser(req).id,
          followingId: req.params.id
        }
      })
      if (!followship) throw new Error("You haven't followed this user!")
      await followship.destroy()
      return res.redirect('back')
    } catch (err) {
      next(err)
    }
  },
  getFollowings: async (req, res, next) => {
    try {
      const followings = await User.findByPk(req.params.id, {
        include: [
          { model: User, as: 'Followings', attributes: ['id'] }
        ]
      })
      const currentUserId = req.params.id
      const currentUserName = followings.toJSON().name
      const currentUserTweetCount = await Tweet.count({
        where: {
          UserId: currentUserId
        }
      })
      // followingUserId = paramsUserId 的 followings UserId
      const followingUserId = followings.toJSON().Followings.map(fu => fu.id)
      const followingUserTweets = await Tweet.findAll({
        include: [{ model: User, attributes: ['id', 'name', 'avatar', 'account'] }],
        where: { UserId: followingUserId },
        order: [
          ['createdAt', 'DESC']
        ],
        raw: true,
        nest: true
      })
      const data = followingUserTweets.map(tweet => ({
        ...tweet,
        isFollowed: helpers.getUser(req) && helpers.getUser(req).Followings.some(f => f.id === tweet.UserId)
      }))

      return res.render('followings', {
        tweets: data,
        currentUserId,
        currentUserName,
        currentUserTweetCount
      })
    } catch (err) {
      next(err)
    }
  },
  getFollowers: async (req, res, next) => {
    try {
      const currentUserId = req.params.id
      const currentUser = await User.findByPk(currentUserId, {
        attributes: ['id', 'name', 'account'],
        include: [
          {
            model: User,
            as: 'Followers',
            attributes: ['id', 'avatar', 'name', 'account', 'introduction']
          },
          { model: Tweet, attributes: ['id'] } // 算 currentUser 的推文數
        ]
      })
      // console.log('currentUser.toJSON()', currentUser.toJSON().Followers)
      const data = currentUser.toJSON().Followers.map(cf => ({
        ...cf,
        isFollowed: helpers.getUser(req) && helpers.getUser(req).Followings.some(f => f.id === cf.id)
      }))
      console.log('helpers.getUser(req).Followers', helpers.getUser(req).Followers)
      console.log('data', data)
      return res.render('followers', {
        currentUser: currentUser.toJSON(),
        followers: data,
        currentUserId
      })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = userController
