function deadlineScore(daysLeft) {
  if (daysLeft <= 0) return 200
  if (daysLeft <= 3) return 180 - daysLeft * 5
  if (daysLeft <= 7) return 150 - (daysLeft - 3) * 10
  if (daysLeft <= 14) return 100 - (daysLeft - 7) * 5
  return Math.max(0, 60 - (daysLeft - 14) * 2)
}

function difficultyScore(difficulty) {
  return (difficulty / 10) * 100
}

function stalenessBonus(createdAt) {
  const weeks = (Date.now() - new Date(createdAt).getTime()) / (7 * 24 * 3600 * 1000)
  return Math.min(30, weeks * 5)
}

export function computePriority(task, weights = { deadline: 1.0, difficulty: 0.6, staleness: 0.4 }) {
  const daysLeft = (new Date(task.ddl).getTime() - Date.now()) / (24 * 3600 * 1000)
  const dScore = deadlineScore(daysLeft)
  const fScore = difficultyScore(task.difficulty)
  const sBonus = stalenessBonus(task.createdAt)
  return dScore * weights.deadline + fScore * weights.difficulty + sBonus * weights.staleness
}

export function sortTasks(tasks, weights) {
  return [...tasks].sort((a, b) => computePriority(b, weights) - computePriority(a, weights))
}
