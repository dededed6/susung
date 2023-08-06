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
                let urls = jsonData.rows[i].c[1].v.split(',');
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
        const new_post = '<button class="postit" id="' + i.toString() + '" onclick="postit(this.id)" style="padding-top: ' + (Math.random() * 10).toString() + '%;">\n    <p style="margin: 0; position: absolute; top: 10%; left: 5%; height: 85%; width: 90%; overflow: hidden; font-size: 2svh;">' + data[i].text + '</p>\n    <div style="position:absolute; top: -5%; left:50%; transform: translate(-50%,0); margin: 0; width: 0.1vh; height: 0.1vh; border: 1svh solid ' + color + '; border-radius: 50%;"></div>\n</button>\n';
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
    target.scrollIntoView({behavior: "smooth", block: "center"});
    setTimeout(() => target.classList.toggle('search', false), 1000);
}

// 사진/글자 토글
const toggleImage = document.getElementById("toggleImage");
function switchToImage() {
    container.innerHTML = "";
    for (var i=0; i<data.length; i++) {
        for (var ii=0; ii<data[i].url.length; ii++) {
            const new_image = '<img class="image" id="' + i.toString() + 'a'.repeat(ii) + '" src="' + data[i].url[ii] + '" onclick="postit(this.id)">\n';
            container.insertAdjacentHTML('afterbegin', new_image);
        }
    }
    toggleImage.setAttribute("onClick", "switchToText()");
}

function switchToText() {
    container.innerHTML = "";
    for(var i=0; i < data.length; i++) {
        const color = flavor_colors[flavors.findIndex(v => v === data[i].flavor)];
        const new_post = '<button class="postit" id="' + i.toString() + '" onclick="postit(this.id)" style="padding-top: ' + (Math.random() * 10).toString() + '%;">\n    <p style="margin: 0; position: absolute; top: 10%; left: 5%; height: 85%; width: 90%; overflow: hidden; font-size: 2svh;">' + data[i].text + '</p>\n    <div style="position:absolute; top: -5%; left:50%; transform: translate(-50%,0); margin: 0; width: 0.1vh; height: 0.1vh; border: 1svh solid ' + color + '; border-radius: 50%;"></div>\n</button>\n';
        container.insertAdjacentHTML('afterbegin', new_post);
    }
    toggleImage.setAttribute("onClick", "switchToImage()");
}

// 디테일
const detial = document.getElementById("detail");

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
    i = parseInt(i);

    for (var ei=0; ei<data[i].url.length; ei++) {
        image_src.push(data[i].url[ei]);
    }
    
    detial.style.display = 'block';
    text.readOnly = true;
    date.disabled = true;
    file.disabled = true;
    circle.disabled = true;

    text.value = data[i].text;
    date.value = data[i].date;
    circle.innerText = data[i].flavor;
    var next = flavors.findIndex(v => v === circle.innerText);
    circle.style.color = flavor_colors[next];
    dateChange();
    mao.setAttribute("onClick", "download(" + i + ")");
}

// 새로 붙이기
function post() {
    detial.style.display = 'block';
    text.readOnly = false;
    date.disabled = false;
    file.disabled = false;
    circle.disabled = false;

    circle.style.color = "#FFC91B";
    circle.innerText = "행복한 맛"
    var now_utc = Date.now()
    var timeOff = new Date().getTimezoneOffset()*60000;
    date.value = new Date(now_utc-timeOff).toISOString().split("T")[0];
    file_image.src = '';
    text.innerText = "";
    dateChange();
    mao.setAttribute("onClick", "maoload()");
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
        for (var i=0; i<file.files.length; i++) {
            var reader = new FileReader();
            reader.onload = function(e) {
                image_src.push(e.target.result);
            };
            reader.readAsDataURL(file.files[i]);
        }
    } else {
        file_image.src = '';
    }
}

// 텍스트 박스 크기 변경
function toggleTextSize() {
    currentClass = text.className;
    if (currentClass != "expand") {
        text.classList.toggle('expand', true);
        file_image.style.opacity = 0;
        document.getElementsByClassName("text_box")[0].style.opacity = 0;
        document.getElementsByClassName("text_box")[1].style.opacity = 0;
    } else {
        text.classList.toggle('expand', false);
        file_image.style.opacity = 1;
        document.getElementsByClassName("text_box")[0].style.opacity = 1;
        document.getElementsByClassName("text_box")[1].style.opacity = 1;
    }
}

// 사진 변경
let image_src = [];

function imageSlide() {
    if (image_src.length != 0) {
        const target = image_src.pop();
        file_image.src = target;
        image_src.unshift(target);
    }
}

// 디테일 닫기
function close_detail() {
    detial.style.display = "none";
    image_src = [];
    file_image.src = '';
}

// 다운로드
function download(i) {
    for (var ii=0; ii<data[i].url.length; ii++) {
        var t_url = 'https://drive.google.com/uc?export=download&id=' + data[i].url[ii].split('=')[1] + '&confirm=t';
        console.log(t_url);
        window.open(t_url, '_blank');
    }
}

// 마오로드
async function maoload() {
    if (file.files && file.files[0] && text.value != "") {

        mao.innerText = "왱이"
        mao.disabled = true;
        urls = "";
        for (var i=0; i<file.files.length; i++) {
            const image = file.files[i];
            const fr = new FileReader();
            const url = "https://script.google.com/macros/s/AKfycbxGWGLUr6dWf0c0M0tMKPpUudf4Ax_ofZTkXNz8H-0bjYizf66eXAfEuNYtJJ2H2jVE/exec";
            var complete = 0;

            fr.readAsArrayBuffer(image);
            fr.onload = f => {
                const qs = new URLSearchParams({filename: date.value, mimeType: image.type});
                fetch(`${url}?${qs}`, {method: "POST", body: JSON.stringify([...new Int8Array(f.target.result)])})
                .then(res => res.json())
                .then(e => sendData((urls = urls + 'https://drive.google.com/uc?id=' + e.id + ','), (complete = complete + 1)))  // <--- You can retrieve the returned value here.
                .catch(err => console.log(err));
            }
        }
        
    }
}

function sendData(id, complete) {
    if (complete == file.files.length) {
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
}

// 최초 실행
window.onload=function() {
    var now_utc = Date.now()
    var timeOff = new Date().getTimezoneOffset()*60000;
    var today = new Date(now_utc-timeOff).toISOString().split("T")[0];
    date.setAttribute("max", today);
    date.value = today;
    search_date.setAttribute("max", today);
    dateChange();
    readData();
    setInterval(imageSlide, 1500);
}

// 디데이 계산
const getDateDiff = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    
    const diffDate = date1.getTime() - date2.getTime();
    
    return Math.abs(diffDate / (1000 * 60 * 60 * 24)); // 밀리세컨 * 초 * 분 * 시 = 일
}