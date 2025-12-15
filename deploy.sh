rm -rf deploy
mkdir deploy
npx esbuild content.js --bundle --outfile=deploy/bundle.js
mkdir deploy/background
cp background/background.js deploy/background/background.js
cp content.css deploy/content.css
mkdir deploy/settings
cp settings/settings.html deploy/settings/settings.html
cp settings/popup.js deploy/settings/popup.js
cp settings/popup.html deploy/settings/popup.html
npx esbuild settings/settings.js --bundle --outfile=deploy/settings.bundle.js
cp manifest.json deploy/manifest.json
cp -r icons/ deploy/icons/
