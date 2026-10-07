require('dotenv').config({ path: '.env.local' }); const { query } = require('./src/lib/db.js'); query('SELECT slug, title, price FROM courses').then(console.log).catch(console.error);
