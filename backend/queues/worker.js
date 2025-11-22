const { getQueue } = require('./emailQueue');
const EmailService = require('../services/emailService');

async function startWorker() {
  const q = getQueue();
  if (!q) {
    console.log('Email queue not configured (no REDIS_URL) — worker will not start');
    return;
  }

  const emailService = new EmailService();

  q.process(async (job) => {
    const { taskName, payload } = job.data || {};
    if (!taskName) throw new Error('No taskName provided to email worker');

    // Map task names to emailService methods
    if (typeof emailService[taskName] === 'function') {
      return emailService[taskName](...Object.values(payload || {}));
    }

    throw new Error(`Unknown email task: ${taskName}`);
  });

  q.on('completed', (job) => {
    console.log('Email job completed', job.id);
  });

  q.on('failed', (job, err) => {
    console.error('Email job failed', job.id, err);
  });
}

module.exports = { startWorker };
