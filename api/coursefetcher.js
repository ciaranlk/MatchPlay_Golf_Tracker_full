export default async function handler(req, res) {
  const { courseName } = req.query;

  if (!courseName) {
    return res.status(400).json({ error: 'Missing courseName parameter' });
  }

  try {
    const apiKey = 'cd3951f87emsh0b5f5033b9096a2p1c849bjsn18ab8e619afc';

    const response = await fetch(
      `https://golf-course-api.p.rapidapi.com/search?name=${encodeURIComponent(courseName)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'golf-course-api.p.rapidapi.com',
          'x-rapidapi-key': apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: 'No courses found' });
    }

    // Return all results for debugging for now
    return res.status(200).json({ courses: data });

  } catch (err) {
    console.error('GolfCourseAPI error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
