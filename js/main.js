import Data from "./data.js";
import { initWorld } from "./display.js";
import Sparticles from "./lib/sparticles.js";
import "./game-card.js";

window.Data = Data;
const hand = document.getElementById("hand");

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

// TODO make a numeric display web componant
const energyNumericDisplay = document.getElementById("energy");
const manaNumericDisplay = document.getElementById("mana");
let mana, energy, control;
mana = energy = control = 0;
window.mana = mana;

let manaGen = 0.001; // the most basic resource, mana, naturally generates by this much every millisecond

// TODO make transmute power scale with the "control" resource
let transmutePower = 0.0001; // the base rate that reasources can be transmuted

function tick(deltaTime, totalTime) {
	mana += manaGen * deltaTime;

	// mana is turned into energy based on the amount of red cards in hand
	let heartCount = document.querySelectorAll(
		"#hand>game-card[suite=hearts]",
	).length;
	let transmuteAmount = transmutePower * heartCount * deltaTime;
	if (mana - transmuteAmount > 0) {
		mana -= transmuteAmount;
		energy += transmuteAmount;
	}

	energyNumericDisplay.textContent = energy.toFixed(2);
	manaNumericDisplay.textContent = mana.toFixed(2);
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getActiveCard = () => document.querySelector("game-card[active]");

function initParticles() {
	new Sparticles(document.getRootNode().body, Data.sparticle.abyss);
}

function addCard(rank, suite, location) {
	const card = document.createElement("game-card");
	card.setAttribute("rank", rank);
	card.setAttribute("suite", suite);
	location.appendChild(card);
}
window.addCard = (rank, suite) => addCard(rank, suite, hand);

function addRandomCard() {
	const rank = pick(Data.card.rank);
	const suite = pick(Data.card.suite);
	addCard(rank, suite, hand);
}
window.addRandomCard = addRandomCard;

function addRandomHand(count = 5) {
	for (let i = 0; i < count; i++) addRandomCard();
}
window.addRandomHand = addRandomHand;

function clearHand() {
	hand.innerHTML = "";
}
window.clearHand = clearHand;

function initCards(amount = 7) {
	hand.innerHTML = "";
	addCard("ace", "hearts", hand);
}

function initDeselect() {
	document.addEventListener("click", () => {
		const active = getActiveCard();
		if (active) active._deselect();
	});
}

window.initCards = initCards;
function initMinimizeButtons() {
	document.querySelectorAll(".title-bar .minimize").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const window = btn.closest(".window");
			window.classList.toggle("minimized");
		});
	});
}

window.onload = () =>
	[initParticles, initWorld, initCards, initDeselect, initMinimizeButtons].map(
		(fn) => fn(),
	);
