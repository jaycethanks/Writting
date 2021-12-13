[TOC]

## 1. 理解对象

### 1.1 属性的类型

​		ESMA-262 使用一些内部特性来描述属性的特征。 这些特性是由为JavaScript实现引擎的规范定义的， 因此， 开发者不能再JavaScript 中直接访问这些特性。

​		为了将某个特性标识为内部特性，规范会用两个中括号把特性的名称括起来， 比如 `[[Enumerable]]` 。

ECMAScript 中将属性分为了两种：

1. 数据属性
2. 访问器属性

#### 1.1.1 数据属性 `CEWV`

数据属性包含了一个保存数据值的位置。 值会从这个位置读取，也会写入到这个位置。 数据属性有四个特性描述它们的行为。

1. `[[Configurable]]` : 
   1. 属性是否可以通过 `delete` 删除并重新定义；
   2. 是否可以修改它的特性；
   3. 是否可以把它改为 访问器属性 
   4. 默认值为 `true`
2. `[[Enumerable]]` :
   1. 属性是否可以通过`for-in` 循环返回。
   2. 默认值为 `true`
3. `[[Writable]]` :
   1. 属性的值是否可以被修改；
   2. 默认值为 `true`
4. `[[Value]]` :
   1. 属性实际的值
   2. 默认值为 `undefined`

当我们创建一个对象时，如：

```javascript
let person = {
    name: "Nicholas"
};
```

属性`name` 的数据属性 `[[Configurable]]`、`[[Enumerable]]`、`[[Writable]]` 都会被设置为 `true`， 而` [[Value]]` 特性会被设置为指定的值，即 `"Nicholas"`。 

##### 1.1.1.2 修改与访问 数据属性

###### 1.1.1.2.1 修改属性的默认特性

`Object` 有两个静态方法用于修改 数据属性：

1. `Object.defineProperty()`
2. `Object.defineProperties()` 

**`Object.defineProperty()`**

该方法用于修改对象单个值的数据属性，其语法格式如下：

```javascript
Object.defineProperty(属性的对象，属性的名称，描述符对象（{CEWV}）)
```

示例：

```javascript
let person = {};
Object.defineProperty(person, "name", {
    Writable: false,
    value: "Nicholas"
});

console.log(person.name);	//	"Nicholas"
person.name = "Greg";
console.log(person.name); //	"Nicholas"
```

> :warning: 严格模式下，尝试修改只读属性的值会抛出错误。

```javascript
let person = {};
Object.defineProperty(person, "name", {
    configurable: false,
    value: "Nicholas"
});
console.log(person.name); // "Nicholas"
delete person.name;
console.log(person.name); // "Nicholas"
```

> :warning: 尝试删除`[[Configurable]]` 为`false` 的值在严格模式下会抛出错误

一旦某个属性被设定了 `[[Configurable]]` 值为`false` 以后， 该值将会被定义为不可配置， 也不能在变回可配置了。 也就是说，此时，如果再次调用`Object.defineProperty()` 并修改任何非 writable 属性还会导致错误。



**:warning:此外，在调用`Object.defineProperty()` 时， 如果不指定`configurable`, `enumerable` 和 `writable` 值，则全部默认为 `false` 。**

```javascript
let obj = {  };
Object.defineProperty(obj, "name",{value:'jayce'});
let a = Object.getOwnPropertyDescriptors(obj)

console.log(a);//{ name: { value: 'jayce',writable: false,enumerable: false,configurable: false } }
```



```javascript
// 注意： 如果已经有初始化值，则初始化时，数据属性已经被设定了默认值，都为true
let obj = { name:'frank' };
Object.defineProperty(obj, "name",{value:'jayce'});
let a = Object.getOwnPropertyDescriptors(obj)

console.log(a);// { name: { value: 'jayce',writable: true,enumerable: true,configurable: true } }
```



**`Object.defineProperties()`**

`Object.defineProperties()` 用于批量修改默认数据属性，其语法格式如下：

```javascript
Object.defineProperties(obj,props)
```

示例：

```javascript
var obj = {};
Object.defineProperties(obj, {
  'property1': {
    value: true,
    writable: true
  },
  'property2': {
    value: 'Hello',
    writable: false
  }
  // etc. etc.
});
```





###### 1.1.1.2.2 访问数据属性

`Object` 提供了两个数据属性的访问方法，分别是：

1. `Object.getOwnPropertyDescriptor()`
2. `Object.getOwnPropertyDescriptors()`

`Object.getOwnPropertyDescriptor()` 用于获取单个对象值数据属性, 而`Object.getOwnPropertyDescriptors()` 则用于获取对象中所有值的数据属性。 

示例：

```javascript
let obj = { name:'frank',age:18,height:'175cm' };
Object.defineProperty(obj, "name",{value:'jayce'});
let res1 = Object.getOwnPropertyDescriptor(obj,'name')
let res2 = Object.getOwnPropertyDescriptors(obj)

console.log(res1);
/* 
{ value: 'jayce',
  writable: true,
  enumerable: true,
  configurable: true }
*/
console.log(res2);

/* { name: 
   { value: 'jayce',
     writable: true,
     enumerable: true,
     configurable: true },
  age: 
   { value: 18,
     writable: true,
     enumerable: true,
     configurable: true },
  height: 
   { value: '175cm',
     writable: true,
     enumerable: true,
     configurable: true } }
 */
```



#### 1.1.2 访问器属性



## 2. 创建对象





## 3. 继承





## 4. 类