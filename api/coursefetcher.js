export default async function handler(req, res) {
  const { courseName } = req.query;

  if (!courseName) {
    return res.status(400).json({ error: 'Missing courseName parameter' });
  }

  try {
    const fetchJsonSafely = async (url) => {
      const response = await fetch(url);
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON from ${url}: ${text.slice(0, 100)}...`);
      }
    };

    // 1. Search clubs
    const clubs = await fetchJsonSafely(`https://golf-data-api.vercel.app/api/clubs`);
    const matchedClub = clubs.find(c =>
      c.name.toLowerCase().includes(courseName.toLowerCase())
    );

    if (!matchedClub) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // 2. Get courses for that club
    const courses = await fetchJsonSafely(`https://golf-data-api.vercel.app/api/clubs/${matchedClub.id}/courses`);

    if (!courses.length) {
      return res.status(404).json({ error: 'No courses for club' });
    }

    // 3. Pick the first course's first marker (tee set)
    const markerId = courses?.[0]?.marker_sets?.[0]?.id;
    if (!markerId) {
      return res.status(404).json({ error: 'No marker sets available for course' });
    }

    // 4. Get holes for that marker
    const holeData = await fetchJsonSafely(`https://golf-data-api.vercel.app/api/markers/${markerId}/holes`);

    const holes = holeData.map(h => ({
      hole: h.number,
      par: h.par,
      si: h.stroke_index
    }));

    return res.status(200).json({
      name: matchedClub.name,
      holes
    });
  } catch (error) {
    console.error('Error using Golf Data API:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
