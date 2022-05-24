const path = require('path')
const express = require('express')
const helpers = require('./_helpers')
const handlebars = require('express-handlebars')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('./config/passport')
const routes = require('./routes')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const port = process.env.PORT || 3000
const SESSION_SECRET = process.env.SESSION_SECRET

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')

app.use(express.urlencoded({ extended: true }))

app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static('public'))
app.use(methodOverride('_method'))
app.use(flash())
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.warning_msg = req.flash('warning_msg')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.error = req.flash('error')
  res.locals.user = helpers.getUser(req)
  res.locals.logInUser = helpers.getUser(req)
  next()
})

app.use(routes)

const messages = [
  { name: 'JohnDou', message: 'Welcome!' },
  { name: 'meeeee', message: 'history' }
]

io.on('connection', socket => {
  console.log('user connected 上線ID: ', socket.id)

  // 發送目前儲存已經發過的所有歷史訊息
  io.emit('allMessage', messages)

  // 監聽訊息
  // socket.on('getMessage', message => {
  //   console.log('服務端 接收 訊息: ', message)

  // 監聽 sendMessage message, 存起來 再傳送 message 給所有客戶端
  socket.on('sendMessage', function (message) {
    console.log('client端傳來 sendMessage 訊息: ', message)
    messages.push(message)
    // 當收到事件的時候，發送一個 "newMessage" 事件給所有的連線用戶
    io.emit('newMessage', { message })
  })
    
  // 連接斷開
  socket.on('disconnect', () => {
    console.log('有人離開了！， 下線ID: ', socket.id)
  })
})

// app.listen(port, () => console.log(`app listening on port ${port}!`))
server.listen(port, () => {
  console.log(`app is on http://localhost:${port}`)
})

module.exports = app
