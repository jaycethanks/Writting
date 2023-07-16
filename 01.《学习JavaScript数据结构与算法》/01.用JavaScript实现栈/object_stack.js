console.clear()
class Stack{
    constructor(){
        this.count = 0
        this.stack = {}
    }
    push(element){
        this.stack[this.count] = element
        this.count++
    }
    pop(){
        if(this.count === 0)return
        console.log('this.count',this.count)
        this.count--
        delete this.stack[this.count]
    }
    peek(){
        return this.stack[this.count - 1]
    }
    isEmpty(){
        return this.count  === 0 ? true : false
    }
    clear(){
        this.stack = {}
    }
    size(){
        return this.count
    }
    log(){
        console.log('this.stack',this.stack)
    }
}


const st = new Stack()
st.log()
const ept = st.isEmpty()
console.log('ept',ept)

st.push("hello")
st.log()
st.push("world")
st.log()
const top = st.peek()
console.log('top',top)
st.pop()
st.pop()
st.pop()
st.pop()
const _top = st.peek()
const size = st.size()
console.log('_top',_top)
console.log('size',size)