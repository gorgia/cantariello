
const express = require('express')
const router = express.Router()
const cors = require('cors')
const mysocket = require('../mysocket.io')
const randomListGenerator = require('../randomListGenerator')
const myCache = require('../cache').myCache

router.all('*', cors())

router.get('/usersconnected', function (req, res) {
  let clientsConnected = mysocket.clientsConnected()
  // debug
  if (clientsConnected <= 0) clientsConnected = 5
  // end debug
  if ((!clientsConnected) || (clientsConnected < 1)) res.status(500).send({success: false, msg: 'no clients connected'})
  else res.json(clientsConnected)
})

router.get('/randomlist', function (req, res) {
    if (myCache.get('choiceList')) res.json(myCache.get('choiceList'))
    else {
      let response = randomListGenerator.getListPromise(5)
      response
        .then(
          function (response) {
            console.log(response)
            let randomList = response.data.query.random
            let list = correctList(randomList)
            myCache.set('choiceList', list)
            console.log(`Returning list value:\n${list}`)
            res.json(list)
          }
        )
        .catch(function (error) {
          console.log(error)
        })
    }
})

function correctList (randomList) {
  let correctedList = []
  randomList.forEach(function (jsonEl) {
    let newJson = {}
    newJson.value = jsonEl.id
    newJson.text = jsonEl.title
    newJson.state = false
    correctedList.push(newJson)
  })
  console.log(correctedList)
  return correctedList// chunk(correctedList, 3)
}

module.exports = router
