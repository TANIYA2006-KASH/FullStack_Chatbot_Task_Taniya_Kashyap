import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { createEnquirySchema, updateEnquirySchema, listQuerySchema } from '../utils/schemas.js';
import { escapeLike } from '../utils/sanitize.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

// Public submissions are rate limited to reduce spam.
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many enquiries from this device. Please try again later.' },
});

const COLUMNS = `id, name, email, phone, user_type AS "userType", interest, message, status, source,
                 created_at AS "createdAt", updated_at AS "updatedAt"`;

const parseId = (raw) => {
  if (!/^\d{1,9}$/.test(raw)) throw new AppError(400, 'Enquiry ID must be a positive number');
  return Number(raw);
};

// CREATE (public) ------------------------------------------------------------
router.post('/', submitLimiter, validate(createEnquirySchema), async (req, res, next) => {
  try {
    const { name, email, phone, userType, interest, message, source } = req.body;
    const { rows } = await query(
      `INSERT INTO enquiries (name, email, phone, user_type, interest, message, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ${COLUMNS}`,
      [name, email, phone, userType, interest, message, source],
    );
    res.status(201).json({ success: true, message: 'Thanks! Your enquiry has been received.', data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// Everything below needs an admin token ---------------------------------------
router.use(requireAuth);

// STATS (must be declared before "/:id")
router.get('/stats/summary', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status='New')::int AS "new",
        COUNT(*) FILTER (WHERE status='Contacted')::int AS contacted,
        COUNT(*) FILTER (WHERE status='In Progress')::int AS "inProgress",
        COUNT(*) FILTER (WHERE status='Closed')::int AS closed,
        COUNT(*) FILTER (WHERE user_type='Student')::int AS students,
        COUNT(*) FILTER (WHERE user_type='Customer')::int AS customers,
        COUNT(*) FILTER (WHERE user_type='Other')::int AS other,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int AS "lastSevenDays"
      FROM enquiries`);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// READ ALL with search / filter / sort / pagination
router.get('/', validate(listQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { search, userType, status, page, limit, sort } = req.validatedQuery;
    const where = [];
    const params = [];

    if (search) {
      params.push(`%${escapeLike(search)}%`);
      const p = `$${params.length}`;
      where.push(`(name ILIKE ${p} OR email ILIKE ${p} OR phone ILIKE ${p} OR interest ILIKE ${p} OR message ILIKE ${p})`);
    }
    if (userType) {
      params.push(userType);
      where.push(`user_type = $${params.length}`);
    }
    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderSql = { newest: 'created_at DESC', oldest: 'created_at ASC', name: 'name ASC' }[sort];

    const count = await query(`SELECT COUNT(*)::int AS total FROM enquiries ${whereSql}`, params);
    const total = count.rows[0].total;

    const { rows } = await query(
      `SELECT ${COLUMNS} FROM enquiries ${whereSql} ORDER BY ${orderSql}, id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, (page - 1) * limit],
    );
    res.json({ success: true, data: rows, meta: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (err) {
    next(err);
  }
});

// READ ONE
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(`SELECT ${COLUMNS} FROM enquiries WHERE id = $1`, [parseId(req.params.id)]);
    if (!rows.length) throw new AppError(404, 'Enquiry not found');
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// UPDATE (PUT and PATCH both accept partial updates)
const FIELD_TO_COLUMN = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  userType: 'user_type',
  interest: 'interest',
  message: 'message',
  status: 'status',
};

const update = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const sets = [];
    const params = [];
    for (const [field, column] of Object.entries(FIELD_TO_COLUMN)) {
      if (req.body[field] !== undefined) {
        params.push(req.body[field]);
        sets.push(`${column} = $${params.length}`); // column names come from our whitelist, never from the client
      }
    }
    params.push(id);
    const { rows } = await query(
      `UPDATE enquiries SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING ${COLUMNS}`,
      params,
    );
    if (!rows.length) throw new AppError(404, 'Enquiry not found');
    res.json({ success: true, message: 'Enquiry updated', data: rows[0] });
  } catch (err) {
    next(err);
  }
};
router.put('/:id', validate(updateEnquirySchema), update);
router.patch('/:id', validate(updateEnquirySchema), update);

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM enquiries WHERE id = $1', [parseId(req.params.id)]);
    if (!rowCount) throw new AppError(404, 'Enquiry not found');
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
