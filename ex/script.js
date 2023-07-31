const date_text = document.getElementById("date_text");
const date = document.getElementById("date");
const file_image = document.getElementById("file_image");
const file = document.getElementById("file");
const tags = document.getElementById("tags");

var data = new Array;

window.onload=function() {
    var now_utc = Date.now()
    var timeOff = new Date().getTimezoneOffset()*60000;
    var today = new Date(now_utc-timeOff).toISOString().split("T")[0];
    date.setAttribute("max", today);
    date.value = today;
    date_text.innerHTML = getDateDiff("2023-04-16", today);

    readData();
}

function dateChange() {
    diff = getDateDiff("2023-04-16", date.value)
    date_text.innerHTML = diff;
    if (data[diff] != null) {
        file_image.src = "https://drive.google.com/uc?id=" + data[diff].id;
        tags.value = data[diff].tags;
    }
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

function readData() {
    google.charts.load('current', { packages: ['corechart'] }).then(function () {
        var query = new google.visualization.Query('http://spreadsheets.google.com/tq?key=1dRatFaGvJLI8vVwML96HzkJ67FmT0fIEKp31mhXk3qM&pub=1');
        query.send(function (response) {            
            var dataTable = response.getDataTable();
            var jsonData = dataTable.toJSON();
            jsonData = JSON.parse(jsonData);

            for(var i=0; i < jsonData.rows.length; i++) {
                dict = {
                    "date": jsonData.rows[i].c[0].v,
                    "id": jsonData.rows[i].c[1].v,
                    "tags": jsonData.rows[i].c[2].v
                };
                data[getDateDiff("2023-4-16", jsonData.rows[i].c[0].v)] = dict;
            }
        });
    });
    console.log(data)
}

function writeData(id) {
    const image = file.files[0];
    const fr = new FileReader();
    const url = "https://script.google.com/macros/s/AKfycbxGWGLUr6dWf0c0M0tMKPpUudf4Ax_ofZTkXNz8H-0bjYizf66eXAfEuNYtJJ2H2jVE/exec";

    fr.readAsArrayBuffer(image);
    fr.onload = f => {
        const qs = new URLSearchParams({filename: image.name, mimeType: image.type});
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
          "DATE": date.value,
          "ID": id,
          "TAGS": tags.value
        }
    });
    data[getDateDiff("2023-4-16", date.value)] = {
        "date": date.value,
        "id": id,
        "tags": tags.value
    };
    console.log("complete");
}

const getDateDiff = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    
    const diffDate = date1.getTime() - date2.getTime();
    
    return Math.abs(diffDate / (1000 * 60 * 60 * 24)); // 밀리세컨 * 초 * 분 * 시 = 일
}