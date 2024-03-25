/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;

// If we're running in test "mode", use our test db
// Make sure to create both databases!
if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
}

let db = new Client({
  connectionString: DB_URI
});

db.connect();

// Expose a query method to execute SQL queries
async function query(text, params) {
  const result = await db.query(text, params);
  return result;
}

module.exports = {
    query
};

//module.exports = db;
