// function convertRow(data)
// {
//   var keys = data.columns.slice(2);
//
// 	var callType   = [...new Set(csv.map(d => d['Call Type Group']))]
// 	var neighborhooods = [...new Set(csv.map(d => d['Neighborhooods - Analysis Boundaries']))]
//
// }

// //to convert data from csv file to required format
// // function convertRow(row, index)
// // {
// //   let out = {};
// //   out.numofalarms = 0;
// //   out.Priority =0;
// //   for(let col in row) {
// //     switch (col) {
// //       case 'Number of Alarms':
// //         out.numofalarms = +(row[col]);
// //         break;
// //       case 'Neighborhooods - Analysis Boundaries':
// //         out[col] = row[col];
// //         break;
// //       case 'Priority':
// //         out.Priority = +(row[col]);
// //         break;
// //       }
// //   }
// //   return out;
// // }
//
function convertRow(data)
{
  //summing up data
  //let agg = new Map();
  let alarms = new Map();
  let priority = new Set();
  let callType = new Set();
  data.forEach(val => {
    priority.add(val['Priority']);
    //callType.add(val['Call Type Group']);
    if (!alarms.has(val['Neighborhooods - Analysis Boundaries'])) {
      alarms.set(val['Neighborhooods - Analysis Boundaries'], 0);
    }
    alarms.set(val['Neighborhooods - Analysis Boundaries'], (alarms.get(val['Neighborhooods - Analysis Boundaries']) + val['Number of Alarms']));
  });

  alarms = new Map([...alarms.entries()].sort((a, b) => b[0] - a[0]));

  let series = new Map();
  data.forEach(val => {
   if (alarms.has(val['Neighborhooods - Analysis Boundaries'])) {
     if (!series.has(val['Neighborhooods - Analysis Boundaries'])) {
       let temp = {};
       temp.name = val['Neighborhooods - Analysis Boundaries'];
       temp.total = alarms.get(val['Neighborhooods - Analysis Boundaries']);
       series.set(val['Neighborhooods - Analysis Boundaries'], temp);
     }
     series.get(val['Neighborhooods - Analysis Boundaries'])[val['Priority']] = val['Number of Alarms'];
   }
  });
  series.set('columns', [...priority]); //[...callType]);

  let seriesArr = [...series.values()];
  seriesArr.slice(0, 1).forEach(d => {
    [...priority].forEach(r => {
      if (!d.hasOwnProperty(r)) {
        d[r] = 0;
      }
    });
  });

  d3Series = d3.stack()
    .keys([...priority])(seriesArr)
    .map(d => (d.forEach(v => v.key = d.key), d))
  d3Series.forEach(d => {
    d.forEach(d2 => {
      if (isNaN(d2[1])) {
        d2[1] = d2[0];
      }
    });
  });
  return [alarms, series];
}
