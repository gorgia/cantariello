<template>
  <div>
    <choice-list></choice-list>
    <game-chat></game-chat>
  </div>
</template>

<script>
  import ChoiceList from './ChoiceList.vue'
  import GameChat from './GameChat.vue'

  export default {
    name: 'Game',
    components: {
      ChoiceList,
      GameChat
    }
  }
</script>

<style scoped>

</style>
