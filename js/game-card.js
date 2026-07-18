import "./lib/hover-tilt.js";

class Card extends HTMLElement {
	static observedAttributes = ["rank", "suite"];

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this._face = null;
		this._vivus = null;
		this._abortController = null;
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
      ::slotted(svg) {
        display: block;
        border-radius: 10px;
        width: 250px;
        height: auto;
        background: white;
      }
    `;

		hoverTilt.appendChild(slot);
		this.shadowRoot.appendChild(style);
		this.shadowRoot.appendChild(hoverTilt);

		this._updateFace();
	}

	attributeChangedCallback(_name, oldVal, newVal) {
		if (newVal === oldVal) return;
		this._updateFace();
	}

	async _updateFace() {
		const rank = this.getAttribute("rank");
		const suite = this.getAttribute("suite");
		if (!rank || !suite) return;

		if (this._abortController) {
			this._abortController.abort();
		}
		if (this._vivus) {
			this._vivus.stop();
			this._vivus = null;
		}
		if (this._face) {
			this._face.remove();
			this._face = null;
		}

		this._abortController = new AbortController();
		const { signal } = this._abortController;

		try {
			const res = await fetch(`cards/basic_deck/${rank}_of_${suite}.svg`, {
				signal,
			});
			const text = await res.text();
			if (signal.aborted) return;

			const doc = new DOMParser().parseFromString(text, "image/svg+xml");
			const svg = doc.querySelector("svg");
			if (!svg) return;

			const imported = document.importNode(svg, true);
			if (!this._face) {
				this._face = imported;
				this.appendChild(this._face);
			}

			this._vivus = new Vivus(this._face, {
				type: "delayed",
				duration: 100,
				start: "autostart",
				animTimingFunction: Vivus.EASE,
				forceRender: false,
			});

			const paths = this._face.querySelectorAll("path");
			for (const path of paths) {
				path.style.stroke = "#000";
				path.style.strokeWidth = "0.5";
				path.style.strokeOpacity = "1";
				path.style.fillOpacity = "0";
			}
			const texts = this._face.querySelectorAll("text");
			for (const t of texts) {
				t.style.opacity = "1";
			}
		} catch (e) {
			if (e.name !== "AbortError") {
				console.error("Card fetch error:", e);
			}
		}
	}
}

customElements.define("game-card", Card);
