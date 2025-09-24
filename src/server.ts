import Fastify from 'fastify';
import usersRoutes from './routes/users';
import mealsRoutes from './routes/meals';

const fastify = Fastify({ logger: true });

fastify.register(usersRoutes, { prefix: '/users' });
fastify.register(mealsRoutes, { prefix: '/meals' });

const start = async () => {
  try {
    await fastify.listen({ port: 3333, host: '0.0.0.0' });
    console.log('Server running');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();