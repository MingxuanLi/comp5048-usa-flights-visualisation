/**
 * Created by mingxuanli on 5/10/17.
 */

const query = `
    select 
        iata,
        airport,
        city,
        state,
        country,
        lat,
        lon
    from airports;`;

module.exports = {
    query
};