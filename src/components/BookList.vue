<template>
  <b-row>
    <b-col cols="12">
      <h2>Book List
        <b-link @click="logout()">(Logout) {{username}} boh</b-link>
      </h2>
      <b-table striped hover :items="books" :fields="fields">
        <template slot="actions" slot-scope="row">
          <b-btn size="sm" @click.stop="details(row.item)">Details</b-btn>
        </template>
      </b-table>
      <ul v-if="errors && errors.length">
        <li v-for="error of errors">
          <b-alert show>{{error.message}}</b-alert>
        </li>
      </ul>
    </b-col>
  </b-row>
</template>

<script>

export default {
  name: 'BookList',
  data () {
    return {
      fields: {
        isbn: { label: 'ISBN', sortable: true, 'class': 'text-center' },
        title: { label: 'Book Title', sortable: true },
        actions: { label: 'Action', 'class': 'text-center' }
      },
      books: [],
      errors: [],
      username: ''
    }
  },
  created () {
    this.$axios.defaults.headers.common['Authorization'] = this.$localStorage.get('jwtToken')
    // this.username = this.$localStorage.get('username')
    console.log('username = ' + this.username)
    this.$axios.get(`${this.$hostname}/book`, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
      .then(response => {
        this.books = response.data
      })
      .catch(e => {
        this.errors.push(e)
        // if (e.response.status === 401) {
        //   this.$router.push({
        //     name: 'Login'
        //   })
        // }
      })
  },
  methods: {
    details (book) {
      this.$router.push({
        name: 'ShowBook',
        params: { id: book._id }
      })
    },
    logout () {
      this.$localStorage.remove('jwtToken')
      this.$localStorage.remove('username')
      this.$router.push({
        name: 'Login'
      })
    }
  }
}
</script>
