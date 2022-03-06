function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}
let person = {
  name: "Nicholas",
  friends: ["Shelby", "Court", "Van"],
};
let anotherPerson = object(person);
let yetAnotherPerson = object(person);
console.log(anotherPerson.prototype === yetAnotherPerson.prototype); //两个实例化对象的指向的原型对象是同一个
anotherPerson.name = "Greg";
anotherPerson.friends.push("Rob");
yetAnotherPerson.name = "Linda";
yetAnotherPerson.friends.push("Barbie");
console.log(anotherPerson, yetAnotherPerson); //{name: 'Greg'},{name: 'Linda'} // name 是赋值操作，赋值操作不同于对象属性或者方法的访问，因此不遵循原型链查找规则 ，会直接对实例对象本身添加或者覆盖属性

console.log(person.friends); //{"name": "Nicholas","friends": ["Shelby","Court","Van","Rob","Barbie"]} // 因为实例化对象指向的是同一个原型对象，而name 是赋值操作，不会影响到原型对象上的name属性，而
//对这里的引用值类型是访问操作（修改），所以遵循原型链的查找规则， 所以原型对象上的引用值被修改了。 这也是前面说的原型对象上的引用值类型会被实例对象状态共享。
