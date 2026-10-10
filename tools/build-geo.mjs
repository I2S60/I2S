import { geoMercator, geoPath, geoGraticule10 } from 'd3-geo';
import * as topo from 'topojson-client';
import { readFileSync, writeFileSync } from 'node:fs';
const [,, dir, out] = process.argv;
const world = JSON.parse(readFileSync(dir + '/node_modules/world-atlas/countries-50m.json'));
const proj = geoMercator().center([-6, 29]).scale(1750).translate([960, 540])
  .clipExtent([[-1100, -800], [3020, 1880]]);
const path = geoPath(proj).digits(1);
const geoms = world.objects.countries.geometries;
const isMA = g => g.id === '504' || g.id === '732';
const others = geoms.filter(g => !isMA(g)).map(g => ({ name: g.properties.name, d: path(topo.feature(world, g)) })).filter(c => c.d);
const maroc = topo.merge(world, geoms.filter(isMA));
const marocD = path(maroc);
const [[x0, y0], [x1, y1]] = path.bounds(maroc);
const cities = [
  ['Tanger', -5.80, 35.76], ['Rabat', -6.84, 34.02], ['Casablanca', -7.59, 33.57], ['Fès', -5.00, 34.03],
  ['Marrakech', -7.99, 31.63], ['Agadir', -9.60, 30.42], ['Laâyoune', -13.20, 27.15], ['Dakhla', -15.93, 23.70],
].map(([n, lon, lat]) => { const [x, y] = proj([lon, lat]); return { n, x: +x.toFixed(1), y: +y.toFixed(1) }; });
// graticule-free; centroid-ish anchor for the star (north Morocco interior, Moyen Atlas)
const [sx, sy] = proj([-6.3, 32.4]);
const grat = path(geoGraticule10());
const P = (lon, lat) => proj([lon, lat]).map(v => +v.toFixed(1));
const seas = { atl: P(-17.8, 33.2), med: P(-2.2, 36.75) };
writeFileSync(out, JSON.stringify({ grat, seas, others, marocD, bbox: [x0, y0, x1, y1], cities, star: [+sx.toFixed(1), +sy.toFixed(1)] }));
console.log('others', others.length, 'bbox', [x0, y0, x1, y1].map(v => v.toFixed(0)), 'size', JSON.stringify(others).length);
