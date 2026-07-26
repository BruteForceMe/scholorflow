import React from 'react';
import { useApp } from '../context/AppContext';
import { useFocus } from '../context/FocusContext';
import { getProductivityInsights, getFocusPatternInsights } from '../utils/mlUtils';
import { getPhysicalDistractionStats, clearPhysicalDistractionLogs } from '../utils/webcamDetection';
import {
  FiSun, FiMoon, FiTrendingUp, FiTrendingDown, FiCoffee, FiActivity,
  FiCamera, FiUser, FiSmartphone, FiTrash2,
} from 'react-icons/fi';

export default function InsightsPage() {
  const { state } = useApp();
  const { focusState } = useFocus();
  const { productivityData } = state;
  const insights = getProductivityInsights(productivityData);
  const focusInsights = getFocusPatternInsights(productivityData);
  const pdStats = getPhysicalDistractionStats();

  const trendIcon = focusInsights.weeklyTrend === 'improving' ? <FiTrendingUp /> : focusInsights.weeklyTrend === 'stable' ? <FiActivity /> : <FiTrendingDown />;
  const trendColor = focusInsights.weeklyTrend === 'improving' ? 'var(--success)' : focusInsights.weeklyTrend === 'stable' ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Focus Insights ⚡</h1>
        <p>Understand your focus patterns and maximize your study efficiency</p>
      </div>

      {/* Focus Pattern */}
      <div className="card" style={{ marginBottom: 24, padding: '24px 28px', background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(192,132,252,0.06) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: '2rem' }}>🧠</div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Focus Pattern: <span style={{ color: 'var(--accent-secondary)', textTransform: 'capitalize' }}>{insights.focusPattern}</span></h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{insights.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-card-icon">🎯</div>
          <div className="insight-card-value">{insights.averageFocusScore}%</div>
          <div className="insight-card-label">Average Focus Score</div>
        </div>

        <div className="insight-card">
          <div className="insight-card-icon">🏆</div>
          <div className="insight-card-value">{insights.bestDay}</div>
          <div className="insight-card-label">Best Day ({insights.bestDayScore}% focus)</div>
        </div>

        <div className="insight-card">
          <div className="insight-card-icon">⚠️</div>
          <div className="insight-card-value">{insights.worstDay}</div>
          <div className="insight-card-label">Weakest Day ({insights.worstDayScore}% focus)</div>
        </div>

        <div className="insight-card">
          <div className="insight-card-icon" style={{ color: trendColor }}>{trendIcon}</div>
          <div className="insight-card-value" style={{ textTransform: 'capitalize' }}>{focusInsights.weeklyTrend}</div>
          <div className="insight-card-label">Weekly Trend</div>
        </div>
      </div>

      {/* Physical Distraction Analytics */}
      <div className="physical-distraction-card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCamera style={{ color: 'var(--accent-secondary)' }} /> Physical Distraction Tracking
          </h3>
          {pdStats.totalEvents > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { clearPhysicalDistractionLogs(); window.location.reload(); }}
              style={{ color: 'var(--danger)' }}
            >
              <FiTrash2 size={13} /> Clear Logs
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Webcam-detected distractions during focus sessions — powered by TensorFlow.js COCO-SSD.
        </p>

        {/* Stats */}
        <div className="pd-stats-grid">
          <div className="pd-stat">
            <div className="pd-stat-value total">{pdStats.totalEvents}</div>
            <div className="pd-stat-label">Total Events</div>
          </div>
          <div className="pd-stat">
            <div className="pd-stat-value person">{pdStats.noPersonCount}</div>
            <div className="pd-stat-label">Person Left Desk</div>
          </div>
          <div className="pd-stat">
            <div className="pd-stat-value phone">{pdStats.phoneCount}</div>
            <div className="pd-stat-label">Phone Detected</div>
          </div>
        </div>

        {/* Recent Log */}
        {pdStats.recentLogs.length > 0 ? (
          <>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 10 }}>Recent Events</h4>
            <div className="pd-log-list">
              {pdStats.recentLogs.map(log => (
                <div key={log.id} className="pd-log-item">
                  <div className={`pd-log-icon ${log.type === 'no_person' ? 'person' : 'phone'}`}>
                    {log.type === 'no_person' ? <FiUser size={14} /> : <FiSmartphone size={14} />}
                  </div>
                  <div className="pd-log-info">
                    <div className="pd-log-label">{log.label}</div>
                    <div className="pd-log-time">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="pd-log-duration">{log.durationSeconds}s</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            📷 No physical distraction events recorded yet. Enable webcam monitoring during focus sessions.
          </div>
        )}

        {/* Session-level webcam distractions from FocusContext */}
        {focusState.sessionHistory.some(s => s.physicalDistractionCount > 0) && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 10 }}>Sessions with Physical Distractions</h4>
            <div className="pd-log-list">
              {focusState.sessionHistory
                .filter(s => s.physicalDistractionCount > 0)
                .slice(0, 10)
                .map(session => (
                  <div key={session.id} className="pd-log-item">
                    <div className="pd-log-icon person">
                      <FiCamera size={14} />
                    </div>
                    <div className="pd-log-info">
                      <div className="pd-log-label">{session.taskName}</div>
                      <div className="pd-log-time">
                        {new Date(session.date).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="pd-log-duration">
                      {session.physicalDistractionCount} event{session.physicalDistractionCount > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiSun style={{ color: 'var(--warning)' }} /> Peak Productivity Time
          </h3>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 6, color: 'var(--accent-secondary)' }}>
            {focusInsights.peakProductivityTime}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Based on your patterns, you tend to focus best during this time window. Schedule your most challenging tasks here for maximum output.
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCoffee style={{ color: 'var(--success)' }} /> Recommended Break Pattern
          </h3>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 6, color: 'var(--accent-secondary)' }}>
            {focusInsights.suggestedBreaks}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The Pomodoro technique with these intervals has been shown to improve focus by up to 25%. Use short breaks for stretching or hydration.
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--success)' }}>✅</span> High Focus Days
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {focusInsights.highFocusDays.map(day => (
              <span key={day} className="badge badge-done" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                {day}
              </span>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Days where your focus score exceeded 80%. Keep reinforcing these habits!
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--danger)' }}>⚡</span> Low Focus Days
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {focusInsights.lowFocusDays.length > 0 ? (
              focusInsights.lowFocusDays.map(day => (
                <span key={day} className="badge badge-high" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                  {day}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>🎉 No low focus days!</span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Days where your focus dropped below 50%. Consider lighter tasks on these days.
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: 24, padding: '24px 28px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>💡 Pro Tips to Boost Focus</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { emoji: '📱', tip: 'Enable Do Not Disturb during study sessions' },
            { emoji: '🎧', tip: 'Use lo-fi music or white noise for concentration' },
            { emoji: '💧', tip: 'Stay hydrated — aim for 8 glasses per day' },
            { emoji: '🏃', tip: 'Take a 10-minute walk between study blocks' },
            { emoji: '🌙', tip: 'Maintain consistent sleep schedule (7-8h)' },
            { emoji: '📝', tip: 'Start with the hardest task when energy is highest' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
              {item.tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
