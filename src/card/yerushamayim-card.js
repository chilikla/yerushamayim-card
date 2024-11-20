import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@3.3.3	/lit-element.js?module";

function loadCSS(url) {
  const link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

loadCSS("https://fonts.googleapis.com/css2?family=Rubik&display=swap");

const SENSOR_BASE = "sensor.yerushamayim_";
const ENTITIES = {
  TEMPERATURE: SENSOR_BASE + "temperature",
  HUMIDITY: SENSOR_BASE + "humidity",
  STATUS: SENSOR_BASE + "status",
  FORECAST: SENSOR_BASE + "forecast"
};

class YerushamayimCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      temperatureState: { type: Object, state: true },
      statusState: { type: Object, state: true },
      forecastState: { type: Object, state: true },
      temperatureStateStr: { type: String, state: true },
      logoUrl: { type: String, state: true },
      lastDayState: { type: Object, state: true }
    };
  }

  constructor() {
    super();
    this.lastDayState = {};
  }

  // This will be called whenever hass updates
  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this.updateStates();
    }
  }

  // Update all states when hass changes
  updateStates() {
    if (!this.hass) return;

    this.temperatureState = this.hass.states[ENTITIES.TEMPERATURE];
    this.statusState = this.hass.states[ENTITIES.STATUS];
    this.forecastState = this.hass.states[ENTITIES.FORECAST];
    this.temperatureStateStr = this.temperatureState ? this.temperatureState.state : 'unavailable';
    this.logoUrl = this.hass.states['sun.sun'].state === 'below_horizon'
      ? 'https://www.02ws.co.il/img/logo_night.png'
      : 'https://www.02ws.co.il/img/logo.png';
  }

  async firstUpdated() {
    if (this.hass) {
      await this.fetchLastDayState();
    }
  }

  async fetchLastDayState() {
    try {
      const now = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await this.hass.callWS({
        "id": 1,
        "type": "history/history_during_period",
        "start_time": yesterday.toISOString(),
        "end_time": now.toISOString(),
        "entity_ids": [ENTITIES.TEMPERATURE, ENTITIES.STATUS]
      });

      if (response && response[ENTITIES.TEMPERATURE]?.[0]?.a) {
        this.lastDayState = {
          temperature: response[ENTITIES.TEMPERATURE][0].a.temperature,
          apparent_temperature: response[ENTITIES.TEMPERATURE][0].a.apparent_temperature,
          day_icon: response[ENTITIES.STATUS][0].a.day_icon,
          status: response[ENTITIES.STATUS][0].a.status
        };
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  handleClick() {
    if (this.hass) {
      const entityFilterPattern = "sensor.yerushamayim_";
      window.history.pushState(null, "", `/config/entities?filter=${entityFilterPattern}`);
      const event = new Event('location-changed', {
        bubbles: true,
        composed: true
      });
      window.dispatchEvent(event);
    }
  }

  render() {
    if (!this.hass || !this.temperatureState) {
      return html`<ha-card><div class="container">Loading...</div></ha-card>`;
    }

    return html`
      <ha-card @click="${this.handleClick}" style="cursor: pointer;">
        <div class="container">
        ${(this.temperatureStateStr !== 'unavailable' && this.temperatureState.attributes.temperature !== null)
        ? html`
          <div class="container-top">
            <div id="left">
              <div id="status-container">
                ${this.statusState.attributes.cloth_icon
            ? html`<div>
                        <img
                          class="icon"
                          src="${this.statusState.attributes.cloth_icon}"
                          title="${this.statusState.attributes
                .cloth_info}"
                        />
                      </div>
                      <div id="icon-info" dir="rtl">
                        <bdi>${this.statusState.attributes.status}</bdi>
                      </div> `
            : html``}
              </div>
              <div>
                <div class="forecast-icon">
                  <img
                    src="https://www.02ws.co.il/img/night_icon_night.png"
                  />
                  <img
                    src="https://www.02ws.co.il/img/noon_icon_night.png"
                  />
                  <img
                    src="https://www.02ws.co.il/img/morning_icon_night.png"
                  />
                </div>
                <div class="forecast-icon">
                  <bdi
                    >${this.forecastState.attributes.night_temp} °C</bdi
                  >
                  <bdi>${this.forecastState.attributes.noon_temp} °C</bdi>
                  <bdi
                    >${this.forecastState.attributes.morning_temp} °C</bdi
                  >
                </div>
                <div class="forecast-icon">
                  <img
                    src="${this.forecastState.attributes
            .night_cloth_icon}"
                    title="${this.forecastState.attributes
            .night_cloth_info}"
                  />
                  <img
                    src="${this.forecastState.attributes.noon_cloth_icon}"
                    title="${this.forecastState.attributes
            .noon_cloth_info}"
                  />
                  <img
                    src="${this.forecastState.attributes
            .morning_cloth_icon}"
                    title="${this.forecastState.attributes
            .morning_cloth_info}"
                  />
                </div>
              </div>
            </div>
            <div id="right" dir="rtl">
              <img class="logo" src="${this.logoUrl}" />
              <div class="block" id="current-temp">
                <bdi>
                  ${this.temperatureState.attributes.temperature}
                  <span>°C </span>
                </bdi>
              </div>
              <div class="block">
                <span>מרגיש כמו: </span>
                <bdi
                  >${this.temperatureState.attributes.apparent_temperature
            ? this.temperatureState.attributes
              .apparent_temperature
            : this.temperatureState.attributes.temperature}
                  °C</bdi
                >
              </div>
              <div>
                <bdi>${this.statusState.attributes.forecast}</bdi>
              </div>
            </div>
          </div>
          ${!this.config.hide_yesterday && this.lastDayState
            ? html`<div class="container-bottom" dir="rtl">
                <div class="yesterday-container">
                  <div>אתמול:</div>
                  <div class="yesterday-row" dir="rtl">
                    <div>
                      <div class="yesterday-temperature">
                        <span dir="rtl"> C°</span>
                        <span>${this.lastDayState.temperature}</span>
                      </div>
                      <div style="margin-top: 8px;">
                        <span>מרגיש כמו:</span>
                        <bdi class="yesterday">
                          ${this.lastDayState.apparent_temperature} °C
                        </bdi>
                      </div>
                    </div>
                    <div class="yesterday-status">
                      <div>
                        <img style="height: 30px;" src="${this.lastDayState.day_icon}" />
                      </div>
                      <div>
                        ${this.lastDayState.status}
                      </div>
                    </div>
                  </div>
                </div
              </div>`
            : html`<div />`}
        `
        : html`No data to show`}
    </div>
  </ha-card>
`;
  }

  setConfig(config) {
    this.config = config;
  }

  getCardSize() {
    return 3;
  }

  static get styles() {
    return css`
      :host {
        font-family: "Rubik", "Open Sans", cursive;
      }
      .container {
        background: linear-gradient(180deg, #3b4d5b 0%, #5e6d97 100%);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(
          --ha-card-box-shadow,
          0px 2px 1px -1px rgba(0, 0, 0, 0.2),
          0px 1px 1px 0px rgba(0, 0, 0, 0.14),
          0px 1px 3px 0px rgba(0, 0, 0, 0.12)
        );
        padding: 16px;
        font-size: 16px;
      }
      .container-top {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
      }
      #left {
        display: flex;
        flex-direction: column;
        flex-basis: 45%;
      }
      #status-container {
        min-height: 105px;
      }
      img.icon {
        height: 60px;
        padding-bottom: 5px;
      }
      #icon-info {
        text-align: left;
        margin-bottom: 15px;
      }
      #forecast-icons {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
      }
      .forecast-icon {
        flex-direction: row;
        justify-content: space-between;
        display: flex;
        align-items: center;
      }
      .forecast-icon:not(:last-child) {
        margin-bottom: 5px;
      }
      img.logo {
        width: 50px;
        margin-bottom: 10px;
        filter: brightness(0) invert(1);
      }
      #right {
        flex-basis: 55%;
      }
      .block {
        margin-bottom: 10px;
      }
      #current-temp {
        font-size: 24px;
      }
      .yesterday-container {
        display: flex;
        flex-direction: column;
        margin-top: 16px;
      }
      .yesterday-row {
        margin-top: 8px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .yesterday-temperature {
        font-size: 24px;
      }
      .yesterday-status {
        height: 55px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;
      }
    `;
  }
}

customElements.define('yerushamayim-card', YerushamayimCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "yerushamayim-card",
  name: "Yerushamayim Weather Card",
  preview: true,
  description: "Unofficial Yerushamayim Home Assistant dashboard card",
  documentationURL: "https://github.com/chilikla/yerushamayim-card"
});