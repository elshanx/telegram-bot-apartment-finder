import { format } from 'date-fns';
import chalk from 'chalk';

const isDevMode = () => process.env.NODE_ENV === 'dev';

const logDate = () => {
  const date = format(new Date(), 'EEEE MMMM d y HH:mm:ss OOOO');
  console.log(chalk.yellowBright(`Ran: ${date}`));
};

export { isDevMode, logDate };
