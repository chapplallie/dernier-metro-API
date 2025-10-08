-- Seed stations
INSERT INTO stations (name) VALUES ('Chatelet'), ('Nation'), ('La Défense');

-- Seed headways (example: Chatelet station, 3 minutes)
INSERT INTO headways (station_id, minutes)
SELECT id, 3 FROM stations WHERE name = 'Chatelet';

-- Seed last metro (example: Chatelet station, 01:10)
INSERT INTO last_metro (station_id, departed_at)
SELECT id, '01:10' FROM stations WHERE name = 'Chatelet';
