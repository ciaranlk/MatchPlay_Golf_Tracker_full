import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [courseName, setCourseName] = useState('');
  const [courseData, setCourseData] = useState([]);
  const [teamRedName, setTeamRedName] = useState('Red');
  const [teamBlueName, setTeamBlueName] = useState('Blue');
  const [teamRedIndex, setTeamRedIndex] = useState(10);
  const [teamBlueIndex, setTeamBlueIndex] = useState(10);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (courseData.length > 0) {
      const initialScores = courseData.map(hole => ({
        hole: hole.hole,
        red: hole.par,
        blue: hole.par
      }));
      setScores(initialScores);
    }
  }, [courseData]);

  const fetchCourse = async () => {
    const res = await fetch(`/api/coursefetcher?courseName=${encodeURIComponent(courseName)}`);
    const data = await res.json();
    if (data.holes) {
      setCourseData(data.holes.sort((a, b) => a.hole - b.hole));
    }
  };

  const adjustScore = (holeNumber, team, delta) => {
    setScores(prev => prev.map(row => row.hole === holeNumber ? { ...row, [team]: row[team] + delta } : row));
  };

  const getShotsGiven = () => {
    const diff = teamRedIndex - teamBlueIndex;
    const shots = Array(18).fill(0);
    if (diff === 0) return shots;
    const giveShotsTo = diff > 0 ? 'red' : 'blue';
    const count = Math.abs(diff);
    const sorted = [...courseData].sort((a, b) => a.si - b.si);
    for (let i = 0; i < count; i++) {
      const holeNum = sorted[i].hole;
      const idx = courseData.findIndex(h => h.hole === holeNum);
      shots[idx] = giveShotsTo;
    }
    return shots;
  };

  const determineResult = (holeIdx) => {
    const score = scores[holeIdx];
    const stroke = shotsGiven[holeIdx];
    let redNet = score.red;
    let blueNet = score.blue;
    if (stroke === 'red') redNet--;
    if (stroke === 'blue') blueNet--;
    if (redNet < blueNet) return teamRedName;
    if (blueNet < redNet) return teamBlueName;
    return 'Half';
  };

  const shotsGiven = getShotsGiven();
  const results = scores.map((_, i) => determineResult(i));
  let redUp = 0, blueUp = 0;
  for (let r of results) {
    if (r === teamRedName) redUp++;
    if (r === teamBlueName) blueUp++;
  }
  const matchStatus = redUp === blueUp ? 'AS' : (redUp > blueUp ? `${teamRedName} ${redUp - blueUp} Up` : `${teamBlueName} ${blueUp - redUp} Up`);

  return (
    <div className="App">
      <h1>Golf Matchplay Tracker</h1>
      <div>
        <label>Course: <input value={courseName} onChange={e => setCourseName(e.target.value)} /></label>
        <button onClick={fetchCourse}>Load Course</button>
      </div>
      <div>
        <label>Red Name: <input value={teamRedName} onChange={e => setTeamRedName(e.target.value)} /></label>
        <label>Blue Name: <input value={teamBlueName} onChange={e => setTeamBlueName(e.target.value)} /></label>
      </div>
      <div>
        <label>{teamRedName} Handicap Index: <input type="number" value={teamRedIndex} onChange={e => setTeamRedIndex(+e.target.value)} /></label>
        <label>{teamBlueName} Handicap Index: <input type="number" value={teamBlueIndex} onChange={e => setTeamBlueIndex(+e.target.value)} /></label>
      </div>
      <h3>Match Status: {matchStatus}</h3>

      <table>
        <thead>
          <tr>
            <th>Hole</th><th>Par</th><th>SI</th>
            <th style={{ color: 'red' }}>{teamRedName}</th>
            <th style={{ color: 'blue' }}>{teamBlueName}</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {courseData.map((hole, i) => (
            <tr key={hole.hole}>
              <td>{hole.hole}</td>
              <td>{hole.par}</td>
              <td>{hole.si}</td>
              <td>
                <button onClick={() => adjustScore(hole.hole, 'red', 1)}>+</button>
                <button onClick={() => adjustScore(hole.hole, 'red', -1)}>-</button>
                {scores[i]?.red || ''} {shotsGiven[i] === 'red' ? <span style={{ color: 'red' }}>(-1)</span> : ''}
              </td>
              <td>
                <button onClick={() => adjustScore(hole.hole, 'blue', 1)}>+</button>
                <button onClick={() => adjustScore(hole.hole, 'blue', -1)}>-</button>
                {scores[i]?.blue || ''} {shotsGiven[i] === 'blue' ? <span style={{ color: 'blue' }}>(-1)</span> : ''}
              </td>
              <td>{results[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
