const fs = require("fs");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

const { isEmbeddingSdkPackageInstalled } = resolveEmbeddingSdkPackage();

module.exports = {
  mode: "development",
  stats: "verbose",
  resolve: {
    alias: {
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
  devtool: false,
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
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
        "./enterprise/frontend/src/embedding-sdk/package.template.json",
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
