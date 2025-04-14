// funnelQuest.js
(function () {
  // Private variables
  let websiteId;
  let traceId;
  let browser;
  let language;
  let visitorCountry;
  let deviceType;
  let queue = [];
  let initialized = false;

  // Configuration
  const API_URL = 'https://api.funnelquest.com/track'; // Assumed API endpoint
  const BATCH_INTERVAL = 15000; // Send batch every 15 seconds
  const MAX_BATCH_SIZE = 10; // Send batch if queue reaches 10 events

  /**
   * Initialize the SDK with a websiteId
   * @param {Object} options - Configuration options
   * @param {string} options.websiteId - UUID string for the website
   */
  function init(options) {
    if (initialized) {
      console.warn('FunnelQuest SDK already initialized');
      return;
    }

    if (!options || !options.websiteId) {
      throw new Error('websiteId is required');
    }

    if (!isValidUUID(options.websiteId)) {
      throw new Error('Invalid websiteId: must be a valid UUID');
    }

    websiteId = options.websiteId;

    // Manage traceId cookie
    traceId = getCookie('fq_trace_id');
    if (!traceId) {
      traceId = generateTraceId();
      setCookie('fq_trace_id', traceId, { expires: 365, secure: true, sameSite: 'Strict' });
    } else {
      traceId = sanitizeString(traceId); // Sanitize retrieved traceId
    }

    // Collect static data once during initialization
    browser = getBrowser();
    language = getLanguage();
    deviceType = getDeviceType();

    // Fetch visitor country asynchronously
    fetchVisitorCountry()
      .then((country) => {
        visitorCountry = sanitizeString(country);
        initialized = true;
        // Start batch sending interval
        setInterval(sendBatch, BATCH_INTERVAL);
      })
      .catch((err) => {
        console.error('Failed to fetch visitor country:', err);
        visitorCountry = 'unknown';
        initialized = true;
        setInterval(sendBatch, BATCH_INTERVAL);
      });
  }

  /**
   * Track an event with the specified event_name
   * @param {string} event_name - Name of the event to track
   */
  function track(event_name) {
    if (!initialized) {
      console.warn('FunnelQuest SDK not initialized. Call init() first.');
      return;
    }

    if (!event_name || typeof event_name !== 'string') {
      console.warn('track() requires a valid event_name string');
      return;
    }

    // Collect event data
    const event = {
      websiteId: websiteId,
      event_name: sanitizeString(event_name),
      date_time: new Date().toISOString(),
      browser: browser,
      language: language,
      visitor_country: visitorCountry,
      device_type: deviceType,
      trace_id: traceId,
    };

    // Add to queue
    queue.push(event);

    // Send batch immediately if queue reaches max size
    if (queue.length >= MAX_BATCH_SIZE) {
      sendBatch();
    }
  }

  /**
   * Send queued events to the API in bulk
   */
  function sendBatch() {
    if (queue.length === 0) return;

    const batch = queue.slice();
    queue = []; // Clear the queue

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to send batch:', response.status);
        }
      })
      .catch((err) => {
        console.error('Error sending batch:', err);
      });
  }

  // Helper Functions

  /**
   * Validate if a string is a UUID
   * @param {string} str - String to validate
   * @returns {boolean}
   */
  function isValidUUID(str) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(str);
  }

  /**
   * Generate a unique trace ID
   * @returns {string}
   */
  function generateTraceId() {
    // Simple trace ID generator (in production, consider using nanoid)
    return 'trace-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get a cookie by name
   * @param {string} name - Cookie name
   * @returns {string|null}
   */
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  /**
   * Set a cookie with options
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {Object} options - Cookie options (expires, secure, sameSite)
   */
  function setCookie(name, value, options) {
    let cookie = `${name}=${encodeURIComponent(value)}`;
    if (options.expires) {
      const date = new Date();
      date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
      cookie += `; expires=${date.toUTCString()}`;
    }
    cookie += '; path=/';
    if (options.secure) cookie += '; secure';
    if (options.sameSite) cookie += `; samesite=${options.sameSite}`;
    document.cookie = cookie;
  }

  /**
   * Get the browser name
   * @returns {string}
   */
  function getBrowser() {
    const ua = navigator.userAgent;
    if (/chrome|chromium|crios/i.test(ua)) return 'Chrome';
    if (/firefox|fxios/i.test(ua)) return 'Firefox';
    if (/safari/i.test(ua)) return 'Safari';
    if (/edg/i.test(ua)) return 'Edge';
    if (/msie|trident/i.test(ua)) return 'Internet Explorer';
    return 'unknown';
  }

  /**
   * Get the browser language
   * @returns {string}
   */
  function getLanguage() {
    return navigator.language || navigator.languages[0] || 'en';
  }

  /**
   * Get the device type
   * @returns {string}
   */
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  /**
   * Fetch the visitor's country
   * @returns {Promise<string>}
   */
  function fetchVisitorCountry() {
    return fetch('https://ipapi.co/json/')
      .then((response) => response.json())
      .then((data) => data.country_name || 'unknown');
  }

  /**
   * Sanitize a string input
   * @param {string} str - String to sanitize
   * @returns {string}
   */
  function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    // Remove control characters, preserve printable Unicode characters
    return str.replace(/[\x00-\x1F\x7F]/g, '').trim();
  }

  // Expose public API
  window.funnelQuest = {
    init,
    track,
  };

  // Send remaining events before page unload
  window.addEventListener('beforeunload', sendBatch);
})();