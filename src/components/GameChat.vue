<template>
  <div class="card mt-3">
    <div class="card-body">
      <form @submit.prevent="sendMessage">
        <div class="gorm-group pb-3">
          <label>Message:</label>
          <input type="text" v-model="message" class="form-control">
        </div>
        <button type="submit" class="btn btn-success">Send</button>
      </form>
    </div>
    <div class="card-footer">
      <div class="card-title">
        <h3>Chat Group</h3>
        <hr>
      </div>
      <div class="card-body">
          <p><span class="font-weight-bold">{{ gameMessage }}</span></p>
      </div>
      <div class="card-body">
        <div class="messages" v-for="(msg, index) in messages" :key="index">
          <p><span class="font-weight-bold">{{ msg.user }} </span>{{ msg.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import io from 'socket.io-client'

  export default {
    data () {
      return {
        message: '',
        messages: [],
        gameMessage: '',
        socket: io(`${this.$hostname}`, {query: {user: this.$store.getters.user}})
      }
    },
    methods: {
      sendMessage(e) {
        e.preventDefault()
        console.log('SEND_MESSAGE:' + this.message)
        this.socket.emit('SEND_MESSAGE', {
          user: this.user.userName,
          message: this.message
        })
        this.message = ''
      },
    },
    computed: {
      playerChoice: function () {
        return this.$store.getters.getPlayerChoice
      },
      user: function () {
        return this.$store.getters.user
      }
    },
    watch: {
      playerChoice: function (newPlayerChoice) {
        console.log('button user ' + this.user)
        this.socket.emit('FIRST_CHOICE', {user: this.user, playerFirstChoice: newPlayerChoice})
      }
    },
    mounted () {
      let self = this
      this.socket.on('MESSAGE', (data) => {
        this.messages = [...this.messages, data]
        // you can also do this.messages.push(data)
      })
      this.socket.on('DATA_RECEIVED', (data) => {
        self.messages = [...this.messages, data]
      })
      this.socket.on('FIRST_CHOICE_RECEIVED', (data) => {
        self.gameMessage = 'please wait for your turn' // [...this.messages, data]
        self.$store.dispatch('setPlayerWait', true)
      })
      this.socket.on('DISABLE_BUTTON', (data) => {
        self.messages = null
      })
    }
  }
</script>

<style>

</style>
