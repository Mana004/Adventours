const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err);

  console.log(' UNCAUGHT EXCEPTION! 💥 Shutting Down ... ');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});

dotenv.config({ path: './config.env' });

const app = require('./app'); //this should be afther the above

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB Connection Successful !');
  });

// console.log(process.env);

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port} ...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);

  console.log(' UNHANDLED REJECTION! 💥 Shutting Down ... ');

  server.close(() => {
    process.exit(1);
  });
});
