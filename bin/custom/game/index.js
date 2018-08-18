const myCache = require('../cache').myCache
const circularIterator = require('circular-iterator')

module.exports = class Game {
  constructor (props) {
    this.io = props.io
    this.playerSocketMap = new Map()
    this.userIdPlayerFirstChoiceMap = new Map()
    this.playerList = []
    this.turnController = null
    this.listenOnGame()
    this.waitForGameStart()
  }

  listenOnGame () {
    let self = this
    this.io.on('connection', (socket) => {
      console.log(`Client connected [id=${socket.id}], number of clients: ${this.clientsConnected()}`)
      let user = socket.handshake.query.user
      console.log(`retrieved user connected\n${user}`)
      this.playerSocketMap.set(user.id, socket.id)
      this.playerList.push(user)
      socket.on('SEND_MESSAGE', function (data) {
        console.log('SEND_MESSAGE:' + data)
        self.io.emit('MESSAGE', data)
      })
      socket.on('FIRST_CHOICE', function (data) {
        console.log('FIRST_CHOICE_RECEIVED:' + data)
        console.log(`data is \n${data.user}`)
        self.userIdPlayerFirstChoiceMap.set(data.user._id, data.playerFirstChoice)
        self.io.emit('FIRST_CHOICE_RECEIVED', data)
      })
      socket.on('PLAYER_TURN_CHOICE', function (data) {
        console.log(`PLAYER_TURN_CHOICE_RECEIVED`, data)
        self.io.emit(`DISABLE_BUTTON`)
      })
    })
  }

  async waitForGameStart () {
    let promise = new Promise((resolve, reject) => {
      (function waitForAllPlayersFirtsChoie () {
        if (this.userIdPlayerFirstChoiceMap.size === this.playerSocketMap.size) {
          resolve(true)
        }
      })()
    })
    await promise
    this.orderPLayerListByScore()
    this.turnController = circularIterator(this.playerList)
    this.nextGameTurn()
  }

  nextGameTurn () {
    let actualPlayer = this.turnController.next
    // let actualPlayerSocket = this.playerSocketMap[actualPlayer._id]
    this.io.emit(`PLAYER_TURN`, {actualPlayer})
  }

  orderPLayerListByScore () {
    this.playerList.sort((u1, u2) => {
      if (u1.score > u2.score) {
        return 1
      }
      if (u1.score < u2.score) {
        return -1
      }
      return 0
    })
  }

  addPlayerToPlayerList (socketid, user) {
    this.playerSocketMap.set(socketid, user)
  }

  clientsConnected () {
    const srvSockets = this.io.sockets.sockets
    let clientsConnected = Object.keys(srvSockets).length
    myCache.set(`clientsConnected`, clientsConnected)
    return clientsConnected
  }

  processPlayerChoice (player, choice) {
    let usersEliminated = this.eliminatePlayersByChoice(choice)
    this.io.emit('PLAYERS_ELIMINATED', usersEliminated)
  }

  eliminatePlayersByChoice (choice) {
    let usersEliminated = []
    let self = this
      this.userIdPlayerFirstChoiceMap.forEach((key, value) => {
        if (value === choice) {
          let userEliminated = self.eliminatePlayerByUserId(key)
          if (userEliminated) usersEliminated.push(userEliminated)
          this.userIdPlayerFirstChoiceMap.delete(key)
        }
      })
    return usersEliminated
  }

  eliminatePlayerByUserId (userId) {
    let userEliminated = null
    this.playerSocketMap.forEach(function (key, value) {
      if (value._id === userId) {
        userEliminated = value
        this.playerSocketMap.delete(key)
      }
    })
    return userEliminated
  }
}
