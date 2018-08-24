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
    isLoading: true,
    playerChoice: null,
    playerWait: false,
    gameMessage: `Please wait for game start`,
    gameStarted: '',
    playerTurn: null,
    gameStatus: GAME_STATUS.WAIT_FOR_START
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
    disableButton (state, index) {
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
    [GAME_STARTED] (state) { state.gameStarted = true },
    [PLAYER_CHOICE_WAIT] (state) { if (state.playerChoice && !state.turnOfPlayer) state.gameMessage = 'Please wait for the other players' },
    setGameStatus (state, gameStatus) { state.gameStatus = gameStatus },
    setPlayerTurn (state, playerTurn) {state.playerTurn = playerTurn }
  },
  getters: {
    getChoiceList: (state) => {
      return state.choiceList
    },
    getIsChoiceListLoading: (state) => {
      return state.isLoading
    },
    getPlayerChoice: (state) => {
      return state.playerChoice
    },
    getPlayerWait: (state) => { return state.playerWait },
    getGameMessage: (state) => { return state.gameMessage },
    getGameStarted: (state) => { return state.gameStarted },
    getGameStatus: (state) => { return state.gameStatus },
    getPlayerTurn: (state) => { return state.playerTurn }
  },
  computed: {},
  actions: {
    fetchData ({commit}) {
      commit(LOADING)
      return axios.get(`${HOSTNAME}/service/randomlist`)
        .then((response) => {
          console.log('data resolved\n' + response.data)
          let choiceList = response.data
          commit('setChoiceList', choiceList)
          commit(LOAD_FINISHED) // this.isLoading = false
        })
    },
    setChoiceList ({commit}, choiceList) {
      commit('setChoiceList', choiceList)
    },
    changeChoiceListElementState ({commit}, payload) {
      commit('changeChoiceListElementState', payload)
    },
    disableButton ({commit}, buttonIndex) {
      commit('disableButton', buttonIndex)
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
    startGame ({commit}) {
      commit(GAME_STARTED)
    },
    setPlayerTurn ({commit}, playerTurn) { commit('setPlayerTurn', playerTurn) },
    updateStatus ({commit}, gameStatusContainer) {
      let gameStatus = gameStatusContainer.gameStatus
      commit('setGameStatus', gameStatus)
      switch (gameStatus) {
        case GAME_STATUS.WAIT_FOR_START:
          commit('setPlayerChoice', null)
          break
        case GAME_STATUS.WAIT_FOR_PLAYERCHOICE:
          commit('setChoiceList', gameStatusContainer.choiceList)
          break
        case GAME_STATUS.PLAYING:
          commit('setChoiceList', gameStatusContainer.choiceList)
          commit('playerTurn', gameStatusContainer.playerTurn)
          break
      }
    }
  }
}

export default new Vuex.Store({
  modules: {
    a: moduleLogin,
    b: moduleChoiceList
  },
  plugins: [createPersistedState()]
})
