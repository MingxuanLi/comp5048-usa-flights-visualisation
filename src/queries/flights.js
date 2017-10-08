/**
 * Created by mingxuanli on 5/10/17.
 */

const uniqueAirportPairsQuery = `
    select 
        flights.origin as origin,
        flights.dest as destination,
        count(*) as num_of_flights,
        avg(flights.arr_delay) as avg_arr_delay,
        avg(flights.dep_delay) as avg_dep_delay,
        avg(flights.distance) as avg_distance,
        avg(flights.carrier_delay) as avg_carrier_delay,
        avg(flights.weather_delay) as avg_weather_delay,
        avg(flights.nas_delay) as avg_nas_delay,
        avg(flights.security_delay) as avg_security_delay,
        avg(flights.late_aircraft_delay) as avg_late_aircraft_delay,
        origin_airports.lat as origin_lat,
        origin_airports.lon as origin_lon,
        dest_airports.lat as dest_lat,
        dest_airports.lon as dest_lon
    from flights
    inner join airports as origin_airports on flights.origin = origin_airports.iata
    inner join airports as dest_airports on flights.dest = dest_airports.iata
    where flights.year = ? and 
        flights.month = ? and 
        flights.unique_carrier in ('AA', 'DL', 'WN', 'UA', 'B6')
    group by 
        flights.origin,
        flights.dest;
`;

module.exports = {
    uniqueAirportPairsQuery
};