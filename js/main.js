import Data from "./data.js";
import Sparticles from "./lib/sparticles.js";
import "./game-card.js";

window.Data = Data;

const hand = document.getElementById("hand");
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getActiveCard = () => document.querySelector("game-card[active]");
const cycleValue = (arr, cur, delta) =>
	arr[(arr.indexOf(cur) + delta + arr.length) % arr.length];

// ISOMER isometric view engine
var iso = new Isomer(document.getElementById("board"));
var Shape = Isomer.Shape;
var Point = Isomer.Point;
var Color = Isomer.Color;
var Path = Isomer.Path;

iso.add(
	Shape.Prism(Point(Point.ORIGIN.x, Point.ORIGIN.y, 0), 5, 5, -10),
	new Color(193, 180, 137),
);
iso.add(
	Shape.Prism(Point(Point.ORIGIN.x, Point.ORIGIN.y, 0), 5, 5, 10),
	new Color(50, 60, 160, 0.5),
);

function initParticles() {
	new Sparticles(document.getRootNode().body, Data.sparticle.abyss);
}

function initCards() {
	hand.innerHTML = "";
	for (let i = 0; i < 5; i++) {
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

function updateControls() {
	const card = getActiveCard();
	const controls = document.getElementById("card-controls");
	if (!card) return controls.classList.add("hidden");
	controls.classList.remove("hidden");
	document.getElementById("rank-label").textContent = card.getAttribute("rank");
	document.getElementById("suite-label").textContent =
		card.getAttribute("suite");
}

function cycleHandler(attr, arr, delta) {
	return (e) => {
		e.stopPropagation();
		const card = getActiveCard();
		if (!card) return;
		card.setAttribute(attr, cycleValue(arr, card.getAttribute(attr), delta));
		updateControls();
	};
}

function initControls() {
	document
		.getElementById("rank-prev")
		.addEventListener("click", cycleHandler("rank", Data.card.rank, -1));
	document
		.getElementById("rank-next")
		.addEventListener("click", cycleHandler("rank", Data.card.rank, 1));
	document
		.getElementById("suite-prev")
		.addEventListener("click", cycleHandler("suite", Data.card.suite, -1));
	document
		.getElementById("suite-next")
		.addEventListener("click", cycleHandler("suite", Data.card.suite, 1));
	document.addEventListener("card-select", updateControls);
	document.addEventListener("card-deselect", updateControls);
}

window.initCards = initCards;
window.onload = () =>
	[initParticles, initCards, initDeselect, initControls].map((fn) => fn());
