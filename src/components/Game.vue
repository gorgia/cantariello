<template>
  <div>
    <start-game v-if="!gameStarted" :socket="socket"></start-game>
    <choice-list v-if="gameStarted"></choice-list>
    <game-chat :socket="socket" v-if="gameStarted"></game-chat>
  </div>
</template>

<script>
  import io from 'socket.io-client'
  import ChoiceList from './ChoiceList.vue'
  import GameChat from './GameChat.vue'
  import StartGame from './StartGame.vue'

  export default {
    name: 'Game',
    data () {
      return {
        socket: io(`${this.$hostname}`, {query: {user: this.$store.getters.user}})
      }
    },
    computed: {
      gameStarted: function () { return this.$store.getters.gameStarted }
    },
    components: {
      ChoiceList,
      GameChat,
      StartGame
    }
  }
</script>

<style scoped>

</style>
