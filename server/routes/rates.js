import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import supabase from '../db/supabaseClient.js';

const router = express.Router();

// ─── 1. POST /api/rates/calculate (PUBLIC Shipping Calculator) ───────────────
router.post('/calculate', async (req, res) => {
  const { weight_kg = 1, service_type = 'EXPRESS_AIR' } = req.body;
  const weight = parseFloat(weight_kg) || 1.0;

  const { data: rules, error } = await supabase
    .from('rate_rules')
    .select('*')
    .eq('is_active', true)
    .order('base_rate_usd', { ascending: true });

  if (error || !rules) {
    return res.status(500).json({ error: 'Failed to fetch rate rules' });
  }

  const comparison = rules.map(rule => {
    let multiplier = 1.0;
    if (service_type === 'OVERNIGHT') multiplier = 1.6;
    if (service_type === 'STANDARD_OCEAN') multiplier = 0.5;
    const cost = Math.round((parseFloat(rule.base_rate_usd) + weight * parseFloat(rule.per_kg_rate_usd)) * multiplier * 100) / 100;
    return {
      id: rule.id,
      courier_name: rule.courier_name,
      estimated_days: rule.estimated_days,
      cost_usd: cost,
      currency: 'USD'
    };
  });

  res.json({ weight_kg: weight, service_type, options: comparison });
});

// ─── 2. GET /api/rates/rules (List all rate rules — public) ─────────────────
router.get('/rules', async (req, res) => {
  const { data: rules, error } = await supabase
    .from('rate_rules')
    .select('*')
    .order('base_rate_usd', { ascending: true });

  if (error) return res.status(500).json({ error: 'Failed to fetch rate rules' });
  res.json(rules);
});

// ─── 3. PUT /api/rates/rules/:id (Super Admin Edit Base Rate) ────────────────
router.put('/rules/:id', authenticateToken, requireRole('superadmin'), async (req, res) => {
  const { id } = req.params;
  const { base_rate_usd, per_kg_rate_usd, estimated_days, is_active } = req.body;

  const updates = { updated_at: new Date().toISOString() };
  if (base_rate_usd !== undefined) updates.base_rate_usd = parseFloat(base_rate_usd);
  if (per_kg_rate_usd !== undefined) updates.per_kg_rate_usd = parseFloat(per_kg_rate_usd);
  if (estimated_days) updates.estimated_days = estimated_days;
  if (typeof is_active === 'boolean') updates.is_active = is_active;

  const { data: rule, error } = await supabase
    .from('rate_rules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !rule) return res.status(404).json({ error: 'Rate rule not found or update failed' });
  res.json({ message: 'Rate rule updated by Super Admin', rule });
});

export default router;
