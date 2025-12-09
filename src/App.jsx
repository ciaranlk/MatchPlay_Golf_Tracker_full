import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [courseName, setCourseName] = useState('');
  const [courseData, setCourseData] = useState([]);
  const [team1Name, setTeam1Name] = useState('Red');
  const [team2Name, setTeam2Name] = useState('Blue');
  const [scores, setScores] = useState([]);
  const [matchStatus, setMatchStatus] = useState('AS');

  useEffect(() => {
    if (courseData.length) {
      setScores(courseData.map(() => ({ team1: 0, team2: 0 })));
    }
  }, [courseData]);

  const fetchCourse = async () => {
  try {
    const res = await fetch(`/api/coursefetcher?courseName=${encodeURIComponent(courseName)}`);
    const data = await res.json();

    if (!res.ok) {
      alert(`Error: ${data.error}`);
      return;
    }

    if (!data.holes || data.holes.length === 0) {
      alert("No holes returned. Try a different course name.");
      return;
    }

    // Sort holes by number
    const sorted = data.holes.sort((a, b) => a.hole - b.hole);
    setCourseData(sorted);
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Failed to load course. Check console.");
  }
};


  const updateScore = (index, team, value) => {
    const newScores = [...scores];
    newScores[index] = {
      ...newScores[index],
      [team]: newScores[index][team] + value,
    };
    setScores(newScores);
    calculateMatchStatus(newScores);
  };

  const calculateMatchStatus = (scoreData) => {
    let team1Wins = 0;
    let team2Wins = 0;

    scoreData.forEach(score => {
      if (score.team1 > score.team2) team1Wins++;
      if (score.team2 > score.team1) team2Wins++;
    });

    const diff = team1Wins - team2Wins;
    if (diff === 0) setMatchStatus('AS');
    else if (diff > 0) setMatchStatus(`${team1Name} ${diff} Up`);
    else setMatchStatus(`${team2Name} ${Math.abs(diff)} Up`);
  };

  return (
    <div>
      <h1>Golf Matchplay Tracker</h1>
      <div>
        <label>Course: </label>
        <input
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="Enter Course Name"
        />
        <button onClick={fetchCourse}>Load Course</button>
      </div>

      <div>
        <label>{team1Name} Name: </label>
        <input value={team1Name} onChange={(e) => setTeam1Name(e.target.value)} />
        <label>{team2Name} Name: </label>
        <input value={team2Name} onChange={(e) => setTeam2Name(e.target.value)} />
      </div>

      <h2>Match Status: {matchStatus}</h2>

      <div className="scorecard">
        {courseData.map((hole, idx) => (
          <div key={idx}>
            <strong>Hole {hole.hole}</strong>
            <div>Par: {hole.par}</div>
            <div>SI: {hole.si}</div>
            <div>{team1Name}: {scores[idx]?.team1 || 0}</div>
            <div>{team2Name}: {scores[idx]?.team2 || 0}</div>
            <button className="team1" onClick={() => updateScore(idx, 'team1', 1)}>{team1Name} +1</button>
            <button className="team2" onClick={() => updateScore(idx, 'team2', 1)}>{team2Name} +1</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
