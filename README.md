[build_status]: https://travis-ci.org/hcphoon01/VATSIM-Data-Handler.svg?branch=master
[coverage_status]: https://img.shields.io/coveralls/github/hcphoon01/VATSIM-Data-Handler
[discord_badge]: https://img.shields.io/discord/580346191854960641
[version_badge]: https://img.shields.io/github/v/tag/hcphoon01/vatsim-data-handler
[license_badge]: https://img.shields.io/github/license/hcphoon01/vatsim-data-handler
[discord_invite]: https://discord.gg/fwK8QfD

# VATSIM Data Handler

A data handler for the VATSIM status system coded in JavaScript

## Status

|      Check      |                            Provider                                                  |              Status             |
|-----------------|--------------------------------------------------------------------------------------|---------------------------------|
| Build           | [TravisCI](https://travis-ci.org/hcphoon01/VATSIM-Data-Handler)                      | ![build_status]                 |
| Coverage        | [Coveralls](https://coveralls.io/github/hcphoon01/VATSIM-Data-Handler?branch=master) | ![coverage_status]              |
| Discord         | [Discord][discord_invite]                                                            | ![discord_badge]                |
| Github Version  | [GitHub](https://img.shields.io/github/package-json/v/hcphoon01/vatsim-data-handler) | ![version_badge]                |
| License         | [License](https://github.com/hcphoon01/VATSIM-Data-Handler/blob/master/LICENSE)      | ![license_badge]                |

## Installation

  `npm install vatsim-data-handler`

## Usage

  ```javascript
  const {handler} = require('vatsim-data-handler');

  handler.getSupervisors().then(val => console.log(val));
  ```

  This would log the number of clients connected to the VATSIM network

## Available methods

* `getCount(type)` - Returns the number of connected clients, where type is the type of requested client. Available arguments are 'all', 'pilots' and 'controllers'
* `getAirportInfo(airport)` - Returns the details of pilots into or out of a certain airport along with the controllers controlling that airport, the airport argument is a 4 letter ICAO code
* `getPopularAirports()` - Returns a list of the top 10 airports for arriving and departing aircraft
* `getFlightInfo(callsign)` - Returns the details of a specific pilots flight, where callsign is a valid VATSIM callsign as a string
* `getClients()` - Returns a list of all connected clients
* `getClientDetails(cid)` - Returns the details of a specific pilots flight, where cid is a valid VATSIM cid as an integer
* `getControllers()` - Returns a list of all the controllers connected to VATSIM
* `getSupervisors()` - Returns a list of all the supervisors/admins connected to VATSIM

## Available events - To be updated

* `on('newController')` - Triggered when a new controller, or when new controllers, connect to the network
* `on('newPilot')` - Triggered when a new pilot, or when new pilots, connect to the network

```javascript
process.on("newController", (data) => {
  console.log(data);
})
```

This would log any new controllers, including observers, that connect to the VATSIM network.

------

### Deprecated - from v2.0.0 +

* `getClientCount()` - Returns the number of clients connected to the VATSIM network (Replaced by `getCount(type)`)
* `getPilotCount()` - Returns the number of pilots connected to the VATSIM network (Replaced by `getCount(type)`)
* `getControllerCount()` - Returns the number of controllers connected to the VATSIM network (Replaced by `getCount(type)`)

------

## Tests

  `npm test`

## Support

If you have any issues or feature requests, either create an issue or you can join my [Discord Server][discord_invite].

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
