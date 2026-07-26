/**
 * WebcamMonitor — Real-time webcam distraction detection overlay component.
 *
 * Integrates with FocusContext to auto-pause the timer when:
 * - No person is detected for 5 continuous seconds
 * - A cell phone is detected for 5 continuous seconds
 *
 * Renders a compact status indicator in the focus session UI.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFocus } from '../context/FocusContext';
import {
  startDetection,
  stopDetection,
  isDetectionRunning,
} from '../utils/webcamDetection';
import {
  FiCamera, FiCameraOff, FiUser, FiSmartphone,
  FiAlertCircle, FiLoader, FiShield, FiShieldOff,
} from 'react-icons/fi';

export default function WebcamMonitor() {
  const { focusState, focusDispatch } = useFocus();

  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [status, setStatus] = useState({
    personDetected: false,
    phoneDetected: false,
    noPersonBufferMs: 0,
    phoneBufferMs: 0,
    modelReady: false,
    loading: false,
  });
  const [error, setError] = useState(null);
  const [minimized, setMinimized] = useState(false);

  const hasTriggeredRef = useRef(false);

  /**
   * Handle distraction detected — pause the timer via FocusContext
   */
  const handleDistraction = useCallback((event) => {
    if (!focusState.isActive) return;

    // Record distraction in the focus context (reuses existing distraction logic)
    focusDispatch({
      type: 'WEBCAM_DISTRACTION',
      payload: {
        distractionType: event.type,
        message: event.message,
        duration: event.duration,
      },
    });
  }, [focusState.isActive, focusDispatch]);

  /**
   * Handle status updates from detection engine
   */
  const handleStatusChange = useCallback((newStatus) => {
    setStatus(newStatus);
  }, []);

  /**
   * Handle detection errors
   */
  const handleError = useCallback((err) => {
    console.error('[WebcamMonitor] Error:', err);
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      setError('Camera permission denied. Please allow camera access in your browser settings.');
    } else if (err.name === 'NotFoundError') {
      setError('No camera found. Please connect a webcam.');
    } else {
      setError(`Camera error: ${err.message}`);
    }
    setWebcamEnabled(false);
  }, []);

  /**
   * Toggle webcam monitoring on/off
   */
  const toggleWebcam = useCallback(async () => {
    if (webcamEnabled) {
      stopDetection();
      setWebcamEnabled(false);
      setError(null);
      setStatus({
        personDetected: false,
        phoneDetected: false,
        noPersonBufferMs: 0,
        phoneBufferMs: 0,
        modelReady: false,
        loading: false,
      });
    } else {
      setError(null);
      setWebcamEnabled(true);
      try {
        await startDetection({
          onDistraction: handleDistraction,
          onStatusChange: handleStatusChange,
          onError: handleError,
        });
      } catch (err) {
        handleError(err);
      }
    }
  }, [webcamEnabled, handleDistraction, handleStatusChange, handleError]);

  /**
   * Auto-stop when focus session ends
   */
  useEffect(() => {
    if (!focusState.isActive && webcamEnabled) {
      stopDetection();
      setWebcamEnabled(false);
    }
  }, [focusState.isActive]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (isDetectionRunning()) {
        stopDetection();
      }
    };
  }, []);

  // Only render when a focus session is active
  if (!focusState.isActive) return null;

  // Buffer progress (0 to 1)
  const noPersonProgress = Math.min(status.noPersonBufferMs / 5000, 1);
  const phoneProgress = Math.min(status.phoneBufferMs / 5000, 1);

  return (
    <div className={`webcam-monitor ${minimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="webcam-monitor-header" onClick={() => setMinimized(!minimized)}>
        <div className="webcam-monitor-title">
          {webcamEnabled ? (
            <FiShield size={14} className="webcam-icon-active" />
          ) : (
            <FiShieldOff size={14} />
          )}
          <span>Webcam Monitor</span>
        </div>
        <div className="webcam-monitor-actions">
          {!minimized && (
            <button
              className={`webcam-toggle-btn ${webcamEnabled ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); toggleWebcam(); }}
              title={webcamEnabled ? 'Disable webcam monitoring' : 'Enable webcam monitoring'}
            >
              {webcamEnabled ? <FiCamera size={13} /> : <FiCameraOff size={13} />}
              {webcamEnabled ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>

      {/* Body — shown when not minimized */}
      {!minimized && (
        <div className="webcam-monitor-body">
          {/* Error state */}
          {error && (
            <div className="webcam-error">
              <FiAlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading state */}
          {status.loading && (
            <div className="webcam-loading">
              <FiLoader size={14} className="webcam-spinner" />
              <span>Loading AI model...</span>
            </div>
          )}

          {/* Active monitoring status */}
          {webcamEnabled && status.modelReady && !error && (
            <div className="webcam-status-grid">
              {/* Person detection */}
              <div className={`webcam-status-item ${status.personDetected ? 'ok' : 'warn'}`}>
                <FiUser size={15} />
                <div className="webcam-status-info">
                  <span className="webcam-status-label">
                    {status.personDetected ? 'Person Detected' : 'No Person'}
                  </span>
                  {!status.personDetected && noPersonProgress > 0 && (
                    <div className="webcam-buffer-bar">
                      <div
                        className="webcam-buffer-fill warn"
                        style={{ width: `${noPersonProgress * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className={`webcam-status-dot ${status.personDetected ? 'green' : 'red'}`} />
              </div>

              {/* Phone detection */}
              <div className={`webcam-status-item ${!status.phoneDetected ? 'ok' : 'warn'}`}>
                <FiSmartphone size={15} />
                <div className="webcam-status-info">
                  <span className="webcam-status-label">
                    {status.phoneDetected ? 'Phone Detected!' : 'No Phone'}
                  </span>
                  {status.phoneDetected && phoneProgress > 0 && (
                    <div className="webcam-buffer-bar">
                      <div
                        className="webcam-buffer-fill danger"
                        style={{ width: `${phoneProgress * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className={`webcam-status-dot ${!status.phoneDetected ? 'green' : 'red'}`} />
              </div>
            </div>
          )}

          {/* Inactive state */}
          {!webcamEnabled && !error && (
            <div className="webcam-inactive">
              <FiCameraOff size={18} />
              <span>Enable webcam to detect physical distractions</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
