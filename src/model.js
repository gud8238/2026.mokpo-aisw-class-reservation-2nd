export const YEAR=2026;
export const AVAILABLE=['10-14','10-21','10-22','10-26','10-28','10-29','11-04','11-05','11-09','11-10','11-12','11-16','11-17','11-18','11-19','11-24','11-25','11-26','12-01','12-02'].map(x=>`${YEAR}-${x}`);
export const SLOTS=['12교시(09:00-10:30)','34교시(10:50-12:10)'];
export const PROGRAMS=['나의 작은 픽셀친구 사이버파이','딜라이텍스 3D 게임개발자'];
export const normalizeDate=value=>{
  if(value instanceof Date) return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;
  const text=String(value??'').trim();
  let m=text.match(/^(\d{4})[-./년 ]+(\d{1,2})[-./월 ]+(\d{1,2})/);
  if(m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  m=text.match(/^(\d{1,2})[-./월 ]+(\d{1,2})/);
  return m?`${YEAR}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`:'';
};
export const calendarCells=(year,month)=>{
  const first=new Date(year,month-1,1).getDay();
  const days=new Date(year,month,0).getDate();
  return [...Array(first).fill(null),...Array.from({length:days},(_,i)=>`${year}-${String(month).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`)];
};
export const status=(date,booked)=>!AVAILABLE.includes(date)?'closed':booked.includes(date)?'booked':'open';
