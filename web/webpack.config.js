const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const outputDir = path.resolve(__dirname, "build");
const template = path.resolve(__dirname, "templates/index.html");
const apiServer = process.env.API_SERVER || `localhost:5000`;
const publicPath = process.env.PUBLIC_PATH || "/";

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: outputDir,
    publicPath: publicPath,
    filename: "main.bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              allowTsInNodeModules: true,
            },
          },
        ],
      },
      {
        test: /\.(jsx|js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(jpe?g|gif|png|svg|woff(2)?|ttf)$/,
        type: "asset/resource",
      },
      {
        test: /i18n\/locales\/[^/]*\.json$/,
        loader: "file-loader",
        type: "javascript/auto",
        exclude: /default\.[^/]*\.json$/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: template,
    }),
  ],
  devtool: "source-map",
  devServer: {
    static: {
      directory: outputDir,
    },
    port: 9999,
    historyApiFallback: true,
    proxy: {
      "/api/*": {
        target: `http://${apiServer}`,
        secure: false,
        logLevel: "debug",
      },
      "/api/v1/socket.io/*": {
        target: `ws://${apiServer}`,
        secure: false,
        ws: true,
        logLevel: "debug",
      },
    },
  },
};
