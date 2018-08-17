const myCache = require('../cache').myCache

module.exports = class Game {
  constructor (props) {
    this.io = props.io
    this.playerList = new Map()
    this.playerChoice = new Map()
  }

  listenOnGame () {
    let self = this
    this.io.on('connection', (socket) => {
      console.log(`Client connected [id=${socket.id}], number of clients: ${this.clientsConnected()}`)
      let user = socket.handshake.query.user
      console.log(`retrieved user connected\n${user}`)
      this.playerList.set(socket.id, user)
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
      socket.on('PLAYER_TURN_CHOICE', function (data) {
        console.log(`PLAYER_TURN_CHOICE_RECEIVED`, data)
        self.io.emit(`DISABLE_BUTTON`)
      })
    })
  }

  addPlayerToPlayerList (socketid, user) {
    this.playerList.set(socketid, user)
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
      this.playerChoice.forEach((key, value) => {
        if (value === choice) {
          let userEliminated = self.eliminatePlayerByUserId(key)
          if (userEliminated) usersEliminated.push(userEliminated)
          this.playerChoice.delete(key)
        }
      })
    return usersEliminated
  }

  eliminatePlayerByUserId (userId) {
    let userEliminated = null
    this.playerList.forEach(function (key, value) {
      if (value._id === userId) {
        userEliminated = value
        this.playerList.delete(key)
      }
    })
    return userEliminated
  }
}
