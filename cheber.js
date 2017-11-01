// Feast your eyes on this performant and CLEAN javascript! Who needs jquery?

const roleMap = {
  1: 'Carry',
  2: 'Mid',
  3: 'Offlaner',
  4: 'Greedy Support',
  5: 'Hard Support',
}

const chrisAccountId = 608275

function formatTime (seconds) {
  let sign = ''
  if (seconds < 0) {
    sign = '-'
    seconds = seconds * -1
  }
  let minutes = Math.floor(seconds / 60)
  if (minutes > -9 && minutes < 9) {
    minutes = '0' + minutes
  }

  let secondsNew = (seconds - Math.floor(seconds / 60) * 60)
  if (secondsNew < 10) {
    secondsNew = '0' + secondsNew
  }
  return '' + sign + minutes + ':' + secondsNew;
}

function formatName (name, chrisName) {
  if (name == chrisName) {
    name = '<span style="color:red;">Chris</span>'
  }
  return name ? name : 'unknown'
}

function isLeastKills (players) {
  return _.sortBy(players, 'kills')[0].account_id === chrisAccountId
}

function isMostDeaths (players) {
  return _.sortBy(players, 'deaths')[9].account_id === chrisAccountId
}


let recentMatchRequest = new XMLHttpRequest();
recentMatchRequest.open("GET", 'https://api.opendota.com/api/players/608275/matches?limit=5', true);

recentMatchRequest.onreadystatechange = function () {
  let mostRecentMatch, playerSlot;
  if (recentMatchRequest.readyState == 4) {
    let parsedResponse = JSON.parse(recentMatchRequest.responseText);
    mostRecentMatch = parsedResponse[0].match_id;
    playerSlot = parsedResponse[0].player_slot;

    let matchResult = new XMLHttpRequest();
    let url = 'https://api.opendota.com/api/matches/' + mostRecentMatch;

    matchResult.open("GET", url, true);
    matchResult.onreadystatechange = function () {
      if (matchResult.readyState == 4) {
        let parsedResponse = JSON.parse(matchResult.responseText);
        let chris = _.find(parsedResponse.players, function (player) {
          return player.player_slot == playerSlot
        })
        let resultText = document.getElementById('result-text');
        let resultImage = document.getElementById('result-image');
        if (chris.win) {
          resultText.innerHTML = 'No, he didn\'t :(';
          chrome.browserAction.setIcon({path: 'images/chris_icon_win.png'});
        } else {
          resultText.innerHTML = 'Yes, he did :)';
          chrome.browserAction.setIcon({path: 'images/chris_icon_loss.png'});
        }

        let chatBox = document.getElementById('chat-box');
        _.each(parsedResponse.chat, function (chat) {
          if (chat.type == "chat") {
            chatBox.innerHTML += '<p>' + formatTime(chat.time) + ' ' + formatName(chat.unit, chris.personaname) + ': ' + chat.key + '</p>';
          }
        })

        let kdr = document.getElementById('kdr-text');
        kdr.innerHTML = 'KDR: <span style="color:green;">' + chris.kills + '</span>-<span style="color:red;">' + chris.deaths + '</span>-<span style="color:black;">'
                         + chris.assists + '</span>';

        let heroName = document.getElementById('hero-text');
        heroName.innerHTML = 'Hero: ' + _.find(heroList, function (hero) {
          return hero.id == chris.hero_id
        }).localized_name;

        let fed = document.getElementById('fed-text');
        fed.innerHTML = 'Fed? ' + (chris.deaths > chris.kills ? 'Yes XD' : 'No');

        let result = document.getElementById('win-text');
        result.innerHTML = 'Result: ' + (chris.win ? 'Winner' : 'Loser');

        let role = document.getElementById('role-text');
        role.innerHTML = 'Role: ' + roleMap[parseInt(chris.lane_role)];

        let kill = document.getElementById('kill-text');
        kill.innerHTML = 'Least Kills? ' + (isLeastKills(parsedResponse.players) ? 'Yes' : 'No');

        let death = document.getElementById('death-text');
        death.innerHTML = 'Most Deaths? ' + (isMostDeaths(parsedResponse.players) ? 'Yes' : 'No');
      }
    }
    matchResult.send();
  }
}
recentMatchRequest.send();