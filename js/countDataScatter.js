function convertRow(row, index)
{
  let out = {};
  out['Number of Alarms'] = 0;
  out['Priority'] = 0;
  out['Station Area'] = 0;
  out['Zipcode'] = ' ';
  out['Call Type'] = ' ';
  for(let col in row) {
    switch (col) {
      case 'Number of Alarms':
        out['Number of Alarms'] = +(row[col]);
        break;
      case 'Zipcode of Incident':
        out['Zipcode'] = row[col];
        break;
      case 'Call Type Group':
        out['Call Type'] = row[col];
        break;
      case 'Priority':
        out['Priority'] = +(row[col]);
        break;
      case 'Station Area':
        out['Station Area'] = +(row[col]);
    }
  }
  return out;
}
