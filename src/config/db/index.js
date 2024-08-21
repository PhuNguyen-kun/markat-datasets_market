const {Client} = require('pg');

async function connect() {
    try {
        const client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'markat_db',
            password: 'admin',
            port: 5432,
        });
        await client.connect();
        console.log("Connected successfully");
    } catch (err) {
        console.log('Connect DB fail with error:',err)
    }
}

module.exports = { connect };