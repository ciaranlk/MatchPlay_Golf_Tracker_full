// src/App.jsx
import React, { useState, useEffect } from 'react';

const NUM_HOLES = 18;

function calculateMatchStatus(results) {
  let redWins = 0;
  let blueWins = 0;
  results.forEach((r) => {
    if (r === 'Red') redWins++;
    else if (r === 'Blue') blueWins++;
  });
  const lead = redWins - blueWins;
  const remaining = NUM_HOLES - results.filter(Boolean).length;
  if (lead === 0) return 'All Square';
  if (lead > 0 && lead > remaining) return `Red wins ${lead}&${remaining}`;
  if (lead < 0 && -lead > remaining) return `Blue wins ${-lead}&${remaining}`;
  return lead > 0 ? `Red ${lead} Up` : `Blue ${-lead} Up`;
}

const App = () => {
  const [teamRed, setTeamRed] = useState('Team Red');
  const [teamBlue, setTeamBlue] = useState('Team Blue');
  const [scores, setScores] = useState(Array(NUM_HOLES).fill({ red: null, blue: null }));
  const [results, setResults] = useState(Array(NUM_HOLES).fill(null));
  const [matchStatus, setMatchStatus] = useState('All Square');
  const [courseData, setCourseData] = useState([]);
  const [courseName, setCourseName] = useState('');

  const [hcpRedIndex, setHcpRedIndex] = useState(10);
  const [hcpBlueIndex, setHcpBlueIndex] = useState(14);
  const [hcpDiff, setHcpDiff] = useState(0);
  const [shotsGiven, setShotsGiven] = useState([]);

  useEffect(() => {
    const diff = Math.abs(hcpRedIndex - hcpBlueIndex);
    const siSorted = [...courseData].sort((a, b) => a.si - b.si);
    const shotHoles = siSorted.slice(0, diff).map(h => h.hole);
    setHcpDiff(diff);
    setShotsGiven(shotHoles);
  }, [hcpRedIndex, hcpBlueIndex, courseData]);

  const updateScore = (hole, team, action) => {
    const newScores = [...scores];
    const current = newScores[hole][team];
    if (action === '+') newScores[hole][team] = current !== null ? current + 1 : 1;
    else if (action === '-') newScores[hole][team] = current > 1 ? current - 1 : null;
    else newScores[hole][team] = null;
    setScores(newScores);

    const red = newScores[hole].red;
    const blue = newScores[hole].blue;
    if (red !== null && blue !== null) {
      const adjustedRed = hcpRedIndex > hcpBlueIndex && shotsGiven.includes(hole + 1) ? red - 1 : red;
      const adjustedBlue = hcpBlueIndex > hcpRedIndex && shotsGiven.includes(hole + 1) ? blue - 1 : blue;
      if (adjustedRed < adjustedBlue) results[hole] = 'Red';
      else if (adjustedRed > adjustedBlue) results[hole] = 'Blue';
      else results[hole] = 'Half';
    } else {
      results[hole] = null;
    }
    setResults([...results]);
    setMatchStatus(calculateMatchStatus(results));
  };

  const fetchCourse = async () => {
    const res = await fetch(`/api/coursefetcher?courseName=${encodeURIComponent(courseName)}`);
    const data = await res.json();
    setCourseData(data.holes.sort((a, b) => a.hole - b.hole));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Golf Matchplay Tracker</h2>
      <div>
        <input placeholder="Course Name" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
        <button onClick={fetchCourse}>Load Course</button>
      </div>
      <div>
        <input value={teamRed} onChange={(e) => setTeamRed(e.target.value)} style={{ color: 'red' }} />
        <input value={teamBlue} onChange={(e) => setTeamBlue(e.target.value)} style={{ color: 'blue' }} />
      </div>
      <div>
        <label>{teamRed} Handicap Index: </label>
        <input type="number" value={hcpRedIndex} onChange={(e) => setHcpRedIndex(Number(e.target.value))} />
        <label>{teamBlue} Handicap Index: </label>
        <input type="number" value={hcpBlueIndex} onChange={(e) => setHcpBlueIndex(Number(e.target.value))} />
      </div>
      <h3>Match Status: {matchStatus}</h3>
      <table>
        <thead>
          <tr>
            <th>Hole</th>
            <th>Par</th>
            <th>SI</th>
            <th style={{ color: 'red' }}>{teamRed}</th>
            <th style={{ color: 'blue' }}>{teamBlue}</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {courseData.map((hole, i) => (
            <tr key={i}>
              <td>{hole.hole}</td>
              <td>{hole.par}</td>
              <td>{hole.si}</td>
              <td>
                <button onClick={() => updateScore(i, 'red', '+')}>+</button>
                <button onClick={() => updateScore(i, 'red', '-')}>-</button>
                <span>{scores[i].red}</span>
              </td>
              <td>
                <button onClick={() => updateScore(i, 'blue', '+')}>+</button>
                <button onClick={() => updateScore(i, 'blue', '-')}>-</button>
                <span>{scores[i].blue}</span>
              </td>
              <td>{results[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
