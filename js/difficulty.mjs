export const difficulties = [
  {val: 0.1, name: "MIN"},
  {val: 0.2, name: "MEDIUM"},
  {val: 0.3, name: "MAX"},
];

const keyDifficulty = 'difficulty'

const selectDifficulty = document.querySelector("#difficultyId");

let difficulty = difficulties[0];

const listeners = [];

export const getDifficulty = () => difficulty;

const notifyListeners = () => {
  for (const listener of listeners) {
    listener(difficulty);
  }
};

const storeDifficulty = (d) => {
  difficulty = d;
  localStorage.setItem(keyDifficulty, `${d.name}`);
  notifyListeners();
};

const loadDifficulty = () => {
  const name = localStorage.getItem(keyDifficulty);
  let d = difficulties.find((d) => d.name === name);
  if (!d)
    d = difficulties[0];
  return d;
};

export const registerDifficultyListener = (listener) => {
  listeners.push(listener);
  notifyListeners();
};

(() => {
  difficulty = loadDifficulty();
  notifyListeners();
  let selectOptions = '';
  for (const d of difficulties) {
    const selected = d.name === difficulty.name;
    selectOptions += `<option value="${d.name}" ${selected ? 'selected' : ''}>${d.name}</option>`;
  }
  selectDifficulty.innerHTML = selectOptions;

  selectDifficulty.addEventListener('change', (evt) => {
    const dName = evt.target.value;
    const d = difficulties.find((d) => d.name === dName);
    if (d)
      storeDifficulty(d);
  });
})();