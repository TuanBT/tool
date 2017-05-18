var mapColor = "#f1c40f"; //Vàng nhạt
var mapOverColor = "#16a085"; //Xanh lam nhạt
var bacgroundColor = "#ff6862"; //Dỏ nhạt
var mapClickColor = "#c0392b"; //Đỏ đậm
var idClicked = "";
var winHeight = $(window).height();
var winWidth = $(window).width();


$(document).ready(function () {
    divMap = $("#mapArea");
    divInfoProvince = $("#infoProvince");
    divNavListProvice = $("#navListProvince");

    initScreen();
    showListProvince();

    //Mouse over map
    $(".land").mouseover(function () {
        $("#" + codeProvince[index].id).css({ fill: mapColor });
        $("#li-" + codeProvince[index].code[indexCode]).removeClass('active');
        if (idClicked != "") {
            $("." + idClicked).removeClass('activeClick');
        }
        if (idClicked != this.id && idClicked != "") {
            $("." + idClicked).addClass('activeClick');
        }

        $("#" + this.id).css({ fill: mapOverColor });
        $("." + this.id).addClass('active');

        for (var i = 0; i < codeProvince.length; i++) {
            if (codeProvince[i].id == this.id) {
                showDetailInfo(codeProvince[i]);
                return;
            }
        }
    })

    //Mouse over out
    $(".land").mouseout(function () {
        if (idClicked != this.id) {
            $("#" + this.id).css({ fill: mapColor });
        } else if (idClicked == this.id) {
            $("#" + this.id).css({ fill: mapClickColor });
        }
        if (idClicked != "") {
            $("." + idClicked).addClass('activeClick');
        }
        $("." + this.id).removeClass('active');

        resetInfoDetailDiv();

        if (idClicked != "") {
            for (var i = 0; i < codeProvince.length; i++) {
                if (codeProvince[i].id == idClicked) {
                    showDetailInfo(codeProvince[i]);
                    return;
                }
            }
        }
    })

    $(".land").click(function () {
        if (idClicked == this.id) {
            idClicked = "";
            $("." + this.id).removeClass('activeClick');
            $("#" + this.id).css({ fill: mapOverColor });
            return;
        }
        if (idClicked != this.id && idClicked != "") {
            $("." + idClicked).removeClass('activeClick');
            $("#" + idClicked).css({ fill: mapColor });
        }
        idClicked = this.id;
        $("." + this.id).addClass('activeClick');
        $("#" + this.id).css({ fill: mapClickColor });
        for (var i = 0; i < codeProvince.length; i++) {
            if (codeProvince[i].id == this.id) {
                showDetailInfo(codeProvince[i]);
                return;
            }
        }
    });

    //Play pause map
    $('#funcPlayPause').on('click', '.buttonPlayPause', function () {
        if ($(this).hasClass('play')) {
            $(this).removeClass('play').addClass('stop');
            document.getElementById('ani-left-to-stop').beginElement();
            document.getElementById('ani-right-to-stop').beginElement();
            showProvince();
        } else
            if ($(this).hasClass('stop')) {
                $(this).removeClass('stop').addClass('play');
                document.getElementById('ani-left-to-play').beginElement();
                document.getElementById('ani-right-to-play').beginElement();
                stopTimeout();
            }
    });

    $("#mainGround").click(function () {
        if (idClicked != "") {
            $("." + idClicked).removeClass('activeClick');
            $("#" + idClicked).css({ fill: mapColor });
            idClicked = "";
        }
    });
});

function initScreen() {
    divMap.css({ left: divInfoProvince.width(), height: winHeight - 20 });

    if (divInfoProvince.width() + divMap.width() >= winWidth) {
        divMap.css({ left: winWidth - divMap.width() });
        $("#functionPanel").css({ left: 10, top: 10 });
        divInfoProvince.css({ "margin-left": 10, top: winHeight / 3 });
    }
}

function showListProvince() {
    var heightLi = 27;
    var widthLi = 160;
    var numCode = 0;
    for (var i = 0; i < codeProvince.length; i++) {
        for (var j = 0; j < codeProvince[i].code.length; j++) {
            numCode++;
        }
    }

    var numLine = Math.round(winHeight / heightLi);

    var divListPro1 = $("#listProvince1");
    divListPro1.css({ "left": divInfoProvince.width() + divMap.width() });

    var divLi = "<li class='var_nav {{proId}}' id='li-{{proCode}}'><div class='link_bg'></div><div class='link_title'><div class=icon><i>{{proCode}}</i></div>"
        + "<a onclick='clickProvince(\"{{proId}}\")' onmouseout='darkProvince(\"{{proId}}\")' onmouseover='lightProvince(\"{{proId}}\")'><span class='provinceName'>{{proTitle}}</span></a></div></li>";

    var countNumLine = 0;
    var countNumRow = 1;
    for (var i = 0; i < codeProvince.length; i++) {
        for (var j = 0; j < codeProvince[i].code.length; j++) {
            if (countNumLine > numLine) {
                countNumLine = 0;
                countNumRow++;
                divNavListProvice.append("<ul class='listProvince' id='listProvince" + countNumRow + "'></ul>");
                $("#listProvince" + countNumRow).css({ "left": divInfoProvince.width() + divMap.width() + (countNumRow - 1) * widthLi });
            }
            countNumLine++;
            var res = divLi.replace("{{proCode}}", codeProvince[i].code[j]);
            var res = res.replace("{{proCode}}", codeProvince[i].code[j]);
            var res = res.replace("{{proTitle}}", codeProvince[i].title);
            var res = res.replace("{{proId}}", codeProvince[i].id);
            var res = res.replace("{{proId}}", codeProvince[i].id);
            var res = res.replace("{{proId}}", codeProvince[i].id);
            var res = res.replace("{{proId}}", codeProvince[i].id);
            $('#listProvince' + countNumRow).append(res);
        }
    }
    divNavListProvice.css({ "top": (winHeight - divListPro1.height()) / 2 });
    if (divInfoProvince.width() + divMap.width() + countNumRow * widthLi >= winWidth) {
        //divNavListProvice.hide();
        divMap.css({ opacity: 0.7 });
    }else{

    }
}

function showDetailInfo(codeProvinceOne) {
    resetInfoDetailDiv();

    $("#infoProvinceTitle").html(codeProvinceOne.title);
    for (var i = 0; i < codeProvinceOne.code.length; i++) {
        $("#listNumberContain").append("<li>" + codeProvinceOne.code[i] + "</li>");
    }

    for (var i = 0; i < codeProvinceOne.area.length; i++) {
        $("#detailInfoContain").append("<li><div class='detailInfoCode'>" + codeProvinceOne.area[i].code + "</div> <div class='detailInfoTitle'>" + codeProvinceOne.area[i].title + "</div></li>");
    }
}

function clickProvince(provinceId) {
    if (idClicked == provinceId) {
        idClicked = "";
        $("." + provinceId).removeClass('activeClick');
        $("#" + provinceId).css({ fill: mapOverColor });
        return;
    }
    if (idClicked != provinceId && idClicked != "") {
        $("." + idClicked).removeClass('activeClick');
        $("#" + idClicked).css({ fill: mapColor });
    }
    idClicked = provinceId;
    $("." + provinceId).addClass('activeClick');
    $("#" + provinceId).css({ fill: mapClickColor });
    for (var i = 0; i < codeProvince.length; i++) {
        if (codeProvince[i].id == provinceId) {
            showDetailInfo(codeProvince[i]);
            return;
        }
    }
};

function lightProvince(provinceId) {
    if (idClicked == provinceId) {
        $("." + provinceId).removeClass('activeClick');
    }
    $("#" + codeProvince[index].id).css({ fill: mapColor });
    $("#li-" + codeProvince[index].code[indexCode]).removeClass('active');

    $("#" + provinceId).css({ fill: mapOverColor });
    for (var i = 0; i < codeProvince.length; i++) {
        if (codeProvince[i].id == provinceId) {
            showDetailInfo(codeProvince[i]);
            return;
        }
    }
}
function darkProvince(provinceId) {
    if (idClicked != provinceId) {
        $("#" + provinceId).css({ fill: mapColor });
    } else {
        $("." + provinceId).addClass('activeClick');
        $("#" + provinceId).css({ fill: mapClickColor });
    }

    resetInfoDetailDiv();

    if (idClicked != "") {
        for (var i = 0; i < codeProvince.length; i++) {
            if (codeProvince[i].id == idClicked) {
                showDetailInfo(codeProvince[i]);
                return;
            }
        }
    }
}

var index = 0;
var indexCode = 0;
var lenghtCode = 0;
var timeout;
function showProvince() {
    if (index == codeProvince.length - 1) {
        index = 0;
    }

    $("#li-" + codeProvince[index].code[indexCode]).addClass('active');
    $("#" + codeProvince[index].id).css({ fill: mapOverColor });
    showDetailInfo(codeProvince[index]);
    timeout = setTimeout(function () {
        $("#" + codeProvince[index].id).css({ fill: mapColor });
        $("#li-" + codeProvince[index].code[indexCode]).removeClass('active');

        lenghtCode = codeProvince[index].code.length;
        indexCode++;
        if (indexCode >= lenghtCode) {
            index++;
            indexCode = 0;
        }
        showProvince();
    }, 500);
}

function stopTimeout() {
    clearTimeout(timeout);
}

var codeNum = 10;
var idNum = 0;
function showCode() {
    if (codeNum == 100) {
        codeNum = 10;
    }
    codeNum++;
    for (var k = 0; k < codeProvince.length; k++) {
        for (var j = 0; j < codeProvince[k].code.length; j++) {
            if (codeProvince[k].code[j] == codeNum) {
                $("#" + codeProvince[k].id).css({ fill: mapOverColor });
                $(".content").html(codeProvince[k].code[j] + "-" + codeProvince[k].title);
                idNum = k;
                break;
            }
        }
    }
    setTimeout(function () {
        $("#" + codeProvince[idNum].id).css({ fill: mapColor });
        $(".content").html(codeNum);
        showCode();
    }, 200);
}

function resetInfoDetailDiv() {
    $("#listNumberContain").empty();
    $("#detailInfoContain").empty();
    $("#infoProvinceTitle").html("");
}