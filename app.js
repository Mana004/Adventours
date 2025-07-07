const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const viewRouter = require('./Routes/viewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Middlewares

console.log(process.env.NODE_ENV);

app.use(cors());

//DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  console.log('Hello From Middleware 👐');
  next();
});

// GLOBAL MIDDLEWARE

//Serving static files

app.use(express.static(path.join(__dirname, 'public')));

//SET SECURITY HTTP HEADERS

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       useDefaults: true,
//       directives: {
//         'default-src': ["'self'"],
//         'script-src': ["'self'", 'https://api.mapbox.com', 'blob:'],
//         'worker-src': ["'self'", 'blob:'],
//         'style-src': [
//           "'self'",
//           'https://api.mapbox.com',
//           'https://fonts.googleapis.com',
//           "'unsafe-inline'",
//         ],
//         'connect-src': [
//           "'self'",
//           'https://api.mapbox.com',
//           'https://events.mapbox.com',
//         ],
//         'img-src': ["'self'", 'blob:', 'data:', 'https://api.mapbox.com'],
//         'font-src': ["'self'", 'https://fonts.gstatic.com'],
//       },
//     },
//   }),
// );

//Rate Limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour !',
});

app.use('/api', limiter);

//sanitization against xss scripting
// app.use(xss());

// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingsQuantity',
//       'ratingsAverage',
//       'maxGroupSize',
//       'difficulty',
//       'price',
//     ],
//   }),
// );

//Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// //Sanitization against NoSQL Injection
// app.use(mongoSanitize());

//Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 2)Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

try {
  app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });
} catch (err) {
  console.error('Error while registering fallback route:', err.message);
}

app.use(globalErrorHandler);

module.exports = app;
