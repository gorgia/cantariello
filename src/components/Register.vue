<template>
  <b-row class="justify-content-md-center">
    <b-col cols="6">
      <h2>Please Register</h2>
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
          <b-form-input id="username" v-model.trim="register.username"></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontalPassword"
                  horizontal
                  :label-cols="4"
                  breakpoint="md"
                  label="Enter Password">
          <b-form-input type="password" id="password" v-model.trim="register.password"></b-form-input>
        </b-form-group>
        <b-form-group id="fieldsetHorizontalScore"
                      horizontal
                      :label-cols="4"
                      breakpoint="md"
                      label="Enter your starting score">
          <b-form-input type="number" id="score" v-model.trim="register.score" :value=0></b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary">Register</b-button>
        <b-button type="button" variant="success" @click="$router.go(-1)">Cancel</b-button>
      </b-form>
    </b-col>
  </b-row>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Register',
  data () {
    return {
      register: {},
      errors: []
    }
  },
  methods: {
    onSubmit (evt) {
      evt.preventDefault()
      axios.post(`${this.$hostname}/api/auth/register/`, this.register)
        .then(response => {
          alert('Registered successfully')
          this.$router.push({
            name: 'Login'
          })
        })
        .catch(e => {
          console.log(e)
          this.errors.push(e)
        })
    }
  }
}
</script>
