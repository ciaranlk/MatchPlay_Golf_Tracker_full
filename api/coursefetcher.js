export default async function handler(req, res) {
  const { courseName } = req.query;

  if (!courseName) {
    return res.status(400).json({ error: 'Missing courseName parameter' });
  }

  try {
    const apiKey = 'YHNT3KMYKDBKYAPDRXLSY7WR3Q'; // Your GolfCourseAPI key

    const searchRes = await fetch(`https://api.golfcourseapi.com/v1/search?name=${encodeURIComponent(courseName)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!searchRes.ok) {
      throw new Error(`Search failed: ${searchRes.status}`);
    }

    const searchData = await searchRes.json();

    if (!searchData || !searchData.length) {
      return res.status(404).json({ error: 'No matching courses found' });
    }

    const courseId = searchData[0].id;

    const courseRes = await fetch(`https://api.golfcourseapi.com/v1/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!courseRes.ok) {
      throw new Error(`Course fetch failed: ${courseRes.status}`);
    }

    const courseData = await courseRes.json();

    const holes = courseData.holes.map(h => ({
      hole: h.number,
      par: h.par,
      si: h.stroke_index
    }));

    res.status(200).json({
      name: courseData.name,
      holes
    });
  } catch (error) {
    console.error('GolfCourseAPI error:', error.message);
    res.status(500).json({ error: 'Failed to fetch course data' });
  }
}
