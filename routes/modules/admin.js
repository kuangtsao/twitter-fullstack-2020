const express = require('express')
const passport = require('../config/passport')

const router = express.Router()
const adminController = require('../controllers/adminController.js')

router.get('/admin/signin', adminController.signinPage)
router.post(
  '/admin/signin',
  passport.authenticate('local', {
    failureRedirect: '/admin/signin',
    failureFlash: true
  }),
  adminController.signin
)

module.exports = router
