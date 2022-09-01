import { config } from 'dotenv';

import { isDevMode } from '../utils';

let ENV_PATH = './config/.env';
if (!isDevMode()) ENV_PATH = './config/.env.production';

config({ path: ENV_PATH });
