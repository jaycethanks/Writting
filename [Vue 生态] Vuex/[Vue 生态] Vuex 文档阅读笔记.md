[toc]

## 1. 最简单的 Store

```javascript
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.store({
    state:{
        count:0
    },
    mutations:{
        increment ( state ){
            state.count ++
        }
    }
})
```

现在可以通过`store.state` 来获取状态对象， 以及通过`store.commit` 来触发状态的变更。

```javascript
store.commit('increment')
console.log(store.state.count) // 1
```

但是，现在无法在其他组件上访问到状态对象。 为了达到这一目的，我们需要将store和Vue 实例关联起来。 

在main.js 中

```javascript
// 引入store 后
new Vue({
    el:'#app',
    store:store,
})
```

这样，从所有子组件中，都可以这样去修改和访问state状态对象中的值：

```javascript
methods:{
    increment(){
        this.$store.commit('increment')
        console.log(this.$store.state.count)
    }
}
```

> :star: 我们修改状态对象中的值，并不是直接去修改， 而是通过提交 mutation 。 
>
> 这样做的目的，是代码阅读更加易于理解，且易于调试。 

另外， 由于store 中的状态是响应式的，在组件中调用store 中的状态，仅需要在计算属性中去返回即可。 触发 变化也仅仅实在组件的methods 中提交 mutation 。 



## **2. 核心概念**

### 2.1 State

#### 2.1.1 在Vue 组件中获得Vuex 状态

Vuex 的状态存储时响应式的，从store 实例中读取状态的最简单方法就是在计算属性中 返回某个状态：

```javascript
const Counter  = {
    template : `<div>{{ count }}</div>`,
    computed: {
        count () {
            return this.$store.state.count
        }
    }
}
```



#### 2.1.2 `mapState` 辅助函数

当一个组件需要获取多个状态 ， 每一个状态都上上面那样去定义computed 有一些繁琐， vue 为了简化这个过程，给我们提供了 `mapState` 辅助函数。

```javascript
import { mapState } from 'vuex'

export default{
    //...
    computed: mapState({
        count: state=> state.count,
        countAlias : 'count'
    })
}
```

当计算属性中的属性名和state 中的子节点相同时，可以直接将名称字符串作为一个字符串数组元素， 然后将这个字符串数组传入`mapState`

```javascript
computed:mapState([
    'count'
])
//即， this.count 的映射为 store.state.count
```

#### 2.1.3 对象展开运算符

`mapState` 函数返回的是一个对象， 怎么将它与局部计算属性混合使用呢 ？

```javascript
computed:{
    localComputed(){/*...*/},
    ...mapState({
        //...
    })
}
```



### 2.2 Getters

有时候，我们需要从 store 中的 state 中派生出一些状态，例如对列表进行过滤并计数：

```javascript
computed: {
    doneTodosCount (){
        return this.$store.state.todos.filter(todo => todo.done).length
    }
}
```

如果，有多个组件需要用到此属性，我们要么复制这个函数，或者抽取到一个共享函数，然后再多出导入它 —— 无论哪种方式都不是很理想。

Vuex 允许它们在 store 中定义`getter` （可以认为是store的计算属性。） 就像计算属性一样，**getter 的返回值会根据它的依赖被缓存起来，其只有当它的依赖值发送了改变才会被重新计算**。

Getter 接收 state 作为其第一个参数 ：

```javascript
const store = new Vuex.Store({
    state:{
        todos:[
            { id: 1, text: '...', done: true},
            { id: 2, text: '...', done: false}
        ]
    },
    getters: {
        doneTodos: state=>{
            return state.todos.filter(todo=>todo.done)
        }
    }
})
```



#### 2.2.1 通过属性访问

Getter 会暴露为 `store.getters` 对象， 你可以以属性的形式访问这些值：

```javascript
store.getters.doneTodos // [{ id: 1, text: '...', done: true }]
```

Getter 也可以接收其他getter作为第二个参数：

```javascript
getter:{
    //...
    doneTodosCount: (state,getters) => {
        return getters.doneTodos.length
    }
}
```

```javascript
store.getters.doneTodosCount // -1
```

我们可以很容易地在任何组件中使用它：

```javascript
computed: {
    dontTodosCount (){
        return this.$store.getter.doneTodosCount
    }
}
```

**注意， getter 在通过属性访问时是作为Vue 的响应式系统的一部分缓存其中的**





#### 2.2.2 通过方法访问 

你也可以通过让getter 返回一个函数，来实现给getter 传参。 在你对 store 里的数组进行查询时会非常有用。

```javascript
getters: {
    //...
    getTodoById: (state) => (id) => {
        return state.todos.find(todo => todo.id === id)
    }
}
```

> :star:以上代码等同于
>
> ```javascript
> getters；{
>     //...
>     getTodoById: function(state){
>         return function(id){
>             return state.todos.find(todo => todo.id === id)
>         }
>     }
> }
> ```

```javascript
store.getters.getTodoById(2);// { id:2, text: '...', done: false }
```

> :warning: 这里的调用很奇怪，这个state 形参是怎么回事?
>
> 这里涉及到 “函数的柯里化”， 简单的说：
>
> ```javascript
> //①
> const add = (x, y) => x + y;
> add(2,3) // 5
> ```
>
> 这段代码的柯里化将会是：
>
> ```javascript
> //②
> const add = x => y => x + y;
> ```
>
> 其es5代码为：
>
> ```javascript
> const add = function(x){
>     return function(y){
>         return x + y
>     }
> }
> ```
>
> 因此:
>
> ```javascript
> getters: {
>     //...
>     getTodoById: (state) => (id) => {
>         return state.todos.find(todo => todo.id === id)
>     }
> }
> ```
>
> 就可以写成其等同式（就像② 和 ①是等同的）：
>
> ```javascript
> getters: {
>     //...
>     getTodoById: (state,id) => {
>         return state.todos.find(todo => todo.id === id)
>     }
> }
> ```
>
> 而 state 这个参数是getters 的默认传参，因此，可以这样去调用：
>
> ```javascript
> store.getters.getTodoById(2);
> ```
>
> 理解参考自：
>
> https://stackoverflow.com/a/32787782/11375753
> https://stackoverflow.com/a/67221323/12261182

**注意: getter 在通过方法访问时， 每次都会去进行调用， 而不会缓存结果。**



#### 2.2.3 mapGetters 辅助函数

`mapGetters` 辅助函数仅仅是将 store 中的getter 映射到局部计算属性：

```javascript
import { mapGetters } from 'vuex'

export default {
    //...
    computed:{
        // 使用对用展开运算符将getter 混入 computed 对象中
        ...mapGetters({
            'doneTodosCount',
            'anotherGetter',
            //...
        })
    }
}
```

如果你想将一个 getter 属性另取一个名字， 使用对象形式：

```javascript
...mapGetters({
    // 把 `this.doneCount` 映射为 `this.$store.getters.doneTodosCount`
    doneCount: 'doneTodosCount'
})
```





### 2.3 Mutation

要更改 Vuex 的 store 中的状态的唯一方法是提交 mutation  。Vuex 中的mutation非常类似于事件 ： 每个 mutation 都有一个字符串的 **事件类型（type）** 和一个 **回调函数（handler）**。 这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数：

```javascript
const store = new Vuex.store({
    state: {
        count: 1
    },
    mutations: {
        increment (state){
            // 变更状态
            state.count ++ 
        }
    }
})
```

你不能直接调用一个 mutation handler 。 这个选项更像是事件注册 ： “当触发一个类型（type）为 `increment` 的 mutation 时， 调用此函数。 " 要唤醒一个 mutation handler ， 你需要以相应的 type 调用 store.commit 方法：

```javascript
store.commit('increment')
```

#### 2.3.1 提交载荷（Payload）

你可以向 `store.commit` 传入额外的参数， 即 mutation的 **载荷(payload)**:

```javascript
//...
mutations: {
    increment (state, n){
        state.count += n
    }
}
```

```javascript
store.commit('increment',10)
```

在大多数情况下， 载荷（Payload） 应该是一个对象， 这样可以包含多个字段并且记录的 mutation 会更易读：

```javascript
//...
mutations:{
    increment(state, payload){
        state.count += payload.amount
    }
}
```

```javascript
store.commit('increment',{
    amount:10
})
```



#### 2.3.2 对象风格的提交方式

提交一个mutation 的另一种方式是直接使用包含 `type`属性的对象 ：

```javascript
store.commit({
    type: 'increment',
    amount: 10
})
```

当使用对象风格的提交方式， 整个对象都作为载荷传给 mutation函数， 因此 handler 保持不变 :

```javascript
mutations:{
    increment (state, payload){
        state.count += payload.amount
    }
}
```



#### 2.3.3 Mutations 需遵守 Vue 的响应规则