## Vuex

### 基本使用

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {    // -> data
    age: 10
  },
  getters: {    // 计算属性
    myAge(state) {
      return state.age + 20
    }
  },
  mutations: {    // method => 同步更改state  mutations 的第一个方法是状态， 第二个参数是可传入的参数
    changeAge(state, payload) {
      state.age += payload   // 更新age属性
    }
  },
  actions: {     // 异步操作做完后将结果提交给 mutations
    changeAge({commit, dispatch}, payload) {
      setTimeout(() => {
        commit('changeAge', payload)
      }, 1000)
    }
  },
  modules: {
  }
})
```

在模板上渲染

```vue
<template>
  <div id="app">
    <div>珠峰今年多少岁：{{this.$store.state.age}}</div>
    <div>我的年龄是：{{this.$store.getters.myAge}}</div>
    <button @click="$store.commit('changeAge', 5)">同步更新age</button>
    <button @click="$store.dispatch('changeAge', 5)">异步更新age</button>
  </div>
</template>
```

导入关在到vue实例上

```js
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```



### 初始化Vuex插件

Vue 中关于插件的安装注册，主要是使用 `Vue.use` 这个方法，其中该方法的核心原理是：

```js
Vue.use = function(plugin) {
  plugin.install.call(this)
}
```

好了，我们现在来初始化这个插件

```js
// store

class Store {}

const install = () => {
  ......
  // 需要将根组件中注入的 store 分派给每一个组件（子组件）  Vue.mixin
  applyMixin(Vue)  
}
```

```js
// applyMixin

export default function applyMixin(Vue) {
  Vue.mixin({   
    beforeCreate: vuexInit
} 

function vuexInit() {   // 每个组件创建的时候都会执行这个 钩子函数
    // 如果有 store 属性，表示的是一个根实例，， 即 最开始，我们把 store 注册到 main.js 上的 根实例中

    // 给所有的组件增加 $store 属性， 指向我们创建的 $store 属性
    const options = this.$options;    // 获取用户所有的选项
    if(options.store) {   // 根实例
      this.$store = options.store
    } else if(options.parent && options.parent.$store) {   // 儿子或者孙子
      this.$store = options.parent.$store
    }
  }
})

```

首先我们可以确定只有在根实例中才有 `store` 属性，因为这个属性是用户传入的。此时我们给根实例定义一个 `$store`属性，当创建子组件时，我们去获取子组件的父组件中的 `$store` 属性，如果存在我们就给子组件也创建这个属性，如果没有，则表示是根组件了。 通过一层层往上找然后创建的方式，这样就给每个组件定义了一个 `$store` 属性了。



 ### Vuex的基本实现



```js
<template>
  <div id="app">
    <div>珠峰今年多少岁：{{this.$store.state.age}}</div>
    <div>我的年龄是：{{this.$store.getters.myAge}}</div>
    <button @click="$store.commit('changeAge', 5)">同步更新age</button>
    <button @click="$store.dispatch('changeAge', 5)">异步更新age</button>
  </div>
</template>
```

我们可以看到像 `state`、`getters`、`commit`、`dispatch` 等都是 Store 的实例，那么现在我们开始创建这个属性或方法