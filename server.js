const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const routes = require('./routes/routes');

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// Use the router
app.use('/', routes);

// Production configurations
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the 'build' folder in production
  app.use(express.static(path.join(__dirname, 'client/build'), {
    // Caching policy can go here
  }));
  // Service index.html as a catch-all route
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log(`NODE_ENV=${process.env.NODE_ENV}`);
