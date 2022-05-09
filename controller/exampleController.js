// const { getUser } = require('../_helpers')

const exampleController = {
  indexPage: (req, res, next) => {
    res.render('index')
  }
}

module.exports = exampleController
