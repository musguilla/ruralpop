import { SPECIFIC_TRACTOR_NAMES, getTractorFormattedName, generateTractorFriendlySlug } from "./src/lib/tractores-data.ts";

const files = [
"MC_CP05_X4T_Brochure_2p_6736307A1_HR_ES.pdf.inline.jpg",
"MC_CP05_X4T_Brochure_2p_6736307A1_HR_ES.pdf.inline.pdf",
"MC_RP6D_X6.4_Brochure_40p_6725799A1_WEB_ES-2.pdf.inline (1).jpg",
"MC_RP6D_X6.4_Brochure_40p_6725799A1_WEB_ES-2.pdf.inline (1).pdf",
"MC_RP6D_X6.4_Brochure_40p_6725799A1_WEB_ES-2.pdf.inline.jpg",
"MC_RP6D_X6.4_Brochure_40p_6725799A1_WEB_ES-2.pdf.inline.pdf",
"MC_RPD8_X7SWB_Brochure_48p_6717637A1_web_ES.pdf.inline.jpg",
"MC_RPD8_X7SWB_Brochure_48p_6717637A1_web_ES.pdf.inline.pdf",
"MC_RPE7-RPE8_X7.6_Brochure_CleverCab_64p_6749391A1_web_IT.pdf.inline.jpg",
"MC_RPE7-RPE8_X7.6_Brochure_CleverCab_64p_6749391A1_web_IT.pdf.inline.pdf",
"MC_RPE7-RPE8_X7.6_Brochure_CleverCab_64p_6749394A1_Web_ES (1).pdf.inline.jpg",
"MC_RPE7-RPE8_X7.6_Brochure_CleverCab_64p_6749394A1_Web_ES (1).pdf.inline.pdf",
"MC_RPF2_X8_CleverCab_Brochure_60p_6737482A1_WEB_ES.pdf.inline.jpg",
"MC_RPF2_X8_CleverCab_Brochure_60p_6737482A1_WEB_ES.pdf.inline.pdf",
"MC_RS14_X2_Brochure_32p_6717647A1_WEB_ES.pdf.inline.jpg",
"MC_RS14_X2_Brochure_32p_6717647A1_WEB_ES.pdf.inline.pdf",
"MC_RS2B_X5HC_Brochure_2p_6737445A1_HR_ES-1.pdf.inline.jpg",
"MC_RS2B_X5HC_Brochure_2p_6737445A1_HR_ES-1.pdf.inline.pdf",
"MC_RS2C_X6_Brochure_44p_6736297A1_web_ES.pdf.inline.jpg",
"MC_RS2C_X6_Brochure_44p_6736297A1_web_ES.pdf.inline.pdf",
"MC_RS57-RS2B_X5_Brochure_56p_6717642A2_Web_ES-1.pdf.inline.jpg",
"MC_RS57-RS2B_X5_Brochure_56p_6717642A2_Web_ES-1.pdf.inline.pdf",
"MC_RS57_X5.085_Brochure_2p_6736272A1_HR_ES.pdf.inline.jpg",
"MC_RS57_X5.085_Brochure_2p_6736272A1_HR_ES.pdf.inline.pdf",
];

files.forEach(f => {
    const formattedName = getTractorFormattedName(f);
    if(formattedName === '__IGNORE__') return;
    const slug = generateTractorFriendlySlug(formattedName);
    console.log(`Original: ${f} -> Formatted: ${formattedName} -> Slug: ${slug}`);
});
