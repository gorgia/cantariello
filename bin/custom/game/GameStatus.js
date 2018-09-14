
let GAME_STATUS = Object.freeze({
  WAIT_FOR_START: 'WAIT_FOR_START',
  WAIT_FOR_PLAYERCHOICE: 'WAIT_FOR_PLAYERCHOICE',
  PLAYING: 'PLAYING'
})

let GameStatus = class GameStatus {
  constructor (GameStatus, startingPlayerList) {
    this.status = GAME_STATUS.WAIT_FOR_START
    this.playerTurn = null
    this.choiceList = []
    this.playerList = startingPlayerList
    this.startingPlayerList = startingPlayerList
    this.gameMessage = ''
  }
}

module.exports = {
  GAME_STATUS: GAME_STATUS,
  GameStatus: GameStatus
}
