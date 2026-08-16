require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    // Find the listing
    const { data: listings, error } = await supabase
        .from('listings')
        .select('id, title, created_at, is_featured')
        .ilike('title', '%ANTICOCIDICO%');
    
    if (error) {
        console.error("Error finding listing:", error);
        return;
    }
    
    if (listings.length === 0) {
        console.log("No listing found with title matching ANTICOCIDICO");
        return;
    }
    
    const targetListing = listings[0];
    console.log("Found target listing:", targetListing.title, "ID:", targetListing.id);
    
    // Find all featured listings to see the timestamps
    const { data: featured } = await supabase
        .from('listings')
        .select('id, title, created_at')
        .eq('is_featured', true)
        .order('created_at', { ascending: true }); // Oldest first
        
    console.log(`Found ${featured.length} featured listings.`);
    
    if (featured.length > 0) {
        console.log("Oldest featured created_at:", featured[0].created_at);
        console.log("Newest featured created_at:", featured[featured.length - 1].created_at);
        
        // We want this one to be the LAST in the UI (ordered by created_at DESC). 
        // So to be last, it needs the OLDEST created_at.
        
        const oldestDate = new Date(featured[0].created_at);
        const newDate = new Date(oldestDate.getTime() - 1000); // 1 second older
        
        console.log("Setting new created_at to:", newDate.toISOString());
        
        const { error: updateError } = await supabase
            .from('listings')
            .update({ created_at: newDate.toISOString() })
            .eq('id', targetListing.id);
            
        if (updateError) {
            console.error("Failed to update:", updateError);
        } else {
            console.log("Successfully moved the featured listing to the last position!");
        }
    }
}

main();
