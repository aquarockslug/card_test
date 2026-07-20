import Data from "./data.js";
import { initWorld } from "./display.js";
import Sparticles from "./lib/sparticles.js";
import "./game-card.js";

window.Data = Data;

let last_time = null;
let total_time = 0;
setInterval(function gameLoop() {
	const current_time = Date.now();
	if (last_time === null) last_time = current_time;
	const delta_time = current_time - last_time;
	total_time += delta_time;
	last_time = current_time;
	tick(delta_time, total_time);
}, 1000 / 25); // the game runs at 25 ticks per second

function tick(delta_time, total_time) {}

const hand = document.getElementById("hand");
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getActiveCard = () => document.querySelector("game-card[active]");

function initParticles() {
	new Sparticles(document.getRootNode().body, Data.sparticle.abyss);
}

function initCards(amount = 7) {
	hand.innerHTML = "";
	for (let i = 0; i < amount; i++) {
		const card = document.createElement("game-card");
		card.setAttribute("rank", pick(Data.card.rank));
		card.setAttribute("suite", pick(Data.card.suite));
		setTimeout(() => hand.appendChild(card), 50 * i);
	}
}

function initDeselect() {
	document.addEventListener("click", () => {
		const active = getActiveCard();
		if (active) active._deselect();
	});
}

window.initCards = initCards;
window.onload = () =>
	[initParticles, initWorld, initCards, initDeselect].map((fn) => fn());
