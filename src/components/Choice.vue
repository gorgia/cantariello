<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <b-jumbotron fluid v-if="!isLoading">
      <b-row v-for="i in Math.ceil(randomElements.length / 3)">
          <b-button v-for="btn in randomElements.slice((i - 1) * 3, i * 3)" :pressed.sync="btn.state" :key="btn.value" class="btn-outline-primary col" :ref="btn.value" @click="select(btn.value)">
            {{ btn.text }}
          </b-button>
      </b-row>

      <!--<b-form-group class="btn-matrix btn-group">-->
        <!--<b-form-radio-group-->
          <!--id="btnradios2"-->
          <!--buttons-->
          <!--button-variant="outline-primary"-->
          <!--size="lg"-->
          <!--v-model="selected"-->
          <!--:options="randomElements"-->
          <!--name="radioBtnOutline">-->
        <!--</b-form-radio-group>-->
      <!--</b-form-group>-->
    </b-jumbotron>
    <p>Pressed States: <strong>{{ btnStates }}</strong></p>
    <div>
      <b-button class="btn-success btn-lg">Send Choice</b-button>
    </div>
  </div>
</template>
<style>
.btn-outline-primary{
  margin-left: 30px;
  margin-bottom: 30px;
}
</style>
<script>
  export default {
    data () {
      return {
        roomName: null,
        playerNumber: null,
        selected: 'radio1'
      }
    },
    beforeMount () {
      this.$store.dispatch('fetchData')
    },
    computed: {
      btnStates: function () {
        if (this.$store.state.b.choiceList) { return this.$store.state.b.choiceList.map(btn => btn.state) }
      },
      randomElements: function () {
        let choiceList = this.$store.getters.getChoiceList
        if (!choiceList) {
          this.$store.dispatch('fetchData')
          choiceList = this.$store.getters.getChoiceList
        }
        return choiceList
      },
      isLoading: function () {
        return this.$store.state.b.isLoading
      }
    },
    methods: {
      fetchData: function () {
        // this.isLoading = true
        // axios.get(`${this.$hostname}/service/randomlist`)
        //   .then((response) => {
        //     console.log('data resolved\n' + response.data)
        //     this.$store.choiceList = response.data
        //     this.isLoading = false
        //   })
      },
      select: function (buttonid) {
        console.log(`selected button id=${buttonid}`)
        let randomElement = this.randomElements.find(function (obj) {
          return obj.value === buttonid
        })
        this.randomElements.forEach(function (el) { if (el.value !== buttonid) el.state = false })
        console.log(randomElement)
      },
      firstchoiceButton: function (buttonid) {

      }
    }
  }
</script>
