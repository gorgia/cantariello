const myCache = require('../cache').myCache
const circularIterator = require('circular-iterator')
const randomListGenerator = require('../randomListGenerator')
const User = require('../../../models/User')
const GameStatus = require('./GameStatus').GameStatus

const GAME_STATUS = require('./GameStatus').GAME_STATUS

module.exports = class Game {
  constructor (props) {
    this.io = props.io
    this.playerSocketMap = new Map()
    this.userIdPlayerFirstChoiceMap = new Map()
    this.turnController = null
    this.userIdUserMapInPlay = new Map()
    this.gameStatus = GAME_STATUS.WAIT_FOR_START
    this.gameMessage = ''
    this.choiceList = []
    this.startingUserIdUserMap = new Map()
    this.playerTurn = null
  }

  listenOnGame () {
    let self = this
    this.io.on('connection', (socket) => {
      this.updateAndGetNumberOfClientsConnected()
      console.log(`Client connected [id=${socket.id}], number of clients: ${this.updateAndGetNumberOfClientsConnected()}`)
      let user = JSON.parse(socket.handshake.query.user)
      console.log(`retrieved user connected\n${user}`)
      this.playerSocketMap.set(user._id, socket.id)
      this.userIdUserMapInPlay.set(user._id, user)
      self.io.emit('NUMBER_OF_CLIENTS_CONNECTED', { numberOfClients: self.updateAndGetNumberOfClientsConnected(), numberOfPlayers: self.numberOfPlayers })
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
        socket.emit('GAME_STATUS', {gameMessage: 'Please wait for other players making their choice'})
        self.processPlayerFirstChoice(data.user, data.playerFirstChoice)
      })
      socket.on('PLAYER_TURN_CHOICE', function (data) {
        console.log(`PLAYER_TURN_CHOICE_RECEIVED`, data)
        self.processPlayerChoice(data.player, data.choice)
      })
      socket.on('disconnect', function () {
        console.log(`DISCONNECT: NUMBER_OF_CLIENTS_CONNECTED:` + { numberOfClients: self.updateAndGetNumberOfClientsConnected(), numberOfPlayers: self.numberOfPlayers })
        self.io.emit('NUMBER_OF_CLIENTS_CONNECTED', { numberOfClients: self.updateAndGetNumberOfClientsConnected(), numberOfPlayers: self.numberOfPlayers })
      })
      socket.on('START_GAME', function () {
        console.log(`START_GAME received`)
        self.emitGameMessage(`Game started with ${self.userIdUserMapInPlay.size} players. Please make your choice`)
        self.startGame()
      })
      socket.on('REQUEST_GAME_STATUS', function (userId, callback) {
        console.log(`userId = ${userId} request game status`)
        let playerChoice = self.userIdPlayerFirstChoiceMap.get(userId)
        let playersInPlay = [...self.userIdUserMapInPlay.values()].map(a => a.username)
        let gameStatsExpanded = { gameStatus: self.gameStatus, choiceList: self.choiceList, playerChoice: playerChoice, playersInPlay: playersInPlay, playerTurn: self.playerTurn }
        if (self.gameStatus === GAME_STATUS.WAIT_FOR_START) self.emitGameMessage('Waiting for other players to reach this page then push the button')
        callback(gameStatsExpanded)
      })
      socket.on('GET_NUMBER_OF_CLIENTS_CONNECTED', function () {
        self.io.emit('NUMBER_OF_CLIENTS_CONNECTED', { numberOfClients: self.updateAndGetNumberOfClientsConnected(), numberOfPlayers: self.numberOfPlayers })
      })
    })
  }

  startGame () {
    let self = this
    let numberOfPlayers = self.userIdUserMapInPlay.size
    this.gameStatus = GAME_STATUS.WAIT_FOR_PLAYERCHOICE
    randomListGenerator.getListPromise(numberOfPlayers).then(function (choiceList) {
      self.choiceList = choiceList.data.query.random
      // self.io.emit('GAME_MESSAGE', 'Please make your choice')
      self.io.emit(`GAME_STATUS`, { gameStatus: self.gameStatus, choiceList: self.choiceList, gameMessage: 'please make your choice' })
    })
  }

  processPlayerFirstChoice (user, firstChoice) {
    this.userIdPlayerFirstChoiceMap.set(user._id, firstChoice)
    if (this.userIdUserMapInPlay.size === this.userIdPlayerFirstChoiceMap.size) {
      this.turnController = this.getOrderedTurnController()
      this.nextGameTurn()
    }
  }

  nextGameTurn () {
    this.gameStatus = GAME_STATUS.PLAYING
    this.playerTurn = this.getNextPlayer()
    let playersInPlay = [...this.userIdUserMapInPlay.values()].map(a => a.username)
    let objectGameStatus = {gameStatus: this.gameStatus, playerTurn: this.playerTurn, playersInPlay: playersInPlay, gameMessage: `It's the turn of ${this.playerTurn.username}`}
    console.log(`Now it's turn of player ${this.playerTurn.username}`)
    console.log(`Players in play: ${playersInPlay}`)
    this.io.emit('GAME_STATUS', objectGameStatus)
  }

  getOrderedTurnController () {
    let playerList = [...this.userIdUserMapInPlay.values()]
    playerList.sort((u1, u2) => {
      if (u1.score > u2.score) {
        return 1
      }
      if (u1.score < u2.score) {
        return -1
      }
      return 0
    })
    return circularIterator(playerList)
  }

  getNextPlayer () {
    let nextPlayer = null
    do {
      nextPlayer = this.turnController.next().value
    } while (this.userIdUserMapInPlay[nextPlayer._id]) //
    return nextPlayer
  }

  addPlayerToPlayerList (socketid, user) {
    this.playerSocketMap.set(socketid, user)
  }

  updateAndGetNumberOfClientsConnected () {
    const srvSockets = this.io.sockets.sockets
    let numberOfClientsConnected = Object.keys(srvSockets).length
    console.log(`Number of clients connected = ${numberOfClientsConnected} | Number of players connected = ${this.userIdUserMapInPlay.size}`)
    return numberOfClientsConnected
  }

  processPlayerChoice (player, choice) {
    let usersEliminated = this.eliminatePlayersByChoice(choice)
    let gameEnded = false
    if (usersEliminated.length > 0) {
      let usernamesEliminated = usersEliminated.map(a => a.username)
      let usernamesInPlay = [...this.userIdUserMapInPlay.values()].map(a => a.username)
      this.io.emit('GAME_STATUS', {playersEliminated: usernamesEliminated, playersInPlay: usernamesInPlay})
      if (this.checkEndGame()) {
        this.endGame([...this.userIdUserMapInPlay.values()])
        let lastGameMessage = `the winners are: ${[...this.userIdUserMapInPlay.values()].map(a => a.username)} by ${this.startingUserIdUserMap.size}`
        this.io.emit('GAME_STATUS', {gameMessage: lastGameMessage, gameStatus: GAME_STATUS.WAIT_FOR_START})
        gameEnded = true
      }
    }
    if (!gameEnded) {
      this.disableButton(choice)
      this.io.emit('GAME_STATUS', {choiceList: this.choiceList})
      this.nextGameTurn()
    }
  }

  eliminatePlayersByChoice (choice) {
    let usersEliminated = []
    let self = this
      self.userIdPlayerFirstChoiceMap.forEach((value, key) => {
        if (value === choice) {
          let userEliminated = self.eliminatePlayerByUserId(key)
          if (userEliminated) usersEliminated.push(userEliminated)
          this.userIdPlayerFirstChoiceMap.delete(key)
        }
      })
    return usersEliminated
  }

  eliminatePlayerByUserId (userId) {
    let playerToBeEliminated = this.userIdUserMapInPlay.get(userId)
    let userEliminated = Object.assign(playerToBeEliminated)
    this.userIdUserMapInPlay.delete(userId)
    return userEliminated
  }

  disableButton (btnValue) {
    let index = this.choiceList.findIndex(el => el.id === btnValue)
    if (index) {
      this.choiceList[index].disabled = true
    }
  }

  emitGameMessage (message) {
    this.gameMessage = message
    this.io.emit(message)
  }

  checkEndGame () {
    if (this.userIdUserMapInPlay.size === 1) return true
    let availabledchoices = this.choiceList.filter(function (btn) {
      return btn.disabled
    })
    return availabledchoices.length > 1
  }

  endGame (winnerPlayers) {
    // update participations
    let self = this
    this.startingUserIdUserMap.forEach(function (value, key) {
        User.findOne({_id: key}, function (err, doc) {
          if (err) {
            return 'mongo error'
          }
          doc.participations.$inc()
          doc.save()
        })
      }
    )
    // update score of the winners
    winnerPlayers.forEach(winnerPlayer => {
        User.findOne({_id: winnerPlayer._id}, function (err, doc) {
          if (err) {
            return 'mongo error'
          }
          doc.score = doc.score + self.startingUserIdUserMap.size
          doc.save()
        })
      }
    )
  }
}
