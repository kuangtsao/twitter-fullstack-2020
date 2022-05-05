const express = require('express')
const helpers = require('./_helpers')
const handlebars = require('express-handlebars')
const methodOverride = require('method-override')

const routes = require('./routes')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const port = process.env.PORT || 3000

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.engine('hbs', handlebars({ extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(express.urlencoded({ extend: true }))

app.use(methodOverride('_method'))

app.use(routes)
app.listen(port, () => console.log(`alphitter listening on port ${port}!`))

module.exports = app
