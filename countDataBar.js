let convertRowBar = function(data) {
  // Summing by region to calculate max
  //let agg = new Map();
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
// function convertRowBar(data)
// {
//   let neighborhooods = new Map();
//   let years = new Set();
//   data.forEach(val => {
//     years.add(val['Year']);
//     if (!neighborhooods.has(val['Neighborhooods'])) {
//       neighborhooods.set(val['Neighborhooods'], 0);
//     }
//     neighborhooods.set(val['Neighborhooods'], neighborhooods.get(val['Neighborhooods']) + val['Number of Alarms']);
//   });
//
//   neighborhooods = new Map([...neighborhooods.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10));
//
//   let series = new Map();
//   data.forEach(val => {
//    if (neighborhooods.has(val['Neighborhooods'])) {
//      if (!series.has(val['Neighborhooods'])) {
//        let temp = {};
//        temp.name = val['Neighborhooods'];
//        temp.total = neighborhooods.get(val['Neighborhooods']);
//        series.set(val['Neighborhooods'], temp);
//      }
//      series.get(val['Neighborhooods'])[val['Year']] = val['Number of Alarms'];
//    }
//   });
//   series.set('columns', [...years]);
//
//   let seriesArr = [...series.values()];
//   seriesArr.slice(0, 1).forEach(d => {
//     [...years].forEach(r => {
//       if (!d.hasOwnProperty(r)) {
//         d[r] = 0;
//       }
//     });
//   });
//
//   d3Series = d3.stack()
//     .keys([...years])(seriesArr)
//     .map(d => (d.forEach(v => v.key = d.key), d))
//   d3Series.forEach(d => {
//     d.forEach(d2 => {
//       if (isNaN(d2[1])) {
//         d2[1] = d2[0];
//       }
//     });
//   });
//   return [neighborhooods, d3Series];
//
// }
// function convertRow(data)
// {
//   let keys = data.columns.slice(2);
//
// 	let years   = [...new Set(csv.map(d => d['Call Type Group']))]
// 	let neighborhooods = [...new Set(csv.map(d => d['Neighborhooods - Analysis Boundaries']))]
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
// function convertRowBar(row, index)
// {
//     let out = {};
//     out.priority2 = 0;
//     out.priority3 = 0;
//     out.neighborhooods = ' ';
//     out.callDate ;
//     for(let col in row) {
//       switch (col) {
//         case 'Neighborhooods' :
//           out.neighborhooods = row[col];
//           break;
//         case 'Priority 2' :
//           out.priority2 = +(row[col]);
//           break;
//         case 'Priority 3':
//           out.priority3 = +(row[col]);
//           break;
//         case 'Year' :
//           out.callDate = new Date(row[col]).getFullYear();
//           break;
//       }
//     }
//     return out;
// }
