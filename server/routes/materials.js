const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

// GET all materials
router.get('/', async (req, res) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new material
router.post('/', async (req, res) => {
  const material = new Material(req.body);
  try {
    const newMaterial = await material.save();
    res.status(201).json(newMaterial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
