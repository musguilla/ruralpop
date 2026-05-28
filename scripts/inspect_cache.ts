import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    const { data: fileData, error: downloadError } = await supabaseAdmin
        .storage
        .from('wpublic')
        .download('admin-insights-cache.json');

    if (downloadError) {
        console.error("Download Error:", downloadError);
        return;
    }

    const text = await fileData.text();
    const insightsData = JSON.parse(text);
    console.log("last_updated:", insightsData.last_updated);
    console.log("activeUsersTodayCount:", insightsData.activeUsersTodayCount);
    console.log("topConnectedUsers:", JSON.stringify(insightsData.topConnectedUsers, null, 2));
}

run();
