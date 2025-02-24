const webpack = require('webpack')
const config = require('@salesforce/pwa-kit-dev/configs/webpack/config')
const {CLIENT} = require('@salesforce/pwa-kit-dev/configs/webpack/config-names')
const clientConfig = config.find((cnf) => cnf.name === CLIENT)
if (process.env.NODE_ENV === 'production') {
    clientConfig.plugins.push(
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map[query]',
            append: `\n\n//# sourceMappingURL=http://localhost:8080/[url]`
        })
    )
}

module.exports = config
