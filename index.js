const clickNum = document.getElementById("clickNum");
const matches = document.getElementById("matches");
const unmatches = document.getElementById("unmatches");
const timer = document.getElementById("timer");
const container = document.getElementById("game_grid");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const powerBtn = document.getElementById("power");
const difficultyForm = document.getElementById("difficulty_form");
const darkmodeBtn = document.getElementById("darkmodeBtn");
const lightmodeBtn = document.getElementById("lightmodeBtn");
const total = document.getElementById("total");
let firstCard = null;
let secondCard = null;

let interval;
let difficulty = "easy";

const pokemonNum = {
  easy: 6,
  normal: 12,
  hard: 24
}

const timerValues = {
  easy: 240,
  normal: 120,
  hard: 60
}

timer.textContent = 0;
clickNum.textContent = 0;
matches.textContent = 0;
unmatches.textContent = 0;
total.textContent = 0;

async function getPokemons(cardNum) {
  const data = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${cardNum}`);
  const parsedData = await data.json();
  const pokemons = parsedData.results;

  const detailedPokemons = await Promise.all(pokemons.map(async (pokemon) => {
    const data2 = await fetch(pokemon.url);
    const parsedData2 = await data2.json();
    return {
      name: parsedData2.name,
      url: parsedData2.sprites.front_default
    }
  }));

  return detailedPokemons;
}

async function renderCards(cardNum) {
  const pokemons = await getPokemons(cardNum);
  updateMatchNum(0, pokemons.length);

  const double = [...pokemons, ...pokemons];

  double.sort(() => { return Math.random() - 0.5 }).forEach((pokemon, idx) => {
    const card = `<div class="card border-1 shadow-sm/50 bg-gray-100 rounded-md w-[200px] h-[200px] relative transition-transform duration-1000 transform-3d">
      <img id="img${idx}" class="front_face" src="${pokemon.url}" alt="${pokemon.name}">
      <img class="back_face" src="back.webp" alt="back-img">
    </div>`

    container.insertAdjacentHTML("beforeend", card);
  }
  )
}

function updateClickNum(num) {
  clickNum.textContent = num;
}

function updateMatchNum(matchNum, unmatchNum) {
  matches.textContent = matchNum;
  unmatches.textContent = unmatchNum;
}

function handleFlipLogic() {
  let lock = false;

  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      if (lock) {
        return;
      }

      if (card.classList.contains("flip")) {
        return;
      }

      const curClickNum = clickNum.textContent;
      updateClickNum((curClickNum - 0) + 1);

      card.classList.toggle("flip");

      if (!firstCard) {
        firstCard = card.querySelector(".front_face");
      } else {
        lock = true;
        secondCard = card.querySelector(".front_face");
        if (firstCard.getAttribute("alt") == secondCard.getAttribute("alt")) {
          console.log("match");
          firstCard.parentElement.title = "match";
          secondCard.parentElement.title = "match";
          const newMatchNum = matches.textContent - 0 + 1;
          const newUnmatchNum = unmatches.textContent - 0 - 1;

          updateMatchNum(newMatchNum, newUnmatchNum);

          firstCard = null;
          secondCard = null;
          lock = false;

          if (newUnmatchNum == 0) {
            setTimeout(() => {
              alert("You win");;
            }, 1001)
          }
        } else {
          console.log("no match");
          setTimeout(() => {
            firstCard.parentElement.classList.toggle("flip");
            secondCard.parentElement.classList.toggle("flip");
            firstCard = null;
            secondCard = null;
            lock = false;
          }, 1000)
        };
      }
    })
  })
}

async function setup(pokemonNum, timerVal) {
  await renderCards(pokemonNum);

  total.textContent = pokemonNum;
  timer.textContent = timerVal;
  handleFlipLogic();
  interval = setInterval(() => {
    timer.textContent -= 1;
    if (timer.textContent == "0") {
      alert("Time out");
      container.style.pointerEvents = "none";
      clearInterval(interval);
    }
  }, 1000)
}

function resetUI() {
  container.innerHTML = "";
  startBtn.disabled = false;
  resetBtn.disabled = true;
  clearInterval(interval);
  timer.textContent = 0;
  total.textContent = 0;
  unmatches.textContent = 0;
  matches.textContent = 0;
}

difficultyForm.addEventListener("change", (e) => {
  const difficultLevel = e.target.value;
  difficulty = difficultLevel;

  document.querySelectorAll("label").forEach(label => {
    if (label.htmlFor == difficultLevel) {
      label.classList.add("check");
    } else {
      label.classList.remove("check");
    }
  })

  document.getElementById(difficultLevel).classList.add("check");
})

startBtn.addEventListener("click", () => {
  setup(pokemonNum[difficulty], timerValues[difficulty]);

  startBtn.disabled = true;
  resetBtn.disabled = false;

  startBtn.querySelector("span").classList.remove("btn");
  startBtn.querySelector("span").classList.add("disable_btn");

  resetBtn.querySelector("span").classList.add("btn");
  resetBtn.querySelector("span").classList.remove("disable_btn");
})

resetBtn.addEventListener("click", () => {
  startBtn.querySelector("span").classList.add("btn");
  startBtn.querySelector("span").classList.remove("disable_btn");

  resetBtn.querySelector("span").classList.remove("btn");
  resetBtn.querySelector("span").classList.add("disable_btn");

  resetUI();
})

powerBtn.addEventListener("click", () => {
  document.querySelectorAll(".card").forEach(card => {
    card.classList.add("flip");

    setTimeout(()=>{
      if(card.title == "match") {
        return;
      }
      card.classList.remove("flip");
    }, 1000)
  })
})

function handleDarkBtnUI() {
  document.querySelector("html").classList.add("dark");
  darkmodeBtn.parentElement.querySelector("div").classList.add("color_theme_btn_bg");
  lightmodeBtn.parentElement.querySelector("div").classList.remove("color_theme_btn_bg");
}

function handleLightBtnUI() {
  document.querySelector("html").classList.remove("dark")
  darkmodeBtn.parentElement.querySelector("div").classList.remove("color_theme_btn_bg");
  lightmodeBtn.parentElement.querySelector("div").classList.add("color_theme_btn_bg");
}


if (localStorage.theme == "dark") {
  document.querySelector("html").classList.add("dark");
  handleDarkBtnUI()

} else {
  document.querySelector("html").classList.remove("dark");
  handleLightBtnUI()
}

darkmodeBtn.addEventListener("click", () => {
  localStorage.setItem("theme", "dark");
  handleDarkBtnUI();
})

lightmodeBtn.addEventListener("click", () => {
  localStorage.setItem("theme", "light");
  handleLightBtnUI()
})






