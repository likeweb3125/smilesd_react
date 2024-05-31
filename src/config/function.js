
//숫자형 콤마넣기
export function MakeIntComma (intVal){
    intVal *= 1; //숫자형 변경
    const option = {
        maximumFractionDigits: 4 //최대 소수점 자리
    };
    const result = intVal.toLocaleString('ko-KR', option);
        
    return result
}
//숫자형 콤마넣기

//숫자형 콤마지우기
export function RemoveIntComma (val){
    val = val+",";
    let regex = /[^0-9]/g;
    let number = val.replace(regex,'');
  
    return number
}
//숫자형 콤마지우기

//api 에러메시지
// export function errorMsgHandler (error) {  
//     let errorMsg = '';
//     let errorType = '';

//     if(error.hasOwnProperty('message')){
//         errorType = "javascript-api";
//     }

//     if(error.hasOwnProperty('response') && error.response.hasOwnProperty('data')){ // 일반 에러 객체 처리
//         errorType = "custom";
//     }
    
//     if(error.hasOwnProperty('response') && error.response.hasOwnProperty('data') && error.response.data.hasOwnProperty('error')){ // 일반 에러 객체 처리
//         errorType = "express-validator";
//     };

//     if(errorType === "javascript-api"){ // 일반 에러 객체 처리
//         errorMsg = error.message;
//     }else if(errorType === "custom"){ // 일반 에러 객체 처리
//         errorMsg = error.response.data.msg;
//     }else if(errorType === "express-validator"){ // validatior 에러 객체 처리
//         errorMsg = error.response.data.error.errors[0].msg;
//     }else{
//         errorMsg = '알 수 없는 오류가 발생했습니다.';
//     }
//     return errorMsg
// }

//api 에러메시지
export function errorMsgHandler (error) {  
    let errorMsg = '';
    let errorType = '';

    if(error.hasOwnProperty('response') && error.response.hasOwnProperty('data')){ // 일반 에러 객체 처리
        errorType = "custom";
    }
    
    if(error.hasOwnProperty('response') && error.response.hasOwnProperty('data') && error.response.data.hasOwnProperty('error')){ // 일반 에러 객체 처리
        errorType = "express-validator";
    };

    if(errorType === "custom"){ // 일반 에러 객체 처리
        errorMsg = error.response.data.message;
    }else if(errorType === "express-validator"){ // validatior 에러 객체 처리
        errorMsg = error.response.data.error.errors[0].msg;
    }else{
        errorMsg = '알 수 없는 오류가 발생했습니다.';
    }
    return errorMsg
}