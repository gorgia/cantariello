import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'
import createPersistedState from 'vuex-persistedstate'
import config from '../config'

Vue.use(Vuex)

// const config = require('../config')
const HOSTNAME = config.HOSTNAME
const GAME_STATUS = config.GAME_STATUS
const LOGIN = 'LOGIN'
const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
const LOGOUT = 'LOGOUT'

const moduleLogin = {
  state: {
    isLoggedIn: false,
    pending: false,
    userName: '',
    user: null
  },
  mutations: {
    [LOGIN] (state) {
      state.pending = true
    },
    [LOGIN_SUCCESS] (state) {
      state.isLoggedIn = true
      state.pending = false
      state.isLoggedIn = localStorage.getItem('token')
      state.userName = localStorage.getItem('userName')
      state.user = JSON.parse(localStorage.getItem('user'))
    },
    [LOGOUT] (state) {
      state.isLoggedIn = false
      state.userName = ''
      state.pending = false
    },
    initialiseStore (state) {
      if (localStorage.getItem('token')) {
        state.isLoggedIn = localStorage.getItem('token')
        state.userName = localStorage.getItem('userName')
        state.user = JSON.parse(localStorage.getItem('user'))
      }
    }
  },
  actions: {
    login ({
            state,
            commit,
            rootState
          }, creds) {
      console.log('login...', creds)
      commit(LOGIN) // show spinner
      const user = creds.user
      return new Promise(resolve => {
        setTimeout(() => {
          console.log(`${user.username} user in login action\n${user}`)
          localStorage.setItem('token', 'JWT')
          localStorage.setItem('userName', creds.user.username)
          localStorage.setItem('user', JSON.stringify(user))
          commit(LOGIN_SUCCESS)
          resolve()
        }, 1000)
      })
    },
    logout ({commit}) {
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      localStorage.removeItem('user')
      commit(LOGOUT)
    }
  },
  getters: {
    isLoggedIn: state => {
      return state.isLoggedIn
    },
    userName: state => {
      return state.userName
    },
    user: state => {
      return state.user
    }
  }
}

const LOAD_FINISHED = 'LOAD_FINISHED'
const LOADING = 'LOADING'
const PLAYER_WAIT = 'PLAYER_WAIT'
const PLAYER_PLAY = 'PLAYER_PLAY'
const GAME_STARTED = 'GAME_STARTED'
const PLAYER_CHOICE_WAIT = `PLAYER_CHOICE_WAIT`

const moduleChoiceList = {
  state: {
    choiceList: [],
    playerChoice: null,
    playerWait: false,
    gameMessage: 'Wait for all players to reach this page then push the button',
    playerTurn: null,
    gameStatus: GAME_STATUS.WAIT_FOR_START,
    playersInPlay: [],
    playersEliminated: [],
    sendButtonEnabled: true
  },
  mutations: {
    setChoiceList (state, list) {
      state.choiceList = list
    },
    [LOAD_FINISHED] (state) {
      state.isLoading = false
    },
    [LOADING] (state) {
      state.isLoading = true
    },
    changeChoiceListElementState (state, payload) {
      let indextochange = state.choiceList.findIndex(function (obj) {
        return obj.value === payload.selectedBtn
      })
      state.choiceList[indextochange].state = null
      state.choiceList[indextochange].userIdPlayerFirstChoiceMap = true
    },
    disableButtonByIndex (state, index) {
      Vue.set(state.choiceList[index], 'disabled', true)
    },
    setPlayerChoice (state, playerChoiceValue) {
      state.playerChoice = playerChoiceValue
    },
    [PLAYER_PLAY] (state) {
      state.playerWait = false
    },
    [PLAYER_WAIT] (state) {
      state.playerWait = true
    },
    setGameMessage (state, gameMessage) { state.gameMessage = gameMessage },
    setGameStatus (state, gameStatus) { state.gameStatus = gameStatus },
    setPlayersInPlay (state, playersInPlay) { state.playersInPlay = playersInPlay },
    setPlayersEliminated (state, playersEliminated) { state.playersEliminated = playersEliminated },
    setPlayerTurn (state, playerTurn) { state.playerTurn = playerTurn }
  },
  getters: {
    getChoiceList: (state) => {
      return state.choiceList
    },
    getPlayerChoice: (state) => {
      return state.playerChoice
    },
    getPlayerWait: (state) => { return state.playerWait },
    getGameMessage: (state) => { return state.gameMessage },
    getGameStatus: (state) => { return state.gameStatus },
    getPlayerTurn: (state) => { return state.playerTurn },
    getPlayersInPlay: (state) => { return state.playersInPlay },
    getPlayersEliminated: (state) => { return state.playersEliminated }
  },
  actions: {
    setChoiceList ({commit}, choiceList) {
      commit('setChoiceList', choiceList)
    },
    changeChoiceListElementState ({commit}, payload) {
      commit('changeChoiceListElementState', payload)
    },
    disableButtonByIndex ({commit}, buttonIndex) {
      commit('disableButtonByIndex', buttonIndex)
    },
    disableButtonByValue ({commit}, buttonValue) {
      let choiceList = this.getters.getChoiceList
      let index = choiceList.findIndex(el => el.id === buttonValue)
      this.dispatch('disableButtonByIndex', index)
    },
    setPlayerChoice ({commit}, playerChoiceValue) {
      commit('setPlayerChoice', playerChoiceValue)
    },
    setPlayerWait ({commit}, wait) {
      if (wait) { commit(PLAYER_WAIT) } else commit(PLAYER_PLAY)
    },
    setGameMessage ({commit}, message) {
      commit('setGameMessage', message)
    },
    setPlayerTurn ({commit}, playerTurn) { commit('setPlayerTurn', playerTurn) },
    updateStatus ({commit, rootState}, gameStatusContainer) {
      if (gameStatusContainer.gameStatus) commit('setGameStatus', gameStatusContainer.gameStatus)
      if (gameStatusContainer.gameMessage) commit('setGameMessage', gameStatusContainer.gameMessage)
      if (gameStatusContainer.choiceList) {
        commit('setChoiceList', gameStatusContainer.choiceList)
        this.dispatch('setPlayerChoice', this.getters.getPlayerChoice)
      }
      if (gameStatusContainer.playersInPlay) commit('setPlayersInPlay', gameStatusContainer.playersInPlay)
      if (gameStatusContainer.playersEliminated) commit('setPlayersEliminated', gameStatusContainer.playersEliminated)
      if (gameStatusContainer.playerTurn) commit('setPlayerTurn', gameStatusContainer.playerTurn)
      if (gameStatusContainer.playerChoice) commit('setPlayerChoice', gameStatusContainer.playerChoice)
    }
  }
}

export default new Vuex.Store({
  modules: {
    a: moduleLogin,
    b: moduleChoiceList
  } // ,
  // plugins: [createPersistedState()]
})
