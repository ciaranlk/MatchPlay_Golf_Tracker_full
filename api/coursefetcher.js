// /api/coursefetcher.js - uses Golf Data API from Jacobbrewer1

export default async function handler(req, res) {
  const { courseName } = req.query;

  if (!courseName) {
    return res.status(400).json({ error: 'Missing courseName parameter' });
  }

  try {
    // 1. Search clubs
    const clubsRes = await fetch(`https://golf-data-api.vercel.app/api/clubs`);
    const clubs = await clubsRes.json();

    const matchedClub = clubs.find(c =>
      c.name.toLowerCase().includes(courseName.toLowerCase())
    );

    if (!matchedClub) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // 2. Get courses for that club
    const coursesRes = await fetch(`https://golf-data-api.vercel.app/api/clubs/${matchedClub.id}/courses`);
    const courses = await coursesRes.json();

    if (!courses.length) {
      return res.status(404).json({ error: 'No courses for club' });
    }

    // 3. Pick the first course's first marker (tee set)
    const markerId = courses[0].marker_sets[0]?.id;
    if (!markerId) {
      return res.status(404).json({ error: 'No marker sets available for course' });
    }

    // 4. Get holes for that marker
    const holesRes = await fetch(`https://golf-data-api.vercel.app/api/markers/${markerId}/holes`);
    const holeData = await holesRes.json();

    const holes = holeData.map(h => ({
      hole: h.number,
      par: h.par,
      si: h.stroke_index
    }));

    res.status(200).json({
      name: matchedClub.name,
      holes
    });
  } catch (error) {
    console.error('Error using Golf Data API:', error);
    res.status(500).json({ error: 'Failed to fetch course data' });
  }
}
