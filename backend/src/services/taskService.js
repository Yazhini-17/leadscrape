const { ScrapingTask } = require('../models');

async function generateTaskId() {
  const lastTask = await ScrapingTask.findOne({
    order: [['id', 'DESC']],
  });
  const nextNum = lastTask && lastTask.id ? lastTask.id + 1 : 1;
  const padded = String(nextNum).padStart(6, '0');
  return `TASK-${padded}`;
}

async function updateTaskStatus(taskDbId, status, extraFields = {}) {
  const updateData = { status, ...extraFields };
  if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status) && !updateData.completed_at) {
    updateData.completed_at = new Date();
  }
  await ScrapingTask.update(updateData, {
    where: { id: taskDbId },
  });
}

async function incrementTaskCounter(taskDbId, field, amount = 1) {
  const task = await ScrapingTask.findByPk(taskDbId);
  if (task) {
    const current = task[field] || 0;
    task[field] = current + amount;
    await task.save();
  }
}

module.exports = {
  generateTaskId,
  updateTaskStatus,
  incrementTaskCounter,
};
