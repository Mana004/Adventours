const errors = require('eslint-plugin-import/config/flat/errors');
const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ID ${err.path}: ${err.value}`; //

  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue
    ? Object.entries(err.keyValue)
        .map(([field, val]) => `${field}: "${val}"`)
        .join(', ')
    : 'Duplicate field';

  const message = `Duplicate field value(s): ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid Token. Please Log in again !', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your Token has Expired. Please Log in again !', 401);
};

const sendErrorDev = (err, req, res) => {
  console.log('Error handler called');

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //Rendered Website
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong !',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //1) APIS
  if (req.originalUrl.startsWith('/api')) {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      //Programming or other unknown error: dont leak error details
    }

    //1)Log error
    console.error('ERROR 💥', err);
    //2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong !',
    });
  }
  // B) RENDERED WEBSITE

  //Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    //Programming or other unknown error: dont leak error details
  }

  //1)Log error
  console.error('ERROR 💥', err);
  //2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong !',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = hadleJWTExpired();

    sendErrorProd(error, req, res);
  }
};
