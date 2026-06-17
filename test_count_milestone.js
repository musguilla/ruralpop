require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';

async function fetchAllFavorites() {
  let allFavs = [];
  let start = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('favorites')
      .select('listing_id')
      .range(start, start + limit - 1);
      
    if (error) throw error;
    if (data.length > 0) {
      allFavs.push(...data);
      start += limit;
    } else {
      hasMore = false;
    }
  }
  return allFavs;
}

async function run() {
  const favs = await fetchAllFavorites();
  console.log("Total favorites rows fetched:", favs.length);

  const counts = {};
  for (let f of favs) {
    counts[f.listing_id] = (counts[f.listing_id] || 0) + 1;
  }

  const eligibleListingIds = Object.keys(counts).filter(id => counts[id] >= 10);
  console.log(`Found ${eligibleListingIds.length} listings with >= 10 favorites.`);

  if (eligibleListingIds.length === 0) return;

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, 
      title, 
      image_urls, 
      tags,
      users ( email )
    `)
    .in('id', eligibleListingIds);
    
  console.log(`Of those, ${listings.length} were found in the database.`);
  
  let sentCount = 0;
  
  for (let listing of listings) {
    // Only send for 10-19 range or 20+ range. We'll do exactly 10 milestone retroactively
    const favCount = counts[listing.id];
    let milestoneToTrigger = 0;
    
    if (favCount >= 10 && favCount < 20) milestoneToTrigger = 10;
    else if (favCount >= 20) milestoneToTrigger = 20;
    
    if (milestoneToTrigger === 0) continue;
    
    const milestoneTag = `_milestone_${milestoneToTrigger}_sent`;
    const currentTags = listing.tags || [];
    const sellerEmail = listing.users?.email;
    
    if (!currentTags.includes(milestoneTag) && sellerEmail) {
      console.log(`Sending ${milestoneToTrigger} milestone to ${sellerEmail} for listing ${listing.id}`);
      
      const imageUrl = listing.image_urls && listing.image_urls.length > 0 ? listing.image_urls[0] : 'https://www.ruralpop.com/apple-icon.png';
      const actionUrl = `${SITE_URL}/dashboard/destacar/${listing.id}`;
      
      let subject = milestoneToTrigger === 10 ? '¡Tu anuncio está triunfando! 🎉' : '¡Tu anuncio lo está reventando! 🚀';
      let bodyText = milestoneToTrigger === 10 
        ? `¡Enhorabuena! Muchos usuarios están guardando tu anuncio como favorito (ya ha alcanzado los <strong>10 likes</strong>). <br/><br/>No pierdas la oportunidad de cerrar la venta hoy mismo. <strong>Destácalo</strong> para que todos estos usuarios y cientos de compradores más lo vean en primera posición.`
        : `¡Espectacular! Tu anuncio acaba de llegar a los <strong>20 likes</strong> de usuarios interesados.<br/><br/>Solo te queda un empujón para acabar de venderlo al mejor precio. <strong>Destácalo</strong> ahora y llega a más de 50.000 agricultores.`;
      let buttonText = milestoneToTrigger === 10 ? 'Destacar mi anuncio ahora' : 'Dar el empujón final y destacar';
      
      const emailHtmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #2F8A43; text-align: center; font-size: 24px; margin-top: 0;">${subject}</h2>
          <p style="text-align: center; font-size: 16px; line-height: 1.6; color: #4b5563;">
            ${bodyText}
          </p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; border: 1px solid #eee;">
            <img src="${imageUrl}" alt="Foto del anuncio" width="150" height="150" style="display: block; margin: 0 auto 15px auto; width: 150px; height: 150px; object-fit: cover; border-radius: 12px;" />
            <h3 style="margin: 0; font-size: 18px; color: #111;">${listing.title}</h3>
            
            <a href="${actionUrl}" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background-color: #2F8A43; color: white; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px;">
              ${buttonText}
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
            El equipo de Ruralpop 🚜
          </p>
        </div>
      `;
      
      try {
        await resend.emails.send({
          from: 'Ruralpop <hola@ruralpop.com>',
          to: [sellerEmail],
          subject: subject,
          html: emailHtmlBody,
        });
        
        // Update tags
        const newTags = [...currentTags, milestoneTag];
        await supabase.from('listings').update({ tags: newTags }).eq('id', listing.id);
        
        sentCount++;
      } catch (err) {
        console.log("Error sending", err);
      }
    }
  }
  console.log(`Finished sending ${sentCount} milestone emails retrospectively.`);
}
run();
