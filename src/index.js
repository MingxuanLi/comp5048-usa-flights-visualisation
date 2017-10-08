const _ = require('lodash');
const mysql = require('mysql');
const fs = require('fs-extra');

const airports = require('./queries/airports');
const flights = require('./queries/flights');

let year = 2008;
const monthRange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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

    let airports = await queryAirports();
    fs.writeJsonSync('visualisation/dataset/airports/airports.json', airports);

    let operationArrs = [];
    monthRange.forEach(async (month) => {
        operationArrs.push(uniqueAirportPairsQuery(year, month));
    });
    let result = await Promise.all(operationArrs);
    result.forEach((flightData, index) => {
        fs.writeJsonSync('visualisation/dataset/flights/flights_' + year + '_' + (index + 1) + '.json', flightData);

        let airportsData = [];
        flightData.forEach((flight) => {
            let origin = _.find(airportsData, {iata: flight.origin});
            if(origin){
                origin.num_of_flights += flight.num_of_flights;
            }else{
                airportsData.push({
                    iata: flight.origin,
                    num_of_flights: flight.num_of_flights
                });
            }
            let dest = _.find(airportsData, {iata: flight.destination});
            if(dest){
                dest.num_of_flights += flight.num_of_flights;
            }else{
                airportsData.push({
                    iata: flight.destination,
                    num_of_flights: flight.num_of_flights
                });
            }
        });
        fs.writeJsonSync('visualisation/dataset/airports/airports_' + year + '_' + (index + 1) + '.json', airportsData);
    });

    disconnectDbPool();
};

const queryAirports = () => {
    return new Promise((resolve, reject) => {
        pool.query(airports.query,  function (error, results, fields){
            if(error){
                reject(error);
            }else{
                resolve(results);
            }
        });
    });
};

const uniqueAirportPairsQuery = (year, month) => {
    return new Promise((resolve, reject) => {
        pool.query(flights.uniqueAirportPairsQuery, [year, month], function (error, results, fields){
            if(error){
                reject(error);
            }else{
                resolve(results);
            }
        });
    });
};

queryAndGenerate();