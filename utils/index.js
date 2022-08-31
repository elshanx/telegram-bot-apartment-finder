const { format } = require('date-fns');
const chalk = require('chalk');

const isDevMode = () => process.env.NODE_ENV === 'dev';

const logDate = () => {
  const date = format(new Date(), 'EEEE MMMM d y H:mm:s OOOO');
  console.log(chalk.yellowBright(`Ran: ${date}`));
};

module.exports = { isDevMode, logDate };
