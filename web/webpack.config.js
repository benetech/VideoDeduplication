const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const outputDir = path.resolve(__dirname, "build");
const template = path.resolve(__dirname, "templates/index.html");
const apiServer = process.env.API_SERVER || `http://localhost:5000`;
const publicPath = process.env.PUBLIC_PATH || "/";

module.exports = {
  entry: "./src/index.js",
  output: {
    path: outputDir,
    publicPath: publicPath,
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
        test: /i18n\/locales\/[^/]*\.json$/,
        loader: "file-loader",
        type: "javascript/auto",
        exclude: [/default\.[^/]*\.json$/],
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
  devServer: {
    contentBase: outputDir,
    port: 9999,
    historyApiFallback: true,
    proxy: {
      "/api/*": {
        target: apiServer,
        secure: false,
        logLevel: "debug",
      },
    },
  },
};
