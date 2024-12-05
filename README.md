
# 길잡이 시작하기...

1. Project 만들기
2. 카카오맵 API key
3. 카카오맵 올리기
4. gpx파일 구조
5. gpx파일을 지도에 올리기
6. gpx파일 저장하기
7. waypoint...


## Day 1

## 1. Project 만들기
### 1.1 기본 프로젝트 설정
* giljabi 프로젝트는 spring boot 2.6.x를 사용합니다. 하지만 Spring boot 프로젝트는 항상 최신 버전으로 만들기 때문에 버전은 프로젝트 생성 후 변경할 예정이므로 기본값으로 나오는 버전을 선택합니다.
* lombok, Spring web(tomcat), DB(postgresql)

![img.png](docs/images/day1/1-new-project.png)
![img.png](docs/images/day1/1-new-project-springboot.png)


### 1.2 디렉토리 구조

![img.png](docs/images/day1/1-new-project-tree.png)

* docs: 각종 문서 및 그림파일들, 필요시 생성
* src: source 파일
* pom.xml:  POM(Project Object Model)은 Apache Maven에서 사용하는 XML 형식의 프로젝트 설정 파일
* README.md: 프로젝트 설명 문서 

### 1.3 pom.xml 수정
* JDK: 11
* Spring boot: 2.6.1
* 현재 사용하지 않는 부분은 삭제하고 위 2개만 수정하고 "maven project reload"합니다.

![img.png](docs/images/day1/1-new-springboot-version.png)


### 1.4 index.html 작성
* src/main/resources/static/index.html 작성
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>길잡이 시작</title>
</head>
<body>
Hello, Giljabi.
</body>
</html>
```

### 1.5 WAS 실행확인

![img_1.png](docs/images/day1/1-new-run-project.png)
![img.png](docs/images/day1/1-new-index.png)


```text
...
2024-12-02 09:54:53.015  INFO 65404 --- [           main] o.s.b.a.w.s.WelcomePageHandlerMapping    : Adding welcome page: class path resource [static/index.html]
2024-12-02 09:54:53.091  INFO 65404 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2024-12-02 09:54:53.101  INFO 65404 --- [           main] c.e.g.GiljabiStartApplication            : Started GiljabiStartApplication in 1.499 seconds (JVM running for 4.492)
```

## 2. 카카오맵 API key
### 2.1 애플리케이션 추가
* https://developers.kakao.com/console/app

![img_1.png](docs/images/day1/2-kakao-app.png)


### 2.2 앱 키 
* 앱선택 후 왼쪽에 "앱 키"를 보면 키가 생성되어 있음을 볼 수 있습니다. 웹에서 사용하는 것은 "JavaScript키"입니다.

![img.png](docs/images/day1/2-kakao-appkey.png)


### 2.3 플랫폼 등록
* 앱키 아래에 있는 "플랫폼"을 등록해야 사용할 수 있습니다.
* "웹플랫폼 등록"을 합니다. 우리가 사용하는 웹플랫폼에서 접속하는 도메인은 localhost(127.0.0.1)입니다.
* 여기에 등록된 도메인서만 앱키를 사용해서 접속 할 수 있습니다.

* ![img.png](docs/images/day1/2-kakao-platform.png)




## 3. 카카오맵에 gpx 올리기
### 3.1 웹화면
* 카카오맵을 사용하려면 javascript에 앱키를 넣어서 사용하며, jquery를 함께 사용합니다.
* src/main/resources/static/day1/mygpx.html
* gpx 파일업로드를 위해 bootstrap파일, 버튼을 반응형에 맞게
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <title>지도 생성하기</title>
    <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=your_appkey"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
    <link href="/css/mygpx.css" rel="stylesheet">
    <script type="text/javascript" src="/js/mygpx.js"></script>
</head>
<body>
<div id="map"></div>
<div class="container text-center mt-3">
    <input type="file" class="form-control w-50 mx-auto" id="fileUpload" accept=".gpx" />
    <button class="btn btn-primary mt-2 w-50" id="loadButton">Load GPX File</button>
</div>

<!-- GPX Data Output -->
<div class="container mt-4">
    <h5>GPX Data:</h5>
    <pre id="gpxOutput" style="background: #f8f9fa; padding: 1rem; border: 1px solid #ddd;"></pre>
</div>
</body>
</html>
```

* src/main/resources/static/day1/mygpx.js mygpx.html에서 사용할 javascript를 함께 작성합니다.
```javascript

let gMap;

function initMap() {
    let mapContainer = document.getElementById('map');
    let mapOption = {
        center: new kakao.maps.LatLng(37.56683546665817, 126.9786607449023),	//지도의 중심위치
        level: 12
    };
    gMap = new kakao.maps.Map(mapContainer, mapOption);
    gMap.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
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
            const waypoints = readXmlfile.find('wpt');
            const trkseg = readXmlfile.find('trkseg');
            const trkpt = readXmlfile.find('trkpt');

            $('#gpxOutput').text(`waypoint:${waypoints.length}, 
            trkseg:${trkseg.length}, trkpt:${trkpt.length}`);
        };
        reader.readAsText(file);
    });
}

$(document).ready(function () {
    initMap();
    clickGpxLoadButton();
});
```

* src/main/resources/static/day1/mygpx.css
```css
html, body {
    width: 100%; /* 부모 요소의 높이를 명시적으로 설정 */
    height: 600px; /* 부모 요소의 높이를 명시적으로 설정 */
    margin: 0; /* 기본 여백 제거 */
}

#map {
    width: 100%; /* 화면 너비 전체 */
    height: 70%; /* 부모 요소를 기준으로 100% 설정 */
    background-color: lightblue;
}
```

![img.png](docs/images/day1/2-kakao-mygpx.png)


## Day2

## 4. gpx 오브젝트
### 4.1 GPX 1.1 Schema Documentation(https://www.topografix.com/GPX/1/1/)
* 구성요소
```
Element: gpx
Complex Type: gpxType
Complex Type: metadataType
Complex Type: wptType
Complex Type: rteType
Complex Type: trkType
Complex Type: extensionsType
Complex Type: trksegType
Complex Type: copyrightType
Complex Type: linkType
Complex Type: emailType
Complex Type: personType
Complex Type: ptType
Complex Type: ptsegType
Complex Type: boundsType
Simple Type: latitudeType
Simple Type: longitudeType
Simple Type: degreesType
Simple Type: fixType
Simple Type: dgpsStationType
```

* 실제 필요한 구성요소 예제
```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="giljabi" version="1.1"
 xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/11.xsd"
 xmlns:ns3="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
 xmlns="http://www.topografix.com/GPX/1/1"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="http://www.garmin.com/xmlschemas/GpxExtensions/v3">
<metadata>
    <name>hwaaksan</name>
    <link href="http://www.giljabi.kr" />
    <desc>giljabi</desc>
    <copyright>giljabi.kr</copyright>
    <speed>2</speed>
    <time>2024-05-29T00:00:00.000Z</time>
</metadata>
<wpt lat="37.957928" lon="127.472581">
    <name>들머리</name>
    <sym>Generic</sym>
</wpt>
<wpt lat="37.958195" lon="127.472373">
    <name>날머리</name>
    <sym>Generic</sym>
</wpt>
<trk>
    <trkseg>
        <trkpt lat="37.957961" lon="127.472555">
            <ele>256</ele>
            <time>2024-05-29T00:00:00.000Z</time>
            <dist>0</dist>
        </trkpt>
        <trkpt lat="37.957961" lon="127.472569">
            <ele>254</ele>
            <time>2024-05-29T00:00:02.000Z</time>
            <dist>1.23</dist>
        </trkpt>
    </trkseg>
</trk>
</gpx>
```

### 4.2 필수요소를 처리하기 위한 javascript object 정의
* waypoint
```javascript
function wpt(lat, lon, ele, name, sym) {
    this.lat = Number(parseFloat(lat).toFixed(6)); // toFixed를 사용한 뒤 문자열로 처리
    this.lon = Number(parseFloat(lon).toFixed(6));
    this.ele = isNaN(ele) ? 0.00 : Number(parseFloat(ele).toFixed(2));
    this.name = name;
    this.sym = sym;
}
```

* trkpt object
```javascript
function trkpt(lat, lon, ele, time, dist) {
    this.lat = Number(parseFloat(lat).toFixed(6)); //소수점 이하 6자리사용, 정밀도가 더 높아도 데이터만 크고 이득이 없음
    this.lon = Number(parseFloat(lon).toFixed(6));
    this.ele = isNaN(ele) ? 0.00 : Number(parseFloat(ele).toFixed(2));
    this.time = time;
    this.dist = isNaN(dist) ? 0.00 : Number(parseFloat(dist.toFixed(2)));  //garmin gpx 포맷에는 없으나 거리정보를 추가해서 사용
}
```


## Day3

## 5. gpx save
* gpx 파일에서는 위치정보는 필수이고, 높이, 시간은 선택, 거리(dist)는 추가정보입니다.
* 각 포인트간의 거리, 이동속도를 이용하여 데이터를 만들고 gpx파일로 저장합니다.

### 5.1 거리계산
* 전체 소요시간을 계산하려면 경로에 있는 포인트간의 거리를 알아야 합니다.
* gpt에서 알려준 vincentyDistance, getDistance를 이용하여 마라톤 코스를 비교하면 거리차이는 무시해도 될 수준이므로 간편한 공식을 사용합니다.
  서울마라톤 풀코스(trkpt:4717개)를 기준으로 28.8정도 차이가 나는데 이는 0.07% 차이입니다. 어느것도 완전한것은 없기에 간단한 공식(getDistance)을 사용합니다.

| vincentyDistance | getDistance       |
|------------------|-------------------|
| 42231.11934530892 | 42202.23066668159 |

```javascript
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function getDistance(fromPoint, toPoint) {
    let R = 6371e3;
    let dLat = deg2rad(toPoint.getLat() - fromPoint.getLat());
    let dLon = deg2rad(toPoint.getLng() - fromPoint.getLng());
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(fromPoint.getLat())) * Math.cos(deg2rad(toPoint.getLat())) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;// * 0.922125;    //가민거리와 비교해서 보정
}

//정확도가 높다는데....
function vincentyDistance(fromPoint, toPoint) {
    // 동일한 지점인지 확인
    if (fromPoint.getLat() === toPoint.getLat() && fromPoint.getLng() === toPoint.getLng())
        return 0; // 동일한 지점이면 거리 0 반환

    const a = 6378137.0; // WGS-84 장축 반지름 (m)
    const f = 1 / 298.257223563; // 편평률
    const b = a * (1 - f); // 단축 반지름

    const φ1 = (fromPoint.getLat() * Math.PI) / 180;
    const φ2 = (toPoint.getLat() * Math.PI) / 180;
    const L = ((toPoint.getLng() - fromPoint.getLng()) * Math.PI) / 180;

    let U1 = Math.atan((1 - f) * Math.tan(φ1));
    let U2 = Math.atan((1 - f) * Math.tan(φ2));

    let sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
    let sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

    let λ = L, λ_prev, iterations = 0, sinσ, cosσ, σ, sinα, cos2α, cos2σm, C;

    do {
        let sinλ = Math.sin(λ), cosλ = Math.cos(λ);
        sinσ = Math.sqrt(
            Math.pow(cosU2 * sinλ, 2) +
            Math.pow(cosU1 * sinU2 - sinU1 * cosU2 * cosλ, 2)
        );
        cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
        σ = Math.atan2(sinσ, cosσ);
        sinα = (cosU1 * cosU2 * sinλ) / sinσ;
        cos2α = 1 - Math.pow(sinα, 2);
        cos2σm = cosσ - (2 * sinU1 * sinU2) / cos2α;

        C = (f / 16) * cos2α * (4 + f * (4 - 3 * cos2α));
        λ_prev = λ;
        λ = L + (1 - C) * f * sinα * (σ + C * sinσ * (cos2σm + C * cosσ * (-1 + 2 * Math.pow(cos2σm, 2))));
        iterations++;
    } while (Math.abs(λ - λ_prev) > 1e-12 && iterations < 200);

    if (iterations >= 200) {
        throw new Error("Formula failed to converge");
    }

    let u2 = cos2α * (Math.pow(a, 2) - Math.pow(b, 2)) / Math.pow(b, 2);
    let A = 1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
    let B = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
    let Δσ = B * sinσ * (cos2σm + (B / 4) * (cosσ * (-1 + 2 * Math.pow(cos2σm, 2)) -
        (B / 6) * cos2σm * (-3 + 4 * Math.pow(sinσ, 2)) * (-3 + 4 * Math.pow(cos2σm, 2))));

    let s = b * A * (σ - Δσ);
    return s; // Distance in meters
}
```

### 5.2 시간 계산
* 거리를 알면 이동속도를 이용하여 각 경로마다 예상시간을 계산할 수 있습니다.
```javascript
function getMoveTimeAndDistance() {
    let startTime = setBaseTimeToToday(new Date('2024-01-01T00:00:00Z'));   //시간 초기화
    let speed = Number($('#speed').val());
    $.each(gTrkpointArray, function (index) {
        if (index == 0) { // index > 0 부터 거리 계산
            // index = 0, 초기값 설정
            gTrkpointArray[index].dist = 0;
            gTrkpointArray[index].time = startTime.toISOString();
        } else {
            let distance = getDistance(gTrkpointArray[index - 1].lat, gTrkpointArray[index - 1].lon,
                gTrkpointArray[index].lat, gTrkpointArray[index].lon);
            //let distance = getDistance(gTrkpointPolyline[index - 1], gTrkpointPolyline[index]);
            let duration = (distance / (speed * 1000 / 3600)); // m/s로 변환
            startTime.setSeconds(startTime.getSeconds() + duration);

            gTrkpointArray[index].dist = Number((Number(gTrkpointArray[index - 1].dist || 0) + distance).toFixed(2));
            gTrkpointArray[index].time = startTime.toISOString();
            //console.log(index + ', ' + distance + ',' + duration + ',' + gTrkpointArray[index].time + ', '+ gTrkpointArray[index].dist +','+ gTrkpointArray[index].lat);
        }
    });
}

```

### 5.3 저장
* makeGpxData 함수를 이용하여 gpx파일을 만들고 Blob으로 저장합니다.
```javascript
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
```
