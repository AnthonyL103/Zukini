const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, json } = format;

// Create the logger
const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'zukini-api' },
  transports: [
    new transports.File({ 
      filename: '/var/log/zukini-api/api-calls.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new transports.File({ 
      filename: '/home/ubuntu/Zukini/backend/logs/api-calls.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5 
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      format.colorize(),
      timestamp(),
      printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level}: ${JSON.stringify(message)}`;
      })
    )
  }));
}

// Middleware to log API requests
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Original URL before any modifications
  const originalUrl = req.originalUrl || req.url;
  
  // Create a response interceptor
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    
    // Log the API call
    logger.info({
      type: 'api_call',
      method: req.method,
      path: originalUrl,
      query: req.query,
      params: req.params,
      // Limit body logging to avoid excessive data
      body: req.body ? JSON.stringify(req.body).substring(0, 1000) : null,
      statusCode: res.statusCode,
      responseTime: responseTime,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress
    });
    
    // Continue with the original send
    originalSend.apply(res, arguments);
  };
  
  next();
};

module.exports = { logger, requestLogger };