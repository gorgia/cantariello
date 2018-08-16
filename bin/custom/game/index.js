const axios = require('axios')
const myCache = require('../cache').myCache

module.exports = class Game {
  constructor (props) {
    this.io = props.io
    this.playerList = props.playerList
    this.playerFirstChoiceList = props.playerFirstChoiceList
    this.playerChoice = new Map()
  }

  listenOnGame () {
    let self = this
    this.io.on('connection', (socket) => {
      console.log(`Client connected [id=${socket.id}], number of clients: ${this.clientsConnected()}`)
      console.log(`retrieved user connected\n${socket.handshake.query.user}`)
      socket.on('SEND_MESSAGE', function (data) {
        console.log('SEND_MESSAGE:' + data)
        self.io.emit('MESSAGE', data)
      })
      socket.on('FIRST_CHOICE', function (data) {
        console.log('FIRST_CHOICE_RECEIVED:' + data)
        console.log(`data is \n${data.user}`)
        self.playerChoice.set(data.user._id, data.playerFirstChoice)
        self.io.emit('FIRST_CHOICE_RECEIVED', data)
      })
    })
  }

  clientsConnected () {
    const srvSockets = this.io.sockets.sockets
    let clientsConnected = Object.keys(srvSockets).length
    myCache.set(`clientsConnected`, clientsConnected)
    return clientsConnected
  }
}
