const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  stats: "verbose", // This will make Webpack more verboseNODE
  resolve: {
    alias: {
      sdk: path.resolve(
        __dirname,
        "../resources/embedding-sdk/dist/main.bundle.js"
      ),
      react: path.resolve(__dirname, "../node_modules/react"),
      "react-dom": path.resolve(
        __dirname,
        "../node_modules/react-dom"
      ),
    },
  },
  entry: [path.join(__dirname, "src", "index.js")],
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
    }),
    new webpack.ProvidePlugin({
      React: "react",
    }),
  ],
};
