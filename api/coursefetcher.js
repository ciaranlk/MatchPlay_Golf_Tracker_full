// /api/coursefetcher.js

export default async function handler(req, res) {
  const { courseName } = req.query;

  if (!courseName) {
    return res.status(400).json({ error: 'Missing courseName parameter' });
  }

  try {
    const apiKey = 'YHNT3KMYKDBKYAPDRXLSY7WR3Q';
    const response = await fetch(`https://golfcourseapi.com/api/v1/courses/search?query=${encodeURIComponent(courseName)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const searchResults = await response.json();
    if (!searchResults.courses || searchResults.courses.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const courseId = searchResults.courses[0].id;

    const detailsRes = await fetch(`https://golfcourseapi.com/api/v1/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const courseDetails = await detailsRes.json();
    const holes = courseDetails?.holes?.map(h => ({
      hole: h.number,
      par: h.par,
      si: h.stroke_index
    })) || [];

    res.status(200).json({
      name: courseDetails.name,
      holes
    });

  } catch (error) {
    console.error('Error fetching course data:', error);
    res.status(500).json({ error: 'Failed to fetch course data' });
  }
}
