import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { user_id, page = 1, limit = 10, start, end } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id é obrigatório' });
  }

  const offset = (page - 1) * limit;

  let query = supabase
    .from('agent_questions')
    .select('question, response', { count: 'exact' })
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (start) query = query.gte('created_at', start);
  if (end) query = query.lte('created_at', end);

  const { data, error, count } = await query;

  if (error) return res.status(500).json({ error });

  return res.status(200).json({ data, total: count });
}
