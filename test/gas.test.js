import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function fixture(){
  const results=[['연번','선택날짜','요일','학교명','학년-반','학생수','수업시간','프로그램 ','응답일시','신청교사','신청교사 연락처']];
  const program=[['','','','','','','학교들'],['','','','','','','목포임성초']];
  const make=rows=>({getLastRow:()=>rows.length,getRange:(row,col,height=1)=>({getValues:()=>rows.slice(row-1,row-1+height).map(r=>Array.from({length:col===7?1:12},(_,i)=>r[col-1+i]??'')),getValue:()=>rows[row-1]?.[col-1]??'',setValue:value=>{rows[row-1][col-1]=value}}),appendRow:r=>rows.push(r)});
  const sheets={results:make(results),program:make(program)};
  let locked=false;
  const context={SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:name=>sheets[name]}),flush:()=>{}},PropertiesService:{getScriptProperties:()=>({getProperty:()=>null})},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({text,setMimeType(){return this}})},LockService:{getScriptLock:()=>({tryLock:()=>{if(locked)return false;locked=true;return true},hasLock:()=>locked,releaseLock:()=>{locked=false}})},Utilities:{formatDate:(d)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`},Date,JSON,Number,String,Object,Error};
  vm.createContext(context);vm.runInContext(readFileSync('gas/Code.gs','utf8'),context);
  return {context,results};
}
test('GAS writes existing columns plus classroom and rejects duplicate day',()=>{
  const {context,results}=fixture();
  const input={date:'2026-10-14',school:'목포임성초',gradeClass:'5학년 2반',studentCount:25,slot:'12교시(09:00-10:30)',program:'나의 작은 픽셀친구 사이버파이',teacher:'김교사',phone:'010-1234-5678',classroom:'5-2 교실'};
  const post=()=>JSON.parse(context.doPost({postData:{contents:JSON.stringify(input)}}).text);
  assert.equal(post().ok,true);assert.equal(results[0][11],'교실');assert.equal(results[1][1],'2026-10-14');assert.equal(results[1][11],'5-2 교실');
  assert.match(post().error,/마감/);assert.equal(results.length,2);
  const status=JSON.parse(context.doGet({parameter:{action:'status'}}).text);
  assert.deepEqual(Array.from(status.booked),['2026-10-14']);
  const lookup=JSON.parse(context.doGet({parameter:{action:'lookup',school:'목포임성초'}}).text);
  assert.equal(lookup.reservations.length,1);assert.equal(JSON.stringify(lookup).includes('010-1234'),false);
});
test('GAS rejects unavailable dates and unknown schools',()=>{
  const {context,results}=fixture();
  const post=input=>JSON.parse(context.doPost({postData:{contents:JSON.stringify(input)}}).text);
  assert.equal(post({date:'2026-10-15'}).ok,false);
  assert.equal(results.length,1);
});
