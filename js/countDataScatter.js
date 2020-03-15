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
  return out;
}
