// file for visually displaying reasources on the screen

import Data from "./data.js";

// The numeric values of the resources modify features of the isometric display
// ISOMER isometric view engine
var iso = new Isomer(document.getElementById("board"));
var Shape = Isomer.Shape;
var Point = Isomer.Point;
var Color = Isomer.Color;
var Path = Isomer.Path;

export function initWorld() {
	iso.add(
		Shape.Prism(Point(Point.ORIGIN.x, Point.ORIGIN.y, 0), 5, 5, -10),
		new Color(193, 180, 137),
	);
	iso.add(
		Shape.Prism(Point(Point.ORIGIN.x, Point.ORIGIN.y, 0), 5, 5, 10),
		new Color(50, 60, 160, 0.5),
	);
}
