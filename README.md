# VATSIM Data Handler [![Build Status](https://travis-ci.org/hcphoon01/VATSIM-Data-Handler.svg?branch=master)](https://travis-ci.org/hcphoon01/VATSIM-Data-Handler) [![Coverage Status](https://coveralls.io/repos/github/hcphoon01/VATSIM-Data-Handler/badge.svg?branch=master)](https://coveralls.io/github/hcphoon01/VATSIM-Data-Handler?branch=master)
=========

A data handler for the VATSIM status system coded in JavaScript

## Installation

  `npm install vatsim-data-handler`

## Usage

  ```javascript
  const DataHandler = require('vatsim-data-handler');
  const handler = new DataHandler();

  console.log(handler.getClientCount());
  ```
  This would log the number of clients connected to the VATSIM network

## Available methods

* `getClientCount()` - Returns the number of clients connected to the VATSIM network
* `getPilotCount()` - Returns the number of pilots connected to the VATSIM network
* `getControllerCount()` - Returns the number of controllers connected to the VATSIM network
* `getAirportInfo(airport)` - Returns the details of pilots into or out of a certain airport along with the controllers controlling that airport, the airport argument is a 4 letter ICAO code
* `getPopularAirports()` - Returns a list of the top 10 airports for arriving and departing aircraft


## Tests

  `npm test`

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.