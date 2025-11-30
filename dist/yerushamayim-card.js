import { LitElement, html, css } from 'https://unpkg.com/lit-element@4.1.1/lit-element.js?module';

class YerushamayimCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  setConfig(config) {
    this.config = config;
  }

  configChanged(ev) {
    const target = ev.target;
    const configValue = target.checked !== undefined ? target.checked : target.value;

    if (this.config[target.configValue] !== configValue) {
      this.config = {
        ...this.config,
        [target.configValue]: configValue
      };

      const event = new CustomEvent("config-changed", {
        detail: { config: this.config },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    }
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    return html`
      <div class="card-config">
        <h3>Yerushamayim Card Configuration</h3>

        <div class="option">
          <ha-switch
            .checked=${this.config.hide_yesterday === true}
            .configValue=${"hide_yesterday"}
            @change=${this.configChanged}
          >
          </ha-switch>
          <label>
            Hide Yesterday Data
            <div class="secondary">Don't show yesterday's weather information</div>
          </label>
        </div>

        <div class="option">
          <ha-switch
            .checked=${this.config.show_cloth === true}
            .configValue=${"show_cloth"}
            @change=${this.configChanged}
          >
          </ha-switch>
          <label>
            Show Clothing Icons
            <div class="secondary">Display clothing recommendations for each day part</div>
          </label>
        </div>

        <div class="option">
          <ha-switch
            .checked=${this.config.show_forecast === true}
            .configValue=${"show_forecast"}
            @change=${this.configChanged}
          >
          </ha-switch>
          <label>
            Show Multi-Day Forecast
            <div class="secondary">Display expandable forecast for upcoming days</div>
          </label>
        </div>

        ${this.config.show_forecast ? html`
          <div class="option sub-option">
            <label>
              Number of Forecast Days
              <div class="secondary">How many days to show in the forecast (1-7)</div>
            </label>
            <input
              type="number"
              min="1"
              max="7"
              .value=${this.config.forecast_days || 3}
              .configValue=${"forecast_days"}
              @change=${this.configChanged}
            />
          </div>
        ` : ''}

        <div class="option">
          <label>
            Background Style
            <div class="secondary">Choose the card background appearance</div>
          </label>
          <select
            .value=${this.config.background_style || 'gradient'}
            .configValue=${"background_style"}
            @change=${this.configChanged}
          >
            <option value="gradient">Gradient (Blue)</option>
            <option value="default">Default (Home Assistant Theme)</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .card-config {
        padding: 16px;
      }

      h3 {
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 18px;
        font-weight: 500;
      }

      .option {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--divider-color);
        gap: 16px;
      }

      .option:last-child {
        border-bottom: none;
      }

      .sub-option {
        padding-left: 24px;
        background: var(--secondary-background-color);
        margin: 0 -16px;
        padding: 12px 40px;
      }

      label {
        flex: 1;
        cursor: pointer;
        font-size: 14px;
      }

      .secondary {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      ha-switch {
        flex-shrink: 0;
      }

      select, input[type="number"] {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        min-width: 200px;
      }

      input[type="number"] {
        min-width: 80px;
        width: 80px;
      }

      select:focus, input:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    `;
  }
}

customElements.define("yerushamayim-card-editor", YerushamayimCardEditor);

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
      _forecastStates: { type: Array, state: true }
    };
  }

  constructor() {
    super();
    this.lastDayState = {};
    this._forecastExpanded = false;
    this._forecastStates = [];
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
    this.temperatureStateStr = this.temperatureState ? this.temperatureState.state : "unavailable";
    this.logoUrl = this.hass.states["sun.sun"].state === "below_horizon"
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

    for (let i = 1; i <= days; i++) {
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
          cloth_icon: response[ENTITIES.STATUS][0].a.cloth_icon,
          status: response[ENTITIES.STATUS][0].a.status
        };
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  handleClick() {
    if (this.hass) {
      const domain = "yerushamayim";
      window.history.pushState(null, "", `/config/entities?historyBack=1&domain=${domain}`);
      const event = new Event("location-changed", {
        bubbles: true,
        composed: true
      });
      window.dispatchEvent(event);
    }
  }

  _getBackgroundStyle() {
    const style = this.config.background_style || 'gradient';
    switch (style) {
      case 'transparent':
        return 'background: transparent;';
      case 'default':
        return 'background: var(--ha-card-background, var(--card-background-color, white));';
      case 'gradient':
      default:
        return 'background: linear-gradient(180deg, #3b4d5b 0%, #5e6d97 100%);';
    }
  }

  render() {
    if (!this.hass || !this.temperatureState) {
      return html`<ha-card><div class="container">Loading...</div></ha-card>`;
    }

    return html`
      <ha-card @click="${this.handleClick}" style="cursor: pointer;">
        <div class="container" style="${this._getBackgroundStyle()}">
        ${(this.temperatureStateStr !== "unavailable" && this.temperatureState.attributes.temperature !== null)
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
                  <bdi>${this.forecastState.attributes.noon_temp} °C</bdi>
                  <bdi
                    >${this.forecastState.attributes.morning_temp} °C</bdi
                  >
                </div>
                ${this.config.show_cloth
                ? html`<div class="forecast-icon">
                    <img
                      src="${this.forecastState.attributes.night_cloth_icon}"
                      title="${this.forecastState.attributes.night_cloth_info}"
                    />
                    <img
                      src="${this.forecastState.attributes.noon_cloth_icon}"
                      title="${this.forecastState.attributes.noon_cloth_info}"
                    />
                    <img
                      src="${this.forecastState.attributes.morning_cloth_icon}"
                      title="${this.forecastState.attributes.morning_cloth_info}"
                    />
                  </div>`
                : html`<div />`}
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
              <div class="block status" title="${this.forecastState.attributes.status}">
                <bdi>${this.forecastState.attributes.status}</bdi>
              </div>
              ${Number(this.precipitationState.attributes.precipitation_probability) > 0
              ? html`<div class="precipitation">
                  <span>סיכוי לגשם: </span>
                  <bdi>${this.precipitationState.attributes.precipitation_probability}%</bdi>
                </div>`
              : html`<div />`}
            </div>
          </div>
          ${!this.config.hide_yesterday && this.lastDayState
            ? html`<div class="container-bottom" dir="rtl">
                <div class="yesterday-container">
                  <div class="yesterday-row" dir="rtl">
                    <div class="yesterday-temperature">
                      <div class="block">אתמול:</div>
                      <div style="font-size: 24px;" class="block">
                        <span dir="rtl"> C°</span>
                        <span>${this.lastDayState.temperature}</span>
                      </div>
                      <div>
                        <span>הרגיש כמו:</span>
                        <bdi class="yesterday">
                          ${this.lastDayState.apparent_temperature} °C
                        </bdi>
                      </div>
                    </div>
                    <div class="yesterday-status">
                      <div>
                        <img style="height: 30px; padding-block: 8px;" src="${this.lastDayState.cloth_icon}" />
                      </div>
                      <div>
                        ${this.lastDayState.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>`
            : html`<div />`}
          ${this.config.show_forecast
            ? html`<div class="forecast-section">
                <div class="forecast-toggle" @click="${this._toggleForecast}">
                  <span>תחזית ${this.config.forecast_days || 3} ימים</span>
                  <ha-icon
                    icon="${this._forecastExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}"
                  ></ha-icon>
                </div>
                ${this._forecastExpanded
                  ? html`<div class="forecast-days">
                      ${this._forecastStates.map((forecast, index) => html`
                        <div class="forecast-day" dir="rtl">
                          <div class="forecast-day-header">
                            <strong>${forecast.attributes.day_name || `יום ${index + 1}`}</strong>
                            <span class="forecast-day-date">${forecast.attributes.date || ''}</span>
                          </div>
                          <div class="forecast-day-content">
                            <div class="forecast-temps">
                              <div class="forecast-temp-item">
                                <img src="https://v2013.02ws.co.il/img/morning_icon_night.png" />
                                <span>${forecast.attributes.morning_temp}°C</span>
                              </div>
                              <div class="forecast-temp-item">
                                <img src="https://v2013.02ws.co.il/img/noon_icon_night.png" />
                                <span>${forecast.attributes.noon_temp}°C</span>
                              </div>
                              <div class="forecast-temp-item">
                                <img src="https://v2013.02ws.co.il/img/night_icon_night.png" />
                                <span>${forecast.attributes.night_temp}°C</span>
                              </div>
                            </div>
                            ${this.config.show_cloth
                              ? html`<div class="forecast-cloth">
                                  <img src="${forecast.attributes.morning_cloth_icon}"
                                       title="${forecast.attributes.morning_cloth_info}" />
                                  <img src="${forecast.attributes.noon_cloth_icon}"
                                       title="${forecast.attributes.noon_cloth_info}" />
                                  <img src="${forecast.attributes.night_cloth_icon}"
                                       title="${forecast.attributes.night_cloth_info}" />
                                </div>`
                              : ''}
                            <div class="forecast-status">
                              ${forecast.attributes.status || ''}
                            </div>
                          </div>
                        </div>
                      `)}
                    </div>`
                  : ''}
              </div>`
            : ''}
        `
        : html`No data to show`}
    </div>
  </ha-card>
`;
  }

  setConfig(config) {
    this.config = {
      hide_yesterday: false,
      show_cloth: false,
      background_style: 'gradient',
      show_forecast: false,
      forecast_days: 3,
      ...config
    };
  }

  getCardSize() {
    if (!this.config.hide_yesterday && this.lastDayState && Object.keys(this.lastDayState).length > 0) {
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
      background_style: 'gradient',
      show_forecast: false,
      forecast_days: 3
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
      
      .container-top {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        flex: 1;
      }
      
      .container-bottom {
        margin-top: 16px;
        /* FIXED: Prevent overflow */
        flex-shrink: 0;
      }
      
      #left {
        display: flex;
        flex-direction: column;
        flex-basis: 40%;
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
        margin-bottom: 8px;
        filter: brightness(0) invert(1);
      }
      #right {
        flex-basis: 60%;
      }
      .block { }
      #current-temp {
        font-size: 24px;
      }
      .today-status {
        display: -webkit-box;
        -webkit-line-clamp: 2; /* Limit to 3 lines */
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
      }
      .yesterday-container {
        display: flex;
        flex-direction: column;
      }
      .yesterday-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }
      
      .yesterday-temperature {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        min-height: fit-content;
        flex: 1;
      }
      .yesterday-status {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;
        min-height: fit-content;
        flex-shrink: 0;
      }

      .forecast-section {
        margin-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 12px;
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
        font-size: 13px;
        text-align: center;
        margin-top: 4px;
        opacity: 0.9;
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
  documentationURL: "https://github.com/chilikla/yerushamayim-card"
});
