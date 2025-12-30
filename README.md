# Yerushamayim
## Unofficial Yerushamayim Home Assistant dashboard card for the unofficial Yerushamayim integration

### Current version: 1.7.0
<br/>

![screenshot](https://raw.githubusercontent.com/chilikla/yerushamayim/main/screenshot.png)

## Features
- Beautiful weather card with current conditions
- Yesterday's weather comparison
- Daily forecast with morning, noon, and night temperatures
- Clothing recommendations
- Multi-day forecast (expandable)
- Customizable background styles
- Fully configurable via UI or YAML

## Installation
1. Install the [Unofficial Yerushamayim integration](https://github.com/chilikla/yerushamayim)
2. Add this repo to HACS' Custom repositories: `https://github.com/chilikla/yerushamayim-card`
3. Download the plugin
4. Add the card to your dashboard

## Configuration

### UI Configuration (Recommended)
The card now supports visual configuration! When adding the card to your dashboard:
1. Click "Add Card"
2. Search for "Yerushamayim Weather Card"
3. Configure all options through the visual editor

### YAML Configuration
You can still configure the card via YAML if preferred:

```yaml
type: custom:yerushamayim-card
hide_yesterday: false        # Hide yesterday's weather data (default: false)
show_cloth: false            # Show clothing icons for each day part (default: false)
background_style: gradient   # Card background: 'gradient', 'default', or 'transparent' (default: gradient)
show_forecast: false         # Show expandable multi-day forecast (default: false)
forecast_days: 3             # Number of forecast days to show (1-7, default: 3)
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hide_yesterday` | boolean | `false` | Hide yesterday's weather information |
| `show_cloth` | boolean | `false` | Show clothing recommendation icons for each day part |
| `background_style` | string | `'gradient'` | Card background style: `'gradient'` (blue gradient), `'default'` (HA theme), or `'transparent'` |
| `show_forecast` | boolean | `false` | Show expandable forecast section for upcoming days |
| `forecast_days` | number | `3` | Number of forecast days to display (1-7) |

### Background Styles
- **Gradient**: Beautiful blue gradient background (original style)
- **Default**: Uses your Home Assistant theme's default card background
- **Transparent**: Transparent background to blend with your dashboard

### Multi-Day Forecast
Enable `show_forecast` to add an expandable forecast section showing:
- Temperature predictions for morning, noon, and night
- Weather status descriptions
- Optional clothing recommendations (when `show_cloth` is enabled)
- Day names and dates
- Click the forecast header to expand/collapse

## License
Apache-2.0. By providing a contribution, you agree the contribution is licensed under Apache-2.0. This is required for Home Assistant contributions.
