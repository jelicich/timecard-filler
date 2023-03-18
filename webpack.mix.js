let mix = require('laravel-mix');

mix.webpackConfig({
  // devtool: 'cheap-module-source-map'
  // devtool: 'source-map'
  devtool: 'inline-source-map',
});

mix.sourceMaps();

mix.setPublicPath('./')
  .copy('manifest.json', 'dist')
  .copy('public/*', 'dist')
  .sass('src/assets/scss/index.scss', 'dist/css')
  .js('src/content-scripts/content-scripts.js', 'dist/content-scripts')
  .js('src/background-scripts/background-scripts.js', 'dist/background-scripts')
  .js('src/web-accessible-resources/web-accessible-resources.js', 'dist/web-accessible-resources')
  .js('src/vue-apps/popup/app.js', 'dist/js/popup').vue()
  .js('src/vue-apps/options-page/app.js', 'dist/js/options-page').vue()
  .options({
    processCssUrls: false
  })