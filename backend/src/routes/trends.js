const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

router.get('/overview', async (req, res) => {
  try {
    const { from, to, limit = 50 } = req.query;
    
    let query = supabase
      .from('trend_snapshots')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (from) {
      query = query.gte('created_at', from);
    }
    if (to) {
      query = query.lte('created_at', to);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      trends: data,
      count: data.length,
      from,
      to
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

router.get('/trend/:trendId', async (req, res) => {
  try {
    const { trendId } = req.params;
    const { from, to } = req.query;

    let query = supabase
      .from('trend_snapshots')
      .select('*')
      .eq('trend_id', trendId)
      .order('created_at', { ascending: false });

    if (from) {
      query = query.gte('created_at', from);
    }
    if (to) {
      query = query.lte('created_at', to);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ error: 'Trend not found' });
    }

    res.json({
      trendId,
      snapshots: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching trend:', error);
    res.status(500).json({ error: 'Failed to fetch trend' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const { timeframe = '7d', limit = 10 } = req.query;
    
    const fromDate = new Date();
    if (timeframe === '1d') fromDate.setDate(fromDate.getDate() - 1);
    else if (timeframe === '7d') fromDate.setDate(fromDate.getDate() - 7);
    else if (timeframe === '30d') fromDate.setDate(fromDate.getDate() - 30);

    const { data, error } = await supabase
      .from('trend_snapshots')
      .select('trend_id, trend_name, search_volume, created_at')
      .gte('created_at', fromDate.toISOString())
      .order('search_volume', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const aggregated = data.reduce((acc, snapshot) => {
      if (!acc[snapshot.trend_id]) {
        acc[snapshot.trend_id] = {
          trendId: snapshot.trend_id,
          trendName: snapshot.trend_name,
          totalVolume: 0,
          snapshots: []
        };
      }
      acc[snapshot.trend_id].totalVolume += snapshot.search_volume || 0;
      acc[snapshot.trend_id].snapshots.push(snapshot);
      return acc;
    }, {});

    const leaderboard = Object.values(aggregated)
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, parseInt(limit));

    res.json({
      leaderboard,
      timeframe,
      count: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
