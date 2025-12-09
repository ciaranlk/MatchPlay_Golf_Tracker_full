export default async function handler(req, res) {
  const { courseName } = req.query;

  if (!courseName) {
    return res.status(400).json({ error: 'Missing courseName parameter' });
  }

  try {
    const apiKey = 'YHNT3KMYKDBKYAPDRXLSY7WR3Q'; // your GolfCourseAPI key

    // 1. Search for the course
    const searchRes = await fetch(`https://api.golfcourseapi.com/v1/search?name=${encodeURIComponent(courseName)}`, {
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    const searchData = await searchRes.json();
    if (!searchData.courses || searchData.courses.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // 2. Get course details
    const courseId = searchData.courses[0].id;
    const detailsRes = await fetch(`https://api.golfcourseapi.com/v1/courses/${courseId}`, {
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    const courseData = await detailsRes.json();
    const tee = courseData.tees[0]; // use first tee set
    const holes = tee.holes.map(h => ({
      hole: h.number,
      par: h.par,
      si: h.stroke_index
    }));

    res.status(200).json({ name: courseData.name, holes });
  } catch (error) {
    console.error('GolfCourseAPI error:', error);
    res.status(500).json({ error: 'Failed to fetch course data' });
  }
}
