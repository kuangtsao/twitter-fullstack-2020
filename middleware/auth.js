const helpers = require('../_helpers')
const authenticated = (req, res, next) => {
  // if (req.isAuthenticated)
  if (helpers.ensureAuthenticated(req)) {
    const user = helpers.getUser(req)
    if (user && user.role && user.role === 'admin') {
      return res.redirect('/admin/tweets')
    }
    return next()
  }
  req.flash('warning_msg', '請先登入才能使用！')
  res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).role === 'admin') {
      return next()
    }
    return res.redirect('/')
  }
  req.flash('warning_msg', '請先登入才能使用！')
  res.redirect('/admin/signin')
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
