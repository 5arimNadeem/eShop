const express = require('express');
const app = express();

//config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require('dotenv').config({ path: 'config/.env' });
}

// Source - https://stackoverflow.com/a/45168667
// Posted by Vladimir Vukanac
// Retrieved 2026-07-26, License - CC BY-SA 3.0

module.exports = app;
