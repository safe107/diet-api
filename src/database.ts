import Knex from 'knex';
import knexConfig from '../knexfile';

const knex = Knex(knexConfig as any);

export default knex;