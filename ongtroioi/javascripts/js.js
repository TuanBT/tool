var options = [];
var idChoose;
var helpTextLine = 4; //1 blank, 2 line, 1 bonus
var countAsk =0;
var customOptionValue = ""; //customOptionKey

$(document).ready(function () {
    //Chọn mặc định nút đầu tiên
    window.onload = function () {
        reset();
        optClick('T1');
		if(getLocalStorage('customOptionKey')!=null){
			customOptionValue = getLocalStorage('customOptionKey');
			document.getElementById('textBoxFirst').value = customOptionValue.split('-')[0];
			document.getElementById('textBoxSecond').value = customOptionValue.split('-')[1];
		}else{
			document.getElementById('textBoxFirst').value = "SẤP";
			document.getElementById('textBoxSecond').value = "NGỬA";
		}
    };
});//End ready

window.onresize = function (event) {
    reset();
};

//Reset
function reset() {
    //BoxResult
    $('#boxClick').css('line-height', $('#boxClick').height() + 12 + "px");
    //$('#boxClick').css('font-size', Math.floor($('#boxResult').height()*3/4)+"px");
    $('#boxClick').css('font-size', $('#boxResult').height() + "px");
    //helpText
    /*for(var i=1;i<helpTextLine*2;i++){
     $('#boxResult').css('font-size', Math.floor($('#boxClick').height()/i));
     if($('#boxResult').height()<=$('#boxClick').height()) break;
     }*/
    //helpText
    for (var i = 1; i < helpTextLine * 2; i++) {
        $('#helpTextCont').css('font-size', Math.floor($('#helpText').height() / i) + "px");
        if ($('#helpTextCont').height() <= $('#helpText').height()) break;
    }
    //Answer
    for (var i = 1; i < helpTextLine * 2; i++) {
        $('#answerContent').css('font-size', Math.floor($('#answer').height() / i) + "px");
        if ($('#answerContent').height() <= $('#answer').height()) break;
    }
    //$('#helpTextCont').css('font-size', Math.floor($('#helpText').height()/4));
    /*while($('#helpTextCont').height()>=$('#helpText').height()){
     var fz = $('#helpTextCont').css('font-size');
     $('#helpTextCont').css('font-size',fz-=1);
     }*/
}

//Click một nút chọn kiểu
function optClick(id) {
    options = $('#'+id).text().trim().split('-');
    idChoose = id;
    var lh = $('#boxClick').height() + 12;
    //$('#boxClick').html("<div id='boxResult' style='line-height:"+lh+"px'>" + options[0] + "-" + options[1] + "</div>");
    $('#boxClick').html("<div id='boxResult' style='line-height:" + lh + "px'>HỎI</div>");
        $('.btnChoose').attr('class', 'btnChoose');
        $('#' + idChoose).attr('class', 'btnChoose current');
		$('#answerContent').html(setFunnyText(0));
    reset();
}

//Click edit option
function saveChoose() {
    var firstText = document.getElementById('textBoxFirst').value;
    var secondText = document.getElementById('textBoxSecond').value;
    document.getElementById('T6').innerHTML = firstText + "-" + secondText;
    $('#editContain').hide();
    $('#T6').show();
	setLocalStorage("customOptionKey",firstText + "-" + secondText);
}

//Quay số kết thúc
function onComplete() {
    // $("#answerContent").text("Đó là câu trả lời của ta. Nếu con muốn ấn nữa thì cứ việc, nhưng ta chỉ trả lời thật cho một câu hỏi thôi.");
    $("#answerContent").text(setFunnyText(countAsk));
    console.log(countAsk);
    reset();
}

//Thực hiện việc quay số
function doSlot() {
    $("#boxResult").slotMachine({delay: 450})
        .shuffle(20, onComplete);
    countAsk++;
}

//ChooseOption
function setChooseOption() {
    $('#boxClick').html("<div id='boxResult'></div>");

    //Chọn số random
    if (idChoose == 'T5') {
        for (var i = 1; i <= 10; i++) {
            $('#boxResult').append("<div>" + i + "</div>");
        }
        return;
    }
    //Chọn các trường hợp chữ khác
    for (var i = 0; i < options.length; i++) {
        $('#boxResult').append("<div>" + options[i] + "</div>");
    }
}

//Ngẫu nhiên funny text
function setFunnyText(intTypeText) {
    var arrDb = [];
    switch (intTypeText) {
		case -1:
            arrDb = db.FunnyTest.Waiting;
            break;
        case 0:
            arrDb = db.FunnyTest.Normal;
            break;
        case 1:
            arrDb = db.FunnyTest.OneTimes;
            break;
        case 2:
            arrDb = db.FunnyTest.SecondTimes;
            break;
        case 3:
            arrDb = db.FunnyTest.ThirdTimes;
            break;
        default:
            arrDb = db.FunnyTest.OverTimes;
            break;
		
    }
    var length = arrDb.length;
    var ranIndex = Math.floor((Math.random() * length) + 0);
    return arrDb[ranIndex].Text;
}

function setLocalStorage(key, value) {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem(key, value);
    } else {
        console.log("Browser not support local storage");
    }
}

function getLocalStorage(key, value) {
    if (typeof(Storage) !== "undefined") {
        return localStorage.getItem(key, value);
    } else {
        console.log("Browser not support local storage");
    }
}

$(document).ready(function () {
    //Click box
    $('#boxClick').click(function () {
        $("#answerContent").text(setFunnyText(-1));
        reset();
        setChooseOption();
        doSlot();
    });
    $('.title').mouseover(function () {
        //$('.st').hide()
    });
    $('.title').mouseout(function () {
        // $('.st').show( "highlight", 100)
    });
});//End ready
