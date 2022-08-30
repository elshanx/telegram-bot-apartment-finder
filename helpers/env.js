const { isDevMode } = require('../utils');

let ENV_PATH = './config/.env.local';

if (!isDevMode()) ENV_PATH = './config/.env.prod';

require('dotenv').config({ path: ENV_PATH });
