const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const teamSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4
  },
  teamName: {
    type: String,
    required: true,
  },
  players: {
    type: [
      {
        Player: String,
        Team: String,
        Role: String,
        Points: {
          type: Number,
          default: 0
        }
      },
    ],
    required: true,
  },
  captain: {
    type: String,
    required: true,
  },
  viceCaptain: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;