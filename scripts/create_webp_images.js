const imagemin = require('imagemin-keep-folder');
const imageminWebp = require('imagemin-webp');

(async () => {
  const webpFiles = await imagemin(['src/images/**/*.{jpg,png}'], {
    use: [imageminWebp({ quality: 50 })],
    replaceOutputDir: output => {
      return output.replace(/images\//, '../dist/images/');
    },
  });
  console.log(webpFiles);
})();
