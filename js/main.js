import Data from "./data.js";
import Sparticles from "./lib/sparticles.esm.js";
import "./game-card.js";

window.Data = Data;

function pipe(...fns) {
	return (initialVal) => fns.reduce((val, fn) => fn(val), initialVal);
}

function createCards(rank, suite) {
	const card = document.createElement("game-card");
	const face = document.createElement("img");
	face.src = `cards/basic_deck/${rank}_of_${suite}.svg`;
	face.alt = `${rank} of ${suite}`;
	card.setAttribute("rank", rank);
	card.setAttribute("suite", suite);
	card.appendChild(face);

	document.body.insertBefore(card, document.getElementById("hand"));
}
window.createCard = createCards;

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
}

window.onload = pipe(initParticles, initCards);
