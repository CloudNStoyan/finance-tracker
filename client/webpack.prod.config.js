const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { DefinePlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "./dist"),
  },
  mode: "production",
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "@mui/base": "@mui/base/modern",
      "@mui/lab": "@mui/lab/modern",
      "@mui/material": "@mui/material/modern",
      "@mui/styled-engine": "@mui/styled-engine/modern",
      "@mui/system": "@mui/system/modern",
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Finance Tracker",
      inject: "body",
      template: "./src/template.html",
      favicon: "./src/favicon.ico",
    }),
    new CopyPlugin({
      patterns: [
        { from: "./src/favicon.ico", to: "./favicon.ico" },
        { from: "./src/dark_favicon.ico", to: "./dark_favicon.ico" },
      ],
    }),
    new DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.Recaptcha_Site_Key": JSON.stringify(
        process.env.Recaptcha_Site_Key
      ),
    }),
  ],
  target: "browserslist",
};
