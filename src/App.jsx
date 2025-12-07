// src/App.jsx (final with deep copy + handicap logic working)

import React, { useState, useEffect } from 'react';

const TOTAL_HOLES = 18;

export default function App() {
  const [teamRed, setTeamRed] = useState('Red Team');
  const [teamBlue, setTeamBlue] = useState('Blue Team');
  const [scores, setScores] = useState(Array(TOTAL_HOLES).fill({ red: null, blue: null }));
  const [results, setResults] = useState(Array(TOTAL_HOLES).fill(null));
  const [matchStatus, setMatchStatus] = useState('All Square');
  const [hcpRedIndex, setHcpRedIndex] = useState(10);
  const [hcpBlueIndex, setHcpBlueIndex] = useState(15);
  const [courseData, setCourseData] = useState([]);
  const [shotsGiven, setShotsGiven] = useState([]);
  const [courseName, setCourseName] = useState('Balmore GC');

  useEffect(() => {
    fetchCourse(courseName);
  }, []);

  useEffect(() => {
    calculateShotsGiven();
  }, [hcpRedIndex, hcpBlueIndex, courseData]);

  const fetchCourse = async (name) => {
    const res = await fetch(`/api/coursefetcher?courseName=${encodeURIComponent(name)}`);
    const data = await res.json();
    if (!data.holes) return;
    setCourseData(data.holes.sort((a, b) => a.hole - b.hole));
  };

  const calculateShotsGiven = () => {
    const diff = Math.abs(hcpRedIndex - hcpBlueIndex);
    const sortedBySI = [...courseData].sort((a, b) => a.si - b.si);
    const holesToGetStrokes = sortedBySI.slice(0, diff).map(h => h.hole);
    setShotsGiven(holesToGetStrokes);
  };

  const calculateMatchStatus = (results) => {
    let redWins = 0;
    let blueWins = 0;

    for (let i = 0; i < TOTAL_HOLES; i++) {
      const r = results[i];
      if (r === 'Red') redWins++;
      if (r === 'Blue') blueWins++;

      const remaining = TOTAL_HOLES - (i + 1);
      if (redWins > blueWins + remaining) return `${teamRed} Wins ${redWins - blueWins}&${remaining}`;
      if (blueWins > redWins + remaining) return `${teamBlue} Wins ${blueWins - redWins}&${remaining}`;
    }

    if (redWins > blueWins) return `${teamRed} ${redWins - blueWins} Up`;
    if (blueWins > redWins) return `${teamBlue} ${blueWins - redWins} Up`;
    return 'All Square';
  };

  const updateScore = (hole, team, action) => {
    const newScores = scores.map(score => ({ ...score }));
    const current = newScores[hole][team];

    if (action === '+') newScores[hole][team] = current !== null ? current + 1 : 1;
    else if (action === '-') newScores[hole][team] = current > 1 ? current - 1 : null;
    else newScores[hole][team] = null;

    setScores(newScores);

    const red = newScores[hole].red;
    const blue = newScores[hole].blue;

    let adjustedRed = red;
    let adjustedBlue = blue;

    if (red !== null && blue !== null) {
      if (hcpRedIndex > hcpBlueIndex && shotsGiven.includes(hole + 1)) adjustedRed -= 1;
      if (hcpBlueIndex > hcpRedIndex && shotsGiven.includes(hole + 1)) adjustedBlue -= 1;

      if (adjustedRed < adjustedBlue) results[hole] = 'Red';
      else if (adjustedRed > adjustedBlue) results[hole] = 'Blue';
      else results[hole] = 'Half';
    } else {
      results[hole] = null;
    }

    setResults([...results]);
    setMatchStatus(calculateMatchStatus(results));
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <h1>Golf Matchplay Tracker</h1>

      <label>Course: </label>
      <input
        value={courseName}
        onChange={e => setCourseName(e.target.value)}
        onBlur={() => fetchCourse(courseName)}
        style={{ marginBottom: 10, width: '100%' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <input value={teamRed} onChange={e => setTeamRed(e.target.value)} />
        <input value={teamBlue} onChange={e => setTeamBlue(e.target.value)} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <label>{teamRed} Handicap Index:</label>
        <input
          type="number"
          value={hcpRedIndex}
          onChange={e => setHcpRedIndex(Number(e.target.value))}
        />

        <label>{teamBlue} Handicap Index:</label>
        <input
          type="number"
          value={hcpBlueIndex}
          onChange={e => setHcpBlueIndex(Number(e.target.value))}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
          {courseData.map((holeData, i) => (
            <tr key={i} style={{ textAlign: 'center' }}>
              <td>{holeData.hole}</td>
              <td>{holeData.par}</td>
              <td>{holeData.si}</td>
              <td>
                <button onClick={() => updateScore(i, 'red', '-')}>-</button>
                {scores[i].red ?? '-'}
                <button onClick={() => updateScore(i, 'red', '+')}>+</button>
                {hcpRedIndex > hcpBlueIndex && shotsGiven.includes(holeData.hole) && <span> +1</span>}
              </td>
              <td>
                <button onClick={() => updateScore(i, 'blue', '-')}>-</button>
                {scores[i].blue ?? '-'}
                <button onClick={() => updateScore(i, 'blue', '+')}>+</button>
                {hcpBlueIndex > hcpRedIndex && shotsGiven.includes(holeData.hole) && <span> +1</span>}
              </td>
              <td>{results[i] ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Match Status: {matchStatus}</h2>
    </div>
  );
}
