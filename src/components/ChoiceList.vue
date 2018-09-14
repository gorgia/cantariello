<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <b-jumbotron fluid v-if="!isLoading">
      <b-row v-if="!isLoading" v-model="btnList" v-for="i in Math.ceil(btnList.length / 3)">
        <b-button  v-if="!isLoading" v-for="btn in btnList.slice((i - 1) * 3, i * 3)" :key="btn.id" :disabled=isButtonDisabled(btn) :class="(btn.id === playerChoice)?  'bg-success' : ''"
                  class="btn-outline-primary col" :ref="btn.id" @click="select(btn.id)">
          {{ btn.title }}
        </b-button>
      </b-row>
    </b-jumbotron>
    <div>
      <b-button class="btn-success btn-lg" :disabled="!isMyTurn" @click="sendChoice()">Send Choice</b-button>
    </div>
    <div>
      <v-dialog/>
    </div>
  </div>
</template>
<style>
.btn-outline-primary {
  margin-left: 30px;
  margin-bottom: 30px;
}
.playerChoice {
  background: red;
}
</style>

<script>
const CONFIG = require('../config')
const GAME_STATUS = CONFIG.default.GAME_STATUS

export default {
  name: 'ChoiceList',
  props: ['socket'],
  data: function () {
    return {
      selectedBtn: null
    }
  },
  computed: {
    isLoading: function () {
      return !(typeof this.$store.getters.getChoiceList !== 'undefined' && this.$store.getters.getChoiceList.length > 0)
    },
    playerChoice: function () {
      return this.$store.getters.getPlayerChoice
    },
    btnList: {
      get: function () {
        let choiceList = this.$store.getters.getChoiceList
        let playerChoice = this.$store.getters.getPlayerChoice
        if (playerChoice) {
            this.$store.dispatch('disableButtonByValue', playerChoice)
        }
        return choiceList
      }
    },
    getPlayerWait: function () {
      return false// return this.$store.getters.getPlayerWait
    },
    isMyTurn: function () {
      if (this.$store.getters.getPlayerTurn) return this.$store.getters.user._id === this.$store.getters.getPlayerTurn._id
      return true
    }
  },
  mounted () {
  },
  methods: {
    select: function (buttonid) {
      console.log(`selected button id=${buttonid}`)
      this.btnList.forEach(function (el) {
        if (el.value !== buttonid) el.state = false
      })
      this.selectedBtn = buttonid
    },
    showModal: function () {
      console.log('Show Modal called')
      this.$modal.show('dialog', {
        title: 'Do you confirm',
        text: 'This is your choice. Are you sure?',
        buttons: [
          {
            title: 'Confirm', // Button title
            default: false, // Will be triggered by default if 'Enter' pressed.
            handler: () => {
              console.log('button confirm pressed')
              let playerChoice = this.selectedBtn
              this.$store.dispatch('setPlayerChoice', this.selectedBtn)
              this.$store.dispatch('setPlayerWait', true)
              this.$modal.hide('dialog')
              let user = this.$store.getters.user
              this.socket.emit('FIRST_CHOICE', {user: user, playerFirstChoice: playerChoice})
            } // Button click handler
          },
          {
            title: 'Close'
          }
        ]
      })
    },
    firstChoiceProcessing: function () {
      this.showModal('first-choice-dialog')
    },
    sendChoice: function () {
      console.log(`sendChoice:${this.selectedBtn}`)
      if (this.$store.getters.getGameStatus === GAME_STATUS.WAIT_FOR_PLAYERCHOICE) { this.firstChoiceProcessing() }
      else if (this.$store.getters.getGameStatus === GAME_STATUS.PLAYING) { this.turnChoiceProcessing() }
    },
    modifyPlayerFirstChoiceButton: function () {
      let playerChoiceValue = this.$store.getters.getPlayerChoice
      for (let index in this.btnList) {
        if (this.btnList[index].value === playerChoiceValue) {
          console.log(`element found`)
          this.$store.dispatch('disableButtonByIndex', index)
        }
      }
    },
    isButtonDisabled: function (btn) {
      if (btn.disabled) return true
      if (btn.id === this.playerChoice) return true
      return false
    },
    displayFirstChoiceClass: function (btn) {
      if (btn.id === this.playerChoice) return
    },
    turnChoiceProcessing: function () {
      let playerChoiceValue = this.selectedBtn
      let playerId = this.$store.getters.user._id
      this.socket.emit('PLAYER_TURN_CHOICE', {player: playerId, choice: playerChoiceValue})
    }
  }
}
</script>
