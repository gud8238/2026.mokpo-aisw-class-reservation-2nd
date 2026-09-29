/** Bind this script to the source Google Sheet, then deploy as a Web app.
 * Execute as: Me; access: Anyone. Set SCRIPT_SPREADSHEET_ID if standalone.
 */
var YEAR = 2026;
var OPEN_DATES = ['10-14','10-21','10-22','10-26','10-28','10-29','11-04','11-05','11-09','11-10','11-12','11-16','11-17','11-18','11-19','11-24','11-25','11-26','12-01','12-02'].map(function(day){return YEAR+'-'+day;});
var SLOTS = ['12교시(09:00-10:30)','34교시(10:50-12:10)'];
var PROGRAMS = ['나의 작은 픽셀친구 사이버파이','딜라이텍스 3D 게임개발자'];
var HEADERS = ['연번','선택날짜','요일','학교명','학년-반','학생수','수업시간','프로그램 ','응답일시','신청교사','신청교사 연락처','교실'];

function sheet_(){
  var id=PropertiesService.getScriptProperties().getProperty('SCRIPT_SPREADSHEET_ID');
  return id?SpreadsheetApp.openById(id):SpreadsheetApp.getActiveSpreadsheet();
}
function json_(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
function clean_(value){return String(value==null?'':value).trim().replace(/^[=+\-@\t\r]/,'\u0027$&');}
function date_(value){
  if(Object.prototype.toString.call(value)==='[object Date]'&&!isNaN(value.getTime())) return Utilities.formatDate(value,'Asia/Seoul','yyyy-MM-dd');
  var text=String(value==null?'':value).trim();
  var match=text.match(/^(\d{4})[-./년 ]+(\d{1,2})[-./월 ]+(\d{1,2})/);
  if(match)return match[1]+'-'+('0'+match[2]).slice(-2)+'-'+('0'+match[3]).slice(-2);
  match=text.match(/^(\d{1,2})[-./월 ]+(\d{1,2})/);
  return match?YEAR+'-'+('0'+match[1]).slice(-2)+'-'+('0'+match[2]).slice(-2):'';
}
function textField_(value){
  // Sheets may interpret a class number such as 5-1 as May 1.
  if(Object.prototype.toString.call(value)==='[object Date]'&&!isNaN(value.getTime()))return Utilities.formatDate(value,'Asia/Seoul','M-d');
  return String(value==null?'':value);
}
function schools_(){var sheet=sheet_().getSheetByName('program');if(!sheet)throw Error('program 탭이 없습니다.');return sheet.getRange(2,7,Math.max(1,sheet.getLastRow()-1),1).getValues().map(function(row){return String(row[0]||'').trim();}).filter(Boolean);}
function rows_(){var sheet=sheet_().getSheetByName('results');if(!sheet)throw Error('results 탭이 없습니다.');var count=sheet.getLastRow();return count>1?sheet.getRange(2,1,count-1,12).getValues():[];}
function doGet(e){try{var action=(e&&e.parameter&&e.parameter.action)||'status';if(action==='status')return json_({ok:true,booked:rows_().map(function(r){return date_(r[1]);}).filter(Boolean),schools:schools_()});if(action==='lookup'){var school=String(e.parameter.school||'').trim();if(!school||school.length>80)throw Error('학교명을 확인해 주세요.');var reservations=rows_().filter(function(r){return String(r[3]||'').trim()===school;}).map(function(r){return {date:date_(r[1]),school:String(r[3]),gradeClass:textField_(r[4]),studentCount:r[5],slot:String(r[6]),program:String(r[7]),classroom:textField_(r[11])};});return json_({ok:true,reservations:reservations});}throw Error('지원하지 않는 요청입니다.');}catch(err){return json_({ok:false,error:String(err.message||err)});}}
function doPost(e){var lock=LockService.getScriptLock();try{var input=JSON.parse(e.postData.contents||'{}');if(!lock.tryLock(20000))throw Error('신청이 몰리고 있습니다. 잠시 후 다시 시도해 주세요.');var date=date_(input.date);if(OPEN_DATES.indexOf(date)<0)throw Error('신청 가능한 날짜가 아닙니다.');if(rows_().some(function(r){return date_(r[1])===date;}))throw Error('이미 신청이 마감된 날짜입니다. 다른 날짜를 선택해 주세요.');var school=String(input.school||'').trim();if(schools_().indexOf(school)<0)throw Error('학교 목록에서 학교를 선택해 주세요.');if(SLOTS.indexOf(input.slot)<0||PROGRAMS.indexOf(input.program)<0)throw Error('수업시간 또는 프로그램을 확인해 주세요.');var count=Number(input.studentCount);if(!Number.isInteger(count)||count<1||count>50)throw Error('학생 수를 1~50명으로 입력해 주세요.');['gradeClass','teacher','phone','classroom'].forEach(function(key){if(!String(input[key]||'').trim()||String(input[key]).length>100)throw Error('신청 정보를 확인해 주세요.');});if(!/^0[0-9-]{8,14}$/.test(String(input.phone)))throw Error('연락처를 확인해 주세요.');var sheet=sheet_().getSheetByName('results');if(!sheet)throw Error('results 탭이 없습니다.');if(sheet.getRange(1,12).getValue()!=='교실')sheet.getRange(1,12).setValue('교실');var nextRow=sheet.getLastRow()+1;var row=[nextRow-1,date,['일','월','화','수','목','금','토'][new Date(date+'T12:00:00+09:00').getDay()]+'요일',clean_(school),clean_(input.gradeClass),count,input.slot,input.program,new Date(),clean_(input.teacher),clean_(input.phone),clean_(input.classroom)];sheet.getRange(nextRow,5).setNumberFormat('@');sheet.getRange(nextRow,12).setNumberFormat('@');sheet.getRange(nextRow,1,1,12).setValues([row]);SpreadsheetApp.flush();return json_({ok:true,date:date});}catch(err){return json_({ok:false,error:String(err.message||err)});}finally{if(lock.hasLock())lock.releaseLock();}}
