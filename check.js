require('dotenv').config({ path: '.env.local' });
const { query } = require('./src/lib/db.js');
query("SELECT id, status FROM orders WHERE id = 'SEAT-1791408865652-R2ZJC'").then(console.log).catch(console.error);
