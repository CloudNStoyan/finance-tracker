const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { DefinePlugin } = require("webpack");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "app.bundle.[contenthash].js",
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/",
  },
  devServer: {
    port: 8001,
    allowedHosts: "all",
    static: {
      directory: path.resolve(__dirname, "./dist"),
    },
    historyApiFallback: true,
  },
  mode: "development",
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
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Finance Tracker",
      inject: "body",
      template: "./src/template.html",
    }),
    new DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
  ],
};
