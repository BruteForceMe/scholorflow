/**
 * Webcam Detection Module — TensorFlow.js COCO-SSD
 *
 * Detects "person" and "cell phone" objects via the webcam during focus sessions.
 * Uses a 5-second continuous buffer before triggering a pause action.
 * Detection runs every ~2.5 seconds to balance accuracy and CPU usage.
 */

// ---------- state shared across the module ----------
let model = null;
let videoElement = null;
let mediaStream = null;
let detectionInterval = null;
let isRunning = false;

// Buffer tracking — how long a distraction condition persists continuously
let noPersonSince = null;   // timestamp when "no person" first detected
let phoneSince = null;      // timestamp when "cell phone" first detected

const BUFFER_DURATION_MS = 5000;  // 5 seconds continuous before action
const DETECTION_INTERVAL_MS = 2500; // run detection every 2.5 seconds
const MIN_CONFIDENCE = 0.55; // minimum confidence threshold

/**
 * Load the COCO-SSD model (lazy, only once)
 */
async function loadModel() {
  if (model) return model;

  // Dynamically import TensorFlow.js + COCO-SSD from CDN at runtime
  // This avoids bundling the large ML library
  if (!window.cocoSsd) {
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
  }

  console.log('[WebcamDetection] Loading COCO-SSD model...');
  model = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
  console.log('[WebcamDetection] Model loaded successfully');
  return model;
}

/**
 * Helper to load an external script tag
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Request webcam permissions and create a hidden video element
 */
async function initCamera() {
  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: { width: 320, height: 240, facingMode: 'user' },
    audio: false,
  });

  // Create a hidden video element if it doesn't exist
  if (!videoElement) {
    videoElement = document.createElement('video');
    videoElement.setAttribute('id', 'sf-webcam-hidden');
    videoElement.style.position = 'fixed';
    videoElement.style.top = '-9999px';
    videoElement.style.left = '-9999px';
    videoElement.style.width = '320px';
    videoElement.style.height = '240px';
    videoElement.style.pointerEvents = 'none';
    videoElement.style.opacity = '0';
    document.body.appendChild(videoElement);
  }

  videoElement.srcObject = mediaStream;
  videoElement.muted = true;
  videoElement.playsInline = true;
  await videoElement.play();

  return videoElement;
}

/**
 * Run a single detection frame
 * Returns: { personDetected: boolean, phoneDetected: boolean, allDetections: [] }
 */
async function detectFrame() {
  if (!model || !videoElement || videoElement.readyState < 2) {
    return { personDetected: false, phoneDetected: false, allDetections: [] };
  }

  try {
    const predictions = await model.detect(videoElement);

    const personDetected = predictions.some(
      p => p.class === 'person' && p.score >= MIN_CONFIDENCE
    );
    const phoneDetected = predictions.some(
      p => p.class === 'cell phone' && p.score >= MIN_CONFIDENCE
    );

    return {
      personDetected,
      phoneDetected,
      allDetections: predictions.filter(p => p.score >= MIN_CONFIDENCE),
    };
  } catch (err) {
    console.error('[WebcamDetection] Detection error:', err);
    return { personDetected: false, phoneDetected: false, allDetections: [] };
  }
}

/**
 * Start webcam monitoring for a focus session
 *
 * @param {Object} options
 * @param {Function} options.onDistraction — called when a distraction is confirmed (after 5s buffer)
 *   Receives: { type: 'no_person' | 'phone_detected', duration: number }
 * @param {Function} options.onStatusChange — called on each detection cycle with current status
 *   Receives: { personDetected, phoneDetected, noPersonBufferMs, phoneBufferMs, modelReady }
 * @param {Function} options.onError — called on critical errors
 * @returns {Promise<void>}
 */
export async function startDetection({ onDistraction, onStatusChange, onError }) {
  if (isRunning) {
    console.warn('[WebcamDetection] Already running');
    return;
  }

  try {
    // Notify UI that we're loading
    onStatusChange?.({
      personDetected: false,
      phoneDetected: false,
      noPersonBufferMs: 0,
      phoneBufferMs: 0,
      modelReady: false,
      loading: true,
    });

    await loadModel();
    await initCamera();

    isRunning = true;
    noPersonSince = null;
    phoneSince = null;

    onStatusChange?.({
      personDetected: true,
      phoneDetected: false,
      noPersonBufferMs: 0,
      phoneBufferMs: 0,
      modelReady: true,
      loading: false,
    });

    // Detection loop
    detectionInterval = setInterval(async () => {
      if (!isRunning) return;

      const result = await detectFrame();
      const now = Date.now();

      // ---- No person logic ----
      if (!result.personDetected) {
        if (!noPersonSince) noPersonSince = now;
        const elapsed = now - noPersonSince;

        if (elapsed >= BUFFER_DURATION_MS) {
          // Trigger distraction
          onDistraction?.({
            type: 'no_person',
            duration: Math.floor(elapsed / 1000),
            message: '👤 No person detected at desk — session auto-paused',
          });
          noPersonSince = now; // Reset so it can fire again
          logPhysicalDistraction('no_person', Math.floor(elapsed / 1000));
        }
      } else {
        noPersonSince = null;
      }

      // ---- Phone detected logic ----
      if (result.phoneDetected) {
        if (!phoneSince) phoneSince = now;
        const elapsed = now - phoneSince;

        if (elapsed >= BUFFER_DURATION_MS) {
          onDistraction?.({
            type: 'phone_detected',
            duration: Math.floor(elapsed / 1000),
            message: '📱 Cell phone detected — session auto-paused',
          });
          phoneSince = now;
          logPhysicalDistraction('phone_detected', Math.floor(elapsed / 1000));
        }
      } else {
        phoneSince = null;
      }

      // Update UI status
      onStatusChange?.({
        personDetected: result.personDetected,
        phoneDetected: result.phoneDetected,
        noPersonBufferMs: noPersonSince ? now - noPersonSince : 0,
        phoneBufferMs: phoneSince ? now - phoneSince : 0,
        modelReady: true,
        loading: false,
      });

    }, DETECTION_INTERVAL_MS);

  } catch (err) {
    console.error('[WebcamDetection] Startup error:', err);
    onError?.(err);
  }
}

/**
 * Stop webcam monitoring — release camera, clear intervals
 */
export function stopDetection() {
  isRunning = false;

  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }

  if (videoElement) {
    videoElement.srcObject = null;
    videoElement.remove();
    videoElement = null;
  }

  noPersonSince = null;
  phoneSince = null;

  console.log('[WebcamDetection] Stopped');
}

/**
 * Check if detection is currently active
 */
export function isDetectionRunning() {
  return isRunning;
}

// ─── Physical Distraction Logging (localStorage-based) ───

const DISTRACTION_LOG_KEY = 'scholorflow_physical_distractions';

/**
 * Log a physical distraction event to localStorage
 */
function logPhysicalDistraction(type, durationSeconds) {
  try {
    const logs = getPhysicalDistractionLogs();
    logs.push({
      id: `pd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      category: 'Physical Distraction',
      label: type === 'no_person' ? 'Person Left Desk' : 'Cell Phone Detected',
      durationSeconds,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US'),
    });

    // Keep only last 200 entries
    const trimmed = logs.slice(-200);
    localStorage.setItem(DISTRACTION_LOG_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('[WebcamDetection] Failed to log distraction:', err);
  }
}

/**
 * Read all physical distraction logs
 */
export function getPhysicalDistractionLogs() {
  try {
    const raw = localStorage.getItem(DISTRACTION_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all physical distraction logs
 */
export function clearPhysicalDistractionLogs() {
  localStorage.removeItem(DISTRACTION_LOG_KEY);
}

/**
 * Get aggregated physical distraction stats
 */
export function getPhysicalDistractionStats() {
  const logs = getPhysicalDistractionLogs();
  const noPersonCount = logs.filter(l => l.type === 'no_person').length;
  const phoneCount = logs.filter(l => l.type === 'phone_detected').length;
  const totalDuration = logs.reduce((sum, l) => sum + (l.durationSeconds || 0), 0);

  // Group by date
  const byDate = {};
  logs.forEach(l => {
    if (!byDate[l.date]) byDate[l.date] = { date: l.date, count: 0, noPerson: 0, phone: 0 };
    byDate[l.date].count++;
    if (l.type === 'no_person') byDate[l.date].noPerson++;
    else byDate[l.date].phone++;
  });

  return {
    totalEvents: logs.length,
    noPersonCount,
    phoneCount,
    totalDurationSeconds: totalDuration,
    byDate: Object.values(byDate).sort((a, b) => new Date(b.date) - new Date(a.date)),
    recentLogs: logs.slice(-20).reverse(),
  };
}
