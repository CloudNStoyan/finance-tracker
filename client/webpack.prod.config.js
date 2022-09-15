const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "./dist"),
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
            plugins: [
              [
                "babel-plugin-direct-import",
                { modules: ["@mui/material", "@mui/icons-material"] },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "src"),
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.svg$/,
        type: "asset/inline",
      },
    ],
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
    }),
  ],
  target: "browserslist",
};
