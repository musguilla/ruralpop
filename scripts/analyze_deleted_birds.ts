import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  console.log("Fetching listings related to birds/agapornis...");
  
  // Try to find deleted listings or listings matching these terms
  const { data: listings, error } = await supabase
    .from('listings')
    .select('title, description, status')
    .or('title.ilike.%agaporni%,title.ilike.%papiller%,description.ilike.%agaporni%,description.ilike.%papiller%,title.ilike.%ninf%,title.ilike.%periquit%,title.ilike.%lor%');

  if (error) {
    console.error("Error fetching listings:", error);
    return;
  }

  console.log(`Found ${listings.length} listings related to these keywords.`);

  const wordsCount: Record<string, number> = {};
  
  const stopwords = new Set(["de", "a", "en", "y", "el", "la", "los", "las", "un", "una", "unos", "unas", "con", "por", "para", "sin", "sobre", "entre", "se", "o", "u", "del", "al", "que", "es", "son", "muy", "no", "si", "como", "pero", "más", "mas", "ya", "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas", "mi", "tu", "su", "mis", "tus", "sus"]);

  listings.forEach(listing => {
    const text = `${listing.title} ${listing.description}`.toLowerCase();
    const words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").split(/\s+/);
    
    words.forEach(word => {
      if (word.length > 2 && !stopwords.has(word)) {
        wordsCount[word] = (wordsCount[word] || 0) + 1;
      }
    });
  });

  const sortedWords = Object.entries(wordsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  console.log("\nMost common words:");
  sortedWords.forEach(([word, count]) => {
    console.log(`${word}: ${count}`);
  });

  console.log("\nChecking how many of these are marked as 'deleted':");
  const deletedCount = listings.filter(l => l.status === 'deleted').length;
  console.log(`Deleted: ${deletedCount}`);
  console.log(`Other statuses: ${listings.length - deletedCount}`);
}

run();
