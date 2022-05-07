const express = require('express')
const router = express.Router()
// const { authenticated } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')
const passport = require('../config/passport')
const userController = require('../controller/userController')
const exampleController = require('../controller/example-controller')

// 使用者登入
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
// 使用者註冊
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/logout', userController.logout)
router.get('/', exampleController.indexPage)
router.use('/', generalErrorHandler)

module.exports = router
