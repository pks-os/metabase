const webpackConfig = require("./webpack.config.js");

module.exports = {
  component: {
    viewportHeight: 800,
    viewportWidth: 1280,
    video: false,

    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig: webpackConfig,
    },
  },
};
