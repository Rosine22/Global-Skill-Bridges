import Redis from 'ioredis';

let client = null;

function getRedis() {
  if (client) return client;
  const url = process.env.REDIS_URL || process.env.REDIS || null;
  if (!url) return null;
  client = new Redis(url);
  client.on('error', (err) => console.error('Redis error:', err));
  return client;
}

export default { getRedis };
