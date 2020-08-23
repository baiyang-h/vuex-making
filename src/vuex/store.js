import applyMixin from "./mixin"
import { forEachValue } from './util'

export let Vue

export class Store {    // 容器的初始化
  constructor(options) {   // options 就是你 Vuex.Store({state, mutation, actions})
    const state = options.state    // 数据变化要更新视图 （vue的核心逻辑 依赖收集）,,  所以 要 改为 响应式数据
    
    // 2. 处理 getters 属性 具有缓存的computed 带有缓存 （多次取值是如果值不变是不会重新取值的）
    const computed = {}
    this.getters = {}
    forEachValue(options.getters, (fn, key) => {
      computed[key] = () => {
        return fn(this.state)
      }
      Object.defineProperty(this.getters, key, {
        get: () => this._vm[key]
      })
    })

    // 响应式数据 new Vue({data})    // 这里的数据就是响应式的
    
    // 1. 添加状态逻辑
    this._vm = new Vue({
      data: {   // 属性如果是通过 $ 开头的 默认不会将这个属性挂载到 vm 上
        $$state: state,    // 会将$$state 对应的对象 都通过 defineProperty 来进行属性劫持
      },
      computed
    })

    // 3. 实现 mutations
    this.mutations = {}
    this.actions = {}
    forEachValue(options.mutations, (fn, key) => {
      // this.mutations = {myAge: payload => 用户定义的逻辑(state, payload)}
      this.mutations[key] = payload => fn(this.state, payload)
    })
    forEachValue(options.actions, (fn, key) => {
      this.actions[key] = payload => fn(this, payload)
    })
  }

  get state() {  // 属性访问器
    return this._vm._data.$$state   //   虽然 vue 官方 内部 对于 $ 开头的属性不会挂载到 vm 实例上， 但是会挂载到 _data 上，所以，在vm._data 中是能够被访问到的。
  }
/*
// 在严格模式下 this 的指向
类的方法内部如果含有this，它默认指向类的实例。但是，必须非常小心，一旦单独使用该方法，很可能报错。 
但是，如果将这个方法提取出来单独使用，this会指向该方法运行时所在的环境（由于 class 内部是严格模式，所以 this 实际指向的是undefined）
1. 一个比较简单的解决方法是，在构造方法中绑定this  bind
2. 使用箭头函数
*/
  commit = (type, payload) => {     // 为什么要这么写， 因为 用户可能会使用解构等方式获取这个方法，这样this就不是指向当前实例，， 所以为了保证当前this指向，所以用箭头函数
    // 调用 commit 其实就是去找 刚才绑定好的mutation
    this.mutations[type](payload)
  }

  dispatch = (type, payload) => {
    this.actions[type](payload)
  }
}

/*
  // Vue.use 的核心原理
  Vue.use = function(plugin) {
    plugin.install.call(this)
  }
*/


// Vue.use 方法会调用插件的install 方法，此方法中的参数就是Vue的构造函数
export const install = (_Vue) => {   // 插件的安装  Vue.use()
  // _Vue   是Vue 的构造函数，外部传入是什么版本的Vue，就是什么版本， 不用在担心 Vue 版本的兼容性问题， 比如 2.x  或 3.x 都可以
  Vue = _Vue  // 将当前的Vue 暴露出去，那么，在当先的项目中，就都可以使用这个 Vue 

  // 需要将根组件中注入的 store 分派给每一个组件（子组件）  Vue.mixin
  applyMixin(Vue)
}