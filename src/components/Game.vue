<template>
  <div>
    <div class="card-body">
      <h1><p><span class="font-weight-bold">{{ gameMessage }}</span></p></h1>
    </div>
    <start-game v-if="(gameStatus === GAME_STATUS.WAIT_FOR_START)" :socket="socket"></start-game>
    <choice-list v-if="(gameStatus !== GAME_STATUS.WAIT_FOR_START)" :socket="socket"></choice-list>
    <game-chat :socket="socket"></game-chat>
  </div>
</template>

<script>
  import io from 'socket.io-client'
  import ChoiceList from './ChoiceList.vue'
  import GameChat from './GameChat.vue'
  import StartGame from './StartGame.vue'
  import CONFIG from '../config'

  export default {
    name: 'Game',
    data () {
      return {
        socket: io(`${this.$hostname}`, {query: {user: JSON.stringify(this.$store.getters.user)}}),
        GAME_STATUS: CONFIG.GAME_STATUS
      }
    },
    computed: {
      gameMessage: function () {
        return this.$store.getters.getGameMessage
      },
      user: function () { return this.$store.getters.user },
      gameStatus: function () { return this.$store.getters.getGameStatus }
    },
    components: {
      ChoiceList,
      GameChat,
      StartGame
    },
    methods: {
      initGameStatus: function (expandedGameStatus) {
        console.log(`Game status expanded ${expandedGameStatus}`)
        this.$store.dispatch('updateStatus', expandedGameStatus)
        console.log(expandedGameStatus) // data will be 'woot'
      }
    },
    mounted () {
      let self = this
      let username = this.$store.getters.user.username
      this.socket.on('GAME_STATUS', (expandedGameStatus) => {
        console.log(`Game status expanded ${expandedGameStatus}`)
        self.$store.dispatch('updateStatus', expandedGameStatus)
        console.log(expandedGameStatus) // data will be 'woot'
      })
      this.socket.on('GAME_STARTED', (data) => {
         self.$store.dispatch('startGame')
      })
      this.socket.on('GAME_MESSAGE', (data) => {
        self.$store.dispatch('setGameMessage', data)
      })
      this.socket.emit('REQUEST_GAME_STATUS', username, self.initGameStatus)
    }
  }
</script>
