<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark">
      <b-nav-item to="/">Home</b-nav-item>
      <b-nav-item to="/login" v-if=!getIsLoggedIn>Login</b-nav-item>
      <b-nav-item to="/register" v-if=!getIsLoggedIn>Register</b-nav-item>
      <b-nav-item :to=getProfileOfUrl v-if=getIsLoggedIn>Your Profile: {{getUsername}}</b-nav-item>
      <b-nav-item to="'users'" v-if=getIsLoggedIn>Users</b-nav-item>
      <b-nav-item v-if=getIsLoggedIn @click="logout">Logout</b-nav-item>
      <b-nav-item to="/choice" v-if=getIsLoggedIn>Choice</b-nav-item>
      <b-nav-item to="/game" v-if=getIsLoggedIn>Game</b-nav-item>
    </b-navbar>
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data () {
      return {
        profileOf: ``,
        username: ``
      }
    },
    methods: {
      logout: function () {
        this.$store.dispatch('logout').then(() => {
          this.$router.push({
            name: 'Home'
          })
        })
      }
    },
    beforeCreate () {
      this.$store.commit('initialiseStore')
    },
    created () {
      this.username = this.$store.getters.userName
      this.profileOf = '/profile/' + this.$store.getters.userName
    },
    computed: {
      getUsername: function () {
        return this.$store.getters.userName
      },
      getIsLoggedIn: function () {
        return this.$store.getters.isLoggedIn
      },
      getProfileOfUrl: function () {
        return '/profile/' + this.getUsername
      },
      isLoggedIn: function () {
        return this.$store.getters.isLoggedIn
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
