const { Pool } = require("pg");
let pool = new Pool({
  connectionString: process.env.DATABASE_URL
  ,ssl: {rejectUnauthorized: false},
});

module.exports = pool;