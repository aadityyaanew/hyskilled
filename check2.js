require('dotenv').config({ path: '.env.local' });
const { query } = require('./src/lib/db.js');
query("DESCRIBE order_items").then(console.log).catch(console.error);
