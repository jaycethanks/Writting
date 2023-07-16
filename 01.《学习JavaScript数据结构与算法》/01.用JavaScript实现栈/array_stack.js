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
const st = new Stack();
st.push(1,2,3,4)
st.log()
