const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const matchResult = require('../data/match.json');

router.get('/process-result', async (req, res) => {

    const teamEntries = await Team.find();

    teamEntries.forEach(async (teamEntry) => {
      
      const playerStats = [];
      const playerPoints = {};
      var maiden;
      var overRun;

      matchResult.forEach((ball) => {
  
        const batter = ball.batter;
        const nonStriker = ball.non_striker;
        const bowler = ball.bowler;
        const fielderInvolved = ball.fielders_involved == "NA" ? undefined : ball.fielders_involved

        if(ball.ballnumber == 1){
          overRun = ball.total_run
        }else if(ball.ballnumber == 6){
          overRun = overRun + ball.total_run
          maiden = overRun == 0 ? true : false
          overRun = 0;
          maiden ? "" : maiden = undefined 
        }else{
          overRun = overRun + ball.total_run
        }

        let playersInBall = [batter, nonStriker, bowler]

        if(fielderInvolved){
          playersInBall.push(fielderInvolved)
        }
      
        playersInBall.forEach((playerInBall) => {
          let playerExist = playerStats.some(stats => stats.hasOwnProperty(playerInBall));

          let playerTableExist = playerPoints.hasOwnProperty(playerInBall);

          if(!playerTableExist){
            playerPoints[playerInBall] = 0
          }

          if (!playerExist) {
              
            let playerObject = {};
            playerObject[playerInBall] = {
              runs : 0,
              boundaries : 0,
              six : 0,
              thirtyRunBonus : 0,
              halfcenturyBonus : 0,
              centuryBonus : 0,
              duckDismissal : 0,
              wicket : 0,
              lbwBowledBonus : 0,
              threewicketBonus : 0,
              fourwicketBonus : 0,
              fivewicketBonus : 0,
              maidenOver : 0,
              catch : 0,
              threeCatchBonus : 0,
              stumping : 0,
              runOut : 0
            }

            playerStats.push(playerObject);

          }

        })



        for (let player of playerStats) {
            
          if (player.hasOwnProperty(batter)) {
              if(ball.batsman_run == 4 && ball.non_boundary == 0){
                player[batter].boundaries = player[batter].boundaries + 1;
              }else if(ball.batsman_run == 6){
                player[batter].six = player[batter].six + 1;
              }
              player[batter].runs = player[batter].runs + ball.batsman_run;
          }

          if (player.hasOwnProperty(bowler)) {

            if(ball.isWicketDelivery){

                let playerOut = playerStats.find(obj => ball.player_out in obj);
                
              if(playerOut[ball.player_out].runs == 0){
                playerOut[ball.player_out].duckDismissal = 1;
              }
              if(!(ball.kind == "run out")){
                player[bowler].wicket = player[bowler].wicket + 1;
                if(ball.kind == "lbw" || ball.kind == "bowled"  || ball.kind == "caught and bowled"){
                  player[bowler].lbwBowledBonus = player[bowler].lbwBowledBonus + 1;
                }
              }
              
            }
            if(ball.ballnumber == 6 && maiden){
              player[bowler].maidenOver = player[bowler].maidenOver + 1;
              maiden ? maiden = undefined : ""
            }
            
          }

          if (player.hasOwnProperty(fielderInvolved)) {
            if(ball.fielders_involved){
              if(ball.kind == "caught"){
                player[fielderInvolved].catch = player[fielderInvolved].catch + 1;
              }else if(ball.kind == "stumping"){
                player[fielderInvolved].stumping = player[fielderInvolved].stumping + 1;
              }else if(ball.kind == "run out"){
                player[fielderInvolved].runOut = player[fielderInvolved].runOut + 1;
              }
          }
      }

        

    }

      })



      playerStats.forEach((player) => {
        let playerName = Object.keys(player)[0];
        
        let currentPlayer = playerStats.find(obj => playerName in obj);

        currentPlayer = currentPlayer[playerName];
              
        if(currentPlayer.runs >= 100){
          currentPlayer.thirtyRunBonus = 1;
          currentPlayer.halfcenturyBonus = 1;
          currentPlayer.centuryBonus = 1;
        }else if(currentPlayer.runs >= 50){
          currentPlayer.thirtyRunBonus = 1;
          currentPlayer.halfcenturyBonus = 1;
        }else if(currentPlayer.runs >= 30){
          currentPlayer.thirtyRunBonus = 1;
        }
        

        if(currentPlayer.wicket >= 5){
          currentPlayer.fivewicketBonus = 1;
          currentPlayer.fourwicketBonus = 1;
          currentPlayer.threewicketBonus = 1;
        }else if(currentPlayer.wicket >= 4){
          currentPlayer.fourwicketBonus = 1;
          currentPlayer.threewicketBonus = 1;
        }else if(currentPlayer.wicket >= 3){
          currentPlayer.threewicketBonus = 1;
        }

        if(currentPlayer.catch >= 3){
          currentPlayer.threeCatchBonus = 1
        }


        let points = currentPlayer.runs + currentPlayer.boundaries + (currentPlayer.six * 2) + (currentPlayer.thirtyRunBonus ? 4 : 0) + (currentPlayer.halfcenturyBonus ? 8 : 0) + (currentPlayer.centuryBonus ? 16 : 0) + (currentPlayer.duckDismissal ? -2 : 0) + (currentPlayer.wicket * 25) + (currentPlayer.lbwBowledBonus * 8) + (currentPlayer.threewicketBonus ? 4 : 0) + (currentPlayer.fourwicketBonus ? 8 : 0) + (currentPlayer.fivewicketBonus ? 16 : 0) + (currentPlayer.maidenOver * 12) + (currentPlayer.catch * 8) + (currentPlayer.stumping * 12) + (currentPlayer.runOut * 6) + (currentPlayer.threeCatchBonus ? 4 : 0);

        playerPoints[playerName] = points;
        
        
      })

      let dream11players = teamEntry.players.map(player => player.Player);
      let captain = teamEntry.captain;
      let viceCaptain = teamEntry.viceCaptain;
      
      playerPoints[captain] = playerPoints[captain] == undefined ? 0 : playerPoints[captain] * 2;
      playerPoints[viceCaptain] = playerPoints[viceCaptain] == undefined ? 0 : playerPoints[viceCaptain] * 1.5;


      const filteredPoints = dream11players.reduce((obj, key) => {
          obj[key] = playerPoints[key] || 0;
          return obj;
      }, {});

      const sortedArray = Object.entries(filteredPoints)
      .sort((a, b) => b[1] - a[1]);

      const sortedPlayerPoints = Object.fromEntries(sortedArray);

      const teamId = teamEntry.teamId;

      const team = await Team.findOne({ teamId: teamId });

      if (team) {
        
        team.players.forEach(player => {
          player.Points = sortedPlayerPoints[player.Player] || 0;
        });

        const totalPoints = Object.values(sortedPlayerPoints).reduce((acc, curr) => acc + curr, 0);
        team.points = totalPoints;
        try {
          const updatedTeam = await team.save();
        } catch (error) {
          return res.status(500).json({ success: false, message: error.message });
        }
      }

    })

    res.status(200).json({ success: true, teamEntries });
  
});


module.exports = router;