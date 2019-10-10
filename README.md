# VATSIM Data Handler [![Build Status](https://travis-ci.org/hcphoon01/VATSIM-Data-Handler.svg?branch=master)](https://travis-ci.org/hcphoon01/VATSIM-Data-Handler) [![Coverage Status](https://coveralls.io/repos/github/hcphoon01/VATSIM-Data-Handler/badge.svg?branch=master)](https://coveralls.io/github/hcphoon01/VATSIM-Data-Handler?branch=master)
=========

A data handler for the VATSIM status system coded in JavaScript

## Installation

  `npm install vatsim-data-handler`

## Usage

  ```javascript
  const DataHandler = require('vatsim-data-handler');
  const handler = new DataHandler();

  console.log(handler.getCount('all'));
  ```
  This would log the number of clients connected to the VATSIM network

## Available methods

* `getClientCount()` - Returns the number of clients connected to the VATSIM network (Deprecated - replaced by `getCount(type)`)
* `getPilotCount()` - Returns the number of pilots connected to the VATSIM network (Deprecated - replaced by `getCount(type)`)
* `getControllerCount()` - Returns the number of controllers connected to the VATSIM network (Deprecated - replaced by `getCount(type)`)
* `getCount(type)` - Returns the number of connected clients, where type is the type of requested client. Available arguments are 'all', 'pilots' and 'controllers'
* `getAirportInfo(airport)` - Returns the details of pilots into or out of a certain airport along with the controllers controlling that airport, the airport argument is a 4 letter ICAO code
* `getPopularAirports()` - Returns a list of the top 10 airports for arriving and departing aircraft
* `getClientDetails(cid)` - Returns the details of a specific pilots flight, where cid is a valid VATSIM cid as an integer

## Tests

  `npm test`

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.