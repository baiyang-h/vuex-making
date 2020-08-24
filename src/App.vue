<template>
  <div id="app">
    <div>珠峰今年多少岁：{{this.$store.state.age}}</div>
    <div>我的年龄是：{{this.$store.getters.myAge}}</div>
    <div>我的年龄是：{{this.$store.state.a.age}}</div>
    <div>我的年龄是：{{this.$store.state.b.age}}</div>
    <!-- <button @click="$store.state.age = 100">同步更新age</button>  -->
    <button @click="$store.commit('changeAge', 5)">同步更新age</button>
    <button @click="$store.dispatch('changeAge', 5)">异步更新age</button>
  </div>
</template>

<script>
export default {
  name: 'app',
}
</script>