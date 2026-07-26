import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useFocus } from '../context/FocusContext';
import { FiCheckCircle, FiClock, FiTrendingUp, FiTarget, FiArrowUpRight, FiArrowDownRight, FiPlay, FiAlertTriangle } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardPage() {
  const { state } = useApp();
  const { focusState } = useFocus();
  const navigate = useNavigate();
  const { tasks, productivityData, currentUser } = state;

  const myTasks = tasks.filter(t => t.assignee === currentUser?.id);
  const todoCount = myTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = myTasks.filter(t => t.status === 'inprogress').length;
  const doneCount = myTasks.filter(t => t.status === 'done').length;

  // Upcoming deadlines
  const upcoming = [...myTasks]
    .filter(t => t.status !== 'done' && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const totalHours = productivityData.reduce((s, d) => s + d.hoursStudied, 0);
  const avgFocus = Math.round(productivityData.reduce((s, d) => s + d.focusScore, 0) / productivityData.length);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>{getGreeting()}, {currentUser?.name?.split(' ')[0]}! 👋</h1>
        <p>Here's an overview of your productivity and tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card purple">
          <div className="stat-icon purple"><FiTarget /></div>
          <div className="stat-value">{myTasks.length}</div>
          <div className="stat-label">Total Tasks</div>
          <div className="stat-change up">
            <FiArrowUpRight size={12} /> Active
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FiCheckCircle /></div>
          <div className="stat-value">{doneCount}</div>
          <div className="stat-label">Completed</div>
          <div className="stat-change up">
            <FiArrowUpRight size={12} /> {myTasks.length > 0 ? Math.round((doneCount / myTasks.length) * 100) : 0}%
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange"><FiClock /></div>
          <div className="stat-value">{totalHours.toFixed(0)}h</div>
          <div className="stat-label">Hours Studied</div>
          <div className="stat-change up">
            <FiArrowUpRight size={12} /> This week
          </div>
        </div>
        <div className="stat-card pink">
          <div className="stat-icon pink"><FiTrendingUp /></div>
          <div className="stat-value">{avgFocus}%</div>
          <div className="stat-label">Avg Focus Score</div>
          <div className={`stat-change ${avgFocus >= 70 ? 'up' : 'down'}`}>
            {avgFocus >= 70 ? <FiArrowUpRight size={12} /> : <FiArrowDownRight size={12} />}
            {avgFocus >= 70 ? 'Doing well' : 'Needs improvement'}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">📈 Focus Score Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#111c33',
                  border: '1px solid rgba(160,174,199,0.1)',
                  borderRadius: 12,
                  color: '#eef2ff',
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="focusScore"
                stroke="#00b4d8"
                strokeWidth={2}
                fill="url(#focusGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">📊 Tasks Completed Per Day</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#1a2035',
                  border: '1px solid rgba(148,163,184,0.1)',
                  borderRadius: 12,
                  color: '#f1f5f9',
                  fontSize: 13,
                }}
              />
              <Bar dataKey="tasksCompleted" fill="#00d4ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <div className="chart-card-header">
          <h3 className="chart-card-title">📅 Upcoming Deadlines</h3>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <div className="empty-state-icon">🎉</div>
            <div className="empty-state-title">All caught up!</div>
            <div className="empty-state-desc">No upcoming deadlines. Great job!</div>
          </div>
        ) : (
          <div className="list-view">
            {upcoming.map(task => {
              const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={task.id} className="list-item">
                  <div className={`kanban-dot ${task.status}`} />
                  <div className="list-item-content">
                    <div className="list-item-title">{task.title}</div>
                    <div className="list-item-subtitle">{task.description}</div>
                  </div>
                  <div className="list-item-right">
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span
                      className={`kanban-card-deadline ${daysLeft <= 1 ? 'urgent' : daysLeft <= 3 ? 'soon' : ''}`}
                    >
                      <FiClock size={12} />
                      {daysLeft <= 0 ? 'Overdue!' : `${daysLeft}d left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Focus Mode Widget */}
      <div className="focus-dashboard-widget" style={{ marginTop: 20 }}>
        <div className="focus-widget-header">
          <h3 className="focus-widget-title">
            🎯 Focus Mode
          </h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/focus')}
          >
            <FiPlay size={13} />
            {focusState.isActive ? 'View Session' : 'Start Session'}
          </button>
        </div>

        {focusState.sessionHistory.length > 0 ? (
          <>
            <div className="focus-widget-stats">
              <div className="focus-widget-stat">
                <div className="focus-widget-stat-value">
                  {focusState.sessionHistory.length}
                </div>
                <div className="focus-widget-stat-label">Sessions</div>
              </div>
              <div className="focus-widget-stat">
                <div className="focus-widget-stat-value">
                  {(() => {
                    const total = focusState.sessionHistory.reduce((s, h) => s + h.duration, 0);
                    if (total < 60) return `${total}s`;
                    const hrs = Math.floor(total / 3600);
                    const mins = Math.floor((total % 3600) / 60);
                    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                  })()}
                </div>
                <div className="focus-widget-stat-label">Focus Time</div>
              </div>
              <div className="focus-widget-stat">
                <div className="focus-widget-stat-value">
                  {focusState.sessionHistory.reduce((s, h) => s + h.distractionCount, 0)}
                </div>
                <div className="focus-widget-stat-label">Distractions</div>
              </div>
            </div>

            {/* Recent sessions */}
            <div className="focus-widget-recent">
              {focusState.sessionHistory.slice(0, 3).map(session => (
                <div key={session.id} className="focus-widget-session">
                  <span className="focus-widget-session-name">{session.taskName}</span>
                  <span className="focus-widget-session-meta">
                    <FiClock size={11} />
                    {session.duration < 60 ? `${session.duration}s` : `${Math.floor(session.duration / 60)}m`}
                    {session.distractionCount > 0 && (
                      <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <FiAlertTriangle size={11} /> {session.distractionCount}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No focus sessions yet. Start your first one!
          </div>
        )}
      </div>
    </div>
  );
}
