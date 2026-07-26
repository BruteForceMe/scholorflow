/**
 * FocusToast — Distraction detection notification popup.
 * Appears when user returns to the app after being away too long.
 * Severity escalates with repeated distractions.
 */
import React, { useEffect } from 'react';
import { useFocus } from '../context/FocusContext';
import { FiAlertTriangle, FiPlay, FiSquare, FiCoffee, FiX } from 'react-icons/fi';

export default function FocusToast() {
  const { focusState, focusDispatch } = useFocus();

  // Auto-dismiss gentle toasts after 8 seconds
  useEffect(() => {
    if (focusState.showToast && focusState.toastSeverity === 'gentle') {
      const timer = setTimeout(() => {
        focusDispatch({ type: 'DISMISS_TOAST' });
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [focusState.showToast, focusState.toastSeverity, focusDispatch]);

  if (!focusState.showToast) return null;

  const severityConfig = {
    gentle: {
      icon: <FiAlertTriangle />,
      borderColor: 'var(--warning)',
      bgColor: 'var(--warning-bg)',
      iconColor: 'var(--warning)',
      label: 'Gentle Reminder',
    },
    warning: {
      icon: <FiAlertTriangle />,
      borderColor: '#ff6b35',
      bgColor: 'rgba(255, 107, 53, 0.12)',
      iconColor: '#ff6b35',
      label: 'Warning',
    },
    critical: {
      icon: <FiCoffee />,
      borderColor: 'var(--danger)',
      bgColor: 'var(--danger-bg)',
      iconColor: 'var(--danger)',
      label: 'Take a Break',
    },
  };

  const config = severityConfig[focusState.toastSeverity];

  return (
    <div className="focus-toast-overlay">
      <div
        className="focus-toast"
        style={{ borderLeftColor: config.borderColor }}
      >
        {/* Close button */}
        <button
          className="focus-toast-close"
          onClick={() => focusDispatch({ type: 'DISMISS_TOAST' })}
        >
          <FiX />
        </button>

        {/* Header */}
        <div className="focus-toast-header">
          <div
            className="focus-toast-icon"
            style={{ background: config.bgColor, color: config.iconColor }}
          >
            {config.icon}
          </div>
          <div>
            <div className="focus-toast-label" style={{ color: config.iconColor }}>
              {config.label}
            </div>
            <div className="focus-toast-away">
              Away for {focusState.awayDuration}s • Distraction #{focusState.distractionCount}
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="focus-toast-message">{focusState.toastMessage}</p>

        {/* Actions */}
        <div className="focus-toast-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              focusDispatch({ type: 'DISMISS_TOAST' });
              if (focusState.isPaused) {
                focusDispatch({ type: 'RESUME_SESSION' });
              }
            }}
          >
            <FiPlay size={13} /> Resume Focus
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              focusDispatch({ type: 'DISMISS_TOAST' });
              focusDispatch({ type: 'END_SESSION' });
            }}
          >
            <FiSquare size={13} /> End Session
          </button>
        </div>

        {/* Distraction progress bar */}
        <div className="focus-toast-progress">
          {[1, 2, 3, 4, 5].map(n => (
            <div
              key={n}
              className={`focus-toast-dot ${focusState.distractionCount >= n ? 'filled' : ''}`}
              style={{
                background: focusState.distractionCount >= n ? config.iconColor : 'var(--bg-input)',
              }}
              title={`Distraction ${n}`}
            />
          ))}
          <span className="focus-toast-dot-label">
            {focusState.distractionCount >= 5 ? 'Time for a break!' : `${5 - focusState.distractionCount} left before break suggestion`}
          </span>
        </div>
      </div>
    </div>
  );
}
