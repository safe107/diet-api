import type { Knex } from 'knex';

const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite'
  },
  useNullAsDefault: true,
  migrations: {
    directory: './src/migrations'
  }
};

export default config;