
const express = require('express')
const router = express.Router()
const cors = require('cors')
const randomListGenerator = require('../randomListGenerator')
const myCache = require('../cache').myCache

router.all('*', cors())

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
