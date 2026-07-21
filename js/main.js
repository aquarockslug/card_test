import Data from "./data.js";
import { initWorld } from "./world.js";
import Sparticles from "./lib/sparticles.js";
import "./game-card.js";

window.Data = Data;
const hand = document.getElementById("hand");
const energyEl = document.getElementById("energy");
const manaEl = document.getElementById("mana");
const controlEl = document.getElementById("control");

let lastTime = null,
	totalTime = 0,
	mana = 0,
	energy = 0,
	control = 0;
const manaGen = 0.001;
const transmutePower = 0.0005;

setInterval(() => {
	const now = Date.now();
	if (lastTime === null) lastTime = now;
	const dt = now - lastTime;
	totalTime += dt;
	lastTime = now;
	gameTick(dt, totalTime);
}, 1000 / 25);

function getHandInfo() {
	return {
		hearts: document.querySelectorAll("#hand>game-card[suite=hearts]"),
		diamonds: document.querySelectorAll("#hand>game-card[suite=diamonds]"),
		spades: document.querySelectorAll("#hand>game-card[suite=spades]"),
		clubs: document.querySelectorAll("#hand>game-card[suite=clubs]"),
	};
}

function gameTick(dt, t) {
	mana += manaGen * dt;
	const hand = getHandInfo();

	function transmute(r1, r2, delta) {
		delta *= transmutePower;
		delta *= dt;
		if (r1 - delta > 0) {
			r1 -= delta;
			r2 += delta;
		}
		return [r1, r2];
	}

	// red cards transmute energy from mana
	[mana, energy] = transmute(
		mana,
		energy,
		hand.hearts.length + hand.diamonds.length,
	);

	// black cards transmute control from mana
	[mana, control] = transmute(
		mana,
		control,
		hand.clubs.length + hand.spades.length,
	);

	energyEl.textContent = energy < 0.05 ? "0.00" : energy.toFixed(2);
	controlEl.textContent = control < 0.05 ? "0.00" : control.toFixed(2);
	manaEl.textContent = mana < 0.05 ? "0.00" : mana.toFixed(2);
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getActiveCard = () => document.querySelector("game-card[active]");

function addCard(rank, suite, location) {
	getActiveCard()?._deselect();
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
