import Data from "./data.js";
import { initWorld } from "./display.js";
import Sparticles from "./lib/sparticles.js";
import "./game-card.js";

window.Data = Data;
const hand = document.getElementById("hand");
const energyEl = document.getElementById("energy");
const manaEl = document.getElementById("mana");

let lastTime = null,
	totalTime = 0,
	mana = 0,
	energy = 0,
	control = 0;
const manaGen = 0.001;
const transmutePower = 0.0001;

setInterval(() => {
	const now = Date.now();
	if (lastTime === null) lastTime = now;
	const dt = now - lastTime;
	totalTime += dt;
	lastTime = now;

	mana += manaGen * dt;
	const hearts = document.querySelectorAll(
		"#hand>game-card[suite=hearts]",
	).length;
	const amount = transmutePower * hearts * dt;
	if (mana - amount > 0) {
		mana -= amount;
		energy += amount;
	}

	energyEl.textContent = energy.toFixed(2);
	manaEl.textContent = mana.toFixed(2);
}, 1000 / 25);

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getActiveCard = () => document.querySelector("game-card[active]");

function addCard(rank, suite, location) {
	const card = document.createElement("game-card");
	card.setAttribute("rank", rank || pick(Data.card.rank));
	card.setAttribute("suite", suite || pick(Data.card.suite));
	location.appendChild(card);
}
window.addCard = (rank, suite) => addCard(rank, suite, hand);
window.addRandomCard = () => addCard(null, null, hand);
window.modifySelectedCard = (attrs) => {
	const card = getActiveCard();
	if (card) for (const [k, v] of Object.entries(attrs)) card.setAttribute(k, v);
};
function shiftRank(delta) {
	const card = getActiveCard();
	if (!card) return;
	const ranks = Data.card.rank;
	const i = ranks.indexOf(card.getAttribute("rank"));
	card.setAttribute("rank", ranks[(i + delta + ranks.length) % ranks.length]);
}
window.shiftRank = shiftRank;

window.onload = () => {
	new Sparticles(document.getRootNode().body, Data.sparticle.abyss);
	initWorld();
	window.initCards();
	document.addEventListener("click", (e) => {
		if (!e.target.closest("#left-panel")) getActiveCard()?._deselect();
	});
	document.querySelectorAll(".title-bar .minimize").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			btn.closest(".window").classList.toggle("minimized");
		});
	});
};
