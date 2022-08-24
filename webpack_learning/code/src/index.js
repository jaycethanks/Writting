import _ from "lodash";
import UTILS from "./utils.js";
console.log(print, "--line2");

const button = document.createElement("button");
button.innerText = "test";
button.addEventListener("click", () => {
  UTILS.print();
});

document.body.appendChild(button);
