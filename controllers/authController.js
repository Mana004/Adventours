const { token } = require('morgan');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Email = require('../utils/email');
const crypto = require('crypto');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (+process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
    active: req.body.active,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);

  const token = signToken(newUser._id);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  //1) check if email && password are present
  if (!email || !password) {
    return next(new AppError('Please provide Email And Password', 400));
  }

  //2)Check if User exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3) If everything OK, send token to client

  createSendToken(user, 200, res);
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

//AUTHENTICATION

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access', 401),
    );
  }

  //2) verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token has signed out'),
    );
  }

  //4) check if user Changed Password
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed Password! Please log in again !',
        401,
      ),
    );
  }

  //Grant Access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1) verification of token

      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      console.log(decoded);

      //2) Check if user still exists
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      //3) check if user Changed Password
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //There is a logged in user  put in res.locals
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

//AUTHORIZATION

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles array includes admin, lead-guide
    //if the current isnt any of them then deny it the actions

    console.log(req.user.role);

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  //2) Generate Random token

  const resetToken = user.createPasswordToken();
  await user.save({ validateBeforeSave: false });

  //3) Send it to user's email

  //const message = `Forgot you password? Submit a patch request with your new password and passwordConfirm to: ${resetURL}.\n If didnt forget please ignore this message`;
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return next(
      new AppError('There was an error sending the email, Try Again Later!'),
      500,
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get the user from the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) If token has not expired and there is user, set the new password

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user for collection

  const user = await User.findById(req.user._id).select('+password');

  //2) Check if password is correct

  if (!user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError('Your Current Password is wrong'));
  }

  //3) If so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  //4) Log user in, Send JWT

  createSendToken(user, 201, res);
});
