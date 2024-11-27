import {toMinutesSecondsString} from "./util/utils.mjs";

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
    score = {mines, user, time};
    highScore.push(score);
    storeHighscore(highScore);
    return true;
  } else if (time < score.time) {
    score.user = user;
    score.time = time;
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
  html += '<tr><th>Mines</th><th>User</th><th>Time</th></tr>';
  const score = loadHighscore();
  if (Array.isArray(score) && score.length > 0) {
    score.sort(compareMines);
    for (const scoreEl of score) {
      html += `<tr data-mines="${scoreEl.mines}"><td>${scoreEl.mines}</td><td>${scoreEl.user}</td><td>${toMinutesSecondsString(scoreEl.time / 1000)}</td></tr>`;
    }
  } else
    html += `<tr><td colspan="3">No scores yet...</td></tr>`;
  html += '</table>';
  return html;
};

export const showHighScore = (highlightBombs) => {
  highScoreContainer.classList.add('show');
  highScoreContainer.innerHTML = highScoreAsTable();

  if (highlightBombs > 0) {
    setTimeout(() => {
      const row = document.querySelector(`tr[data-mines="${highlightBombs}"]`);
      if (row) {
        row.scrollIntoView(true);
        row.style.background = 'rgb(2, 0, 36)';
      }
    }, 300);
  }
};

export const hideHighScore = () => {
  highScoreContainer.classList.remove('show');
}