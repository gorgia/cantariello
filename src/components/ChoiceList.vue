<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <b-jumbotron fluid v-if="!isLoading">
      <b-row v-if="!isLoading" v-model="btnList" v-for="i in Math.ceil(btnList.length / 3)" :key = i>
        <b-button  v-if="!isLoading" v-for="btn in btnList.slice((i - 1) * 3, i * 3)" :key="btn.value" :class="[btn.disabled ? (btn.value === getPlayerChoice) ? 'disabled playerChoice bg-success' : 'disabled' : '']"
                  class="btn-outline-primary col" :ref="btn.value" @click="select(btn.value)">
          {{ btn.text }}
        </b-button>
      </b-row>
    </b-jumbotron>
    <div>
      <b-button class="btn-success btn-lg" :class="playerWait ? 'disabled': ''" @click="sendChoice()">Send Choice</b-button>
    </div>
    <div>
      <v-dialog/>
    </div>
  </div>
</template>
<style>
.btn-outline-primary {
  margin-left: 30px;
  margin-bottom: 30px;
}
.playerChoice {
  background: red;
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
    },
    playerWait: function () {
      return this.$store.getters.playerWait
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
    showModal: function () {
      console.log('Show Modal called')
      this.$modal.show('dialog', {
        title: 'Do you confirm',
        text: 'This is your choice. Are you sure?',
        buttons: [
          {
            title: 'Confirm', // Button title
            default: true, // Will be triggered by default if 'Enter' pressed.
            handler: () => {
              console.log('button confirm pressed')
              this.$store.dispatch('setPlayerChoice', this.selectedBtn)
              this.$store.dispatch('playerWait', true)
              this.$modal.hide('dialog')
            } // Button click handler
          },
          {
            title: 'Close'
          }
        ]
      })
    },
    sendChoice: function () {
      if (!this.$store.getters.getChoiceList.find(x => x.state === 'playerChoice')) {
        this.firstChoiceProcessing()
      }
    },
    firstChoiceProcessing: function () {
      console.log('this is playerChoice')
      this.showModal('first-choice-dialog')
      let newstate = 'playerChoice'
      let selectedBtnValue = this.selectedBtn
      console.log(`selectedBtnValue: ${selectedBtnValue}`)
      let payload = { selectedBtn: selectedBtnValue, newstate }
      // this.$store.dispatch('changeChoiceListElementState', payload)
      for (let index in this.btnList) {
        if (this.btnList[index].value === selectedBtnValue) {
          console.log(`element found`)
          this.$store.dispatch('disableButton', index)
        }
      }
    }
  }
}
</script>
