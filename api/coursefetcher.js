// api/coursefetcher.js

export default async function handler(req, res) {
  const { courseName } = req.query;

  // TEMP: mock data - replace this with scraper or API fetch from England Golf
  if (!courseName || courseName.trim() === '') {
    return res.status(400).json({ error: 'Missing course name' });
  }

  // Simulated course data
  const mockCourses = {
    'Balmore GC': [
      { hole: 1, par: 4, si: 10 },
      { hole: 2, par: 3, si: 18 },
      { hole: 3, par: 5, si: 4 },
      { hole: 4, par: 4, si: 6 },
      { hole: 5, par: 4, si: 14 },
      { hole: 6, par: 4, si: 8 },
      { hole: 7, par: 3, si: 16 },
      { hole: 8, par: 5, si: 2 },
      { hole: 9, par: 4, si: 12 },
      { hole: 10, par: 4, si: 11 },
      { hole: 11, par: 3, si: 17 },
      { hole: 12, par: 5, si: 3 },
      { hole: 13, par: 4, si: 5 },
      { hole: 14, par: 4, si: 13 },
      { hole: 15, par: 4, si: 7 },
      { hole: 16, par: 3, si: 15 },
      { hole: 17, par: 5, si: 1 },
      { hole: 18, par: 4, si: 9 }
    ],
    'Newcastle United GC': [
      { hole: 1, par: 4, si: 11 },
      { hole: 2, par: 4, si: 7 },
      { hole: 3, par: 3, si: 17 },
      { hole: 4, par: 5, si: 3 },
      { hole: 5, par: 4, si: 13 },
      { hole: 6, par: 4, si: 9 },
      { hole: 7, par: 4, si: 1 },
      { hole: 8, par: 3, si: 15 },
      { hole: 9, par: 5, si: 5 },
      { hole: 10, par: 4, si: 12 },
      { hole: 11, par: 5, si: 4 },
      { hole: 12, par: 4, si: 2 },
      { hole: 13, par: 4, si: 6 },
      { hole: 14, par: 3, si: 16 },
      { hole: 15, par: 5, si: 8 },
      { hole: 16, par: 4, si: 10 },
      { hole: 17, par: 3, si: 18 },
      { hole: 18, par: 4, si: 14 }
    ]
  };

  const holes = mockCourses[courseName];

  if (!holes) {
    return res.status(404).json({ error: `Course '${courseName}' not found.` });
  }

  return res.status(200).json({ holes });
}
