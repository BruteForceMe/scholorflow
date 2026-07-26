import React from 'react';
import { useApp } from '../context/AppContext';
import { generateStudySchedule, calculateTaskPriority } from '../utils/mlUtils';
import { FiClock, FiCalendar, FiZap } from 'react-icons/fi';

export default function SchedulePage() {
  const { state } = useApp();
  const schedule = generateStudySchedule(state.tasks);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Smart Study Schedule 🗓️</h1>
        <p>AI-powered schedule based on your task priorities and deadlines</p>
      </div>

      {/* How it works */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 24px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--accent-secondary)' }}>🧠 How it works:</strong>{' '}
          Tasks are ranked by a <strong>Smart Score</strong> combining deadline urgency, priority level, and incomplete subtasks.
          The top tasks are assigned to optimal time slots throughout your day.
        </p>
      </div>

      {schedule.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <div className="empty-state-title">No active tasks to schedule</div>
          <div className="empty-state-desc">Create some tasks first, and we'll generate a smart study plan for you!</div>
        </div>
      ) : (
        <>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCalendar /> Today's Recommended Schedule
          </h3>

          <div className="schedule-list">
            {schedule.map((item, i) => (
              <div key={i} className="schedule-item" style={{ animationDelay: `${i * 0.08}s` }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>

                <div className="schedule-time">
                  <FiClock size={13} style={{ marginRight: 4 }} />
                  {item.timeSlot}
                </div>

                <div className="schedule-task-name" style={{ flex: 1 }}>
                  {item.task}
                </div>

                <span className={`badge badge-${item.priority}`}>{item.priority}</span>

                <div className="schedule-score">
                  <FiZap size={11} style={{ marginRight: 3 }} />
                  {item.smartScore}
                </div>

                {item.deadline && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    Due {new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Score Legend */}
          <div className="card" style={{ marginTop: 24, padding: '16px 24px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10 }}>📐 Smart Score Breakdown</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div><strong style={{ color: 'var(--danger)' }}>Deadline urgency:</strong> Up to 50 points</div>
              <div><strong style={{ color: 'var(--warning)' }}>Priority level:</strong> Up to 30 points</div>
              <div><strong style={{ color: 'var(--info)' }}>Pending subtasks:</strong> 5 points each</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
