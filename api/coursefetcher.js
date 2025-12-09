export default async function handler(req, res) {
  const { courseName } = req.query;

  if (!courseName) {
    return res.status(400).json({ error: 'Missing courseName parameter' });
  }

  try {
    const rapidApiKey = 'cd3951f87emsh0b5f5033b9096a2p1c849bjsn18ab8e619afc'; // Your RapidAPI key

    const response = await fetch(
      `https://golf-course-api.p.rapidapi.com/search?name=${encodeURIComponent(courseName)}`,
      {
        headers: {
          'x-rapidapi-host': 'golf-course-api.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey,
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.length) {
      return res.status(404).json({ error: 'No matching course found' });
    }

    // Return course list directly — you can enhance this later
    res.status(200).json({ courses: data });
    
  } catch (error) {
    console.error('GolfCourseAPI error:', error.message);
    res.status(500).json({ error: 'Failed to fetch course data' });
  }
}
