/**
 * Created by andrea on 06/10/16.
 */

const axios = require('axios')

module.exports = {
  getListPromise: function (numberOfPlayers) {
    let numberOfChoices = numberOfPlayers * 3
    if (numberOfChoices < 15) numberOfChoices = 15
    return axios.get(`https://it.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=${numberOfChoices}&format=json`)
  }
}
