require('dotenv').config({ path: '.env.local' });
console.log("Has R2_ACCESS_KEY_ID?", !!process.env.R2_ACCESS_KEY_ID);
console.log("Has R2_SECRET_ACCESS_KEY?", !!process.env.R2_SECRET_ACCESS_KEY);
console.log("Has R2_ACCOUNT_ID?", !!process.env.R2_ACCOUNT_ID);
console.log("Has R2_BUCKET_NAME?", !!process.env.R2_BUCKET_NAME);
