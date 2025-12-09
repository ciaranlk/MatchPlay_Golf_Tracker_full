// /api/coursefetcher.js – uses GolfCourseAPI

export default async function handler(req, res) {
  const { courseName } = req.query;

  if (!courseName) {
    return res.status(400).json({ error: 'Missing courseName parameter' });
  }

  try {
    const apiKey = 'YHNT3KMYKDBKYAPDRXLSY7WR3Q';

    // 1. Search for the course
    const searchRes = await fetch(`https://golfcourseapi.com/api/v1/search?name=${encodeURIComponent(courseName)}`, {
      headers: {
        'x-api-key': apiKey
      }
    });

    const searchData = await searchRes.json();
    if (!searchData.courses || searchData.courses.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // 2. Get full course details
    const courseId = searchData.courses[0].id;
    const detailsRes = await fetch(`https://golfcourseapi.com/api/v1/courses/${courseId}`, {
      headers: {
        'x-api-key': apiKey
      }
    });
    const courseData = await detailsRes.json();

    const tee = courseData.tees[0]; // default to first tee set
    const holes = tee.holes.map(hole => ({
      hole: hole.number,
      par: hole.par,
      si: hole.stroke_index
    }));

    res.status(200).json({
      name: courseData.name,
      holes
    });
  } catch (err) {
    console.error('GolfCourseAPI error:', err);
    res.status(500).json({ error: 'Failed to fetch course data' });
  }
}
