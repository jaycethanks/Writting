import "./css/style.scss";
console.log("hello 212313webpack!!", "--line1");

async function fetch() {
  let count = 0;
  await count++;
  return count;
}

let res = fetch();
console.log(res, "--line11");

const CONSTANT = "THIS IS A CONSTANT";
const StringTemplate = `
Hey!,
this is
a string <template> for a test only!!
and here below is a inserted variable
${CONSTANT}
`;

console.log(CONSTANT, "--line22");
console.log(StringTemplate, "--line23");
