import './game-card.js';
import Sparticles from './lib/sparticles.esm.js';

let fireCrackerParticles = {
  "count": 125,
  "speed": 25,
  "parallax": 42,
  "direction": 0,
  "xVariance": 8,
  "rotation": 3,
  "alphaSpeed": 4,
  "alphaVariance": 9,
  "minSize": 4,
  "maxSize": 16,
  "style": "both",
  "drift": 0,
  "glow": 20,
  "twinkle": true,
  "spawnFromPoint": true,
  "spawnArea": 10,
  "staggerSpawn": 12,
  "color": [
    "#ffffff",
    "#ffb366",
    "#f3ca7c",
    "#875005"
  ],
  "shape": ["star","circle"]
}

function initParticles() {
  new Sparticles(document.getRootNode().body, fireCrackerParticles, 400);
}

window.onload = initParticles;
