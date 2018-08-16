<template>
  <b-row class="justify-content-md-center">
    <b-col cols="6">
      <h2>Please Login</h2>
      <div v-if="errors && errors.length">
        <div v-for="error of errors">
          <b-alert show>{{error.message}}</b-alert>
        </div>
      </div>
      <b-form @submit="onSubmit">
        <b-form-group id="fieldsetHorizontalUsername"
                  horizontal
                  :label-cols="4"
                  breakpoint="md"
                  label="Enter Username">
          <b-form-input id="username" autocomplete="username" v-model.trim="login.username"></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontalPassword"
                  horizontal
                  :label-cols="4"
                  breakpoint="md"
                  label="Enter Password">
          <b-form-input type="password" id="password" autocomplete="current-password" v-model.trim="login.password"></b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary">Login</b-button>
        <b-button type="button" variant="success" @click.stop="register()">Register</b-button>
      </b-form>
    </b-col>
  </b-row>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  data () {
    return {
      login: {},
      errors: []
    }
  },
  methods: {
    onSubmit: function (evt) {
      evt.preventDefault()
      const self = this
      axios.post(`${this.$hostname}/api/auth/login/`, this.login)
        .then((response) => {
          console.log(`response: ${response.data}`)
          self.$store.dispatch('login', response.data)
          // this.$localStorage.set('jwtToken', response.data.token)
          // this.$localStorage.set('userName', response.data.username)
          self.$router.push({
            path: '/'
          })
        })
        .catch(e => {
          console.log(e)
          this.errors.push(e)
        })
    },
    register () {
      this.$router.push({
        name: 'Register'
      })
    }
  }
}
</script>
