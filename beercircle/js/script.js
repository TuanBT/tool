$(document).ready(function () {
    var canvas = document.getElementById('canvas');
    
    var docWi = $(document).width();
    var docHe = $(document).height();

    var minDoc = docWi > docHe ? docHe : docWi;

    canvas.style.width  = minDoc + 'px';
    canvas.style.height = minDoc + 'px';
});//End ready


window.onresize = function (event) {
    docWi = $(document).width();
    docHe = $(document).height();

    minDoc = docWi > docHe ? docHe : docWi;

    canvas.style.width  = minDoc + 'px';
    canvas.style.height = minDoc + 'px';
};