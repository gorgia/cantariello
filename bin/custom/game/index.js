const myCache = require('../cache').myCache
const circularIterator = require('circular-iterator')
const randomListGenerator = require('../randomListGenerator')

const GAME_STATUS = Object.freeze({
  WAIT_FOR_START: 'WAIT_FOR_START',
  WAIT_FOR_PLAYERCHOICE: 'WAIT_FOR_PLAYERCHOICE',
  PLAYING: 'PLAYING'
})

module.exports = class Game {
  constructor (props) {
    this.io = props.io
    this.playerSocketMap = new Map()
    this.userIdPlayerFirstChoiceMap = new Map()
    this.playerList = []
    this.turnController = null
    this.userIdUserMap = new Map()
    this.gamestatus = GAME_STATUS.WAIT_FOR_START
    // this.waitForGameStart()
  }

  listenOnGame () {
    let self = this
    this.io.on('connection', (socket) => {
      this.updateAndGetNumberOfClientsConnected()
      console.log(`Client connected [id=${socket.id}], number of clients: ${this.updateAndGetNumberOfClientsConnected()}`)
      let user = JSON.parse(socket.handshake.query.user)
      console.log(`retrieved user connected\n${user}`)
      this.playerSocketMap.set(user._id, socket.id)
      this.userIdUserMap.set(user._id, user)
      self.io.emit('NUMBER_OF_CLIENTS_CONNECTED', this.updateAndGetNumberOfClientsConnected())
      socket.on('CHAT_MESSAGE', function (data) {
        console.log(`chat message: ${data.message} | received from ${data.username}`)
        // self.io.emit('MESSAGE', `${data.username}:${data.message}`)
        let messagetosend = `${data.username}:${data.message}`
        self.io.emit('MESSAGE', messagetosend)
      })
      socket.on('SEND_MESSAGE', function (data) {
        console.log(`message: ${data.message} | received from ${data.username}`)
        // self.io.emit('MESSAGE', `${data.username}:${data.message}`)
        let messagetosend = `${data.username}:${data.message}`
        self.io.emit('MESSAGE', messagetosend)
      })
      socket.on('FIRST_CHOICE', function (data) {
        console.log('FIRST_CHOICE_RECEIVED:' + data)
        console.log(`data is \n${data.user}`)
        self.userIdPlayerFirstChoiceMap.set(data.user._id, data.playerFirstChoice)
        // self.io.emit('FIRST_CHOICE_RECEIVED', data)
        socket.emit('GAME_MESSAGE', 'Please wait for other players')
        self.waitForPlayersFirstChoice()
      })
      socket.on('PLAYER_TURN_CHOICE', function (data) {
        console.log(`PLAYER_TURN_CHOICE_RECEIVED`, data)
        self.io.emit(`DISABLE_BUTTON`)
      })
      socket.on('disconnect', function () {
        console.log(`DISCONNECT: NUMBER_OF_CLIENTS_CONNECTED:${self.updateAndGetNumberOfClientsConnected()}`)
        self.io.emit('NUMBER_OF_CLIENTS_CONNECTED', self.updateAndGetNumberOfClientsConnected())
      })
      socket.on('START_GAME', function () {
        console.log(`START_GAME received`)
        self.startGame(self.playerList.length)
      })
      socket.on('REQUEST_GAME_STATUS', function (data, callback) {
        console.log(`username = ${data}`)
        let gameStatsExpanded = {gameStatus: self.gamestatus, choiceList: myCache.get('choiceList')}
        callback(gameStatsExpanded)
      })
      socket.on('GET_NUMBER_OF_CLIENTS_CONNECTED', function () {
        let numberOfClientsConnected = self.updateAndGetNumberOfClientsConnected()
        console.log(`GET_NUMBER_OF_CLIENTS_CONNECTED requested : ${numberOfClientsConnected}`)
        self.io.emit('NUMBER_OF_CLIENTS_CONNECTED', numberOfClientsConnected)
      })
    })
  }

  startGame (numberOfPlayers) {
    this.gamestatus = GAME_STATUS.WAIT_FOR_PLAYERCHOICE
    this.io.emit(`GAME_STATUS`, this.gamestatus)
    this.io.emit('GAME_MESSAGE', 'Please make your choice')
    myCache.set('choiceList', null)
    this.sendUpdatedChoiceList(numberOfPlayers, this.gamestatus)
  }

  waitForPlayersFirstChoice () {
    if (this.userIdUserMap.size === this.userIdPlayerFirstChoiceMap.size) {
      this.orderPLayerListByScore()
      this.turnController = circularIterator(Array.from(this.userIdUserMap.values()))
      this.nextGameTurn()
    }
  }

  sendUpdatedChoiceList (numberOfPlayers, gameStatus) {
    let choiceList
    // if (myCache.get('choiceList')) choiceList = myCache.get('choiceList')
    // else
    choiceList = randomListGenerator.getListPromise(numberOfPlayers)
    this.io.emit('UPDATE_STATUS', {choiceList: choiceList, gameStatus: gameStatus})
  }

  nextGameTurn () {
    this.gamestatus = GAME_STATUS.PLAYING
    let actualPlayer = this.turnController.next().value
    console.log(`Now it's turn of player ${actualPlayer}`)
    this.io.emit('GAME_STATUS', this.gamestatus)
    this.io.emit(`PLAYER_TURN`, {actualPlayer})
    this.io.emit('GAME_MESSAGE', `It's the turn of ${actualPlayer.username}`)
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

  updateAndGetNumberOfClientsConnected () {
    const srvSockets = this.io.sockets.sockets
    let numberOfClientsConnected = Object.keys(srvSockets).length
    console.log('Number of players connected = ' + numberOfClientsConnected)
    return numberOfClientsConnected
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
