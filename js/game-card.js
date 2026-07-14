import './lib/hover-tilt.js';

class Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const slot = document.createElement('slot');
    const hoverTilt = document.createElement('hover-tilt');

    hoverTilt.setAttribute('shadow', '');
    hoverTilt.setAttribute('glare-intensity', '0.5');
    hoverTilt.setAttribute('glare-hue', '200');
    hoverTilt.setAttribute('scale-factor', '1.2');
    hoverTilt.setAttribute('tilt-factor', '1');
    hoverTilt.setAttribute('tilt-factor-y', '1');

    const style = document.createElement('style');
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
  }
}

customElements.define('game-card', Card);
