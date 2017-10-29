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
const selectedAirport = selectedAirports[0];

let years = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008];
let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
years = [2000];
months = [1];

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

    let flightsFromOrigin = await queryflightsFromAirport(selectedAirport);
    console.log(flightsFromOrigin.length);

    let flightsToOrigin = await queryflightsToAirport(selectedAirport);
    console.log(flightsToOrigin.length);

    let flights = await queryflightsRelateToAirport(selectedAirport);
    console.log(flights.length);

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