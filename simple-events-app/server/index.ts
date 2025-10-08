import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/', async (request, reply) => {
  return { message: 'Welcome to Fastify!' };
});

fastify.get('/api/hello', async (request, reply) => {
  return { message: 'Hello from Fastify!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    console.log('Fastify server running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();