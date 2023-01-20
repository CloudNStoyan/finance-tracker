const path = require("path");
const babelConfig = require("./babel.config.js");

module.exports = [
  {
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: "babel-loader",
      options: {
        presets: babelConfig.presets,
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
];
