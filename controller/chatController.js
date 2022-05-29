const { User } = require('../models')
const helpers = require('../_helpers')

const chatController = {
  test: async (req, res, next) => {
    try {
      return res.render('chat')
    } catch (err) {
      next(err)
    }
  }
}
module.exports = chatController
