import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'

import { HOSTNAME } from '../config'

Vue.use(Vuex)

const LOGIN = 'LOGIN'
const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
const LOGOUT = 'LOGOUT'

const moduleLogin = {
  state: {
    isLoggedIn: false,
    pending: false,
    userName: ''
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
      return new Promise(resolve => {
        setTimeout(() => {
          localStorage.setItem('token', 'JWT')
          localStorage.setItem('userName', creds.username)
          commit(LOGIN_SUCCESS)
          resolve()
        }, 1000)
      })
    },
    logout ({commit}) {
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      commit(LOGOUT)
    }
  },
  getters: {
    isLoggedIn: state => {
      return state.isLoggedIn
    },
    userName: state => {
      return state.userName
    }
  }
}

const LOAD_FINISHED = 'LOAD_FINISHED'
const LOADING = 'LOADING'

const moduleChoiceList = {
    state: {
      choiceList: [],
      isLoading: true,
      playerChoice: null
    },
    mutations: {
      loadList (state, list) {
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
        state.choiceList[indextochange].playerChoice = true
      },
      disableButton (state, index) {
        Vue.set(state.choiceList[index], 'disabled', true)
      },
      setPlayerChoice (state, playerChoiceValue) {
        state.playerChoice = playerChoiceValue
      }
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
      }
    },
    actions: {
      fetchData ({commit}) {
        commit(LOADING)
        return axios.get(`${HOSTNAME}/service/randomlist`)
          .then((response) => {
            console.log('data resolved\n' + response.data)
            let choiceList = response.data
            commit('loadList', choiceList)
            commit(LOAD_FINISHED) // this.isLoading = false
          })
      },
      changeChoiceListElementState ({commit}, payload) {
        commit('changeChoiceListElementState', payload)
      },
      disableButton ({commit}, buttonIndex) {
        commit('disableButton', buttonIndex)
      },
      setPlayerChoice ({commit}, playerChoiceValue){
        commit('setPlayerChoice', playerChoiceValue)
      }
  }
}

export default new Vuex.Store({
  modules: {
    a: moduleLogin,
    b: moduleChoiceList
  }

})
