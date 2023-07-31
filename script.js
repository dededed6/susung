




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

function postit(e) {
    detial.style.display = 'block';
    text.disabled = true;
    mao.disabled = true;
    date.disabled = true;
    file.disabled = true;
    console.log(e);
}

// 새로 붙이기
function post() {
    detial.style.display = 'block';
    text.disabled = false;
    mao.disabled = false;
    date.disabled = false;
    file.disabled = false;
}

function dateChange() {
    day = new Date(date.value);
    diff = getDateDiff("2023-04-16", day)
    content = day.getFullYear() + "." + parseInt(day.getMonth() + 1) + "." + day.getDate() + "\nD+" + diff;
    date_text.innerText = content;
}

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


function maod() {
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

function sendData(id) {
    $.ajax({
        type: "GET",
        url: "https://script.google.com/macros/s/AKfycbxrcwkYlaT5U7bj4sMi2JFHVfsZUXnO9UL_R9jDbd-iu-vCmyxdWwMRV_cSy6YvSX2n6w/exec",
        data: {
            "FLAVOR": circle.innerText,
            "URL": "https://drive.google.com/uc?id=" + id,
            "TEXT": text.value,
            "DATE": date.value
        }
    });
    console.log("complete");
    window.location.reload();
}

// 최초 실행
window.onload=function() {
    var now_utc = Date.now()
    var timeOff = new Date().getTimezoneOffset()*60000;
    var today = new Date(now_utc-timeOff).toISOString().split("T")[0];
    date.setAttribute("max", today);
    date.value = today;
    dateChange();
}

// 디데이 계산
const getDateDiff = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    
    const diffDate = date1.getTime() - date2.getTime();
    
    return Math.abs(diffDate / (1000 * 60 * 60 * 24)); // 밀리세컨 * 초 * 분 * 시 = 일
}