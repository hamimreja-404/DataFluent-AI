const express = require('express');
const router  = express.Router();
const { getNextWordCompletion } = require('../services/grockService');

// Ghost-text endpoint — uses llama-3.1-8b-instant for instant response
router.post('/suggest', async (req, res) => {
  const { partial, autocomplete } = req.body;

  // Client-side toggle OFF → skip AI entirely (no tokens spent)
  if (autocomplete === false) return res.json({ completion: '' });

  // Server-side length guard
  if (!partial || partial.trim().length < 6) return res.json({ completion: '' });

  const result = await getNextWordCompletion(partial.trim());
  res.json({
    completion:      result.completion,
    remainingTokens: result.remainingTokens,
  });
});


module.exports = router;
