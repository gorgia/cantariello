<template>
  <div>
    <div>
      <h1>Number of players connected: {{numberOfPlayersConnected}} | Number of clients connected {{numberOfClientsConnected}} </h1>
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
          numberOfPlayersConnected: 0,
          numberOfClientsConnected: 0
        }
      },
      computed: {
          gameStarted: function () { return this.$store.getters.gameStarted() }
      },
      methods: {
          startGame () {
            this.socket.emit(`START_GAME`)
          }
      },
      mounted () {
        const self = this
        this.socket.emit('GET_NUMBER_OF_CLIENTS_CONNECTED')
        this.socket.on('NUMBER_OF_CLIENTS_CONNECTED', (data) => {
          console.log(`NUMBER_OF_CLIENTS_CONNECTED received ${JSON.stringify(data)}`)
          self.numberOfPlayersConnected = data.numberOfPlayers ? data.numberOfPlayers : 'unknown'
          self.numberOfClientsConnected = data.numberOfClients
        })
      }
    }
</script>

<style scoped>

</style>
