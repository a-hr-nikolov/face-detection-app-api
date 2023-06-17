const knexOptions = {
  client: 'pg',
  connection: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: 'postgres',
    password: process.env.PGPASS,
    database: process.env.PGDB,
  },
};

module.exports = { knexOptions };
