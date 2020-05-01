DROP TABLE IF EXISTS city;
CREATE TABLE city (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(100),
    formatted_query VARCHAR(255),
    latitude VARCHAR(255),
    longitude VARCHAR(255)
);

