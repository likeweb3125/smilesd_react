const api_uri = "https://www.event-invitation.co.kr:446";


exports.enum_api_uri = {
    api_uri: `${api_uri}`,

    // 공통 ------------------------------------------
    //로그인
    login: `${api_uri}/v1/arko/login`,

    // 관리자단 ------------------------------------------
    //이벤트
    event_list: `${api_uri}/v1/arko/eventList`,
    event_ex: `${api_uri}/v1/arko/eventListEx`,

}