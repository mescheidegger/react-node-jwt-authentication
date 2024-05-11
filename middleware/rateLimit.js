// rateLimit.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => req.ip, // Use the IP address from the request connection
});

module.exports = apiLimiter;

/*
NOTE:
If behind a reverse proxy like cloudflare or a load balancer would need to define at the app level
app.set('trust proxy', true); // Trust first proxy
*/