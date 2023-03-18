import { differenceInMinutes } from 'date-fns';

/**
* Get the different between two hours in 'HH:mm' format
*/
export function getHourDifference(ending, starting) {
  if(ending && starting) {
    const start = `1970-01-01T${starting}:00.000Z`;
    const end = `1970-01-01T${ending}:00.000Z`;
    const diff = differenceInMinutes(new Date(end), new Date(start));
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
  
    return `${hours > 9 ? hours : '0' + hours}:${minutes > 9 ? minutes : '0' + minutes}`;
  } else {
    return '00:00'
  }
}