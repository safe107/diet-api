import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import knex from '../database';

export default async function usersRoutes(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    const body = request.body as any;
    const { name, email } = body;
    if (!name || !email) {
      return reply.status(400).send({ message: 'name and email are required' });
    }

    const id = uuidv4();
    await knex('users').insert({ id, name, email });

    return reply.status(201).send({ id });
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const user = await knex('users').where({ id }).first();
    if (!user) return reply.status(404).send({ message: 'User not found' });
    return { user };
  });
}