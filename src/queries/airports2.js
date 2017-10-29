/**
 * Created by mingxuanli on 29/10/17.
 */

const flightsFromAirport = `
select
	flights1.origin,
	flights1.year,
	flights1.month,
	flights1.day_of_month,
	flights1.num_of_flights,
	flights1.avg_dep_delay,
	flights2.num_of_delayed_flights
from	
	(select 
        flights.origin as origin,
        flights.year as year,
        flights.month as month,
        flights.day_of_month as day_of_month,
        count(*) as num_of_flights,
        avg(flights.dep_delay) as avg_dep_delay
    from flights
    where 
        flights.origin = ?
    group by 
        flights.year,
    	flights.month,
    	flights.day_of_month
    ) as flights1
left join
	(select 
		flights.origin as origin,
        flights.year as year,
        flights.month as month,
        flights.day_of_month as day_of_month,
		count(*) as num_of_delayed_flights
    from flights
    where 
        flights.origin = ? and
        flights.dep_delay > 15
    group by 
        flights.year,
    	flights.month,
    	flights.day_of_month
    ) as flights2
on
	flights1.year = flights2.year and
	flights1.month = flights2.month and 
	flights1.day_of_month = flights2.day_of_month
`;

const flightsToAirport = `
select
	flights1.dest,
	flights1.year,
	flights1.month,
	flights1.day_of_month,
	flights1.num_of_flights,
	flights1.avg_arr_delay,
	flights2.num_of_delayed_flights
from	
	(select 
        flights.dest as dest,
        flights.year as year,
        flights.month as month,
        flights.day_of_month as day_of_month,
        count(*) as num_of_flights,
        avg(flights.arr_delay) as avg_arr_delay
    from flights
    where 
        flights.dest = ?
    group by 
        flights.year,
    	flights.month,
    	flights.day_of_month
    ) as flights1
left join
	(select 
		flights.dest as dest,
        flights.year as year,
        flights.month as month,
        flights.day_of_month as day_of_month,
		count(*) as num_of_delayed_flights
    from flights
    where 
        flights.dest = ? and
        flights.arr_delay > 15
    group by 
        flights.year,
    	flights.month,
    	flights.day_of_month
    ) as flights2
on 
	flights1.year = flights2.year and
	flights1.month = flights2.month and 
	flights1.day_of_month = flights2.day_of_month	
`;

const flightsRelateToAirport = `
select 
    flights.year,
    flights.month,
    flights.day_of_month,
    avg(flights.carrier_delay) as avg_carrier_delay,
    avg(flights.weather_delay) as avg_weather_delay,
    avg(flights.nas_delay) as avg_nas_delay,
    avg(flights.security_delay) as avg_security_delay,
    avg(flights.late_aircraft_delay) as avg_late_aircraft_delay
from flights
where 
    flights.origin = ? or
    flights.dest = ?		
group by
    flights.year,
    flights.month,
    flights.day_of_month
`;

module.exports = {
    flightsFromAirport,
    flightsToAirport,
    flightsRelateToAirport
};