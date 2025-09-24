import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import knex from '../database';

function getSessionIdFromHeaders(headers: any) {
  return headers['x-session-id'] || headers['X-Session-Id'] || headers['x_session_id'];
}

export default async function mealsRoutes(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    const sessionId = getSessionIdFromHeaders(request.headers as any);
    if (!sessionId) return reply.status(401).send({ message: 'Missing x-session-id header' });

    const user = await knex('users').where({ id: sessionId }).first();
    if (!user) return reply.status(401).send({ message: 'Invalid session' });

    const body = request.body as any;
    const { name, description, datetime, is_diet } = body;
    if (!name || !datetime || typeof is_diet === 'undefined') {
      return reply.status(400).send({ message: 'name, datetime and is_diet are required' });
    }

    const id = uuidv4();
    await knex('meals').insert({ id, user_id: sessionId, name, description: description || null, datetime: new Date(datetime), is_diet });
    return reply.status(201).send({ id });
  });

  fastify.put('/:id', async (request, reply) => {
    const sessionId = getSessionIdFromHeaders(request.headers as any);
    if (!sessionId) return reply.status(401).send({ message: 'Missing x-session-id header' });

    const { id } = request.params as any;
    const meal = await knex('meals').where({ id }).first();
    if (!meal) return reply.status(404).send({ message: 'Meal not found' });
    if (meal.user_id !== sessionId) return reply.status(403).send({ message: 'Forbidden' });

    const body = request.body as any;
    const { name, description, datetime, is_diet } = body;

    await knex('meals').where({ id }).update({ name, description, datetime: datetime ? new Date(datetime) : meal.datetime, is_diet });
    return reply.status(200).send({ id });
  });

  fastify.delete('/:id', async (request, reply) => {
    const sessionId = getSessionIdFromHeaders(request.headers as any);
    if (!sessionId) return reply.status(401).send({ message: 'Missing x-session-id header' });

    const { id } = request.params as any;
    const meal = await knex('meals').where({ id }).first();
    if (!meal) return reply.status(404).send({ message: 'Meal not found' });
    if (meal.user_id !== sessionId) return reply.status(403).send({ message: 'Forbidden' });

    await knex('meals').where({ id }).del();
    return reply.status(204).send();
  });

  fastify.get('/', async (request, reply) => {
    const sessionId = getSessionIdFromHeaders(request.headers as any);
    if (!sessionId) return reply.status(401).send({ message: 'Missing x-session-id header' });

    const meals = await knex('meals').where({ user_id: sessionId }).orderBy('datetime', 'desc');
    return { meals };
  });

  fastify.get('/:id', async (request, reply) => {
    const sessionId = getSessionIdFromHeaders(request.headers as any);
    if (!sessionId) return reply.status(401).send({ message: 'Missing x-session-id header' });

    const { id } = request.params as any;
    const meal = await knex('meals').where({ id }).first();
    if (!meal) return reply.status(404).send({ message: 'Meal not found' });
    if (meal.user_id !== sessionId) return reply.status(403).send({ message: 'Forbidden' });

    return { meal };
  });

  fastify.get('/metrics', async (request, reply) => {
    const sessionId = getSessionIdFromHeaders(request.headers as any);
    if (!sessionId) return reply.status(401).send({ message: 'Missing x-session-id header' });

    const total = await knex('meals').where({ user_id: sessionId }).count('* as count').first();
    const inside = await knex('meals').where({ user_id: sessionId, is_diet: 1 }).count('* as count').first();
    const outside = await knex('meals').where({ user_id: sessionId, is_diet: 0 }).count('* as count').first();

    const meals = await knex('meals').where({ user_id: sessionId }).orderBy('datetime', 'asc');
    let best = 0;
    let cur = 0;
    for (const m of meals) {
      if (m.is_diet || m.is_diet === 1) {
        cur += 1;
        if (cur > best) best = cur;
      } else {
        cur = 0;
      }
    }

    return {
      total: Number(total?.count || 0),
      inside: Number(inside?.count || 0),
      outside: Number(outside?.count || 0),
      best_sequence: best
    };
  });
}