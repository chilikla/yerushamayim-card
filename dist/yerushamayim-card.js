import { LitElement, html, css } from 'https://unpkg.com/lit-element@2.0.1/lit-element.js?module';

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
      hass: {},
      config: {}
    };
  }

  render() {
    const temperatureState = this.hass.states[ENTITIES.TEMPERATURE];
    const statusState = this.hass.states[ENTITIES.STATUS];
    const forecastState = this.hass.states[ENTITIES.FORECAST];
    const temperatureStateStr = temperatureState ? temperatureState.state : 'unavailable';
    const logUrl = this.hass.states['sun.sun'].state === 'below_horizon' ? 'https://www.02ws.co.il/img/logo_night.png' : 'https://www.02ws.co.il/img/logo.png';

    const lastDayStats = {};
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.hass.callWS({
      "id": 1,
      "type": "history/history_during_period",
      "start_time": yesterday.toISOString(),
      "end_time": now.toISOString(),
      "entity_ids": [ENTITIES.TEMPERATURE, ENTITIES.STATUS]
    }).then((response) => {
      console.log("response", response);
      lastDayStats.temperature = response[ENTITIES.TEMPERATURE][0].a.temperature;
      lastDayStats.apparent_temperature = response[ENTITIES.TEMPERATURE][0].a.apparent_temperature;
      lastDayStats.day_icon  = response[ENTITIES.STATUS][0].a.day_icon;
      lastDayStats.status  = response[ENTITIES.STATUS][0].a.status;
      console.log("lastDayStats 1", lastDayStats);
    });
    console.log("lastDayStats 2", lastDayStats);

    return html`
      <ha-card>
        <div class="container">
        ${(temperatureStateStr !== 'unavailable' && temperatureState.attributes.temperature !== null)
        ? html`
              <div id="left">
                <div id="status-container">
                  ${(statusState.attributes.cloth_icon)
            ? html`<div>
                      <img class="icon" src="${statusState.attributes.cloth_icon}" title="${statusState.attributes.cloth_info}">
                    </div>
                    <div id="icon-info" dir="rtl">
                      <bdi>${statusState.attributes.status}</bdi>
                    </div>
                    `
            : html``
          }
                </div>
                <div>
                  <div class="forecast-icon">
                    <img src="https://www.02ws.co.il/img/night_icon_night.png">
                    <img src="https://www.02ws.co.il/img/noon_icon_night.png">
                    <img src="https://www.02ws.co.il/img/morning_icon_night.png">
                  </div>
                  <div class="forecast-icon">
                    <bdi>${forecastState.attributes.night_temp} °C</bdi>
                    <bdi>${forecastState.attributes.noon_temp} °C</bdi>
                    <bdi>${forecastState.attributes.morning_temp} °C</bdi>
                  </div>
                  <div class="forecast-icon">
                    <img src="${forecastState.attributes.night_cloth_icon}" title="${forecastState.attributes.night_cloth_info}">
                    <img src="${forecastState.attributes.noon_cloth_icon}" title="${forecastState.attributes.noon_cloth_info}">
                    <img src="${forecastState.attributes.morning_cloth_icon}" title="${forecastState.attributes.morning_cloth_info}">
                  </div>
                </div>
              </div>
              <div id="right" dir="rtl">
                <img class="logo" src="${logUrl}">
                <div class="block" id="current-temp">
                  <bdi>
                    ${temperatureState.attributes.temperature}
                    <span>°C </span>
                  </bdi>
                </div>
                ${temperatureState.attributes.apparent_temperature
            ? html`<div class="block">
                    <span>מרגיש כמו: </span>
                    <bdi>${temperatureState.attributes.apparent_temperature} °C</bdi>
                  </div>`
            : html`<div class="block">
                    <span>מרגיש כמו: </span>
                    <bdi>${temperatureState.attributes.temperature} °C</bdi>
                  </div>`
          }
                <div>
                  <bdi>${statusState.attributes.forecast}</bdi>
                </div>
              </div>
            `
        : html`No data to show`
      }
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
        box-shadow: var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
        padding: 16px;
        font-size: 16px;
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
