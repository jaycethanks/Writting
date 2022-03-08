function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}
function createAnother(original) {
  let clone = ojbect(original); //通过调用函数创建一个新会县
  clone.sayHi = function () {
    //以某种当时增强这个对象
    console.log("hi");
  };
  return clone; // 返回这个对象
}
