import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [courseName, setCourseName] = useState('');
  const [courseData, setCourseData] = useState([]);
  const [teamRedName, setTeamRedName] = useState('Team Red');
  const [teamBlueName, setTeamBlueName] = useState('Team Blue');
  const [redHcpIndex, setRedHcpIndex] = useState(0);
  const [blueHcpIndex, setBlueHcpIndex] = useState(0);
  const [scores, setScores] = useState({ red: {}, blue: {} });
  const [shotsGiven, setShotsGiven] = useState([]);
  const [matchStatus, setMatchStatus] = useState('All Square');

  useEffect(() => {
    calculateShots();
  }, [courseData, redHcpIndex, blueHcpIndex]);

  const fetchCourse = async () => {
    const res = await fetch(`/api/coursefetcher?courseName=${encodeURIComponent(courseName)}`);
    const data = await res.json();
    const sortedHoles = data.holes.sort((a, b) => a.hole - b.hole);
    setCourseData(sortedHoles);
  };

  const calculateShots = () => {
    const redHcp = Number(redHcpIndex);
    const blueHcp = Number(blueHcpIndex);
    const diff = Math.abs(redHcp - blueHcp);
    const lowerHcpTeam = redHcp > blueHcp ? 'blue' : 'red';

    const sortedBySI = [...courseData].sort((a, b) => a.si - b.si);
    const holesToApply = sortedBySI.slice(0, diff).map(h => h.hole);
    setShotsGiven(holesToApply.map(hole => ({ hole, team: lowerHcpTeam })));
  };

  const handleScoreChange = (hole, team, delta) => {
    setScores(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        [hole]: Math.max(0, (prev[team][hole] || 0) + delta)
      }
    }));
  };

  const getNetScore = (hole, team) => {
    const base = scores[team]?.[hole] || 0;
    const stroke = shotsGiven.find(s => s.hole === hole && s.team === team) ? 1 : 0;
    return base - stroke;
  };

  const calculateHoleResult = (hole) => {
    const redScore = getNetScore(hole, 'red');
    const blueScore = getNetScore(hole, 'blue');
    if (!redScore && !blueScore) return '';
    if (redScore < blueScore) return 'Red';
    if (blueScore < redScore) return 'Blue';
    return 'Half';
  };

  useEffect(() => {
    let redUp = 0, blueUp = 0;
    courseData.forEach(holeData => {
      const result = calculateHoleResult(holeData.hole);
      if (result === 'Red') redUp++;
      else if (result === 'Blue') blueUp++;
    });

    const diff = redUp - blueUp;
    if (diff === 0) setMatchStatus('All Square');
    else if (diff > 0) setMatchStatus(`${teamRedName} ${diff} Up`);
    else setMatchStatus(`${teamBlueName} ${Math.abs(diff)} Up`);
  }, [scores, shotsGiven, courseData, teamRedName, teamBlueName]);

  return (
    <div className="App">
      <h2>Golf Matchplay Tracker</h2>
      <input
        value={courseName}
        onChange={e => setCourseName(e.target.value)}
        placeholder="Enter course name"
      />
      <button onClick={fetchCourse}>Load Course</button>

      <div>
        <label style={{ color: 'red' }}>
          <span style={{ fontWeight: 'bold' }}>Team Red:</span>
          <input value={teamRedName} onChange={e => setTeamRedName(e.target.value)} />
        </label>
        <input
          type="number"
          placeholder="HCP Index"
          value={redHcpIndex}
          onChange={e => setRedHcpIndex(e.target.value)}
        />
      </div>
      <div>
        <label style={{ color: 'blue' }}>
          <span style={{ fontWeight: 'bold' }}>Team Blue:</span>
          <input value={teamBlueName} onChange={e => setTeamBlueName(e.target.value)} />
        </label>
        <input
          type="number"
          placeholder="HCP Index"
          value={blueHcpIndex}
          onChange={e => setBlueHcpIndex(e.target.value)}
        />
      </div>

      <h4>Match Status: {matchStatus}</h4>

      <table>
        <thead>
          <tr>
            <th>Hole</th>
            <th>Par</th>
            <th>SI</th>
            <th style={{ color: 'red' }}>{teamRedName}</th>
            <th style={{ color: 'blue' }}>{teamBlueName}</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {courseData.map(({ hole, par, si }) => (
            <tr key={hole}>
              <td>{hole}</td>
              <td>{par}</td>
              <td>{si}</td>
              <td>
                <button onClick={() => handleScoreChange(hole, 'red', 1)}>+</button>
                <button onClick={() => handleScoreChange(hole, 'red', -1)}>-</button>
                {scores.red?.[hole] || 0}
              </td>
              <td>
                <button onClick={() => handleScoreChange(hole, 'blue', 1)}>+</button>
                <button onClick={() => handleScoreChange(hole, 'blue', -1)}>-</button>
                {scores.blue?.[hole] || 0}
              </td>
              <td>{calculateHoleResult(hole)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
