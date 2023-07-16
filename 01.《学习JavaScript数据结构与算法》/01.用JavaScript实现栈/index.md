## 队列的方法:
1. push
2. pop
3. peek
4. isEmpty
5. clear
6. size

### 1.数组实现

```js
class Stack{
    constructor(){
        this.stack = [];
    }
    push(element){
        this.stack.push(element)
    }
    pop(){
        this.stack.splice(this.stack.length - 1,1)
    }
    peek(){
        return this.stack[this.stack.length - 1]
    }
    isEmpty(){
        return this.stack.length === 0 ? true : false
    }
    clear(){
        this.stack = []
    }
    size(){
        return this.stack.length
    }
    log(){
        console.log('this.stack',this.stack)
    }
}
```

通过数组实现存在的问题:
