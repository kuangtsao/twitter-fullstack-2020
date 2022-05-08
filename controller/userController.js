const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const { Op } = require('sequelize')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    const { account, name, email, password, checkPassword } = req.body
    const errors = []
    User.findOne({
      where: {
        [Op.or]: [{ account }, { email }]
      }
    }).then(user => {
      if (user) {
        if (user.account === account) {
          errors.push({ message: '帳號已重覆註冊！' })
        } else {
          errors.push({ message: 'Email已重覆註冊!' })
        }
        return res.render('signup', {
          errors,
          account,
          name,
          email,
          password,
          checkPassword
        })
      } else {
        req.flash('success_messages', '註冊成功!')
        return User.create({
          account,
          name,
          email,
          password: bcrypt.hashSync(
            req.body.password,
            bcrypt.genSaltSync(10),
            null
          )
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
  }
}
module.exports = userController
