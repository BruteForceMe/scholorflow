/**
 * FocusOverlay — Active focus session overlay bar.
 * Shows as a floating bar at the bottom of the screen during active focus sessions.
 * Displays timer, task name, distraction count, and controls.
 */
import React from 'react';
import { useFocus } from '../context/FocusContext';
import { FiTarget, FiSquare, FiAlertTriangle, FiPause, FiPlay } from 'react-icons/fi';

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
function formatTime(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function FocusOverlay() {
  const { focusState, focusDispatch } = useFocus();

  if (!focusState.isActive) return null;

  return (
    <div className={`focus-overlay-bar ${focusState.isPaused ? 'paused' : ''}`}>
      {/* Pulsing indicator */}
      <div className={`focus-overlay-pulse ${focusState.isPaused ? 'paused' : ''}`} />

      {/* Session info */}
      <div className="focus-overlay-info">
        {focusState.isPaused ? (
          <FiPause className="focus-overlay-icon paused" />
        ) : (
          <FiTarget className="focus-overlay-icon" />
        )}
        <span className="focus-overlay-label">
          {focusState.isPaused ? 'Paused' : 'Focus Mode'}
        </span>
        <span className="focus-overlay-divider">•</span>
        <span className="focus-overlay-task">{focusState.taskName}</span>
      </div>

      {/* Timer */}
      <div className={`focus-overlay-timer ${focusState.isPaused ? 'paused' : ''}`}>
        {formatTime(focusState.totalFocusDuration)}
      </div>

      {/* Distraction count */}
      {focusState.distractionCount > 0 && (
        <div className="focus-overlay-distractions">
          <FiAlertTriangle size={13} />
          {focusState.distractionCount}
        </div>
      )}

      {/* Resume / End buttons */}
      {focusState.isPaused ? (
        <button
          className="focus-overlay-resume"
          onClick={() => focusDispatch({ type: 'RESUME_SESSION' })}
          title="Resume Focus Session"
        >
          <FiPlay size={14} />
          Resume
        </button>
      ) : null}

      <button
        className="focus-overlay-end"
        onClick={() => focusDispatch({ type: 'END_SESSION' })}
        title="End Focus Session"
      >
        <FiSquare size={14} />
        End
      </button>
    </div>
  );
}
