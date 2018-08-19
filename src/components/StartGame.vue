<template>
  <div>
    <div>
      <h1>Number of players connected: {{numberOfPlayersConnected}}</h1>
    </div>
    <div>
      <b-button class="btn-success btn-lg" @click="startGame()">Start Game</b-button>
    </div>
  </div>
</template>

<script>
    export default {
        name: 'StartGame',
        props: ['socket'],
      data () {
        return {
          numberOfPlayersConnected: 0
        }
      },
      computed: {
          gameStarted: function () { return this.$store.getters.gameStarted() }
      },
      methods: {
          startGame () { this.$store.dispatch('startGame') }
      },
      mounted () {
        const self = this
        this.socket.on('NUMBER_OF_CLIENTS_CONNECTED', (data) => {
          self.numberOfPlayersConnected = data
        })
      }
    }
</script>

<style scoped>

</style>
