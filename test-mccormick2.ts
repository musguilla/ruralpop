import { IGNORED_CATALOG_FILES, getTractorFormattedName } from "./src/lib/tractores-data.ts";

const dupX64 = "MC_RP6D_X6.4_Brochure_40p_6725799A1_WEB_ES-2.pdf.inline (1).jpg";
console.log(getTractorFormattedName(dupX64));

const dupX76 = "MC_RPE7-RPE8_X7.6_Brochure_CleverCab_64p_6749394A1_Web_ES (1).pdf.inline.pdf";
console.log(getTractorFormattedName(dupX76));
