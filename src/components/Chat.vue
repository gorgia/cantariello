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
        <div class="messages" v-for="(msg, index) in messages" :key="index">
          <p><span class="font-weight-bold">{{ msg.user }}: </span>{{ msg.message }}</p>
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
        user: this.$store.getters.userName,
        message: '',
        messages: [],
        socket: io(`${this.$hostname}`)
      }
    },
    methods: {
      sendMessage (e) {
        e.preventDefault()
        console.log('SEND_MESSAGE:' + this.message)
        this.socket.emit('SEND_MESSAGE', {
          user: this.user,
          message: this.message
        })
        this.message = ''
      }
    },
    mounted () {
      this.socket.on('MESSAGE', (data) => {
        this.messages = [...this.messages, data]
        // you can also do this.messages.push(data)
      })
      this.socket.on('DISABLE_BUTTON', (data) => {
        this.messages
      })
    }
  }
</script>

<style>

</style>
