const { isDevMode } = require('../utils');

let ENV_PATH = './config/.env';

if (!isDevMode()) ENV_PATH = './config/.env.production';

require('dotenv').config({ path: ENV_PATH });
