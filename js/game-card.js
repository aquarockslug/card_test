import "./lib/hover-tilt.js";

class Card extends HTMLElement {
	static observedAttributes = ["rank", "suite"];

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this._face = null;
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if (newVal === oldVal) return;
		this._updateFace();
	}

	connectedCallback() {
		const slot = document.createElement("slot");
		const hoverTilt = document.createElement("hover-tilt");

		hoverTilt.setAttribute("shadow", "");
		hoverTilt.setAttribute("glare-intensity", "0.5");
		hoverTilt.setAttribute("glare-hue", "200");
		hoverTilt.setAttribute("scale-factor", "1.1");
		hoverTilt.setAttribute("tilt-factor", "1");
		hoverTilt.setAttribute("tilt-factor-y", "1");

		const style = document.createElement("style");
		style.textContent = `
      :host {
        display: inline-block;
      }
      hover-tilt {
        display: flex;
      }
      ::slotted(img) {
        display: block;
        border-radius: 10px;
        max-width: 250px;
        height: auto;
      }
    `;

		hoverTilt.appendChild(slot);
		this.shadowRoot.appendChild(style);
		this.shadowRoot.appendChild(hoverTilt);

		this._updateFace();
	}

	_updateFace() {
		const rank = this.getAttribute("rank");
		const suite = this.getAttribute("suite");
		if (!rank || !suite) return;

		if (!this._face) {
			this._face = document.createElement("img");
			this.appendChild(this._face);
		}

		this._face.src = `cards/basic_deck/${rank}_of_${suite}.svg`;
		this._face.alt = `${rank} of ${suite}`;
	}
}

customElements.define("game-card", Card);
