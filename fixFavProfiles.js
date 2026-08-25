const fs = require('fs');
const path = require('path');

const favFile = path.join(__dirname, 'ruralpop-mobile/app/(tabs)/favorites.tsx');
let favContent = fs.readFileSync(favFile, 'utf8');

// Fix column name and tenant filter
favContent = favContent.replace(
    /const \{ data: userListings \} = await supabase\.from\('listings'\)\.select\('id, user_id, images'\)\.in\('user_id', favoriteProfiles\)\.eq\('status', 'active'\);/,
    `const { data: userListings } = await supabase.from('listings').select('id, user_id, image_urls').in('user_id', favoriteProfiles).eq('status', 'active').or(getDefaultTenantFilterString());`
);

// Fix layout: 2 columns to 1 column
favContent = favContent.replace(
    /numColumns=\{2\}\s*columnWrapperStyle=\{\{ paddingHorizontal: 16, justifyContent: 'space-between' \}\}\s*renderItem=\{[\s\S]*?View style=\{\{ width: '48\.5%' \}\}>/,
    `numColumns={1}
                        renderItem={({ item }) => (
                            <View style={{ width: '100%', paddingHorizontal: 16 }}>`
);

fs.writeFileSync(favFile, favContent);

const cardFile = path.join(__dirname, 'ruralpop-mobile/src/components/ui/FavoriteProfileCard.tsx');
let cardContent = fs.readFileSync(cardFile, 'utf8');

// Fix image field mapping
cardContent = cardContent.replace(
    /const images = listings\.map\(l => l\.images\?\.\[0\]\)\.filter\(Boolean\);/,
    `const images = listings.map(l => l.image_urls?.[0]).filter(Boolean);`
);

// Fix card height
cardContent = cardContent.replace(
    /className="h-32 bg-gray-100 flex-row flex-wrap"/,
    `className="h-48 bg-gray-100 flex-row flex-wrap"`
);

fs.writeFileSync(cardFile, cardContent);
