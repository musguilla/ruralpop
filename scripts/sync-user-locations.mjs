import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno para Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncUserLocations() {
  console.log("Iniciando sincronización de localizaciones de usuarios...");
  
  // 1. Get users that have null or empty province_id
  const { data: profiles, error: pErr } = await supabase
    .from('users')
    .select('id, province_id, municipality_id')
    .is('province_id', null);

  if (pErr) {
    console.error("Error obteniendo perfiles:", pErr);
    return;
  }

  console.log(`Se encontraron ${profiles.length} perfiles sin provincia asignada.`);

  let updatedCount = 0;

  for (const profile of profiles) {
    // 2. Fetch the most recent listing of this user
    const { data: listings, error: lErr } = await supabase
      .from('listings')
      .select('province_id, municipality_id')
      .eq('user_id', profile.id)
      .not('province_id', 'is', null) // only if it has province_id
      .order('created_at', { ascending: false })
      .limit(1);

    if (lErr) {
      console.error(`Error obteniendo anuncios para el usuario ${profile.id}:`, lErr);
      continue;
    }

    if (listings && listings.length > 0) {
      const { province_id, municipality_id } = listings[0];
      
      console.log(`Actualizando usuario ${profile.id} -> Provincia: ${province_id}, Municipio: ${municipality_id}`);
      
      // 3. Update user profile
      const { error: updErr } = await supabase
        .from('users')
        .update({ province_id, municipality_id })
        .eq('id', profile.id);

      if (updErr) {
        console.error(`Error actualizando perfil ${profile.id}:`, updErr);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`\nSincronización completada. Se actualizaron ${updatedCount} perfiles.`);
}

syncUserLocations();
