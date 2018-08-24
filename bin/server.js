
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())

const book = require('./custom/routes/book')
const auth = require('./custom/routes/auth')
const service = require('./custom/routes/service')

const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

mongoose.connect('mongodb://localhost/mevn-secure', { promiseLibrary: require('bluebird') })
  .then(() => console.log('mongoose: server connection to mongo succesful'))
  .catch((err) => console.error(err))

// allow cors origins for debug

app.use(favicon(path.join(__dirname, '/favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({'extended': 'false'}))
app.use(express.static(path.join(__dirname, '..', 'dist')))
app.set('view engine', 'html')
app.use('/books', express.static(path.join(__dirname, 'dist')))
app.use('/book', book)
app.use('/api/auth', auth)
app.use('/service', service)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// restful api error handler
app.use(function (err, req, res, next) {
  console.log(err)
  if (req.app.get('env') !== 'development') {
      delete err.stack
  }
  res.status(err.statusCode || 500).json(err)
})

module.exports = app
