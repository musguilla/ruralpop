const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'ruralpop-mobile/app/anuncio/[id].tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Ad Unit \*\/\}\s*<View className="mt-4 mb-4">\s*<View className="w-full items-center justify-center bg-gray-50\/50 mb-6 rounded-xl overflow-hidden">\s*<RectangularBanner \/>\s*<\/View>\s*<\/View>/;

const replacement = `{/* Thin Banner Ad */}
                    <View className="w-full mb-6">
                        <RectangularBanner />
                    </View>`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);

const bannerFile = path.join(__dirname, 'ruralpop-mobile/src/components/ui/RectangularBanner.tsx');
let bannerContent = fs.readFileSync(bannerFile, 'utf8');
bannerContent = bannerContent.replace(
    /className="items-center justify-center py-4 w-full bg-surface-muted" style=\{\{ minHeight: 60 \}\}/,
    `className="items-center justify-center w-full my-2"`
);
// change to BANNER size to ensure it's "muy poco alto"
bannerContent = bannerContent.replace(
    /size=\{BannerAdSize\.ANCHORED_ADAPTIVE_BANNER\}/,
    `size={BannerAdSize.BANNER}`
);
fs.writeFileSync(bannerFile, bannerContent);

