const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

router.get('/team-result', async (req, res) => {
  try {
    // Fetch all the team entries from the database
    const teamEntries = await Team.find();

    const teamInfoArray = teamEntries.map(entry => ({
      teamName: entry.teamName,
      points: entry.points,
      players: entry.players.map(player => ({
        playerName: player.Player,
        playerPoints: player.Points || 0
      }))
    }));

    // Sort the team entries based on their points in descending order
    teamInfoArray.sort((a, b) => b.points - a.points);

    // Determine the winning team(s) with the highest points
    const highestPoints = teamInfoArray[0].points;
    const winningTeams = teamInfoArray.filter((team) => team.points === highestPoints);

    const otherTeams = teamInfoArray.filter((team) => !winningTeams.includes(team));

    res.status(200).json({ winningTeams , otherTeams});
  } catch (error) {
    console.error('Error retrieving team results', error);
    res.status(500).json({ error: 'Failed to retrieve team results' });
  }
});

module.exports = router;