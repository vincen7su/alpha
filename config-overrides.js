const { ProvidePlugin } = require('webpack')
const path = require('path')

module.exports = function (config, env) {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(m?js|ts)$/,
          enforce: 'pre',
          use: ['source-map-loader']
        }
      ]
    },
    plugins: [
      ...config.plugins,
      new ProvidePlugin({
        process: 'process/browser'
      })
    ],
    resolve: {
      ...config.resolve,
      alias: {
        '@': path.resolve(__dirname, 'src')
      },
      fallback: {
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
        fs: false,
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify')
      }
    },
    ignoreWarnings: [/Failed to parse source map/]
  }
}
