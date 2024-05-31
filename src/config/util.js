const util = {
    // // 쿠키 설정
	// setCookie : (name, value, days) => {
    //     var todayDate = new Date();
    
    //     todayDate.setDate(todayDate.getDate() + days);
    //     document.cookie = name + "=" + value + "; path=/; expires=" + todayDate.toGMTString() + ";"
    // },
    
    
    // // 쿠키 조회 
    // getCookie : (name) => {
    //     var x, y;
    //     var val = document.cookie.split(';');
    
    //     for (var i = 0; i < val.length; i++) {
    //         x = val[i].substr(0, val[i].indexOf('='));
    //         y = val[i].substr(val[i].indexOf('=') + 1);
    //         x = x.replace(/^\s+|\s+$/g, ''); // 앞과 뒤의 공백 제거하기
    //         if (x == name) {
    //             return unescape(y); // unescape로 디코딩 후 값 리턴
    //         }
    //     }
    // },

    // 쿠키 설정
    setCookie: (name, value, days) => {
        var todayDate = new Date();
        todayDate.setDate(todayDate.getDate() + days);

        // 배열을 JSON 문자열로 변환하여 저장
        const jsonValue = JSON.stringify(value);
        document.cookie = name + "=" + jsonValue + "; path=/; expires=" + todayDate.toGMTString() + ";"
    },

    // 쿠키 조회 
    getCookie: (name) => {
        var x, y;
        var val = document.cookie.split(';');

        for (var i = 0; i < val.length; i++) {
            x = val[i].substr(0, val[i].indexOf('='));
            y = val[i].substr(val[i].indexOf('=') + 1);
            x = x.replace(/^\s+|\s+$/g, ''); // 앞과 뒤의 공백 제거하기
            if (x == name) {
                // JSON 문자열을 파싱하여 배열로 변환
                return JSON.parse(unescape(y));
            }
        }
    },

}
export default util;