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
console.log(anotherPerson, "--line13");

yetAnotherPerson.name = "Linda";
yetAnotherPerson.friends.push("Barbie");
console.log(yetAnotherPerson, "--line13");

console.log(person.friends);
console.log(person, "--line19");
