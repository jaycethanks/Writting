const APP = {
  sw: null,
  imgList: ["/imgs/city.jpg", "/imgs/nature.jpg", "/imgs/sports.jpg"],
  count: 0,
  init() {
    document.querySelector("button").addEventListener("click", APP.addTitle);
    APP.registerSW();
  },
  registerSW() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(
        (reg) => {
          APP.SW = reg.installing || reg.waiting || reg.active;
        },
        (error) => {
          console.log("Service Worker Registration Fialed: ", error);
        },
      );
    }
  },
  addTitle() {
    if (APP.count < 3) {
      const img = document.createElement("img");
      img.src = APP.imgList[APP.count];
      APP.count++;
      document.body.appendChild(img);
    }
  },
};

document.addEventListener("DOMContentLoaded", APP.init);
