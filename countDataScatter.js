function convertRow(row, index)
{
  let out = {};
  out.numofalarms = 0;
  out.priority = 0;
  out.stationArea = 0;
  out.zipcode = ' ';
  out.callType = ' ';
  for(let col in row) {
    switch (col) {
      case 'Number of Alarms':
        out.numofalarms = +(row[col]);
        break;
      case 'Zipcode of Incident':
        out.zipcode = row[col];
        break;
      case 'Call Type Group':
        out.callType = row[col];
        break;
      case 'Priority':
        out.priority = +(row[col]);
        break;
      case 'Station Area':
        out.stationArea = +(row[col]);
    }
  }
  // [...data].forEach( function(d) {
  //   out['Priority'] = +d['Priority'];
  //    out['Number of Alarms'] = +d['Number of Alarms'];
  //    out['Station Area'] = +d['Station Area'];
  //    out['Zipcode of Incident'] = d['Zipcode of Incident'];
  //    out['Call Type Group'] = d['Call Type Group'];
     //return out;
  //});
  return out;
}
