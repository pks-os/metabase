const fs = require("fs");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

const mainConfig = require("../../webpack.config");

const { isEmbeddingSdkPackageInstalled } = resolveEmbeddingSdkPackage();

module.exports = {
  mode: "development",
  devtool: false,
  resolve: {
    alias: {
      ...mainConfig.resolve.alias,
      ...(!isEmbeddingSdkPackageInstalled
        ? {
            "@metabase/embedding-sdk-react": path.resolve(
              __dirname,
              "../../resources/embedding-sdk/dist/main.bundle.js",
            ),
          }
        : null),
    },
  },
  entry: [path.join(__dirname, "src", "index.js")],
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(tsx?|jsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
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

function resolveEmbeddingSdkPackage() {
  let isEmbeddingSdkPackageInstalled = false;
  let embeddingSdkVersion;

  try {
    embeddingSdkVersion =
      require("@metabase/embedding-sdk-react/package.json").version;
    isEmbeddingSdkPackageInstalled = true;
  } catch (err) {
    const sdkPackageTemplateJson = fs.readFileSync(
      path.resolve(
        "../../enterprise/frontend/src/embedding-sdk/package.template.json",
      ),
      "utf-8",
    );
    const sdkPackageTemplateJsonContent = JSON.parse(sdkPackageTemplateJson);
    embeddingSdkVersion = JSON.stringify(sdkPackageTemplateJsonContent.version);
  }

  return {
    isEmbeddingSdkPackageInstalled,
    embeddingSdkVersion,
  };
}
