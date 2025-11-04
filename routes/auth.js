const express = require('express');
const { getViewerToken } = require('../services/aps.js');

const router = express.Router();

router.get('/api/auth/token', async (_req, res, next) => {
  try {
    res.json(await getViewerToken());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
