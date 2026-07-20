import Data from "./data.js";

var iso = new Isomer(document.getElementById("world"));
var Shape = Isomer.Shape;
var Point = Isomer.Point;
var Color = Isomer.Color;

export function initWorld() {
	iso.add(
		Shape.Prism(Point(Point.ORIGIN.x, Point.ORIGIN.y, -2), 5, 5, -5),
		new Color(193, 180, 137),
	);
	iso.add(
		Shape.Prism(Point(Point.ORIGIN.x, Point.ORIGIN.y, -2), 5, 5, 10),
		new Color(50, 60, 160, 0.5),
	);
}
