let mix = require('laravel-mix');

mix.setPublicPath('./')
  .copy('manifest.json', 'dist')
  .copy('public/*', 'dist')
  .sass('src/assets/scss/index.scss', 'dist/css')
  .js('src/content-scripts/content-scripts.js', 'dist/content-scripts')
  .js('src/app.js', 'dist/js').vue()
  .options({
    processCssUrls: false
  })