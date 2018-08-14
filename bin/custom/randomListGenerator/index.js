/**
 * Created by andrea on 06/10/16.
 */

const mysocket = require('../mysocket.io')
const axios = require('axios')

module.exports = {
  getListPromise: function () {
    let length = mysocket.clientsConnected()
    if (length < 2) length = 5
    return axios.get(`https://it.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=${length * 3}&format=json`)
  }
}
