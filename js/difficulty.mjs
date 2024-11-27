export const difficulties = {
  MIN: 0.1,
  MEDIUM: 0.2,
  MAX: 0.3
};

const keyDifficulty = 'difficulty'

const selectDifficulty = document.querySelector("#difficultyId");

let difficulty = difficulties.MIN;

const listeners = [];

const notifyListeners = () => {
  for (const listener of listeners) {
    listener(difficulty);
  }
};

const storeDifficulty = (value) => {
  difficulty = value;
  localStorage.setItem(keyDifficulty, `${value}`);
  notifyListeners();
};

const loadDifficulty = () => {
  let val = localStorage.getItem(keyDifficulty);
  if (val && val.length > 0)
    val = parseFloat(val);
  if (val < difficulties.MIN || val > difficulties.MAX)
    val = difficulties.MIN;
  return val;
};

export const registerDifficultyListener = (listener) => {
  listeners.push(listener);
  notifyListeners();
};

// <option value="MIN">Min</option>
// <option value="MEDIUM">Medium</option>
// <option value="MAX">Max</option>

(() => {
  difficulty = loadDifficulty();
  notifyListeners();
  let selectOptions = '';
  for (const key of Object.keys(difficulties)) {
    const value = difficulties[key];
    const selected = value === difficulty;
    selectOptions += `<option value="${key}" ${selected ? 'selected' : ''}>${key}</option>`;
  }
  selectDifficulty.innerHTML = selectOptions;

  selectDifficulty.addEventListener('change', (evt) => {
    const selected = evt.target.value;
    for (const key of Object.keys(difficulties)) {
      if (key === selected)
        storeDifficulty(difficulties[key]);
    }
  });
})();