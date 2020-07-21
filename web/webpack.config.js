const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const outputDir = path.resolve(__dirname, "build");
const template = path.resolve(__dirname, "templates/index.html");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: outputDir,
    publicPath: "/",
    filename: "main.bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(jsx|js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(jpe?g|gif|png|svg|woff(2)?|ttf)$/,
        use: [
          {
            loader: "file-loader",
            options: {},
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: template,
    }),
  ],
};
