<template>
  <div>
    <div class="card-body">
      <h1><p><span class="font-weight-bold">{{ gameMessage }}</span></p></h1>
      <h1 v-if="(gameStatus === GAME_STATUS.PLAYING)"><p><span class="font-weight-bold">Players {{ playersInPlay }} | Eliminated {{ playersEliminated}}</span></p></h1>
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
      gameStatus: function () { return this.$store.getters.getGameStatus },
      playersInPlay: function () { return this.$store.getters.getPlayersInPlay },
      playersEliminated: function () {return this.$store.getters.getPlayersEliminated}
    },
    components: {
      ChoiceList,
      GameChat,
      StartGame
    },
    methods: {
      initGameStatus: function (expandedGameStatus) {
        console.log(`InitGameStatus: Game status expanded =\n${JSON.stringify(expandedGameStatus)}`)
        this.$store.dispatch('updateStatus', expandedGameStatus)
      }
    },
    mounted () {
      let self = this
      let userId = this.$store.getters.user._id
      this.socket.on('GAME_STATUS', (expandedGameStatus) => {
        self.initGameStatus(expandedGameStatus)
      })
      this.socket.on('GAME_MESSAGE', (data) => {
        self.$store.dispatch('setGameMessage', data)
      })
      this.socket.emit('REQUEST_GAME_STATUS', userId, function (data) { self.initGameStatus(data) })
    }
  }
</script>
