# FunnelQuest JavaScript SDK

The FunnelQuest JavaScript SDK is a lightweight tool designed to integrate event tracking into your web applications. With this SDK, you can easily initialize tracking using a unique `websiteId` and manually trigger custom events with the `track()` method. The SDK automatically collects key data points such as browser details, device type, and visitor location, sanitizes inputs for security, and sends events to the FunnelQuest API in efficient batches.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Tracking Events](#tracking-events)
- [API Reference](#api-reference)
  - [init(options)](#initoptions)
  - [track(event_name)](#trackevent_name)
- [Data Collected](#data-collected)
- [Configuration](#configuration)
- [Security and Privacy](#security-and-privacy)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Simple Setup**: Initialize tracking with a single `websiteId`.
- **Custom Event Tracking**: Log specific events with the `track()` method.
- **Automatic Data Collection**: Gathers browser, language, device type, visitor country, and session trace ID.
- **Sanitized Inputs**: Ensures all data is clean and secure.
- **Efficient Batching**: Sends events in batches to minimize network requests.
- **Secure Cookie Handling**: Manages session tracking with privacy-focused cookie settings.

## Installation

To add the FunnelQuest JavaScript SDK to your project, include the script in your HTML file:

```html
<script src="path/to/funnelQuest.js"></script>
```

If you're using a module bundler like Webpack or Rollup, import it as a module:

```javascript
import { funnelQuest } from 'path/to/funnelQuest.js';
```
Important: Ensure the script is loaded before calling funnelQuest.init() or funnelQuest.track().


## Usage

### Initialization

You must initialize the SDK with your unique websiteId (a UUID provided by FunnelQuest) before tracking events:

```javascript
funnelQuest.init({
  websiteId: 'f9e8d7c6-b5a4-3210-9876-543210fedcba'
});
```

-   **websiteId**: A required UUID string that identifies your website.
    

If the SDK is already initialized, it will log a warning and skip reinitialization.

### Tracking Events

After initialization, use the track() method to log custom events:


```javascript
funnelQuest.track('button_click');
```

-   **event_name**: A required string that names the event. This must match an event predefined in your FunnelQuest dashboard.
    

## API Reference

**init**(options)

Initializes the SDK with the specified options.

-   Parameters:
    
    -   options (object):
        
        -   websiteId (string, required): A UUID string identifying your website.
            
-   Example:
    

```javascript
funnelQuest.init({
  websiteId: 'f9e8d7c6-b5a4-3210-9876-543210fedcba'
});
```

-   Throws:
    
    -   An error if websiteId is missing or invalid.
        

**track**(event_name)

Tracks a custom event with the given name.

-   Parameters:
    
    -   event_name (string, required): The name of the event to track.
        
-   Example:
    

```javascript
funnelQuest.track('button_click');
```

-   Notes:
    
    -   Requires prior initialization with init().
        
    -   If event_name is not a string or is empty, a warning is logged, and the event is ignored.
        

## Data Collected

When you call track(), the SDK automatically collects and sends the following data to the FunnelQuest API:

-   event_name: The name of the event (e.g., "button_click").
    
-   date_time: Timestamp of the event in ISO 8601 format (e.g., "2023-10-15T12:00:00Z").
    
-   browser: The user's browser (e.g., "Chrome", "Firefox", "Safari").
    
-   language: The user's browser language (e.g., "en", "fr", "es").
    
-   visitor_country: The user's country (e.g., "US", "United Kingdom").
    
-   device_type: The device type (e.g., "desktop", "mobile", "tablet").
    
-   trace_id: A unique session identifier stored in a cookie.
    

All data is sanitized to remove non-printable characters and trim excess whitespace.

## Configuration

The SDK includes the following internal settings (not currently customizable):

-   API_URL: The endpoint for event data (Default: https://api.funnelquest.com/track).
    
-   BATCH_INTERVAL: Time interval for sending batched events (Default: 5000ms).
    
-   MAX_BATCH_SIZE: Maximum events per batch (Default: 10).
    

## Security and Privacy

-   Input Sanitization: All inputs and collected data are cleaned to prevent injection attacks.
    
-   Cookie Security: The trace_id is stored in a cookie with secure, SameSite=Lax, and a 1-year expiration.
    
-   Country Detection: Uses ipapi.co to detect visitor country. Ensure compliance with privacy laws (e.g., GDPR) when deploying.
    

## Contributing

We welcome contributions! To get started:

1.  Fork the repository.
    
2.  Create a branch for your feature or fix (git checkout -b feature-name).
    
3.  Commit your changes with descriptive messages.
    
4.  Submit a pull request with details of your updates.
    

Please follow the existing code style and include tests where applicable.

## License

This project is licensed under the MIT License. See the LICENSE file for more information.