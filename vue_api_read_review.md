Vue.extend 使用基础Vue构造器，创建一个“子类”
Vue.nextTick	在下次Dom更新循环结束之后执行延迟回调
Vue.set 向响应式对象中添加一个property，并确保这个新的property同样是响应式的，且出发视图更新


Vue.delete 删除对象的property,如果对象是响应式的，确保删除能触发更新视图。

Vue.directive 注册或者获取全局指令

Vue.filter 注册或者获取全局过滤器

Vue.component 注册或者获取全局组件，注册还会自动使用给定的id设置组件的名称

Vue.use  安装Vue.js 插件

Vue.mixin  全局注册一个混入，影响注册之后所有创建的每个Vue实例

Vue.version 提供字符串形式的Vue 安装版本号

Vue.compile 将一个模板字符串编译成render函数，只在完整版时可以用。 



## 选项

data	Vue实例的数据对象
props 	props可以是数组或者对象，用于接收来自父组件的数据
propsData 创建实例时传递props, 主要作用时方便测试
computed 计算数据将被混入到Vue实例中
methods methods 将被混入到Vue实例中。 
watch 一个对象，键是需要观察的表达式，值是对应对调函数
el 提供在一个页面上已存在的DOM 元素作为Vue实例的挂在目标
template 一个字符串模板作为Vue 实例的标识使用
render 字符串模板的代替方案，该渲染函数接收一个createElement 方法作为第一个参数用来创建VNode 
renderError 当render 函数遭遇错误的时候，提供另一种渲染输出，只在开发环境下工作
directives 包含Vue实例，可用指令的哈希表
filters 包含Vues实例可用过滤器的哈希表
components 包含Vue实例可用组件的哈希表
parent 指定已经创建的实例之父实例，在两者之间建立父子关系
mixins 选项接收一个混入对象的数组
extends 允许声明扩展另一个组件
provide/inject 允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在其上下游关系成立的时间里始终生效 

name 允许组件模板递归地调用滋生
delimiters 改变纯文本插入分隔符
functional 使组件无状态，没有data，和无实例，没有this上下文
model允许一个自定义组件在使用v-model时定制prop和event
inheritAttrs inheritAttrs属性默认值为true，表示允许组件的根节点继承$attrs包含的属性
comments 当设为true时，将会保留且渲染模板中的HTML注释




## 实例属性
vm.$data Vue实例观察的数据对象
vm.$props 当前组件接收到props对象
vm.$el vue实例使用的根DOM元素
vm.$options 用于当前Vue实例的初始化选项
vm.$parent 父实例，如果当前实例有的话
vm.$root 当前组件树的根Vue实例
vm.$children 当前实例的直接子组件
vm.$slots 分发的内容
vm.$scopedSlots	用来访问作用域插槽
vm.$refs 一个对象，持有注册过ref attribute 的所有DOM 元素和组件实例
vm.$isServer 当前Vue实例是否运行于服务器
vm.$attrs 包含了父作用域中不作为prop被识别（且获取）的attribute兵丁
vm.$listener 包含了父作用域中的（不含.native修饰器的）v-on事件监听器


## 实例方法
vm.$watch() 观察Vue 实例上的一个表达式或者一个函数计算结果的变化
vm.$set() 这是全局Vue.set的别名
vm.$delete() 这是全局Vue.delete 的别名
vm.$on() 监听当前实例上的自定义事件
vm.$once() 监听一个自定义事件，但是只触发一次
vm.$off() 移除自定义事件监听器
vm.$emit() 触发当前实例上的事件，
vm.$mount() 手动的挂在一个未挂载的实例，
vm.$forceUpdate() 迫使Vue实例重新渲染
vm.$nextTick()将回调延迟到下次DOM 更新循环之后执行
vm.$destory() 完全销毁一个实例
