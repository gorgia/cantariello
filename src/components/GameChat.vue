<template>
  <div class="card mt-3">
    <div class="card-body">
        <div class="gorm-group pb-3">
          <label>Message:</label>
          <input type="text" v-model="message" class="form-control">
        </div>
        <button v-on:click.prevent="sendMessage" class="btn btn-success btn-primary">Send</button>
    </div>
    <div class="card-footer">
      <div class="card-title">
        <h3>Chat Group</h3>
        <hr>
      </div>
    </div>
    <div>messages are {{messages}}</div>
    <div class="card-body">
      <div class="messages" v-for="(msg, index) in messages" :key="index">
        <p><span class="font-weight-bold"></span>{{ msg.message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['socket'],
    data () {
      return {
        message: '',
        messages: []
      }
    },
    methods: {
      sendMessage (e) {
        e.preventDefault()
        let messageToBeSent = {
          username: this.$store.getters.userName,
          message: this.message
        }
        console.log('sendMessage() invoked: ' + messageToBeSent)
        this.socket.emit('CHAT_MESSAGE', messageToBeSent)
        this.message = ''
      }
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
        console.log('message received ' + data)
        self.messages.push(data)
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
