import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@4.1.1/lit-element.js?module";
import "./yerushamayim-card-editor.js";

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
  FORECAST: SENSOR_BASE + "forecast_day_1",
  PRECIPITATION: SENSOR_BASE + "precipitation",
  ALERTS: SENSOR_BASE + "alerts",
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
      lastDayState: { type: Object, state: true },
      _baseUrl: { type: String, state: true },
      _forecastExpanded: { type: Boolean, state: true },
      _forecastStates: { type: Array, state: true },
      _showAlertDialog: { type: Boolean, state: true },
    };
  }

  constructor() {
    super();
    this.lastDayState = {};
    this._forecastExpanded = false;
    this._forecastStates = [];
    this._showAlertDialog = false;
    // Get the base URL for assets relative to the card's JS file
    this._baseUrl = this._getBaseUrl();
  }

  _getBaseUrl() {
    // Find the script URL for this card
    const scripts = document.getElementsByTagName("script");
    for (let script of scripts) {
      if (script.src && script.src.includes("yerushamayim-card")) {
        // Extract the directory path
        return script.src.substring(0, script.src.lastIndexOf("/"));
      }
    }
    // Fallback: try to get from import.meta if available
    return "";
  }

  // This will be called whenever hass updates
  updated(changedProperties) {
    if (changedProperties.has("hass")) {
      this.updateStates();
    }
  }

  // Update all states when hass changes
  updateStates() {
    if (!this.hass) return;

    this.temperatureState = this.hass.states[ENTITIES.TEMPERATURE];
    this.statusState = this.hass.states[ENTITIES.STATUS];
    this.forecastState = this.hass.states[ENTITIES.FORECAST];
    this.precipitationState = this.hass.states[ENTITIES.PRECIPITATION];
    this.temperatureStateStr = this.temperatureState
      ? this.temperatureState.state
      : "unavailable";
    this.logoUrl =
      this.hass.states["sun.sun"].state === "below_horizon"
        ? `${this._baseUrl}/assets/logo_night.png`
        : `${this._baseUrl}/assets/logo.png`;

    // Update forecast states if forecast is enabled
    if (this.config.show_forecast) {
      this._updateForecastStates();
    }
  }

  _updateForecastStates() {
    const days = this.config.forecast_days || 3;
    this._forecastStates = [];

    // Check if forecast_day_1 is today or tomorrow
    const day1State = this.hass.states[ENTITIES.FORECAST];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    let startDay = 2; // Default: skip day_1 (today) and start from day_2

    if (day1State?.attributes?.date) {
      const day1Date = day1State.attributes.date;
      // If day_1 is not today (it's tomorrow or later), include it in the forecast
      if (day1Date !== todayStr) {
        startDay = 1;
      }
    }

    // Collect forecast states starting from the determined day
    for (let i = startDay; i < startDay + days; i++) {
      const entityId = `${SENSOR_BASE}forecast_day_${i}`;
      const state = this.hass.states[entityId];
      if (state) {
        this._forecastStates.push(state);
      }
    }
  }

  _toggleForecast(e) {
    e.stopPropagation();
    this._forecastExpanded = !this._forecastExpanded;
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
        id: 1,
        type: "history/history_during_period",
        start_time: yesterday.toISOString(),
        end_time: now.toISOString(),
        entity_ids: [ENTITIES.TEMPERATURE, ENTITIES.STATUS],
      });

      if (response && response[ENTITIES.TEMPERATURE]?.[0]?.a) {
        this.lastDayState = {
          temperature: response[ENTITIES.TEMPERATURE][0].a.temperature,
          apparent_temperature:
            response[ENTITIES.TEMPERATURE][0].a.apparent_temperature,
          cloth_icon: response[ENTITIES.STATUS][0].a.cloth_icon,
          status: response[ENTITIES.STATUS][0].a.status,
        };
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  handleClick() {
    if (!this.hass) return;

    const clickBehavior = this.config.click_behavior || 'entities';

    if (clickBehavior === 'alert') {
      this._showAlertDialog = true;
    } else {
      // Default: navigate to entities
      const domain = "yerushamayim";
      window.history.pushState(
        null,
        "",
        `/config/entities?historyBack=1&domain=${domain}`
      );
      const event = new Event("location-changed", {
        bubbles: true,
        composed: true,
      });
      window.dispatchEvent(event);
    }
  }

  _closeAlertDialog(e) {
    e.stopPropagation();
    this._showAlertDialog = false;
  }

  _getAlertData() {
    const alertsEntity = this.hass?.states[ENTITIES.ALERTS];
    if (!alertsEntity) {
      return { hasAlert: false };
    }

    const attributes = alertsEntity.attributes || {};
    let publishedTime = attributes.alert_1_date || '';

    // Fix time format for RTL display: move time after date if format is "HH:MM:SS YYYY-MM-DD"
    if (publishedTime && publishedTime.match(/^\d{2}:\d{2}:\d{2} \d{4}-\d{2}-\d{2}$/)) {
      const [time, date] = publishedTime.split(' ');
      publishedTime = `${date} ${time}`;
    }

    return {
      hasAlert: true,
      title: attributes.alert_1_title || 'עדכון',
      description: attributes.alert_1_description?.trim() || alertsEntity.state || 'אין מידע זמין',
      publishedTime: publishedTime,
    };
  }

  _getBackgroundStyle() {
    const style = this.config.background_style || "gradient";
    switch (style) {
      case "transparent":
        return "background: transparent;";
      case "default":
        return "background: var(--ha-card-background, var(--card-background-color, white));";
      case "gradient":
      default:
        return "background: linear-gradient(180deg, #3b4d5b 0%, #5e6d97 100%);";
    }
  }

  render() {
    if (!this.hass || !this.temperatureState) {
      return html`<ha-card><div class="container">Loading...</div></ha-card>`;
    }

    return html`
      <ha-card @click="${this.handleClick}" style="cursor: pointer;">
        <div class="container" style="${this._getBackgroundStyle()}">
          ${this.temperatureStateStr !== "unavailable" &&
          this.temperatureState.attributes.temperature !== null
            ? html`
                <div class="columns-container">
                  <div class="column left-column">
                    <div class="column-section">
                      <div id="status-container">
                        ${this.statusState.attributes.cloth_icon
                          ? html`<div>
                                <img
                                  class="icon"
                                  src="${this.statusState.attributes
                                    .cloth_icon}"
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
                            src="https://v2013.02ws.co.il/img/night_icon_night.png"
                          />
                          <img
                            src="https://v2013.02ws.co.il/img/noon_icon_night.png"
                          />
                          <img
                            src="https://v2013.02ws.co.il/img/morning_icon_night.png"
                          />
                        </div>
                        <div class="forecast-icon">
                          <bdi
                            >${this.forecastState.attributes.night_temp} °C</bdi
                          >
                          <bdi
                            >${this.forecastState.attributes.noon_temp} °C</bdi
                          >
                          <bdi
                            >${this.forecastState.attributes.morning_temp}
                            °C</bdi
                          >
                        </div>
                        ${this.config.show_cloth
                          ? html`<div class="forecast-icon">
                              <img
                                src="${this.forecastState.attributes
                                  .night_cloth_icon}"
                                title="${this.forecastState.attributes
                                  .night_cloth_info}"
                              />
                              <img
                                src="${this.forecastState.attributes
                                  .noon_cloth_icon}"
                                title="${this.forecastState.attributes
                                  .noon_cloth_info}"
                              />
                              <img
                                src="${this.forecastState.attributes
                                  .morning_cloth_icon}"
                                title="${this.forecastState.attributes
                                  .morning_cloth_info}"
                              />
                            </div>`
                          : html`<div />`}
                      </div>
                    </div>
                    ${!this.config.hide_yesterday && this.lastDayState
                      ? html`<div
                          class="column-section yesterday-section"
                          dir="rtl"
                        >
                          <div class="yesterday-icon-container">
                            <img
                              class="yesterday-icon"
                              src="${this.lastDayState.cloth_icon}"
                            />
                          </div>
                          <div class="yesterday-status-text">
                            ${this.lastDayState.status}
                          </div>
                        </div>`
                      : html`<div />`}
                  </div>

                  <div class="logo-center">
                    <img class="logo" src="${this.logoUrl}" />
                  </div>

                  <div class="column right-column" dir="rtl">
                    <div class="column-section">
                      <div class="block" id="current-temp">
                        <bdi>
                          ${this.temperatureState.attributes.temperature}
                          <span>°C </span>
                        </bdi>
                      </div>
                      <div class="block">
                        <span>מרגיש כמו: </span>
                        <bdi
                          >${this.temperatureState.attributes
                            .apparent_temperature
                            ? this.temperatureState.attributes
                                .apparent_temperature
                            : this.temperatureState.attributes.temperature}
                          °C</bdi
                        >
                      </div>
                      <div
                        class="block today-status"
                        title="${this.forecastState.attributes.status}"
                      >
                        <bdi>${this.forecastState.attributes.status}</bdi>
                      </div>
                      ${Number(
                        this.precipitationState.attributes
                          .precipitation_probability
                      ) > 0
                        ? html`<div class="precipitation">
                            <span>סיכוי לגשם: </span>
                            <bdi
                              >${this.precipitationState.attributes
                                .precipitation_probability}%</bdi
                            >
                          </div>`
                        : html`<div />`}
                    </div>
                    ${!this.config.hide_yesterday && this.lastDayState
                      ? html`<div
                          class="column-section yesterday-section"
                          dir="rtl"
                        >
                          <div class="yesterday-label">אתמול:</div>
                          <div class="yesterday-temp">
                            <span dir="rtl"> C°</span>
                            <span>${this.lastDayState.temperature}</span>
                          </div>
                          <div class="yesterday-feels">
                            <span>הרגיש כמו:</span>
                            <bdi>
                              ${this.lastDayState.apparent_temperature} °C
                            </bdi>
                          </div>
                        </div>`
                      : html`<div />`}
                  </div>
                </div>
                ${this.config.show_forecast
                  ? html`<div class="forecast-section">
                      <div
                        class="forecast-toggle"
                        @click="${this._toggleForecast}"
                      >
                        <span
                          >תחזית ${this.config.forecast_days || 3} ימים</span
                        >
                        <ha-icon
                          icon="${this._forecastExpanded
                            ? "mdi:chevron-up"
                            : "mdi:chevron-down"}"
                        ></ha-icon>
                      </div>
                      ${this._forecastExpanded
                        ? html`<div class="forecast-days">
                            ${this._forecastStates.map(
                              (forecast, index) => html`
                                <div class="forecast-day" dir="rtl">
                                  <div class="forecast-day-header">
                                    <div class="forecast-day-title">
                                      <img
                                        class="forecast-day-icon"
                                        src="${forecast.attributes.day_icon}"
                                        title="${forecast.attributes.status || ""}"
                                      />
                                      <div class="forecast-day-text">
                                        <strong
                                          >${`יום ${forecast.attributes.day_name_heb}`}</strong
                                        >
                                        <span class="forecast-day-date"
                                          >${forecast.attributes.date || ""}</span
                                        >
                                      </div>
                                    </div>
                                    <div class="forecast-status">
                                      ${forecast.attributes.status || ""}
                                    </div>
                                  </div>
                                  <div class="forecast-day-content">
                                    <div class="forecast-temps">
                                      <div class="forecast-temp-item">
                                        <img
                                          src="https://v2013.02ws.co.il/img/morning_icon_night.png"
                                        />
                                        <span
                                          >${forecast.attributes
                                            .morning_temp}°C</span
                                        >
                                      </div>
                                      <div class="forecast-temp-item">
                                        <img
                                          src="https://v2013.02ws.co.il/img/noon_icon_night.png"
                                        />
                                        <span
                                          >${forecast.attributes
                                            .noon_temp}°C</span
                                        >
                                      </div>
                                      <div class="forecast-temp-item">
                                        <img
                                          src="https://v2013.02ws.co.il/img/night_icon_night.png"
                                        />
                                        <span
                                          >${forecast.attributes
                                            .night_temp}°C</span
                                        >
                                      </div>
                                    </div>
                                    ${this.config.show_cloth
                                      ? html`<div class="forecast-cloth">
                                          <img
                                            src="${forecast.attributes
                                              .morning_cloth_icon}"
                                            title="${forecast.attributes
                                              .morning_cloth_info}"
                                          />
                                          <img
                                            src="${forecast.attributes
                                              .noon_cloth_icon}"
                                            title="${forecast.attributes
                                              .noon_cloth_info}"
                                          />
                                          <img
                                            src="${forecast.attributes
                                              .night_cloth_icon}"
                                            title="${forecast.attributes
                                              .night_cloth_info}"
                                          />
                                        </div>`
                                      : ""}
                                  </div>
                                </div>
                              `
                            )}
                          </div>`
                        : ""}
                    </div>`
                  : ""}
              `
            : html`No data to show`}
        </div>
        ${this._showAlertDialog ? this._renderAlertDialog() : ''}
      </ha-card>
    `;
  }

  _renderAlertDialog() {
    const alertData = this._getAlertData();

    return html`
      <div class="alert-dialog-overlay" @click="${this._closeAlertDialog}">
        <div class="alert-dialog" @click="${(e) => e.stopPropagation()}" dir="rtl">
          <div class="alert-dialog-header">
            <h2>${alertData.hasAlert ? alertData.title : 'אין עדכונים'}</h2>
            <button class="close-button" @click="${this._closeAlertDialog}">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="alert-dialog-content">
            ${alertData.hasAlert
              ? html`
                  <div class="alert-message">
                    ${alertData.description}
                  </div>
                  ${alertData.publishedTime
                    ? html`<div class="alert-time">
                        <strong>זמן פרסום:</strong> ${alertData.publishedTime}
                      </div>`
                    : ''}
                `
              : html`<div class="no-alert">אין התראות פעילות כרגע</div>`}
          </div>
        </div>
      </div>
    `;
  }

  setConfig(config) {
    this.config = {
      hide_yesterday: false,
      show_cloth: false,
      background_style: "gradient",
      show_forecast: false,
      forecast_days: 3,
      click_behavior: "entities",
      ...config,
    };
  }

  getCardSize() {
    if (
      !this.config.hide_yesterday &&
      this.lastDayState &&
      Object.keys(this.lastDayState).length > 0
    ) {
      return 4; // Larger size when yesterday section is shown
    }
    return 3;
  }

  static getConfigElement() {
    return document.createElement("yerushamayim-card-editor");
  }

  static getStubConfig() {
    return {
      hide_yesterday: false,
      show_cloth: false,
      background_style: "gradient",
      show_forecast: false,
      forecast_days: 3,
      click_behavior: "entities",
    };
  }

  static get styles() {
    return css`
      :host {
        font-family: "Rubik", "Open Sans", cursive;
      }
      ha-card {
        height: 100%;
        overflow: hidden;
      }
      .container {
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(
          --ha-card-box-shadow,
          0px 2px 1px -1px rgba(0, 0, 0, 0.2),
          0px 1px 1px 0px rgba(0, 0, 0, 0.14),
          0px 1px 3px 0px rgba(0, 0, 0, 0.12)
        );
        padding: 16px;
        font-size: 16px;
        min-height: calc(100% - 32px);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }

      .columns-container {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 16px;
        flex: 1;
      }

      .column {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 1;
      }

      .left-column {
        flex-basis: 40%;
        align-self: stretch;
      }

      .logo-center {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex-shrink: 0;
      }

      .right-column {
        flex-basis: 40%;
        align-self: stretch;
      }

      .column-section {
        display: flex;
        flex-direction: column;
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
        align-items: flex-start;
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
        filter: brightness(0) invert(1);
      }
      .block {
        margin-bottom: 4px;
      }
      #current-temp {
        font-size: 24px;
      }
      .today-status {
        display: -webkit-box;
        -webkit-line-clamp: 3; /* Limit to 3 lines */
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
      }
      .yesterday-section {
        margin-top: 20px;
        align-self: flex-start;
      }

      .yesterday-label {
        font-size: 14px;
        margin-bottom: 4px;
        opacity: 0.9;
      }

      .yesterday-temp {
        font-size: 20px;
        margin-bottom: 4px;
      }

      .yesterday-feels {
        font-size: 14px;
        opacity: 0.9;
      }

      .yesterday-icon-container {
        display: flex;
        justify-content: center;
        margin-bottom: 8px;
      }

      .yesterday-icon {
        height: 36px;
      }

      .yesterday-status-text {
        font-size: 14px;
        text-align: center;
        opacity: 0.9;
      }
      .forecast-section {
        margin-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 12px;
        direction: rtl;
      }
      .forecast-toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: background-color 0.2s;
      }
      .forecast-toggle:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      .forecast-toggle span {
        font-weight: 500;
        font-size: 16px;
      }
      .forecast-days {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .forecast-day {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 12px;
      }
      .forecast-day-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      }
      .forecast-day-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .forecast-day-icon {
        height: 40px;
        width: 40px;
        flex-shrink: 0;
      }
      .forecast-day-text {
        display: flex;
        flex-direction: column;
      }
      .forecast-day-header strong {
        font-size: 15px;
      }
      .forecast-day-date {
        font-size: 13px;
        opacity: 0.8;
      }
      .forecast-day-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .forecast-temps {
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 8px;
      }
      .forecast-temp-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        flex: 1;
      }
      .forecast-temp-item img {
        height: 24px;
        width: 24px;
      }
      .forecast-temp-item span {
        font-size: 14px;
      }
      .forecast-cloth {
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }
      .forecast-cloth img {
        height: 24px;
        width: 24px;
      }
      .forecast-status {
        font-size: 12px;
        text-align: left;
        opacity: 0.9;
        max-width: 50%;
        line-height: 1.3;
        opacity: 0.9;
      }
      .alert-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        padding: 16px;
      }
      .alert-dialog {
        background: var(--ha-card-background, var(--card-background-color, white));
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        cursor: default;
      }
      .alert-dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color);
      }
      .alert-dialog-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        color: var(--primary-text-color);
        cursor: text;
      }
      .close-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: var(--primary-text-color);
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      .close-button:hover {
        opacity: 1;
      }
      .alert-dialog-content {
        padding: 20px;
      }
      .alert-message {
        font-size: 16px;
        line-height: 1.6;
        color: var(--primary-text-color);
        margin-bottom: 16px;
        cursor: text;
      }
      .alert-time {
        font-size: 14px;
        color: var(--secondary-text-color);
        margin-top: 8px;
        cursor: text;
      }
      .alert-time strong {
        color: var(--primary-text-color);
      }
      .no-alert {
        font-size: 16px;
        color: var(--secondary-text-color);
        text-align: center;
        padding: 20px;
      }
    `;
  }
}

customElements.define("yerushamayim-card", YerushamayimCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "yerushamayim-card",
  name: "Yerushamayim Weather Card",
  preview: true,
  description: "Unofficial Yerushamayim Home Assistant dashboard card",
  documentationURL: "https://github.com/chilikla/yerushamayim-card",
});
