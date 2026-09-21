import rateLimit from 'express-rate-limit';

// Security log store in memory
export const securityAuditLogs = [];

export function logSecurityEvent(eventType, req, details = '') {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const entry = {
    id: 'SEC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    ip,
    userAgent,
    eventType,
    details,
    timestamp: new Date().toISOString()
  };
  securityAuditLogs.unshift(entry);
  if (securityAuditLogs.length > 200) securityAuditLogs.pop();
  return entry;
}

// 1. General Rate Limiter (Protection against DDoS)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests from this IP. Swift Line DDoS shield activated. Please try again later.'
  },
  handler: (req, res, next, options) => {
    logSecurityEvent('DDoS_RATE_LIMIT_EXCEEDED', req, `Endpoint: ${req.originalUrl}`);
    res.status(429).json(options.message);
  }
});

// 2. Strict Rate Limiter for Auth & Sensitive Operations
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // limit each IP to 15 attempts
  message: {
    status: 429,
    error: 'Too many authentication attempts. Please wait 10 minutes before retrying.'
  },
  handler: (req, res, next, options) => {
    logSecurityEvent('AUTH_RATE_LIMIT_EXCEEDED', req, `Attempted Email: ${req.body?.email || 'N/A'}`);
    res.status(429).json(options.message);
  }
});

// 3. Bot & Malicious Crawler Detection Middleware
export function botProtectionMiddleware(req, res, next) {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  
  // Known bot/scanner user-agents that exploit public forms
  const botPatterns = [
    'sqlmap', 'nikto', 'acunetix', 'masscan', 'zgrab',
    'python-requests/2.0', 'go-http-client/1.1', 'curl/', 'wget/'
  ];

  const isSuspicious = botPatterns.some(pattern => userAgent.includes(pattern));

  if (isSuspicious && !req.headers['authorization']) {
    logSecurityEvent('BOT_ATTEMPT_BLOCKED', req, `Blocked UA: ${userAgent}`);
    return res.status(403).json({
      error: 'Access Denied by Swift Line Bot & Anti-Scraping Defense Shield.',
      code: 'BOT_DETECTED'
    });
  }

  next();
}
