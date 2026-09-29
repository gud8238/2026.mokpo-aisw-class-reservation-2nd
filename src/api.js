const endpoint=window.APP_CONFIG?.gasUrl?.trim();
export const configured=Boolean(endpoint);
async function request(params){
  if(!configured) throw new Error('예약 시스템 연결이 아직 설정되지 않았습니다. 관리자에게 문의해 주세요.');
  const url=new URL(endpoint);
  Object.entries(params).forEach(([key,value])=>url.searchParams.set(key,value));
  const response=await fetch(url.toString(),{redirect:'follow'});
  if(!response.ok) throw new Error('예약 정보를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  const result=await response.json();
  if(!result.ok) throw new Error(result.error||'요청을 처리하지 못했습니다.');
  return result;
}
export const getStatus=()=>request({action:'status'});
export const findSchool=school=>request({action:'lookup',school});
// GAS ContentService redirects POST responses; text/plain avoids a CORS preflight.
export async function book(data){
  if(!configured) throw new Error('예약 시스템 연결이 아직 설정되지 않았습니다.');
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data),redirect:'follow'});
  if(!response.ok) throw new Error('신청 결과를 확인하지 못했습니다. 예약 현황을 먼저 조회해 주세요.');
  const result=await response.json();
  if(!result.ok) throw new Error(result.error||'신청할 수 없습니다.');
  return result;
}
