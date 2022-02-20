```javascript
handelfileChange(e) {
  this.file = null; //init
  const FD = new FormData();
  let newNameFile = this.rewriteFileName(e.target.files[0]);
  FD.append("mFile", newNameFile);
  this.file = FD;
},
rewriteFileName(fileObj) {
  /* 后台在处理某文件没处理完时，前台再次传一个同名文件， 后台就会报错。 所以解决的方案就是每次都需要修改文件名，这个处理可以后台处理。 这里是在前台处理 */
  /* file 对象中的name 属性，原生是只读属性， 以下过程是通过新建一个变量，然后用name的getter访问这个变量， 就可以达到"改名"的目的 */
  Object.defineProperties(fileObj, {
      xname: {
          value:
              // prettier-ignore
              new Date().getTime() +"." +fileObj.name.split(".").at(-1) //at(-1) 用于取得最后一个元素
      },
      name: {
          get: function() {
              // 复写name 的原始get方法
              return this.xname;
          }
      }
  });
  return fileObj;
},
```

