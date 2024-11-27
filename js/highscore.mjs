import {toMinutesSecondsString} from "./util/utils.mjs";
import {difficulties, getDifficulty} from "./difficulty.mjs";

const keyHighScore = 'highScore';

const highScoreContainer = document.querySelector('#highScoreContainerId');
document.querySelector('#highScoreId').addEventListener('click', () => {
  highScoreContainer.classList.toggle('show');
  if (highScoreContainer.classList.contains('show'))
    highScoreContainer.innerHTML = highScoreAsTable();
});

const loadHighscore = () => {
  const value = localStorage.getItem(keyHighScore);
  if (!value)
    return null;
  return JSON.parse(value);
};

const storeHighscore = (h) => {
  localStorage.setItem(keyHighScore, JSON.stringify(h));
}

export const addToHighScore = (mines, user, time) => {
  let highScore = loadHighscore();
  if (!Array.isArray(highScore)) highScore = [];

  let score = highScore.find(s => s['mines'] === mines);
  if (!score) {
    score = {mines};
    highScore.push(score);
  }

  const difficulty = getDifficulty();

  let difficultyScore = score[difficulty.name];
  if (!difficultyScore) {
    difficultyScore = {user, time};
    score[difficulty.name] = difficultyScore;

    storeHighscore(highScore);
    return true;
  } else if (time < difficultyScore.time) {
    difficultyScore.user = user;
    difficultyScore.time = time;
    storeHighscore(highScore);
    return true;
  }

  return false;
}

const compareMines = (a, b) => {
  return a.mines - b.mines;
};

export const highScoreAsTable = () => {
  let html = '<table>';
  html += `</head>`;
  html += '<tr><th></th><th colspan="2">MIN</th><th colspan="2">MEDIUM</th><th colspan="2">MAX</th></tr>';
  html += '<tr><th>Mines</th><th>User</th><th>Time</th><th>User</th><th>Time</th><th>User</th><th>Time</th></tr>';
  html += `</thead>`;
  const score = loadHighscore();
  if (Array.isArray(score) && score.length > 0) {
    score.sort(compareMines);
    for (const scoreEl of score) {
      html += `<tr data-mines="${scoreEl.mines}"><td>${scoreEl.mines}</td>`;
      for (const difficulty of difficulties) {
        const scoreElDifficulty = scoreEl[difficulty.name];
        if (scoreElDifficulty)
          html += `<td data-difficulty="${difficulty.name}">${scoreElDifficulty.user}</td><td data-difficulty="${difficulty.name}" class="time">${toMinutesSecondsString(scoreElDifficulty.time / 1000)}</td>`;
        else
          html += `<td colspan="2"></td>`;
      }
      html += `</tr>`;
    }
  } else
    html += `<tr><td colspan="7">No scores yet...</td></tr>`;
  html += '</table>';
  return html;
};

export const showHighScore = (highlightBombs) => {
  highScoreContainer.classList.add('show');
  highScoreContainer.innerHTML = highScoreAsTable();

  if (highlightBombs > 0) {
    const dName = getDifficulty().name;
    setTimeout(() => {
      const tds = document.querySelectorAll(`tr[data-mines="${highlightBombs}"] > td[data-difficulty="${dName}"]`);
      if (tds.length > 0) {
        tds.forEach(td => {
          td.style.background = 'rgb(2, 0, 36)';
        });
        tds[0].scrollIntoView(true);
      }
    }, 300);
  }
};

export const hideHighScore = () => {
  highScoreContainer.classList.remove('show');
}