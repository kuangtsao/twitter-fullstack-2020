const { User } = require('../models')
const helpers = require('../_helpers')
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
imgur.setClientId(IMGUR_CLIENT_ID)

const apiController = {
  editUser: async (req, res, next) => {
    const loginUserId = helpers.getUser(req) && helpers.getUser(req).id
    try {
      const userData = await User.findOne({
        where: {
          id: loginUserId,
          isAdmin: false
        },
        attributes: [
          'id',
          'name',
          'avatar',
          'cover',
          'account',
          'introduction'
        ]
      })
      res.json({
        status: 'success',
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar,
        cover: userData.cover,
        account: userData.account,
        introduction: userData.introduction 
      })
    } catch (err) {
      res.status(400).json({ status: 'fail', cause: err })
      next(err)
    }
  }
}
module.exports = apiController
