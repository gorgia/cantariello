<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <b-jumbotron fluid v-if="!isLoading">
      <b-row v-model="btnList" v-for="i in Math.ceil(btnList.length / 3)" :key = i>
        <b-button v-for="btn in btnList.slice((i - 1) * 3, i * 3)" :key="btn.value" :class="[(btn.value === getPlayerChoice) ? 'playerChoice' : '', btn.disabled ? 'disabled' : '']"
                  class="btn-outline-primary col" :ref="btn.value" @click="select(btn.value)">
          {{ btn.text }}
        </b-button>
      </b-row>
    </b-jumbotron>
    <div>
      <b-button class="btn-success btn-lg" @click="sendChoice">Send Choice</b-button>
    </div>
  </div>
</template>
<style>
  .btn-outline-primary {
    margin-left: 30px;
    margin-bottom: 30px;
  }
  .playerChoice {
    color: red;
  }
</style>
<script>

  export default {
    name: 'ChoiceList',
    data () {
      return {
        selectedBtn: null
      }
    },
    beforeMount: function () {
      this.$store.dispatch('fetchData')
    },
    computed: {
      isLoading: function () {
        return this.$store.getters.getIsChoiceListLoading
      },
      btnList: {
        get: function () {
          return this.$store.getters.getChoiceList
        }
      },
      getPlayerChoice: function () {
        return this.$store.getters.getPlayerChoice
      }
    },
    methods: {
      select: function (buttonid) {
        console.log(`selected button id=${buttonid}`)
        this.btnList.forEach(function (el) {
          if (el.value !== buttonid) el.state = false
        })
        this.selectedBtn = buttonid
      },
      sendChoice: function () {

        if (!this.$store.getters.getChoiceList.find(x => x.state === 'playerChoice')) {
          let newstate = 'playerChoice'
          let selectedBtnValue = this.selectedBtn
          console.log(`selectedBtnValue: ${selectedBtnValue}`)
          let payload = {selectedBtn: selectedBtnValue, newstate}
          // this.$store.dispatch('changeChoiceListElementState', payload)
          for (let index in this.btnList) {
            if (this.btnList[index].value === selectedBtnValue) {
              console.log(`element found`)
              this.$store.dispatch('disableButton', index)
            }
          }
        }

        // if (!this.$store.getters.getPlayerChoice) {
          this.$store.dispatch('setPlayerChoice', this.selectedBtn)
        // }

      }

    }

  }
</script>

<style scoped>

</style>
