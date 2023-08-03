// 포스트잇 데이터
var data = [];

// 데이터 불러오기
function readData() {
    google.charts.load('current', { packages: ['corechart'] }).then(function () {
        var query = new google.visualization.Query('http://spreadsheets.google.com/tq?key=1dRatFaGvJLI8vVwML96HzkJ67FmT0fIEKp31mhXk3qM&pub=1');
        query.send(function (response) {            
            var dataTable = response.getDataTable();
            var jsonData = dataTable.toJSON();
            jsonData = JSON.parse(jsonData);

            for(var i=0; i < jsonData.rows.length; i++) {
                urls = jsonData.rows[i].c[1].v.split(',');
                urls.pop();
                dict = {
                    flavor: jsonData.rows[i].c[0].v,
                    url: urls,
                    text: jsonData.rows[i].c[2].v,
                    date: jsonData.rows[i].c[3].f
                };
                data.push(dict);
            }
            post_data();
        });
    });
}

// 불러온 데이터들을 포스트
const container = document.getElementsByClassName('container')[0];

function post_data() {
    data = data.sort((a,b) => (new Date(a.date).getTime() - new Date(b.date).getTime())); // 데이터 시간순 정렬
    for(var i=0; i < data.length; i++) {
        const color = flavor_colors[flavors.findIndex(v => v === data[i].flavor)];
        const new_post = '<button class="postit" id="' + i.toString() + '" onclick="postit(this.id)" style="padding-top: ' + (Math.random() * 10).toString() + '%;">\n    <p style="margin: 0; position: absolute; top: 10%; left: 5%; height: 85%; width: 90%; overflow: hidden; font-size: 2svh;">' + data[i].text + '</p>\n    <div style="position:absolute; top: -5%; left:50%; transform: translate(-50%,0); margin: 0; width: 0.1vh; height: 0.1vh; border: 1svh solid ' + color + '; border-radius: 50%;"></div>\n</button>\n'
        container.insertAdjacentHTML('afterbegin', new_post);
    }
}

// 검색
const search_date = document.getElementById("search_date");

function search() {
    var min = getDateDiff(search_date.value, data[0].date);
    var minIndex = 0;
    for (var i=1; i<data.length; i++) {
        var diff = getDateDiff(search_date.value, data[i].date);
        if (diff < min) {
            minIndex = i;
            min = diff;
        }
    }
    const target = document.getElementById(minIndex);
    target.classList.toggle('search', true);
    setTimeout(() => target.classList.toggle('search', false), 1000);
    const target_top = target.getBoundingClientRect().top;
    window.scroll({top : target_top, behavior: 'smooth'});
}


// 디테일
const detial = document.getElementById("detail");

function close_detail() {
    detial.style.display = "none";
}

// 맛 스티커
const circle = document.getElementById("circle");
const flavors = ["보고싶은 맛",  "행복한 맛", "미안한 맛", "여유로운 맛", "신나는 맛", "고마운 맛", "기대되는 맛", "재미있는 맛", "사랑스런 맛", "설레는 맛", "심심한 맛", "부러운 맛"]; 12
const flavor_colors = ["#FF4C1B", "#FFC91B", "#B7FF17", "#FFFA1B", "#3CFF1B", "#1BFFCE", "#1BE9FF", "#5767FF", "#9C17FF", "#FF17F4", "#FC664C", "#FFFFFF"];

function flavor() {
    var i = flavors.findIndex(v => v === circle.innerText);
    var next = (i + 1) % flavors.length;
    circle.innerText = flavors[next];
    circle.style.color = flavor_colors[next];
}

// 디테일 박스 내부
const file_image = document.getElementById("file_image");
const file = document.getElementById("file");
const text = document.getElementById("text");
const date_text = document.getElementById("date_text");
const date = document.getElementById("date");
const mao = document.getElementById("mao");

function postit(i) {
    detial.style.display = 'block';
    text.readOnly = true;
    mao.disabled = true;
    date.disabled = true;
    file.disabled = true;
    circle.disabled = true;
    file_image.src = data[i].url;
    text.innerText = data[i].text;
    date.value = data[i].date;
    circle.innerText = data[i].flavor;
    var next = flavors.findIndex(v => v === circle.innerText);
    circle.style.color = flavor_colors[next];
    dateChange();
}

// 새로 붙이기
function post() {
    detial.style.display = 'block';
    text.readOnly = false;
    mao.disabled = false;
    date.disabled = false;
    file.disabled = false;
    circle.disabled = false;

    circle.style.color = "#FFC91B";
    circle.innerText = "행복한 맛"
    var now_utc = Date.now()
    var timeOff = new Date().getTimezoneOffset()*60000;
    date.value = new Date(now_utc-timeOff).toISOString().split("T")[0];
    file_image.outerHTML = '<img id="file_image">';
    text.innerText = "";
    dateChange();
}

// 날짜 변경
function dateChange() {
    day = new Date(date.value);
    diff = getDateDiff("2023-04-16", day)
    content = day.getFullYear() + "." + parseInt(day.getMonth() + 1) + "." + day.getDate() + "\nD+" + diff;
    date_text.innerText = content;
}

// 파일 변경
function fileChange() {
    if (file.files && file.files[0]) {
        slideImageMao();
    } else {
        document.getElementById("file_image").src = null;
    }
}

// 사진 변경
const timer = ms => new Promise(res => setTimeout(res, ms))

async function slideImageMao() {
    for (var i=0; i<=file.files.length; i++) {
        if (i == file.files.length && detial.style.display == 'block') {
            i = 0;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
          document.getElementById("file_image").src = e.target.result;
        };
        reader.readAsDataURL(file.files[i]);
        await timer(2000);
    }

}

async function slideImage(images) {
    for (var i=0; i<=images.length; i++) {
        if (i == images.length && detial.style.display == 'block') {
            i = 0;
        }
        file_image.src = images[i];
        await timer(2000);
    }
}

// 마오로드
function maoload() {
    if (file.files && file.files[0] && text.value != "") {

        mao.innerText = "대기"
        urls = "";
        for (var i=0; i<=file.files.length; i++) {
            if (i==file.files.length) {
                sendData(urls);
                break;
            }
            const image = file.files[i];
            const fr = new FileReader();
            const url = "https://script.google.com/macros/s/AKfycbxGWGLUr6dWf0c0M0tMKPpUudf4Ax_ofZTkXNz8H-0bjYizf66eXAfEuNYtJJ2H2jVE/exec";

            fr.readAsArrayBuffer(image);
            fr.onload = f => {
                const qs = new URLSearchParams({filename: date.value, mimeType: image.type});
                fetch(`${url}?${qs}`, {method: "POST", body: JSON.stringify([...new Int8Array(f.target.result)])})
                .then(res => res.json())
                .then(e => urls+="https://drive.google.com/uc?id=" + e.id + ",")  // <--- You can retrieve the returned value here.
                .catch(err => console.log(err));
            }
        }
    }
}

function sendData(id) {
    $.ajax({
        type: "GET",
        url: "https://script.google.com/macros/s/AKfycbxrcwkYlaT5U7bj4sMi2JFHVfsZUXnO9UL_R9jDbd-iu-vCmyxdWwMRV_cSy6YvSX2n6w/exec",
        data: {
            FLAVOR: circle.innerText,
            URL: id.toString(),
            TEXT: text.value,
            DATE: date.value
        },
        success: function(data){ //성공시 실행할 함수
            window.location.reload();
        },
        error: function(request,status,error){ // 에러발생시 실행할 함수
            alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        }
    });
}

// 최초 실행
window.onload=function() {
    var now_utc = Date.now()
    var timeOff = new Date().getTimezoneOffset()*60000;
    var today = new Date(now_utc-timeOff).toISOString().split("T")[0];
    date.setAttribute("max", today);
    date.value = today;
    dateChange();
    readData();
}

// 디데이 계산
const getDateDiff = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    
    const diffDate = date1.getTime() - date2.getTime();
    
    return Math.abs(diffDate / (1000 * 60 * 60 * 24)); // 밀리세컨 * 초 * 분 * 시 = 일
}