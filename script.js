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
                dict = {
                    flavor: jsonData.rows[i].c[0].v,
                    url: jsonData.rows[i].c[1].v,
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
        const new_post = '<button class="postit" id="' + i.toString() + '" onclick="postit(this.id)">' + data[i].text + '</button>\n'
        container.insertAdjacentHTML('afterbegin', new_post);
    }
    console.log(data);
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
    const target_top = document.getElementById(minIndex).getBoundingClientRect().top;
    window.scroll({top : target_top, behavior: 'smooth'});
}


// 디테일
const detial = document.getElementById("detail");

function close_detail() {
    detial.style.display = "none";
}

// 맛 스티커
const circle = document.getElementById("circle");
const flavors = ["보고싶은 맛", "행복한 맛", "미안한 맛", "여유로운 맛", "신나는 맛", "재밌는 맛", "고마운 맛", "기대되는 맛", "재미있는 맛", "사랑스런 맛", "설레는 맛", "심심한 맛", "피곤한 맛", "부러운 맛"];

function flavor() {
    i = flavors.findIndex(v => v === circle.innerText);
    circle.innerText = flavors[(i + 1) % flavors.length];
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
    text.disabled = true;
    mao.disabled = true;
    date.disabled = true;
    file.disabled = true;
    file_image.src = data[i].url;
    text.innerText = data[i].text;
    date.value = data[i].date;
    circle.innerText = data[i].flavor;
    dateChange();
    console.log(data[i]);
}

// 새로 붙이기
function post() {
    detial.style.display = 'block';
    text.disabled = false;
    mao.disabled = false;
    date.disabled = false;
    file.disabled = false;
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
        var reader = new FileReader();
        reader.onload = function(e) {
          document.getElementById("file_image").src = e.target.result;
        };
        reader.readAsDataURL(file.files[0]);
      } else {
        document.getElementById("file_image").src = "";
      }
}

// 마오로드
function maoload() {
    if (file.files && file.files[0] && text.value != "") {

        mao.innerText = "대기"
        const image = file.files[0];
        const fr = new FileReader();
        const url = "https://script.google.com/macros/s/AKfycbxGWGLUr6dWf0c0M0tMKPpUudf4Ax_ofZTkXNz8H-0bjYizf66eXAfEuNYtJJ2H2jVE/exec";

        fr.readAsArrayBuffer(image);
        fr.onload = f => {
            const qs = new URLSearchParams({filename: date.value, mimeType: image.type});
            fetch(`${url}?${qs}`, {method: "POST", body: JSON.stringify([...new Int8Array(f.target.result)])})
            .then(res => res.json())
            .then(e => sendData(e.id))  // <--- You can retrieve the returned value here.
            .catch(err => console.log(err));
        }
    }
}

function sendData(id) {
    $.ajax({
        type: "GET",
        url: "https://script.google.com/macros/s/AKfycbxrcwkYlaT5U7bj4sMi2JFHVfsZUXnO9UL_R9jDbd-iu-vCmyxdWwMRV_cSy6YvSX2n6w/exec",
        data: {
            FLAVOR: circle.innerText,
            URL: "https://drive.google.com/uc?id=" + id.toString(),
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