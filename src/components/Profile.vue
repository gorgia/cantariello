<template>
  <div>
    <b-row class="justify-content-md-center">
      <b-col cols="6">
        <h2>Your Data</h2>
        <div v-if="errors && errors.length">
          <div v-for="error of errors">
            <b-alert show>{{error.message}}</b-alert>
          </div>
        </div>
        <b-form>
          <b-form-group id="fieldsetHorizontalUsername"
                        horizontal
                        :label-cols="4"
                        breakpoint="md"
                        label="Enter Username" readonly>
            <b-form-input id="username" v-model.trim="user.username" readonly></b-form-input>
          </b-form-group>
          <b-form-group id="fieldsetHorizontalPassword"
                        horizontal
                        :label-cols="4"
                        breakpoint="md"
                        label="Enter Password">
            <b-form-input type="password" id="password" v-model.trim="user.password" readonly></b-form-input>
          </b-form-group>
          <b-form-group id="fieldsetHorizontalScore"
                        horizontal
                        :label-cols="4"
                        breakpoint="md"
                        label="Enter your starting score">
            <b-form-input type="number" id="score" v-model.trim="user.score" value="0"></b-form-input>
          </b-form-group>
          <b-form-group id="fieldsetHorizontalParticipations"
                        horizontal
                        :label-cols="4"
                        breakpoint="md"
                        label="Enter your starting score">
            <b-form-input type="number" id="participations" v-model.trim="user.participations" value="0"></b-form-input>
          </b-form-group>
          <b-button v-on:click="update">Update Score</b-button>
        </b-form>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  export default {
    mounted: function () {
      const requestUrl = `${this.$hostname}/api/auth/profile/` + this.$store.getters.userName
      if (typeof requestUrl !== 'undefined') {
        this.$axios.get(requestUrl).then((response) => {
          this.user = response.data
        })
      }
    },
    data () {
      return {
        register: {},
        errors: [],
        user: {}
      }
    },
    methods: {
      update: function (evt) {
        evt.preventDefault()
        let requestUrl = `${this.$hostname}/api/auth/updatescore`
        this.$axios.post(requestUrl, this.user).then((response) => {
          console.log('response data \n' + response.data.toString() + '\nend of response')
          this.user = response.data
        })
      }
    }
  }
</script>
