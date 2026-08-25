const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'ruralpop-mobile/app/(tabs)/search.tsx');
let content = fs.readFileSync(file, 'utf8');

// The state injection failed because the regex was too specific. 
// Let's find: `export default function SearchScreen() {`
content = content.replace(
    /export default function SearchScreen\(\) \{/,
    `export default function SearchScreen() {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { addSearch } = useRecentSearches();`
);

fs.writeFileSync(file, content);
