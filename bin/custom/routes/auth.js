const passport = require('passport')
const settings = require('../../../config/settings')
require('../../../config/passport')(passport)
const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../../../models/User')
const cors = require('cors')

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.all('*', cors())

router.post('/register', function (req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Please pass username and password.'})
  } else {
    let newUser = new User({
      username: req.body.username,
      password: req.body.password,
      score: req.body.score
    })
    // save the user
    newUser.save(function (err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'})
      }
      res.json({success: true, msg: 'Successful created new user.'})
    })
  }
})

router.post('/updatescore', function (req, res) {
  console.log('item to be changed id: ' + req.body._id)
  User.findByIdAndUpdate(
    // the id of the item to find
    req.body._id,

    // the change to be made. Mongoose will smartly combine your existing
    // document with this change, which allows for partial updates too
    req.body,

    // an option that asks mongoose to return the updated version
    // of the document instead of the pre-updated one.
    {new: true},

    // the callback function
    (err, user) => {
      // Handle any possible database errors
      if (err) return res.status(500).send(err)
      return res.send(user)
    }
  )
})

router.post('/login', function (req, res) {
  User.findOne({
    username: req.body.username
  }, function (err, user) {
    if (err) throw err

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'})
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          let token = jwt.sign(user.toJSON(), settings.secret)
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token})
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'})
        }
      })
    }
  })
})

router.get('/profile/:username', function (req, res) {
  User.findOne({
    username: req.params.username
  }, function (err, user) {
    if (err) throw err

    if (!user) {
      res.status(401).send({success: false, msg: 'User not found.'})
    } else {
      res.json(user)
    }
  })
})

module.exports = router
