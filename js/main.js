import Data from "./data.js";
import Sparticles from "./lib/sparticles.esm.js";
import "./game-card.js";

window.Data = Data;

function pipe(...fns) {
	return (initialVal) => fns.reduce((val, fn) => fn(val), initialVal);
}

function createCard(rank, suite) {
	const card = document.createElement("game-card");
	card.setAttribute("rank", rank);
	card.setAttribute("suite", suite);
	document.body.appendChild(card);
}

function initParticles() {
	new Sparticles(document.getRootNode().body, Data.sparticle.abyss, 400);
}

function initCards() {
	var randRank = () =>
		Data.card.rank[Math.floor(Math.random() * Data.card.rank.length)];
	var randSuite = () =>
		Data.card.suite[Math.floor(Math.random() * Data.card.suite.length)];

	createCard(randRank(), randSuite());
	createCard(randRank(), randSuite());
	createCard(randRank(), randSuite());
	createCard(randRank(), randSuite());
	createCard(randRank(), randSuite());
}

window.initCards = initCards;
window.onload = pipe(initParticles, initCards);
