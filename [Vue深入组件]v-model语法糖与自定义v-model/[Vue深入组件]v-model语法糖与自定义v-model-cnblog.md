[toc]

## 1. `v-model` 语法糖

当你希望一个自定义组件的值能够实现双向绑定。 那么就需要：

1. 将值传入组件；
2. 将变化的值逆传回父组件。 

实际上，就可以利用 `props` 实现的父传子 +　通过自定义事件`this.$emit`实现的子传父。实现双向的数据流传递。 

下面是一个示例：

有这样一个父组件：

```javascript
<template>
  <div>
    <Child :cusProp="message" @cusEvent="message = $event" />
    文字：{{message}}
  </div>

</template>
<script>
import Child from "./comps/child.vue"
export default {
  components: {
    Child
  },
  data() {
    return {
      message: 'init default'
    }
  }
}
</script>
```

和这样的一个子组件：

```javascript
<template>
  <div>
    this is child comp
    <input type="text" :value="cusProp" @input="onInputChange">
  </div>
</template>
<script>
export default {
  props:["cusProp"],
  methods: {
    onInputChange(e) {
      this.$emit('cusEvent', e.target.value)
    }
  }
}
</script>
```

![image-20210824220325859](https://img2020.cnblogs.com/blog/1735896/202108/1735896-20210824224550110-1278227484.png)

我们自定义了一个组件，名为`<Child />` ， 我们通过 `v-bind:cusProp` 向`<Child />` 传递了一个名为 "cusProp" 的`prop` , 即 `<Child :cusProp="message" />` 。

然后在`<Child />`组件内部，通过`props`接收到了这个值，并通过`v-bind:cusProp` 将值绑定给了`<input />` 元素。

紧接着，我们给`<input />` 元素设定了一个`input` 监听事件， 当输入时，触发该事件，然后将当前值通过`this.$emit('cusProp',e.target.value)` 触发了一个我们自定义命名为"cusProp"的自定义事件，以参数的形式，将变化后的值逆向传递（子传父）给了父组件。 在父组件中接收到变化后的值，然后通过`$event` 将值赋给了绑定的 `message` 。 

从而实现了自定义的双向绑定。



实际上，上边这个过程，可以简化为一个vue为我们预定义实现的`v-model`， 但是不能直接替换，我们需要做一些简单的处理。这就涉及到了自定义`v-model`





## 2. 自定义`v-model`

### 2.1 v-model 语法糖， 以及最简单的自定义v-model

首先，我们仿照着[vue文档的举例](https://cn.vuejs.org/v2/guide/components-custom-events.html#自定义组件的-v-model)，尝试去理解需要自定义`v-model`的使用场景。 

文档中有这样一段描述很重要

> 一个组件上的 `v-model` 默认会利用名为 `value` 的 prop 和名为 `input` 的事件

文档中的这段话极为概要，但是这句话蕴含了很重要的一些细节：

<span style="color:red">实际，当你使用`v-model` 的时候，**默认是**，是传递的**名为`value`的**`prop` ，且**`$emit`触发的自定义事件的事件名是`input`** 。 </span>

而回头看看我们刚才写的组件：

父组件：

```javascript
 <Child :cusProp="message" @cusEvent="message = $event" />
```

子组件：

```javascript
<input type="text" :value="cusProp" @input="onInputChange">
...
props:["cusProp"]
...
onInputChange(e) {
    this.$emit('cusEvent', e.target.value)
}
```

我们默认传递的prop值名为"cusProp"， 即`v-bind:cusProp` ， 且`$emit`触发的自定义事件名为`cusEvent` 。 并不满足能直接写作`v-model` 的形式其前提条件。 所以我们不能直接替换。

我们需要做一些简单的变化：

父组件：

```javascript
<template>
  <div>
    <Child :value="message" @input="message = $event" /> <!--改动行-->
    文字：{{message}}
  </div>

</template>
<script>
import Child from "./comps/child.vue"
export default {
  components: {
    Child
  },
  data() {
    return {
      message: 'init default'
    }
  }
}
</script>
```

子组件：

```javascript
<template>
  <div>
    this is child comp
    <input type="text" :value="value" @input="onInputChange"> <!--改动行-->
  </div>
</template>
<script>
export default {
  props:["value"],// --改动行--
  methods: {
    onInputChange(e) {
      this.$emit('input', e.target.value) //--改动行--
    }
  }
}
</script>
```

我们把`prop` 值的改为了`value`, 把`$emit` 触发的事件改为了`input` 现在，我们就能写作`v-model` 的 形式了，保持子组件不变，直接替换父组件中即可：

```javascript
<Child v-model="message" />
```

自此，我们便能够理解，为什么说**`v-model` 实际上就是`props` + `$emit` 自定义事件的语法糖 。**





### 2.2 通用自定义v-model 

上边的示例中，我们由于不满足先是利用了`props` 父传子，和自定义事件的子传父，手动实现了一个数据流的双向绑定。 

紧接着，我们介绍了`v-model` 的实质，就是`props` + 自定义事件 的语法糖。 然后我们期望将我们自己的手动实现，简化成`v-model`语法糖的形式。

文档告诉我们，需要满足两个基本的默认条件：

1. `prop` 名默认须为`value`；
2. `$emit` 触发的自定义事件名默认须为`input`

而我们的手动实现起初并不满足要求(prop ---- cusProp, $emit ---- cusEvent)， 所以我们做了部分修改，以满足默认的条件。 从而实现了将手动实现，转换成了`v-model`语法糖的形式。 



但是，这里有一个问题，就是`v-model` 默认的两个条件，会对我们有着很大的限制，这里封装的是一个`<input/>`输入框，以`value` prop值，以`input` 作为自定义事件名，本身是合乎习惯的，但是，日常开发中，我们不可能只封装一个输入框，可不能所有的自定义v-model 组件，都以`value` 传递，自定义事件一定名为`input` ，这显然是不合理的，也有违“自定义事件” 。我们开发工作中，可能更多的需要自定义指定prop名，和自定义事件。 为了更好的说明这个问题，解决通用性，下面我们通过一个示例来加深了解：





> 这里之所以要着重强调，是因为很容易出错，这个文档中说的`input` 事件到底指的是，自定义子组件中元素的监听事件名为`input`，还是说`$emit`触发的事件名为`input`。  以上就是为了强调，是后者，是`$emit`触发的事件名，默认情况下，必须为`input`。 尽管它是自定义事件名，这也是之所以容易出错的地方。



这里我们同样使用`<input/` 这个元素，但是，不再用输入框了（`type="text"`） ，我们将其指定为一个checkbox 看看会怎么样呢？

```javascript
<!--Father Component-->
<template>
  <div>
    <Child :cusProp="status" @cusEvent="status = $event" />
    状态：{{status}}
  </div>

</template>
<script>
import Child from "../cusVModelcheckBox/comps/child.vue"
export default {
  components: {
    Child
  },
  data() {
    return {
      status: true
    }
  }
}
</script>
```

```javascript
<!-- Child Component-->
<template>
  <div>
    this is child comp
    <input type="checkbox" :checked="cusProp" @change="onChange">
  </div>
</template>
<script>
export default {
  props:["cusProp"],
  methods: {
    onChange(e) {
      this.$emit('cusEvent', e.target.checked)
    }
  }
}
```

![image-20210824220413039](https://img2020.cnblogs.com/blog/1735896/202108/1735896-20210824224549948-1087106263.png)

一样的，如果此时，你想写作`v-model`语法糖的形式。就需要想刚才那样做一些改动：

父组件：

```javascript
<template>
  <div>
    <Child v-model="status" /> <!--改动行-->
    状态：{{status}}
  </div>

</template>
<script>
import Child from "../cusVModelcheckBox/comps/child.vue"
export default {
  components: {
    Child
  },
  data() {
    return {
      status: true
    }
  }
}
</script>
```

子组件：

```javascript
<template>
  <div>
    this is child comp
    <input type="checkbox" :checked="value" @change="onChange"> <!--改动行-->
  </div>
</template>
<script>
export default {
  props:["value"], //--改动行--
  methods: {
    onChange(e) {
      this.$emit('input', e.target.checked) //--改动行--
    }
  }
}
```



现在，由于这是一个checkbox ，我们可以放大刚才所描述的限制了。 你莫名奇妙的加上接受了一个名为`value` 的prop, 以及通过`$emit` 触发了一个莫名其妙的`input`自定义事件。 尽管它能够如期的正常工作。  当代码量多了之后, 你会发现这种组件异常难以维护。 

**那么到底该怎么解决这样一种场景呢？**

其实非常简单 , 只需要指定一个`model `对象属性即可：

我们只需要在刚才的基础上，在`<Child/>`组件中指定如下`model`配置加以稍微改动即可：

```javascript
<template>
  <div>
    this is child comp
    <input type="checkbox" :checked="cusProp" @change="onChange">	<!--改动行-->
  </div>
</template>
<script>
export default {
  props:["cusProp"], 	//改动行 //当然一般直接写父组件v-model的变量名, 这里为了说明是任意名所以 写了个cusProp
  model:{				//改动行
    prop:'cusProp', 	//改动行
    event:'cusEvent'	//改动行
  },//改动行
  methods: {
    onChange(e) {
      this.$emit('cusEvent', e.target.checked)	//改动行
    }
  }
}
```

vue 为我们提供了一个名为`model`的实例配置项, 它可以指定一个任意的变量名,用于接受父组件中`v-model` 的传递值, 还可以指定一个任意的事件名, 用以"代理", `$emit`的触发事件.

这样,就解决了难以后期维护的问题,使得有双向绑定需求的组件封装更加的通用. 

## 3. 总结

所以，总结一下。

什么情况下需要自定义`v-model`？

1. 当有自定义组件的双向数据流的需求的时候，都可以自定义`v-model` 来达成目的。

   1. 其中，什么时候需要配置 `model` 属性？

      当默认通过`v-bind` prop传递到自定义组件的变量名不是默认的`value` ，**<u>或者</u>** 触发自定义事件的事件名不为`input` 的时候。

   2. 什么时候不需要配置`model` 属性？

      当满足默认的`v-model`规则时，即 prop传递到自定义组件的变量名为`value` **<u>且</u>** 触发自定义事件的事件名为`input` 的时候，不需要指定`model`属性配置。可直接使用`v-model` 这种情况比较少见，<u>**基本**</u>仅当自定义组件是为了扩展`type="text"` 的 `<input/>` 元素时才符合条件。

      

**特别注意的一点：**

自定义事件内部，可以通过任意事件去触发`$emit` ，但是一般是通过DOM监听事件，例如`@change`， `@input`，`@click`，等等。 但是默认情况下，如果不配置`model`实例配置，加以指明，`$emit` 触发的事件名须是"input" 。 主要是不要混淆，这么默认情况下的约束规则，`input` 事件，指的是`$emit`触发的事件名，而不是自定义子组件内部触发`$emit` 的事件。

通过`model` 实例配置，实际上帮我们解决的主要问题是日后的维护问题，和代码易读性。 它相当于背后帮我们自动将默认`prop`为`value` ，默认自定义事件为`input` 做了一层别名化处理（alias），从而让我们能够去自定义任何名称。



## 4. 附加拓展，实践一个常见的`v-model`业务需求

**【需求：】**

假设现在有这样一个需求（基于antdv）

![image-20210824222912833](https://img2020.cnblogs.com/blog/1735896/202108/1735896-20210824224549764-1566991117.png)

有这样一个区域级联选择器，我希望，我能从父组件中给它一个初始值`cascaderSelected:"浙江/杭州"`。 在级联选择器值变换以后，这个`cascaderSelected`值响应式的变化。 要求利用`v-model` 实现，从而让代码简洁高效。



【**实现：**】

父组件：

```javascript
<template>
  <div>
    <cus-area-cascader v-model="cascaderSelected"/>
    当前选中区域：{{cascaderSelected}}
  </div>

</template>
<script>
import CusAreaCascader from "../cusVModelPractice/comps/CusAreaCascader.vue"
export default {
  components: {
    CusAreaCascader
  },
  data() {
    return {
      cascaderSelected: ['zhejiang', 'hangzhou','xihu']
    }
  }
}
</script>
```

子组件：

```javascript
<template>
  <a-cascader :options="options" :value="onPropHandle" placeholder="Please select" @change="onChange" />
</template>
<script>
export default {
  props:['onPropHandle'],
  model:{
    prop:'onPropHandle',
    event:'onChangeHandle'
  },
  data() {
    return {
      options: [
        {
          value: 'zhejiang',
          label: 'Zhejiang',
          children: [
            {
              value: 'hangzhou',
              label: 'Hangzhou',
              children: [
                {
                  value: 'xihu',
                  label: 'West Lake',
                },
              ],
            },
          ],
        },
        {
          value: 'jiangsu',
          label: 'Jiangsu',
          children: [
            {
              value: 'nanjing',
              label: 'Nanjing',
              children: [
                {
                  value: 'zhonghuamen',
                  label: 'Zhong Hua Men',
                },
              ],
            },
          ],
        },
      ],
    };
  },
  methods: {
    onChange(value) {
      this.$emit('onChangeHandle',value)
    },
  },
};
</script>

```



![image-20210824224431745](https://img2020.cnblogs.com/blog/1735896/202108/1735896-20210824224549331-1731900097.png)

目标达成。