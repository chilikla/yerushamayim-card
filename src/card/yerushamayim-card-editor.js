import {
  LitElement,
  html,
  css
} from "https://unpkg.com/lit-element@4.1.1/lit-element.js?module";

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
    const configKey = target.configValue;
    let configValue = target.checked !== undefined ? target.checked : target.value;

    // Convert number inputs to actual numbers
    if (target.type === 'number') {
      configValue = parseInt(target.value, 10);
    }

    if (this.config[configKey] !== configValue) {
      this.config = {
        ...this.config,
        [configKey]: configValue
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
              <div class="secondary">How many days to show in the forecast (1-6)</div>
            </label>
            <input
              type="number"
              min="1"
              max="6"
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

        <div class="option">
          <label>
            Card Click Behavior
            <div class="secondary">Choose what happens when clicking the card</div>
          </label>
          <select
            .value=${this.config.click_behavior || 'entities'}
            .configValue=${"click_behavior"}
            @change=${this.configChanged}
          >
            <option value="entities">Open Yerushamayim Entities</option>
            <option value="alert">Show Last Alert</option>
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
