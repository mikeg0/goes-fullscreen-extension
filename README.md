# GOES Fullscreen Extension

A Chrome extension that enhances the NOAA GOES Image Viewer website by providing fullscreen viewing capabilities for GOES satellite imagery loops. Perfect for always-on monitor displays showing real-time weather imagery.

## Project Overview

This extension is specifically designed to work with the [NOAA GOES Image Viewer](https://www.star.nesdis.noaa.gov/GOES/) website, which displays near real-time satellite imagery from the Geostationary Operational Environmental Satellites (GOES). The extension provides two main functionalities:

1. **Fullscreen Toggle**: Displays the satellite image animation loop in fullscreen mode
2. **Auto-Update**: Automatically checks for and adds new satellite images to the animation loop as they become available

## Intended Use

- **Weather Monitoring**: Display real-time satellite imagery on dedicated monitors for weather tracking
- **Educational Displays**: Use in classrooms, weather stations, or public displays
- **Professional Applications**: Meteorologists, emergency management, and aviation professionals
- **Always-On Displays**: Perfect for dedicated monitors showing continuous weather imagery

## Features

- **Enhanced Fullscreen Mode**: Optimized display with proper aspect ratio and centering
- **Automatic Image Updates**: Continuously checks for new GOES-18 satellite images every 5 minutes
- **Smart Image Detection**: Accounts for server processing delays and image availability
- **Seamless Integration**: Works directly with the existing NOAA GOES website interface
- **Timeline Updates**: Automatically updates the image slider when new images are added

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the project folder
5. The extension will appear in your Chrome toolbar

## Usage

1. Navigate to any GOES image viewer page on the NOAA website (e.g., [GOES-West CONUS GeoColor](https://www.star.nesdis.noaa.gov/GOES/conus_band.php?sat=G18&band=GEOCOLOR&length=120))
2. Click the "GOES Viewer Fullscreen Toggle" extension icon in your Chrome toolbar
3. Click the "Toggle Fullscreen" button in the popup
4. The satellite image animation will display in fullscreen mode with automatic updates

## File Descriptions

### Core Extension Files

- **`manifest.json`**: Chrome extension configuration file that defines the extension's metadata, permissions, and structure. Specifies manifest version 3, required permissions for active tab access and script injection, and sets up the popup interface.

- **`popup.html`**: The extension's user interface - a simple HTML page containing a single "Toggle Fullscreen" button that users interact with when clicking the extension icon.

- **`popup.js`**: The main functionality script containing sophisticated logic for:
  - Detecting the GOES animation block on the webpage
  - Generating timestamps for new satellite images (accounting for server processing delays)
  - Checking image availability using HTTP requests
  - Dynamically adding new images to the animation loop
  - Managing fullscreen display with proper styling and aspect ratio
  - Integrating with the website's existing jQuery Cycle2 and slider components

- **`popup.js.bak`**: Backup of the original, simpler implementation that only provided basic fullscreen functionality without automatic image updates. Kept for reference and potential rollback if needed.

### Standalone Display

- **`index-display.html`**: A complete standalone HTML page that replicates the NOAA GOES website interface. This 4,000+ line file includes:
  - Used for developing the plugin


## Technical Details

### Satellite Image Sources

The extension works with GOES-18 (GOES-West) satellite imagery from NOAA's CDN:
- **Standard Resolution**: 1250x750 pixels for animation display
- **High Resolution**: 2500x1500 pixels for full-size viewing
- **Update Frequency**: New images available approximately every 5 minutes
- **Server Processing**: Accounts for 10-minute delay in image availability

### Image Timestamp Format

The extension generates timestamps in the format: `YYYYDDDHHMM` where:
- `YYYY`: 4-digit year
- `DDD`: 3-digit day of year (001-365/366)
- `HH`: 2-digit hour (UTC)
- `MM`: 2-digit minute (aligned to server schedule: 01, 06, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56)

### Browser Compatibility

- **Chrome**: Fully supported (Manifest V3)
- **Edge**: Should work with Chromium-based Edge
- **Firefox**: Would require manifest conversion for Firefox extension format
- **Safari**: Would require separate Safari extension development

## Development

### Prerequisites

- Chrome browser with developer mode enabled
- Basic understanding of Chrome extension development
- Knowledge of JavaScript, HTML, and CSS

### Key Technologies

- **Chrome Extensions API**: For tab access and script injection
- **JavaScript ES6+**: Modern JavaScript features and async/await
- **DOM Manipulation**: Direct interaction with NOAA website elements
- **HTTP Image Validation**: Checking image availability before loading
- **CSS Fullscreen API**: Native browser fullscreen capabilities

## Contributing

This project is open source under the GPL v3.0 license. Contributions are welcome for:
- Bug fixes and improvements
- Additional satellite data sources
- Enhanced UI/UX
- Cross-browser compatibility
- Documentation improvements

## Support

For issues or questions:
1. Check the existing GitHub issues
2. Create a new issue with detailed description
3. Include browser version and website URL where issues occur

## License

This project is licensed under the GNU General Public License v3.0. See the `LICENSE` file for full license terms. This ensures the software remains free and open source with strong copyleft protections.
