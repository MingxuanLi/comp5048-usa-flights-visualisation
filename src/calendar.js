const _ = require('lodash');
const mysql = require('mysql');
const fs = require('fs-extra');
const moment = require('moment');

const airportsQuery = require('./queries/airports2');

const selectedAirports = [
    'MIA',
    'SFO',
    'ATL',
    'JFK'
];
const selectedAirport = selectedAirports[3];

let pool;

const connectDbPool = () => {
    pool = mysql.createPool({
        connectionLimit : 10,
        host: 'localhost',
        user: 'root',
        password: 'Password123',
        database: 'flight'
    });
};

const disconnectDbPool = () => {
    pool.end();
};

const queryAndGenerate = async () => {
    connectDbPool();

    let airportFlights = [];

    let flightsFromOrigin = await queryflightsFromAirport(selectedAirport);
    let flightsToOrigin = await queryflightsToAirport(selectedAirport);
    let flights = await queryflightsRelateToAirport(selectedAirport);
    _.each(flightsFromOrigin, function(flightFromOrigin){
        let year = flightFromOrigin.year;
        let month = flightFromOrigin.month;
        let day_of_month = flightFromOrigin.day_of_month;
        let flightToOrigin = _.find(flightsToOrigin, {year: year, month: month, day_of_month: day_of_month});
        let flight = _.find(flights, {year: year, month: month, day_of_month: day_of_month});
        airportFlights.push({
            airport: flightFromOrigin.origin,
            year: year,
            month: month,
            day_of_month: day_of_month,
            num_of_out_flights: flightFromOrigin.num_of_flights,
            num_of_out_delayed_flights: flightFromOrigin.num_of_delayed_flights,
            num_of_in_flights: flightToOrigin.num_of_flights,
            num_of_in_delayed_flights: flightToOrigin.num_of_delayed_flights,
            avg_dep_delay: flightFromOrigin.avg_dep_delay,
            avg_arr_delay: flightToOrigin.avg_arr_delay,
            avg_carrier_delay: flight.avg_carrier_delay,
            avg_weather_delay: flight.avg_weather_delay,
            avg_nas_delay: flight.avg_nas_delay,
            avg_security_delay: flight.avg_security_delay,
            avg_late_aircraft_delay: flight.avg_late_aircraft_delay
        });
    });

    fs.writeJsonSync('visualisation/dataset/performance/airports_' + selectedAirport + '.json', airportFlights);

    disconnectDbPool();
};

const queryflightsFromAirport = (airport) => {
    return new Promise((resolve, reject) => {
        pool.query(
            airportsQuery.flightsFromAirport,
            [airport, airport],
            (error, results, fields) => {
                if(error){
                    reject(error);
                }else{
                    resolve(results);
                }
            }
        )
    });
};

const queryflightsToAirport = (airport) => {
    return new Promise((resolve, reject) => {
        pool.query(
            airportsQuery.flightsToAirport,
            [airport, airport],
            (error, results, fields) => {
                if(error){
                    reject(error);
                }else{
                    resolve(results);
                }
            }
        )
    });
};

const queryflightsRelateToAirport = (airport) => {
    return new Promise((resolve, reject) => {
        pool.query(
            airportsQuery.flightsRelateToAirport,
            [airport, airport],
            (error, results, fields) => {
                if(error){
                    reject(error);
                }else{
                    resolve(results);
                }
            }
        )
    });
};

queryAndGenerate();