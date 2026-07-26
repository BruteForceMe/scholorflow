/**
 * FocusPage — Full focus mode page with session controls,
 * distracting sites manager, and session history.
 */
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useFocus } from '../context/FocusContext';
import WebcamMonitor from '../components/WebcamMonitor';
import {
  FiTarget, FiPlay, FiSquare, FiPlus, FiTrash2, FiClock,
  FiAlertTriangle, FiCheckCircle, FiSettings, FiX, FiGlobe,
  FiTrendingUp, FiZap, FiAward, FiPause, FiEye, FiCamera,
  FiSmartphone, FiUser,
} from 'react-icons/fi';

/**
 * Format seconds to readable time string
 */
function formatDuration(totalSeconds) {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m ${secs}s`;
}

/**
 * Format seconds to MM:SS timer display
 */
function formatTimer(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function FocusPage() {
  const { state } = useApp();
  const { focusState, focusDispatch } = useFocus();
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [newSite, setNewSite] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [threshold, setThreshold] = useState(focusState.thresholdSeconds);

  // Get active (non-done) tasks for task selection
  const activeTasks = state.tasks.filter(
    t => t.status !== 'done' && t.assignee === state.currentUser?.id
  );

  /**
   * Start a new focus session on the selected task
   */
  const handleStartSession = () => {
    const task = state.tasks.find(t => t.id === selectedTaskId);
    if (!task) return;
    focusDispatch({
      type: 'START_SESSION',
      payload: { taskId: task.id, taskName: task.title },
    });
  };

  /**
   * End the current focus session
   */
  const handleEndSession = () => {
    focusDispatch({ type: 'END_SESSION' });
  };

  /**
   * Add a distracting site to the list
   */
  const handleAddSite = (e) => {
    e.preventDefault();
    const site = newSite.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (site) {
      focusDispatch({ type: 'ADD_SITE', payload: site });
      setNewSite('');
    }
  };

  /**
   * Save threshold setting
   */
  const handleSaveThreshold = () => {
    focusDispatch({ type: 'SET_THRESHOLD', payload: Number(threshold) });
    setShowSettings(false);
  };

  // Aggregate session stats
  const totalSessions = focusState.sessionHistory.length;
  const totalFocusTime = focusState.sessionHistory.reduce((s, h) => s + h.duration, 0);
  const totalDistractions = focusState.sessionHistory.reduce((s, h) => s + h.distractionCount, 0);
  const avgDistractions = totalSessions > 0 ? (totalDistractions / totalSessions).toFixed(1) : 0;
  const longestSession = totalSessions > 0
    ? Math.max(...focusState.sessionHistory.map(h => h.duration))
    : 0;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Focus Mode 🎯</h1>
        <p>Deep focus sessions with distraction detection</p>
      </div>

      {/* ===== Active Session View ===== */}
      {focusState.isActive ? (
        <div className="focus-session-active">
          {/* Main timer card */}
          <div className={`focus-timer-card ${focusState.isPaused ? 'paused' : ''}`}>
            <div className={`focus-timer-pulse-ring ${focusState.isPaused ? 'paused' : ''}`} />
            <div className="focus-timer-inner">
              {/* Paused badge */}
              {focusState.isPaused && (
                <div className="focus-paused-badge">
                  <FiPause size={12} /> SESSION PAUSED
                </div>
              )}
              <div className="focus-timer-label">
                {focusState.isPaused ? 'PAUSED' : 'FOCUS SESSION'}
              </div>
              <div className={`focus-timer-display ${focusState.isPaused ? 'paused' : ''}`}>
                {formatTimer(focusState.totalFocusDuration)}
              </div>
              <div className="focus-timer-task">
                <FiTarget size={15} />
                {focusState.taskName}
              </div>

              {/* Distraction counter */}
              <div className="focus-timer-stats">
                <div className="focus-timer-stat">
                  <FiAlertTriangle size={14} />
                  <span>{focusState.distractionCount}</span>
                  <small>Distractions</small>
                </div>
                <div className="focus-timer-stat-divider" />
                <div className="focus-timer-stat">
                  <FiCamera size={14} />
                  <span>{focusState.webcamDistractions.length}</span>
                  <small>Physical</small>
                </div>
                <div className="focus-timer-stat-divider" />
                <div className="focus-timer-stat">
                  <FiClock size={14} />
                  <span>{formatDuration(focusState.totalFocusDuration)}</span>
                  <small>Elapsed</small>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                {focusState.isPaused ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => focusDispatch({ type: 'RESUME_SESSION' })}
                  >
                    <FiPlay size={14} /> Resume Session
                  </button>
                ) : (
                  <button
                    className="btn btn-ghost"
                    onClick={() => focusDispatch({ type: 'PAUSE_SESSION' })}
                    style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}
                  >
                    <FiPause size={14} /> Pause
                  </button>
                )}
                <button className="btn btn-danger" onClick={handleEndSession}>
                  <FiSquare size={14} /> End Session
                </button>
              </div>
            </div>
          </div>

          {/* Webcam Monitor Widget */}
          <WebcamMonitor />

          {/* Tips while in session */}
          <div className="focus-tips-card card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiZap style={{ color: 'var(--accent-secondary)' }} /> Focus Tips
            </h3>
            <div className="focus-tips-list">
              {[
                { emoji: '🔕', tip: 'Keep notifications silenced' },
                { emoji: '🎧', tip: 'Use music without lyrics' },
                { emoji: '💧', tip: 'Keep water nearby' },
                { emoji: '📵', tip: 'Put your phone face-down' },
                { emoji: '📷', tip: 'Enable webcam for physical distraction detection' },
                { emoji: '⏱️', tip: `Distraction threshold: ${focusState.thresholdSeconds}s` },
              ].map((item, i) => (
                <div key={i} className="focus-tip-item">
                  <span>{item.emoji}</span> {item.tip}
                </div>
              ))}
            </div>
          </div>

          {/* Recent distractions log */}
          {focusState.distractions.length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiAlertTriangle style={{ color: 'var(--warning)' }} /> Distractions This Session
              </h3>
              <div className="focus-distraction-log">
                {focusState.distractions.map((d, i) => (
                  <div key={i} className={`focus-distraction-item ${d.type ? 'physical' : ''}`}>
                    <span className="focus-distraction-num">#{i + 1}</span>
                    {d.type === 'webcam_no_person' && (
                      <span className="focus-distraction-type no-person">
                        <FiUser size={11} /> No Person
                      </span>
                    )}
                    {d.type === 'webcam_phone' && (
                      <span className="focus-distraction-type phone">
                        <FiSmartphone size={11} /> Phone
                      </span>
                    )}
                    {!d.type && (
                      <span className="focus-distraction-type tab">
                        <FiEye size={11} /> Tab Switch
                      </span>
                    )}
                    <span className="focus-distraction-time">
                      {new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="focus-distraction-away">
                      {d.awayDuration}s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ===== Inactive — Start Session View ===== */
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Start Session Card */}
            <div className="focus-start-card card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiPlay style={{ color: 'var(--accent-secondary)' }} /> Start Focus Session
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Select a task and enter deep focus mode. We'll detect when you switch tabs and help you stay on track.
              </p>

              <div className="auth-field" style={{ marginBottom: 16 }}>
                <label className="input-label">Select Task *</label>
                <select
                  className="input-field"
                  value={selectedTaskId}
                  onChange={e => setSelectedTaskId(e.target.value)}
                >
                  <option value="">Choose a task...</option>
                  {activeTasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🔵'}{' '}
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary btn-lg w-full"
                onClick={handleStartSession}
                disabled={!selectedTaskId}
                style={{ opacity: selectedTaskId ? 1 : 0.5 }}
              >
                <FiTarget /> Start Focusing
              </button>

              {activeTasks.length === 0 && (
                <p style={{ fontSize: '0.82rem', color: 'var(--warning)', marginTop: 12, textAlign: 'center' }}>
                  No active tasks. Create a task first!
                </p>
              )}
            </div>

            {/* Distracting Sites Manager */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiGlobe style={{ color: 'var(--danger)' }} /> Distracting Sites
                </h3>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Settings"
                >
                  <FiSettings size={14} />
                </button>
              </div>

              {/* Threshold settings */}
              {showSettings && (
                <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <label className="input-label">Distraction Threshold (seconds)</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      className="input-field"
                      type="number"
                      min="3"
                      max="60"
                      value={threshold}
                      onChange={e => setThreshold(e.target.value)}
                      style={{ width: 80 }}
                    />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      seconds away = distraction
                    </span>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveThreshold}>Save</button>
                  </div>
                </div>
              )}

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Sites that might distract you during study sessions.
              </p>

              {/* Add new site */}
              <form onSubmit={handleAddSite} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. youtube.com"
                  value={newSite}
                  onChange={e => setNewSite(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-icon" style={{ flexShrink: 0 }}>
                  <FiPlus />
                </button>
              </form>

              {/* Sites list */}
              <div className="focus-sites-list">
                {focusState.distractingSites.map(site => (
                  <div key={site} className="focus-site-item">
                    <FiGlobe size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span className="focus-site-name">{site}</span>
                    <button
                      className="focus-site-remove"
                      onClick={() => focusDispatch({ type: 'REMOVE_SITE', payload: site })}
                      title="Remove"
                    >
                      <FiX size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Session Stats Summary */}
          {totalSessions > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiAward style={{ color: 'var(--accent-secondary)' }} /> Your Focus Stats
              </h3>
              <div className="dashboard-grid">
                <div className="stat-card purple">
                  <div className="stat-icon purple"><FiTarget /></div>
                  <div className="stat-value">{totalSessions}</div>
                  <div className="stat-label">Total Sessions</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-icon green"><FiClock /></div>
                  <div className="stat-value">{formatDuration(totalFocusTime)}</div>
                  <div className="stat-label">Total Focus Time</div>
                </div>
                <div className="stat-card orange">
                  <div className="stat-icon orange"><FiAlertTriangle /></div>
                  <div className="stat-value">{avgDistractions}</div>
                  <div className="stat-label">Avg Distractions / Session</div>
                </div>
                <div className="stat-card pink">
                  <div className="stat-icon pink"><FiTrendingUp /></div>
                  <div className="stat-value">{formatDuration(longestSession)}</div>
                  <div className="stat-label">Longest Session</div>
                </div>
              </div>
            </div>
          )}

          {/* Session History */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiClock style={{ color: 'var(--text-muted)' }} /> Session History
              </h3>
              {focusState.sessionHistory.length > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => focusDispatch({ type: 'CLEAR_HISTORY' })}
                  style={{ color: 'var(--danger)' }}
                >
                  <FiTrash2 size={13} /> Clear All
                </button>
              )}
            </div>

            {focusState.sessionHistory.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-state-icon">🎯</div>
                <div className="empty-state-title">No sessions yet</div>
                <div className="empty-state-desc">
                  Start your first focus session to begin tracking your productivity!
                </div>
              </div>
            ) : (
              <div className="focus-history-list">
                {focusState.sessionHistory.map(session => (
                  <div key={session.id} className="focus-history-item">
                    <div className="focus-history-left">
                      <div className="focus-history-task">{session.taskName}</div>
                      <div className="focus-history-date">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="focus-history-right">
                      <div className="focus-history-duration">
                        <FiClock size={12} />
                        {formatDuration(session.duration)}
                      </div>
                      <div className={`focus-history-distractions ${session.distractionCount === 0 ? 'clean' : session.distractionCount <= 2 ? 'ok' : 'bad'}`}>
                        {session.distractionCount === 0 ? (
                          <><FiCheckCircle size={12} /> Clean</>
                        ) : (
                          <><FiAlertTriangle size={12} /> {session.distractionCount} distraction{session.distractionCount > 1 ? 's' : ''}</>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
