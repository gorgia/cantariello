<template>
<div>
  <li v-for="user in userList">
    username: {{user.username}} - score: {{user.score}} - participations {{user.participations}}
  </li>
</div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'Leaderboard',
    data () {
       return {
         userList: []
       }
    },
    mounted () {
      let requestUrl = `${this.$hostname}/service/users`
      let self = this
      console.log(`request to ${requestUrl}`)
      axios.get(requestUrl)
        .then(function (response) {
          self.userList = response.data.users
          console.log(response.data) // ex.: { user: 'Your User'}
          console.log(response.status)// ex.: 200
        })
    }
  }
</script>

<style scoped>

</style>
