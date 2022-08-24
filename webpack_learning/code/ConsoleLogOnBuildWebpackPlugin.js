const pluginName = "ConsoleLogOnBuildWebpackPlugin";

class ConsoleLogOnBuildWebpackPlugin {
  constructor(obj) {
    this.obj = obj;
  }
  apply(compiler) {
    compiler.hooks.run.tap(pluginName, (compilation) => {
      for (const key in this.obj) {
        console.log(key, "--line10");
      }
      console.log("webpack 构建过程开始！");
    });
  }
}
module.exports = ConsoleLogOnBuildWebpackPlugin;
