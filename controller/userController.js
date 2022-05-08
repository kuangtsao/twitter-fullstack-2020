const bcrypt = require('bcryptjs')
const { Tweet, User, Like, Reply } = require('../models')
const { Op } = require('sequelize')

const userController = {
  signUpPage: (req, res, next) => {
    return res.render('signup')
  },
  signUp: async (req, res) => {
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
        account,
        name,
        email
      })
    }
    try {
      const user = await User.findOne({ where: { [Op.or]: [{ account }, { email }] } })
      if (user) {
        if (user.account === account) {
          errors.push({ message: 'account 已重複註冊！' })
        } else {
          errors.push({ message: 'email 已重複註冊！' })
        }
      }
      await User.create({
        account,
        name,
        email,
        avatar: 'https://i.pinimg.com/474x/ff/4f/c3/ff4fc37f314916957e1103a2035a11fa.jpg',
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
      })
      req.flash('success_messages', '註冊成功!')
      return res.redirect('/signin')
    } catch (err) {
      console.log(err)
    }
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
  }
}
module.exports = userController
