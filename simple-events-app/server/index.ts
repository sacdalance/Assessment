import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Client } from 'pg';

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, {
  origin: ['http://localhost:5173'],
  credentials: true
});

// PostgreSQL client
const client = new Client({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'events_db',
  password: process.env.PGPASSWORD || 'your_password',
  port: parseInt(process.env.PGPORT || '5432'),
});

client.connect().catch(console.error);

// Routes
fastify.get('/', async () => {
  return { message: 'Events API is running!', timestamp: new Date().toISOString() };
});

fastify.get('/api/events', async (request, reply) => {
  try {
    const res = await client.query('SELECT * FROM events_entries ORDER BY created_at DESC');
    return res.rows;
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to fetch events' });
  }
});

fastify.post('/api/events', async (request, reply) => {
  try {
    const { title, description, lat, lng } = request.body as any;
    
    // Validate coordinates are in DD format
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return reply.code(400).send({ error: 'Invalid coordinates' });
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return reply.code(400).send({ error: 'Coordinates out of valid range' });
    }
    
    const now = new Date();
    const res = await client.query(
      'INSERT INTO events_entries (title, description, lat, lng, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $5) RETURNING *',
      [title, description || null, latitude, longitude, now]
    );
    
    reply.code(201).send(res.rows[0]);
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to create event' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('🚀 Fastify server running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();