/**
 * ML / Smart Utilities for ScholorFlow
 * These simulate smart features — in production you'd use a real ML backend
 */

/**
 * Smart Task Prioritization
 * Scores tasks based on deadline proximity, importance, and effort
 */
export function calculateTaskPriority(task) {
  const now = new Date();
  const deadline = new Date(task.deadline);
  const daysLeft = Math.max(0, (deadline - now) / (1000 * 60 * 60 * 24));

  let score = 0;

  // Urgency: closer deadline = higher score
  if (daysLeft <= 1) score += 50;
  else if (daysLeft <= 3) score += 35;
  else if (daysLeft <= 7) score += 20;
  else score += 5;

  // Priority weight
  if (task.priority === 'high') score += 30;
  else if (task.priority === 'medium') score += 15;
  else score += 5;

  // Incomplete subtasks boost urgency
  if (task.subtasks && task.subtasks.length > 0) {
    const incomplete = task.subtasks.filter(s => !s.done).length;
    score += incomplete * 5;
  }

  // Penalize already done tasks
  if (task.status === 'done') score = 0;

  return Math.min(100, score);
}

/**
 * Generate a personalized study schedule suggestion
 */
export function generateStudySchedule(tasks) {
  const activeTasks = tasks
    .filter(t => t.status !== 'done')
    .map(t => ({ ...t, smartScore: calculateTaskPriority(t) }))
    .sort((a, b) => b.smartScore - a.smartScore);

  const schedule = [];
  const timeSlots = [
    { label: 'Morning (8-10 AM)', hours: 2 },
    { label: 'Late Morning (10-12 PM)', hours: 2 },
    { label: 'Afternoon (2-4 PM)', hours: 2 },
    { label: 'Evening (5-7 PM)', hours: 2 },
    { label: 'Night (8-10 PM)', hours: 2 },
  ];

  activeTasks.forEach((task, i) => {
    if (i < timeSlots.length) {
      schedule.push({
        task: task.title,
        timeSlot: timeSlots[i].label,
        priority: task.priority,
        smartScore: task.smartScore,
        deadline: task.deadline,
      });
    }
  });

  return schedule;
}

/**
 * Productivity Analytics — derive insights from data
 */
export function getProductivityInsights(productivityData) {
  const avgFocus = productivityData.reduce((sum, d) => sum + d.focusScore, 0) / productivityData.length;
  const totalTasks = productivityData.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const totalHours = productivityData.reduce((sum, d) => sum + d.hoursStudied, 0);
  const bestDay = [...productivityData].sort((a, b) => b.focusScore - a.focusScore)[0];
  const worstDay = [...productivityData].sort((a, b) => a.focusScore - b.focusScore)[0];

  return {
    averageFocusScore: Math.round(avgFocus),
    totalTasksCompleted: totalTasks,
    totalHoursStudied: totalHours.toFixed(1),
    bestDay: bestDay.day,
    bestDayScore: bestDay.focusScore,
    worstDay: worstDay.day,
    worstDayScore: worstDay.focusScore,
    recommendation: avgFocus >= 75
      ? '🎯 Great focus! Keep your current routine.'
      : avgFocus >= 50
        ? '💡 Try the Pomodoro technique to improve focus on low days.'
        : '⚠️ Consider shorter study sessions with more breaks.',
    focusPattern: avgFocus >= 70 ? 'consistent' : avgFocus >= 50 ? 'moderate' : 'scattered',
  };
}

/**
 * Focus Pattern Insights
 */
export function getFocusPatternInsights(productivityData) {
  const highFocusDays = productivityData.filter(d => d.focusScore >= 80);
  const lowFocusDays = productivityData.filter(d => d.focusScore < 50);

  return {
    highFocusDays: highFocusDays.map(d => d.day),
    lowFocusDays: lowFocusDays.map(d => d.day),
    peakProductivityTime: 'Afternoon (2-4 PM)',
    suggestedBreaks: '25 min work / 5 min break',
    weeklyTrend: highFocusDays.length >= 4 ? 'improving' : highFocusDays.length >= 2 ? 'stable' : 'declining',
  };
}
