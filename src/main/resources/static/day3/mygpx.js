
let gMap;
let gWptArray = [];             //gpx 파일저장시 사용
let gTrksegmentArray = [];      //gpx 파일저장시 사용
let gTrkpointArray = [];        //gpx 파일저장시 사용
let gTrkpointPolyline = [];    //지도위에 그릴 경로
let gBounds = new kakao.maps.LatLngBounds();    //gpx 경로를 그린 후 확대하기 위한 영역정보

function initMap() {
    let mapContainer = document.getElementById('map');
    let mapOption = {
        center: new kakao.maps.LatLng(37.56683546665817, 126.9786607449023),	//지도의 중심위치
        level: 12
    };
    gMap = new kakao.maps.Map(mapContainer, mapOption);
    gMap.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
}

//https://www.topografix.com/GPX/1/1/
function wpt(lat, lon, ele, name, sym) {
    this.lat = Number(parseFloat(lat).toFixed(6)); // toFixed를 사용한 뒤 문자열로 처리
    this.lon = Number(parseFloat(lon).toFixed(6));
    this.ele = isNaN(ele) ? 0.00 : Number(parseFloat(ele).toFixed(2));
    this.name = name;
    this.sym = sym;

}

function trkpt(lat, lon, ele, time, dist) {
    this.lat = Number(parseFloat(lat).toFixed(6));
    this.lon = Number(parseFloat(lon).toFixed(6));
    this.ele = isNaN(ele) ? 0.00 : Number(parseFloat(ele).toFixed(2));
    this.time = time; //trkpt가 저장된 일시
    this.dist = isNaN(dist) ? 0.00 : Number(parseFloat(dist).toFixed(2));  //garmin gpx 포맷에는 없으나 거리정보를 추가해서 사용
}

function drawPolyline(polyline) {
    // 지도에 표시할 선을 생성합니다
    let lineStyle = new kakao.maps.Polyline({
        path: polyline, // 선을 구성하는 좌표배열
        strokeWeight: 5, // 선의 두께
        strokeColor: '#FF0000', // 선의 색깔
        strokeOpacity: 0.7, // 선의 불투명도, 1에서 0 사이의 값이며 0에 가까울수록 투명
        strokeStyle: 'solid' // 선의 스타일
    });
    // 지도에 선을 표시합니다
    lineStyle.setMap(gMap);
}

function getWpt(readXmlfile) {
    $.each(readXmlfile.find('gpx > wpt'), function (index) {
        gWptArray.push(new wpt(
            $(this).attr('lat'), $(this).attr('lon'),
            $(this).find('ele'), $(this).find('name').text(), $(this).find('sym').text()));

        //https://apis.map.kakao.com/web/sample/addMarkerClickEvent/
        //wpt를 infowindow를 이용해서 표기
        var marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(gWptArray[index].lat, gWptArray[index].lon),
            clickable: true
        });
        marker.setMap(gMap);
        let iwContent = `<div style="padding:2px; font-size:12px;">${gWptArray[index].name}</div>`;
        // 인포윈도우를 생성합니다
        var infowindow = new kakao.maps.InfoWindow({
            content : iwContent,
            removable : true
        });
        kakao.maps.event.addListener(marker, 'click', function() {
            // 마커 위에 인포윈도우를 표시합니다
            infowindow.open(gMap, marker);
        });
    });
}

function getTrkseg(readXmlfile) {
    gTrksegmentArray = readXmlfile.find('gpx > trk > trkseg');
}

//이동 경로를 그리기 위한 trkpt 정보를 가져온다.
function getTrkpt(readXmlfile) {
    $.each(readXmlfile.find('gpx > trk > trkseg > trkpt'), function (index) {
        //gpx 정보
        gTrkpointArray.push(new trkpt(
            $(this).attr('lat'), $(this).attr('lon'),
            Number($(this).find('ele').text()),
            $(this).find('time').text(),
            Number($(this).find('dist').text())));

        //지도상에 그려주는 폴리라인 정보
        gTrkpointPolyline.push(new kakao.maps.LatLng(gTrkpointArray[index].lat, gTrkpointArray[index].lon));

        gBounds.extend(gTrkpointPolyline[index]);
    });
}

function setBaseTimeToToday(baseTime) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    baseTime.setFullYear(year, month, day);
    return baseTime;
}


function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function getDistance(fromLat, fromLon, toLat, toLon) {
    let R = 6371e3;
    let dLat = deg2rad(toLat - fromLat);
    let dLon = deg2rad(toLon - fromLon);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(fromLat)) * Math.cos(deg2rad(toLat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;// * 0.922125;    //가민거리와 비교해서 보정
}

//거리에 따른 이동시간을 계산하는 메소드, 거리정보:gTrksegmentArray, 좌표정보: gTrksegPolyline
function getMoveTimeAndDistance() {
    let startTime = setBaseTimeToToday(new Date('2024-01-01T00:00:00Z'));   //시간 초기화
    let speed = Number($('#speed').val());
    $.each(gTrkpointArray, function (index) {
        if (index == 0) { // index > 0 부터 거리 계산
            // index = 0, 초기값 설정
            gTrkpointArray[index].dist = 0;
            gTrkpointArray[index].time = startTime.toISOString();
        } else {
            let distance = getDistance(
                gTrkpointArray[index - 1].lat, gTrkpointArray[index - 1].lon,
                gTrkpointArray[index].lat, gTrkpointArray[index].lon);
            let duration = (distance / (speed * 1000 / 3600)); // m/s로 변환
            startTime.setSeconds(startTime.getSeconds() + duration);

            gTrkpointArray[index].dist = Number((Number(gTrkpointArray[index - 1].dist || 0) + distance).toFixed(2));
            gTrkpointArray[index].time = startTime.toISOString();
            //console.log(index + ', ' + distance + ',' + duration + ',' + gTrkpointArray[index].time + ', '+ gTrkpointArray[index].dist +','+ gTrkpointArray[index].lat);
        }
    });
}

function clickGpxLoadButton() {
    $('#loadButton').on('click', function () {
        const file = $('#fileUpload')[0].files[0];

        if (!file) {
            alert('Please select a GPX file first.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const fileContent = event.target.result;
            let readXmlfile = $($.parseXML(fileContent.replace(/&/g, '&amp;')));
            getWpt(readXmlfile);

            //trkpt는 경로가 여러개 일때 선택적으로 사용하지만 여기서는 고려하지 않고, 모든 경로를 1개로 처리함
            getTrkseg(readXmlfile);

            getTrkpt(readXmlfile);

            //gpx 파일정보
            $('#gpxOutput').text(`waypoint:${gWptArray.length}, trkseg:${gTrksegmentArray.length}, trkpt:${gTrkpointArray.length}`);

            //draw gpx polyline
            drawPolyline(gTrkpointPolyline);

            //gpx영역을 전체 화면으로
            gMap.setBounds(gBounds);
        };
        reader.readAsText(file);
    });
}

function clickGpxSaveButton() {
    $('#saveButton').on('click', function () {
        getMoveTimeAndDistance();   //gpx 저장에 필요한 정보

        const fileName = $('#fileUpload')[0].files[0].name;  //필요시 경로명을 입력받아서 사용
        const gpxName = fileName.split('.');
        const gpxFileData = makeGpxData(gpxName[0], Number($('#speed').val()), gWptArray, gTrkpointArray);

        saveAs(new Blob([gpxFileData], {
            type: "application/vnd.garmin.tcx+xml"
        }), gpxName[0] + '.gpx'); //지금은 gpx만 사용

        console.log('gpx file saved')
    });
}

$(document).ready(function () {
    initMap();
    clickGpxLoadButton();
    clickGpxSaveButton();
});
