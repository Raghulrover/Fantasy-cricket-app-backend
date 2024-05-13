const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

router.post('/add-team', async (req, res) => {
    try {
      const { teamName, players, captain, viceCaptain } = req.body;
  
      // Validate the request data
      if (!teamName || !players || !captain || !viceCaptain) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Validate the number of players
      if (players.length !== 11) {
        return res.status(400).json({ error: 'A team must have exactly 11 players' });
      }

      const teamCounts = {};

      players.forEach(player => {
        teamCounts[player.Team] = (teamCounts[player.Team] || 0) + 1;
      });

      // Identify any team violations (more than 10 players)
      Object.keys(teamCounts).forEach(team => {
        if (teamCounts[team] > 10) {
          return res.status(400).json({ error: `${team} has more than 10 players, which violates the rules.` });
        }
      });
  
      // Validate the types of players and captain-vice captain selection
      let wkCount = 0;
      let batCount = 0;
      let arCount = 0;
      let bwlCount = 0;
  
      for (const player of players) {
  
        // Increment the count based on player type
        if (player.Role === 'WICKETKEEPER') {
          wkCount++;
        } else if (player.Role === 'BATTER') {
          batCount++;
        } else if (player.Role === 'ALL-ROUNDER') {
          arCount++;
        } else if (player.Role === 'BOWLER') {
          bwlCount++;
        }
      }
  
      // Validate the count of player types
      if (wkCount < 1 || wkCount > 8 || batCount < 1 || batCount > 8 || arCount < 1 || arCount > 8 || bwlCount < 1 || bwlCount > 8) {
        return res.status(400).json({ error: 'Invalid countof player types. Each type should have a minimum of 1 and a maximum of 8 players' });
      }

      // Check if captain and viceCaptain names are in the players list
      const captainExists = players.some(player => player.Player === captain);
      const viceCaptainExists = players.some(player => player.Player === viceCaptain);

      if(!(captainExists && viceCaptainExists)){
        return res.status(400).json({ error: 'Select captain and vicecaptain from team' });
      }
  
      // Save the team entry to the database
      const team = new Team({ teamName, players, captain, viceCaptain });
      await team.save();
  
      res.status(201).json({ message: 'Team added successfully' });
    } catch (error) {
      console.error('Error adding team', error);
      res.status(500).json({ error: 'Failed to add team' });
    }
  });

module.exports = router;