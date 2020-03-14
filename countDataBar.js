let convertRowBar = function(data) {
  
  let alarms = new Map();
  let years = new Set();
  data.forEach(val => {
    years.add(val['Year']);
    if (!alarms.has(val['Neighborhooods'])) {
      alarms.set(val['Neighborhooods'], 0);
    }
    alarms.set(val['Neighborhooods'], alarms.get(val['Neighborhooods']) + val['Number of Alarms']);
  });

  alarms = new Map([...alarms.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10));
  //alarms = new Map([...alarms.entries()].slice(0, 10));

  let series = new Map();
  data.forEach(val => {
   if (alarms.has(val['Neighborhooods'])) {
     if (!series.has(val['Neighborhooods'])) {
       let temp = {};
       temp.name = val['Neighborhooods'];
       temp.total = alarms.get(val['Neighborhooods']);
       series.set(val['Neighborhooods'], temp);
     }
     series.get(val['Neighborhooods'])[val['Year']] = val['Number of Alarms'];
   }
  });
  series.set('columns', [...years]);

  let seriesArr = [...series.values()];
  seriesArr.slice(0, 1).forEach(d => {
    [...years].forEach(r => {
      if (!d.hasOwnProperty(r)) {
        d[r] = 0;
      }
    });
  });

  d3Series = d3.stack()
    .keys([...years])(seriesArr)
    .map(d => (d.forEach(v => v.key = d.key), d))
  d3Series.forEach(d => {
    d.forEach(d2 => {
      if (isNaN(d2[1])) {
        d2[1] = d2[0];
      }
    });
  });
  return [alarms, d3Series];
}
