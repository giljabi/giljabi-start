
let gMap;
let gWptArray = [];         //gpx 파일저장시 사용
let gTrksegArray = [];      //gpx 파일저장시 사용
let gTrksegPolyline = [];   //지도위에 그릴 경로
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
    this.dist = isNaN(dist) ? 0.00 : Number(parseFloat(dist.toFixed(2)));  //garmin gpx 포맷에는 없으나 거리정보를 추가해서 사용
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
    const waypoints = readXmlfile.find('wpt');
    $.each(waypoints, function (index) {
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
    return waypoints;
}

function getTrkpt(readXmlfile) {
    const trkpt = readXmlfile.find('trkpt');
    $.each(trkpt, function (index) {
        gTrksegArray.push(new wpt(
            $(this).attr('lat'), $(this).attr('lon'),
            $(this).find('ele'), $(this).find('time').text(), $(this).find('dist').text()));

        gTrksegPolyline.push(new kakao.maps.LatLng(gTrksegArray[index].lat, gTrksegArray[index].lon));

        gBounds.extend(gTrksegPolyline[index]);
    });
    return trkpt;
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
            const waypoints = getWpt(readXmlfile);

            //trkpt는 경로가 여러개 일때 선택적으로 사용하지만 여기서는 고려하지 않고, 모든 경로를 1개로 처리함
            const trkseg = readXmlfile.find('trkseg');

            const trkpt = getTrkpt(readXmlfile);
            $('#gpxOutput').text(`waypoint:${waypoints.length}, trkseg:${trkseg.length}, trkpt:${trkpt.length}`);

            //draw gpx polyline
            drawPolyline(gTrksegPolyline);

            //gpx영역을 전체 화면으로
            gMap.setBounds(gBounds);
        };
        reader.readAsText(file);
    });
}

$(document).ready(function () {
    initMap();
    clickGpxLoadButton();
});
