let Queue = null;
try {
  // Bull is optional for environments that don't want Redis/queue
  Queue = require('bull');
} catch (err) {
  console.warn('Optional dependency `bull` not installed - email queue disabled');
}

const { getRedis } = require('../utils/redisClient').default;

let emailQueue = null;

function getQueue() {
  if (!Queue) return null;
  if (emailQueue) return emailQueue;
  const redis = process.env.REDIS_URL || process.env.REDIS || null;
  if (!redis) return null;
  emailQueue = new Queue('emailQueue', redis);
  return emailQueue;
}

async function enqueueEmail(taskName, payload) {
  if (!Queue) return null;
  const q = getQueue();
  if (!q) {
    // Redis not configured or queue not available; caller should fallback to direct send
    return null;
  }
  return q.add({ taskName, payload }, { attempts: 5, backoff: { type: 'exponential', delay: 60000 } });
}

module.exports = { getQueue, enqueueEmail };
