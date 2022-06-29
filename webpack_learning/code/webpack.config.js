const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
module.exports = {
  entry: {
    utils: "./src/utils.js",
    app: {
      dependOn: "utils",
      import: "./src/index.js",
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    // filename: "output_[name].js",
  },
  plugins: [new HtmlWebpackPlugin({ template: "./src/index.html" })],
};
