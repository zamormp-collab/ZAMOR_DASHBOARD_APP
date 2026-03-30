/**
 * Incidents API Routes
 * Endpoints for managing incidents
 */

const express = require('express');
const router = express.Router();

// In-memory incident storage
let incidents = [];
let nextId = 1;

/**
 * GET /api/incidents
 * Returns list of all incidents
 */
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      count: incidents.length,
      incidents: incidents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

/**
 * POST /api/incidents
 * Create new incident
 */
router.post('/', (req, res) => {
  try {
    const { title, description, severity } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Title is required'
      });
    }

    if (!severity || !['Low', 'Medium', 'High'].includes(severity)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Severity must be Low, Medium, or High'
      });
    }

    // Create incident
    const incident = {
      id: nextId++,
      title: title.trim(),
      description: description ? description.trim() : '',
      severity,
      created_at: new Date().toISOString()
    };

    incidents.push(incident);

    res.status(201).json({
      success: true,
      message: 'Incident created successfully',
      incident
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

/**
 * GET /api/incidents/:id
 * Get specific incident by ID
 */
router.get('/:id', (req, res) => {
  try {
    const incident = incidents.find(i => i.id === parseInt(req.params.id));
    
    if (!incident) {
      return res.status(404).json({
        error: 'Not found',
        message: `Incident with id ${req.params.id} not found`
      });
    }

    res.json({
      success: true,
      incident
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

module.exports = router;
