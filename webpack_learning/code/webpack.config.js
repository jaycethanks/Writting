const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ConsoleLogOnBuildWebpackPlugin = require("./ConsoleLogOnBuildWebpackPlugin.js");
const path = require("path");
module.exports = {
  entry: {
    index: "./src/index.js",
    utils: "./src/utils.js",
    jquery: "./src/lib/jquery.js",
    lodash: "./src/lib/lodash.core.js",
    underscore: "./src/lib/underscore-esm-min.js",
  },
  output: {
    filename: "[name].[contenthash].bundle.js",
    path: path.resolve(__dirname, "dist"),
    // filename: "output_[name].js",
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    new CleanWebpackPlugin(),
    new ConsoleLogOnBuildWebpackPlugin({
      key1: "hello world",
      key2: "hello webpack",
    }),
  ],
};
