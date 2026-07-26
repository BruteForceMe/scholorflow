/**
 * FocusContext — Manages focus mode state, distraction detection,
 * and session tracking using the Page Visibility API.
 */
import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const FocusContext = createContext();

// Default list of distracting websites
const DEFAULT_DISTRACTING_SITES = [
  'youtube.com',
  'instagram.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'tiktok.com',
  'whatsapp.com',
  'netflix.com',
  'twitch.tv',
];

// Distraction threshold in seconds — if user is away longer, it's a distraction
const DISTRACTION_THRESHOLD_SECONDS = 5;

const initialFocusState = {
  // Session state
  isActive: false,
  isPaused: false,   // true when auto-paused by webcam detection
  taskId: null,
  taskName: '',
  startTime: null,
  totalFocusDuration: 0, // in seconds
  pausedAt: null,         // timestamp when paused
  accumulatedPauseMs: 0,  // total time spent paused during this session

  // Distraction tracking
  distractionCount: 0,
  distractions: [], // Array of { timestamp, awayDuration, type? }
  lastHiddenTime: null,

  // Webcam / physical distraction tracking
  webcamDistractions: [], // Array of { timestamp, type, message, duration }

  // Toast/notification
  showToast: false,
  toastMessage: '',
  toastSeverity: 'gentle', // 'gentle' | 'warning' | 'critical'
  awayDuration: 0,

  // Distracting sites management
  distractingSites: [],

  // Session history — persisted between sessions
  sessionHistory: [],

  // Settings
  thresholdSeconds: DISTRACTION_THRESHOLD_SECONDS,
};

/**
 * Load persisted focus data (distracting sites list + session history)
 */
function loadFocusState() {
  try {
    const saved = localStorage.getItem('scholorflow_focus');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialFocusState,
        distractingSites: parsed.distractingSites || DEFAULT_DISTRACTING_SITES,
        sessionHistory: parsed.sessionHistory || [],
        thresholdSeconds: parsed.thresholdSeconds || DISTRACTION_THRESHOLD_SECONDS,
      };
    }
  } catch (e) {
    console.error('Failed to load focus state:', e);
  }
  return {
    ...initialFocusState,
    distractingSites: DEFAULT_DISTRACTING_SITES,
  };
}

function focusReducer(state, action) {
  switch (action.type) {
    /**
     * START_SESSION — Begin a focus session on a specific task
     */
    case 'START_SESSION':
      return {
        ...state,
        isActive: true,
        isPaused: false,
        taskId: action.payload.taskId,
        taskName: action.payload.taskName,
        startTime: Date.now(),
        totalFocusDuration: 0,
        pausedAt: null,
        accumulatedPauseMs: 0,
        distractionCount: 0,
        distractions: [],
        webcamDistractions: [],
        lastHiddenTime: null,
        showToast: false,
      };

    /**
     * END_SESSION — Finish the current focus session, add to history
     */
    case 'END_SESSION': {
      const duration = state.startTime
        ? Math.floor((Date.now() - state.startTime) / 1000)
        : 0;

      const sessionRecord = {
        id: uuidv4(),
        taskId: state.taskId,
        taskName: state.taskName,
        startTime: state.startTime,
        endTime: Date.now(),
        duration,
        distractionCount: state.distractionCount,
        distractions: state.distractions,
        webcamDistractions: state.webcamDistractions,
        physicalDistractionCount: state.webcamDistractions.length,
        date: new Date().toISOString(),
      };

      return {
        ...state,
        isActive: false,
        isPaused: false,
        taskId: null,
        taskName: '',
        startTime: null,
        totalFocusDuration: 0,
        pausedAt: null,
        accumulatedPauseMs: 0,
        distractionCount: 0,
        distractions: [],
        webcamDistractions: [],
        lastHiddenTime: null,
        showToast: false,
        sessionHistory: [sessionRecord, ...state.sessionHistory].slice(0, 50), // Keep last 50
      };
    }

    /**
     * TAB_HIDDEN — User switched away from the app
     */
    case 'TAB_HIDDEN':
      return {
        ...state,
        lastHiddenTime: Date.now(),
      };

    /**
     * TAB_VISIBLE — User returned to the app
     * Evaluates whether the absence counts as a distraction
     */
    case 'TAB_VISIBLE': {
      if (!state.lastHiddenTime || !state.isActive) {
        return { ...state, lastHiddenTime: null };
      }

      const awayMs = Date.now() - state.lastHiddenTime;
      const awaySec = Math.floor(awayMs / 1000);

      // If away time exceeds threshold, count as distraction
      if (awaySec >= state.thresholdSeconds) {
        const newCount = state.distractionCount + 1;
        const distraction = {
          timestamp: Date.now(),
          awayDuration: awaySec,
        };

        // Determine severity based on distraction count
        let severity = 'gentle';
        let message = '';

        if (newCount <= 2) {
          severity = 'gentle';
          message = `⚠️ Stay focused! You left "${state.taskName}" for ${awaySec}s. Let's get back on track!`;
        } else if (newCount <= 4) {
          severity = 'warning';
          message = `🔶 You've been distracted ${newCount} times during "${state.taskName}". Try to stay in the zone!`;
        } else {
          severity = 'critical';
          message = `🛑 ${newCount} distractions during "${state.taskName}". Consider taking a 5-minute break to recharge, then come back stronger.`;
        }

        return {
          ...state,
          lastHiddenTime: null,
          distractionCount: newCount,
          distractions: [...state.distractions, distraction],
          showToast: true,
          toastMessage: message,
          toastSeverity: severity,
          awayDuration: awaySec,
        };
      }

      // Short absence — not a distraction
      return { ...state, lastHiddenTime: null };
    }

    /**
     * DISMISS_TOAST — Hide the distraction notification
     */
    case 'DISMISS_TOAST':
      return { ...state, showToast: false };

    /**
     * ADD_SITE — Add a site to the distracting list
     */
    case 'ADD_SITE':
      if (state.distractingSites.includes(action.payload)) return state;
      return {
        ...state,
        distractingSites: [...state.distractingSites, action.payload],
      };

    /**
     * REMOVE_SITE — Remove a site from the distracting list
     */
    case 'REMOVE_SITE':
      return {
        ...state,
        distractingSites: state.distractingSites.filter(s => s !== action.payload),
      };

    /**
     * SET_THRESHOLD — Update the distraction threshold
     */
    case 'SET_THRESHOLD':
      return { ...state, thresholdSeconds: action.payload };

    /**
     * CLEAR_HISTORY — Clear all session history
     */
    case 'CLEAR_HISTORY':
      return { ...state, sessionHistory: [] };

    /**
     * UPDATE_DURATION — Called by timer to update elapsed time
     * Accounts for accumulated pause time
     */
    case 'UPDATE_DURATION':
      if (!state.isActive || !state.startTime || state.isPaused) return state;
      return {
        ...state,
        totalFocusDuration: Math.floor(
          (Date.now() - state.startTime - state.accumulatedPauseMs) / 1000
        ),
      };

    /**
     * WEBCAM_DISTRACTION — Physical distraction detected by webcam
     * Auto-pauses the session and shows a toast
     */
    case 'WEBCAM_DISTRACTION': {
      const { distractionType, message, duration } = action.payload;
      const newCount = state.distractionCount + 1;
      const webcamRecord = {
        timestamp: Date.now(),
        type: distractionType,
        message,
        duration,
      };

      // Determine toast severity
      let severity = 'warning';
      if (newCount >= 5) severity = 'critical';

      return {
        ...state,
        isPaused: true,
        pausedAt: Date.now(),
        distractionCount: newCount,
        distractions: [
          ...state.distractions,
          {
            timestamp: Date.now(),
            awayDuration: duration,
            type: distractionType === 'no_person' ? 'webcam_no_person' : 'webcam_phone',
          },
        ],
        webcamDistractions: [...state.webcamDistractions, webcamRecord],
        showToast: true,
        toastMessage: message,
        toastSeverity: severity,
        awayDuration: duration,
      };
    }

    /**
     * PAUSE_SESSION — Manually or auto-pause the focus session
     */
    case 'PAUSE_SESSION':
      if (!state.isActive || state.isPaused) return state;
      return {
        ...state,
        isPaused: true,
        pausedAt: Date.now(),
      };

    /**
     * RESUME_SESSION — Resume a paused focus session
     */
    case 'RESUME_SESSION':
      if (!state.isActive || !state.isPaused) return state;
      return {
        ...state,
        isPaused: false,
        accumulatedPauseMs:
          state.accumulatedPauseMs + (Date.now() - (state.pausedAt || Date.now())),
        pausedAt: null,
      };

    default:
      return state;
  }
}

export function FocusProvider({ children }) {
  const [focusState, focusDispatch] = useReducer(focusReducer, null, loadFocusState);
  const timerRef = useRef(null);

  /**
   * Persist distracting sites, session history, and threshold to localStorage
   */
  useEffect(() => {
    localStorage.setItem('scholorflow_focus', JSON.stringify({
      distractingSites: focusState.distractingSites,
      sessionHistory: focusState.sessionHistory,
      thresholdSeconds: focusState.thresholdSeconds,
    }));
  }, [focusState.distractingSites, focusState.sessionHistory, focusState.thresholdSeconds]);

  /**
   * Page Visibility API — detect tab switches
   * This is the core of distraction detection
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        focusDispatch({ type: 'TAB_HIDDEN' });
      } else if (document.visibilityState === 'visible') {
        focusDispatch({ type: 'TAB_VISIBLE' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  /**
   * Timer — update elapsed duration every second while session is active
   */
  useEffect(() => {
    if (focusState.isActive) {
      timerRef.current = setInterval(() => {
        focusDispatch({ type: 'UPDATE_DURATION' });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [focusState.isActive]);

  return (
    <FocusContext.Provider value={{ focusState, focusDispatch }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (!context) throw new Error('useFocus must be used within FocusProvider');
  return context;
}

export default FocusContext;
