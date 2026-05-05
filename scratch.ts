import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase
        .from("escrow_orders")
        .select(`
            *,
            buyer:users!escrow_orders_buyer_id_fkey(email)
        `)
        .limit(1);

    if (error) {
        console.error("Error with specific relation name:", error.message);
        
        // try without relation name
        const { data: d2, error: e2 } = await supabase
            .from("escrow_orders")
            .select(`
                *,
                users!buyer_id(email)
            `)
            .limit(1);
            
        if (e2) {
            console.error("Error with users!buyer_id:", e2.message);
            
            // try just users
             const { data: d3, error: e3 } = await supabase
                .from("escrow_orders")
                .select(`
                    *,
                    buyer:buyer_id(email)
                `)
                .limit(1);
            if(e3) {
                console.error("Error with buyer:buyer_id:", e3.message);
            } else {
                 console.log("Success with buyer:buyer_id:", d3);
            }
        } else {
            console.log("Success with users!buyer_id:", d2);
        }
    } else {
        console.log("Success:", data);
    }
}

test();
