import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// ==================== BADGE DEFINITIONS ====================

const BADGE_DEFINITIONS = [
  // Problem Solving Badges
  { id: 'first_blood', name: 'First Blood', description: 'Solve your first problem', icon: '🎯', condition: { type: 'problems_solved', count: 1 } },
  { id: 'problem_solver_10', name: 'Problem Solver', description: 'Solve 10 problems', icon: '🧩', condition: { type: 'problems_solved', count: 10 } },
  { id: 'problem_solver_25', name: 'Code Warrior', description: 'Solve 25 problems', icon: '⚔️', condition: { type: 'problems_solved', count: 25 } },
  { id: 'problem_solver_50', name: 'Algorithm Master', description: 'Solve 50 problems', icon: '🏆', condition: { type: 'problems_solved', count: 50 } },
  { id: 'problem_solver_100', name: 'Legendary Coder', description: 'Solve 100 problems', icon: '👑', condition: { type: 'problems_solved', count: 100 } },
  
  // Streak Badges
  { id: 'streak_3', name: 'Hat Trick', description: '3 correct submissions in a row', icon: '🎩', condition: { type: 'streak', count: 3 } },
  { id: 'streak_5', name: 'On Fire', description: '5 correct submissions in a row', icon: '🔥', condition: { type: 'streak', count: 5 } },
  { id: 'streak_10', name: 'Unstoppable', description: '10 correct submissions in a row', icon: '💫', condition: { type: 'streak', count: 10 } },
  
  // Difficulty Badges
  { id: 'easy_5', name: 'Easy Peasy', description: 'Solve 5 Easy problems', icon: '🌱', condition: { type: 'difficulty', difficulty: 'easy', count: 5 } },
  { id: 'medium_5', name: 'Getting Warmer', description: 'Solve 5 Medium problems', icon: '🌟', condition: { type: 'difficulty', difficulty: 'medium', count: 5 } },
  { id: 'hard_3', name: 'Hard Mode', description: 'Solve 3 Hard problems', icon: '💎', condition: { type: 'difficulty', difficulty: 'hard', count: 3 } },
  { id: 'hard_10', name: 'Genius', description: 'Solve 10 Hard problems', icon: '🧠', condition: { type: 'difficulty', difficulty: 'hard', count: 10 } },
  
  // Speed Badges
  { id: 'speed_demon', name: 'Speed Demon', description: 'Solve a problem in under 5 minutes', icon: '⚡', condition: { type: 'speed', minutes: 5 } },
  { id: 'flash', name: 'The Flash', description: 'Solve a problem in under 2 minutes', icon: '🏃', condition: { type: 'speed', minutes: 2 } },
  
  // Consistency Badges
  { id: 'daily_7', name: 'Week Warrior', description: 'Submit code for 7 consecutive days', icon: '📅', condition: { type: 'daily_streak', days: 7 } },
  { id: 'daily_30', name: 'Monthly Master', description: 'Submit code for 30 consecutive days', icon: '🗓️', condition: { type: 'daily_streak', days: 30 } },
  
  // Language Badges
  { id: 'polyglot', name: 'Polyglot', description: 'Solve problems in 3 different languages', icon: '🌐', condition: { type: 'languages', count: 3 } },
  
  // Perfect Score Badges
  { id: 'perfectionist', name: 'Perfectionist', description: 'Get 100% on 5 assignments', icon: '💯', condition: { type: 'perfect_assignments', count: 5 } },
  
  // Contest Badges
  { id: 'contest_first', name: 'Contest Champion', description: 'Win first place in a contest', icon: '🥇', condition: { type: 'contest_rank', rank: 1 } },
  { id: 'contest_top3', name: 'Podium Finish', description: 'Finish in top 3 in a contest', icon: '🏅', condition: { type: 'contest_rank', rank: 3 } },
];

// ==================== ENDPOINTS ====================

// Get all badges with user progress
router.get('/', auth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    // Get user's earned badges
    const earnedBadges = await db.all(`
      SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?
    `, [userId]);
    const earnedSet = new Set(earnedBadges.map(b => b.badge_id));

    // Get user stats for progress calculation
    const stats = await getUserStats(db, userId);

    // Calculate progress for each badge
    const badges = BADGE_DEFINITIONS.map(badge => {
      const earned = earnedBadges.find(b => b.badge_id === badge.id);
      const progress = calculateProgress(badge.condition, stats);
      
      return {
        ...badge,
        earned: !!earned,
        earnedAt: earned?.earned_at,
        progress: Math.min(progress, 100)
      };
    });

    res.json({ badges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Failed to fetch badges' });
  }
});

// Get user's earned badges only
router.get('/earned', auth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    const earnedBadges = await db.all(`
      SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?
      ORDER BY earned_at DESC
    `, [userId]);

    const badges = earnedBadges.map(eb => {
      const def = BADGE_DEFINITIONS.find(b => b.id === eb.badge_id);
      return def ? { ...def, earnedAt: eb.earned_at, earned: true } : null;
    }).filter(Boolean);

    res.json({ badges });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch earned badges' });
  }
});

// Check and award badges for a user
router.post('/check', auth, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    const newBadges = await checkAndAwardBadges(db, userId);

    res.json({ 
      newBadges,
      message: newBadges.length > 0 ? `You earned ${newBadges.length} new badge(s)!` : 'No new badges earned'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check badges' });
  }
});

// Get leaderboard by badges
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const db = req.app.get('db');

    const leaderboard = await db.all(`
      SELECT 
        u.id, u.name, u.usn,
        COUNT(ub.badge_id) as badge_count,
        GROUP_CONCAT(ub.badge_id) as badge_ids
      FROM users u
      LEFT JOIN user_badges ub ON u.id = ub.user_id
      WHERE u.role = 'student'
      GROUP BY u.id
      HAVING badge_count > 0
      ORDER BY badge_count DESC
      LIMIT 50
    `);

    // Add badge details
    const result = leaderboard.map(entry => ({
      ...entry,
      badges: entry.badge_ids 
        ? entry.badge_ids.split(',').map(id => BADGE_DEFINITIONS.find(b => b.id === id)).filter(Boolean)
        : []
    }));

    res.json({ leaderboard: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

// ==================== HELPER FUNCTIONS ====================

async function getUserStats(db, userId) {
  const [solved, submissions, byDifficulty, languages, streak, dailyStreak] = await Promise.all([
    // Total problems solved
    db.get(`
      SELECT COUNT(DISTINCT problem_id) as count 
      FROM submissions 
      WHERE student_id = ? AND verdict = 'AC'
    `, [userId]),
    
    // Total submissions
    db.get(`SELECT COUNT(*) as count FROM submissions WHERE student_id = ?`, [userId]),
    
    // By difficulty
    db.all(`
      SELECT p.difficulty, COUNT(DISTINCT s.problem_id) as count
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.student_id = ? AND s.verdict = 'AC'
      GROUP BY p.difficulty
    `, [userId]),
    
    // Languages used
    db.get(`
      SELECT COUNT(DISTINCT language) as count
      FROM submissions
      WHERE student_id = ? AND verdict = 'AC'
    `, [userId]),
    
    // Current AC streak
    db.all(`
      SELECT verdict FROM submissions
      WHERE student_id = ?
      ORDER BY submitted_at DESC
      LIMIT 20
    `, [userId]),
    
    // Daily submission streak
    db.all(`
      SELECT DISTINCT DATE(submitted_at) as date
      FROM submissions
      WHERE student_id = ?
      ORDER BY date DESC
      LIMIT 60
    `, [userId])
  ]);

  // Calculate AC streak
  let acStreak = 0;
  for (const s of streak) {
    if (s.verdict === 'AC') acStreak++;
    else break;
  }

  // Calculate daily streak
  let daily = 0;
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < dailyStreak.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    if (dailyStreak[i]?.date === expected.toISOString().split('T')[0]) {
      daily++;
    } else {
      break;
    }
  }

  return {
    problemsSolved: solved.count,
    totalSubmissions: submissions.count,
    easy: byDifficulty.find(d => d.difficulty === 'easy')?.count || 0,
    medium: byDifficulty.find(d => d.difficulty === 'medium')?.count || 0,
    hard: byDifficulty.find(d => d.difficulty === 'hard')?.count || 0,
    languages: languages.count,
    acStreak,
    dailyStreak: daily
  };
}

function calculateProgress(condition, stats) {
  switch (condition.type) {
    case 'problems_solved':
      return (stats.problemsSolved / condition.count) * 100;
    case 'streak':
      return (stats.acStreak / condition.count) * 100;
    case 'difficulty':
      const count = stats[condition.difficulty] || 0;
      return (count / condition.count) * 100;
    case 'daily_streak':
      return (stats.dailyStreak / condition.days) * 100;
    case 'languages':
      return (stats.languages / condition.count) * 100;
    default:
      return 0;
  }
}

async function checkAndAwardBadges(db, userId) {
  const stats = await getUserStats(db, userId);
  const earnedBadges = await db.all('SELECT badge_id FROM user_badges WHERE user_id = ?', [userId]);
  const earnedSet = new Set(earnedBadges.map(b => b.badge_id));
  
  const newBadges = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (earnedSet.has(badge.id)) continue;

    const progress = calculateProgress(badge.condition, stats);
    if (progress >= 100) {
      await db.run(
        'INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, datetime("now"))',
        [userId, badge.id]
      );
      newBadges.push(badge);
    }
  }

  return newBadges;
}

export { checkAndAwardBadges, BADGE_DEFINITIONS };
export default router;
