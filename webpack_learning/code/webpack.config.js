const HtmlWebpackPlugin = require("html-webpack-plugin");
const RemarkHtml = require("remark-html");
console.log(RemarkHtml);
const ConsoleLogOnBuildWebpackPlugin = require("./ConsoleLogOnBuildWebpackPlugin.js");
const path = require("path");
module.exports = {
  mode: "production",
  // watch: true,
  entry: {
    index: "./src/index.js",
  },
  output: {
    filename: "[name].[contenthash].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    // filename: "output_[name].js",
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    new ConsoleLogOnBuildWebpackPlugin({
      key1: "hello world",
      key2: "hello webpack",
    }),
  ],

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.(s[a|c]|c)ss$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: false,
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
    ],
  },
};
