//FireBase
var config = {
    apiKey: "AIzaSyAR8cYUbTWgB72t4-N21gyR5F2P9vaRm7o",
    authDomain: "tree-family-tuan.firebaseapp.com",
    databaseURL: "https://tree-family-tuan.firebaseio.com",
    projectId: "tree-family-tuan",
    storageBucket: "tree-family-tuan.appspot.com/",
    messagingSenderId: "75284012167"
};
firebase.initializeApp(config);

// Get a reference to the database service
var ref = firebase.database().ref();

var ancestor = "";

var curId = "1";
var preId = "1";

var thisEleCur;
var thisElePre;
var thisElePrePre;

var pathDataCur;
var pathDataPre;

var nodeDataCur;
var nodeDataPre;

var nodeDataParentCur;
var nodeDataParentPre;

var male = "male";
var female = "female";
var ndmale = "ndmale";
var ndfemale = "ndfemale";

$(document).ready(function () {
    //Update node
    function updateNode() {
        var nodeName = $("input[name=nodeName]").val();
        // var nodeGender = $('input[name=nodeGender]:checked').val();
        var nodeBirthday = $("input[name=nodeBirthday]").val();
        var nodeSpouse = $("input[name=nodeSpouse]").val();
        // var nodeDirect = nodeDirect;

        firebase.database().ref(pathDataCur).update(
            {
                text: {
                    ID: nodeDataCur.text.ID,
                    name: nodeName,
                    spouse: nodeSpouse,
                    gender: nodeDataCur.text.gender,
                    birthday: nodeBirthday,
                }
            }
        )
    }

    function updateNodeGender() {
        var nodeGender = $('input[name=nodeGender]:checked').val();

        nodeDataCur.text.gender = nodeGender;
        if (nodeDataCur.HTMLclass == male || nodeDataCur.HTMLclass == female) {
            nodeDataCur.HTMLclass = nodeDataCur.text.gender == male ? male : female;
        } else {
            nodeDataCur.HTMLclass = nodeDataCur.text.gender == male ? ndmale : ndfemale
        }

        changeDirect(nodeDataCur, nodeDataCur.HTMLclass);
        firebase.database().ref(pathDataCur).update(
            nodeDataCur
        )
    }

    $("input.nodeInfo").focusout(function () {
        updateNode();
    })
    $('input[name=nodeGender]').change(function () {
        updateNodeGender();
    })

    //Add a node
    $("#btnAddNode").click(function () {
        ref.child(pathDataCur + "children/").once("value", function (snapshot) {
            var nodeData = jsonPath(tree, "$.[?(@.hierachy == \"" + curId + "\")]")[0];
            var numChild = snapshot.numChildren();
            var hierachyNum = numChild + 1;
            // var nodeName = nodeData.hierachy + "." + hierachyNum;
            var nodeName = "";
            var nodeGender = male;
            var nodeBirthday = "";
            var nodeSpouse = "";
            var nodeDirect = male

            if (nodeData.HTMLclass == male) {
                nodeDirect = nodeGender == male ? male : female;
            } else {
                nodeDirect = nodeGender == male ? ndmale : ndfemale;
            }

            // console.log("btnAddNode Numberchild: " + numChild);
            firebase.database().ref(pathDataCur).child('children/' + numChild).set(
                {
                    hierachy: nodeData.hierachy + "." + hierachyNum,
                    HTMLclass: nodeDirect,
                    text: {
                        ID: nodeData.hierachy + "." + hierachyNum,
                        name: nodeName,
                        spouse: nodeSpouse,
                        gender: nodeGender,
                        birthday: nodeBirthday,
                        children: [],
                    },

                }
            );

            curId = nodeData.hierachy + "." + hierachyNum;
            clickNodeId();
        });
    });

    //Delete a node
    $("#btnDeleteNode").click(function () {
        firebase.database().ref(pathDataCur).remove();
        $('#btnDeleteNode').prop("disabled", true);
        //Show detail of root
        curId = "1";
        clickNodeId();
    });

    //Swap a node
    $("#btnSwapNode").click(function () {
        var preHierachy = nodeDataPre.hierachy;
        var curHierachy = nodeDataCur.hierachy;

        var newDirectPre;
        var newDirectCur;
        if (nodeDataCur.HTMLclass == male || nodeDataCur.HTMLclass == female) {
            newDirectPre = nodeDataPre.HTMLclass == ndmale ? male : female;
        } else {
            newDirectPre = nodeDataPre.HTMLclass == male ? ndmale : ndfemale;
        }

        if (nodeDataPre.HTMLclass == male || nodeDataPre.HTMLclass == female) {
            newDirectCur = nodeDataCur.HTMLclass == ndmale ? male : female;
        } else {
            newDirectCur = nodeDataCur.HTMLclass == male ? ndmale : ndfemale;
        }

        changeHierachy(nodeDataPre, curHierachy)
        changeHierachy(nodeDataCur, preHierachy)

        changeDirect(nodeDataPre, newDirectPre);
        changeDirect(nodeDataCur, newDirectCur);

        firebase.database().ref(pathDataCur).set(
            nodeDataPre
        );
        firebase.database().ref(pathDataPre).set(
            nodeDataCur
        );

        $('#btnSwapNode').prop("disabled", true);
        $('#btnAddNode').prop("disabled", true);
    })

    //Change all hierachy in object and child
    function changeHierachy(object, hierachy) {
        object.hierachy = editHierachy(object.hierachy, hierachy);
        object.text.ID = editHierachy(object.text.ID, hierachy);
        if (object.children != undefined) {
            for (var i = 0; i < object.children.length; i++) {
                changeHierachy(object.children[i], hierachy)
            }
        }
    }

    //object: nodeData
    //direct: HTMLClass
    function changeDirect(object, direct) {
        if (direct == male || direct == female) {
            direct = object.text.gender == male ? male : female;
        } else {
            direct = object.text.gender == male ? ndmale : ndfemale
        }
        object.HTMLclass = direct;
        if (object.children != undefined) {
            for (var i = 0; i < object.children.length; i++) {
                if (object.HTMLclass == ndmale || object.HTMLclass == ndfemale || object.text.gender == female) {
                    direct = object.text.gender == male ? ndmale : ndfemale;
                } else {
                    direct = object.text.gender == male ? male : female;
                }
                changeDirect(object.children[i], direct)
            }
        }
    }

    //Change origin to source
    function editHierachy(hierachyStrOrigin, hierachyStrSource) {
        var arrOri = hierachyStrOrigin.split(".");
        var arrSou = hierachyStrSource.split(".");

        var arrLengthMin = arrOri.length < arrSou.length ? arrOri.length : arrSou.length;

        for (var i = 0; i < arrLengthMin; i++) {
            arrOri[i] = arrSou[i];
        }

        var str = "";
        for (var i = 0; i < arrOri.length; i++) {
            str = str + arrOri[i]
            if (i < arrOri.length - 1) {
                str = str + ".";
            }
        }

        return str;
    }





    //Hide info panel
    $("#btnHide").click(function () {
        $("#info-panel").hide();
        $(".chart").css("margin-left", "0px");
        $("#info-panel").hide();
        $("#btnShow").show();
        $("#btnHide").hide();
    })

    //Show info panel
    $("#btnShow").click(function () {
        $("#btnShow").hide();
        $("#btnHide").show();
        $("#info-panel").show();
        $(".chart").css("margin-left", "180px");
    })
});

function convertJsonPath2FirePath(inStr) {
    var str = inStr;
    str = str.replaceAll('$', '');
    str = str.replaceAll('\'', '');
    str = str.replaceAll('][', '\/');
    str = str.replaceAll('[', '');
    str = str.replaceAll(']', '/');
    return str;
}

function clickNodeId() {
    preId = preId == "" ? "1" : preId;
    curId = curId == "" ? "1" : curId;

    nodeDataPre = jsonPath(tree, "$.[?(@.hierachy == \"" + preId + "\")]")[0];
    nodeDataCur = jsonPath(tree, "$.[?(@.hierachy == \"" + curId + "\")]")[0];
 
    pathDataCur = ancestor + "/" + jsonPath(tree, "$.[?(@.hierachy == \"" + curId + "\")]", { resultType: "PATH" }).toString();
    pathDataCur = convertJsonPath2FirePath(pathDataCur);

    console.log(pathDataCur);
    console.log(curId);

    pathDataPre =  ancestor + "/" + jsonPath(tree, "$.[?(@.hierachy == \"" + preId + "\")]", { resultType: "PATH" }).toString();
    pathDataPre = convertJsonPath2FirePath(pathDataPre);

    var hierachyParentPre = getHiarechyParent(nodeDataPre.hierachy);
    var hierachyParentCur = getHiarechyParent(nodeDataCur.hierachy);
    nodeDataParentPre = jsonPath(tree, "$.[?(@.hierachy == \"" + hierachyParentPre + "\")]")[0];
    nodeDataParentCur = jsonPath(tree, "$.[?(@.hierachy == \"" + hierachyParentCur + "\")]")[0];

    $('#btnAddNode').prop("disabled", false);
    $(thisEleCur).addClass("first-choose");
    $(thisElePre).removeClass("first-choose");
    $(thisElePre).addClass("second-choose");
    $(thisElePrePre).removeClass("second-choose");

    if(curId != "1" || preId != "1"){
        if (preId == undefined || 
            curId == undefined || 
            preId == curId || 
            curId.toString().length == 1 || 
            preId.split('.').length != curId.split('.').length) {
            $('#btnSwapNode').prop("disabled", true);
        } else {
            $('#btnSwapNode').prop("disabled", false);
        }
    }

    if (nodeDataCur != undefined) {
        var data = nodeDataCur;
        //Add to view edit detail
        $("input[name=nodeName]").val(data.text.name);
        $("input[name=nodeGender][value=" + data.text.gender + "]").prop('checked', true);
        $("input[name=nodeBirthday]").val(data.text.birthday);
        $("input[name=nodeSpouse]").val(data.text.spouse);
        if (data.HTMLclass != "") {
            $("input[name=nodeDirect]").prop('checked', true);
        } else {
            $("input[name=nodeDirect]").prop('checked', false);
        }
    }

    //Show button delete or not
    $('#btnDeleteNode').prop("disabled", true);
    var array = pathDataCur.replaceAll("/", ".").split(".");
    var strJsonPath = "";
    for (var i = 1; i < array.length - 2; i++) {
        strJsonPath = strJsonPath + array[i];
        if (i < array.length - 3) {
            strJsonPath = strJsonPath + ".";
        }
    }

    //Show relationShip
    if (nodeDataPre != undefined) {
        var relationshipStr = getRelationship(nodeDataPre.hierachy, nodeDataPre.text.gender, nodeDataCur.hierachy, nodeDataCur.text.gender);
        $('.name-pre').html(nodeDataPre.text.name);
        $('.name-cur').html(nodeDataCur.text.name);
        $('.spouse-pre').html(nodeDataPre.text.spouse);
        $('.spouse-cur').html(nodeDataCur.text.spouse);
        $('.relation-name-pre').html(relationshipStr[0]);
        $('.relation-name-cur').html(relationshipStr[1]);
        $('.relation-spouse-pre').html(relationshipStr[2]);
        $('.relation-spouse-cur').html(relationshipStr[3]);
    } else {
        $('.name-pre').html("");
        $('.relation-name-pre').html("");
        $('.relation-name-cur').html("");
        $('.name-cur').html("");
    }

    //Get the node last
    strJsonPath = strJsonPath + "[(@.length-1)]";
    var nodeData = jsonPath(tree, strJsonPath)[0];
    if (nodeData != undefined) {
        ref.child(pathDataCur).once("value", function (snapshot) {
            if (snapshot.val().children === undefined && nodeData.hierachy == snapshot.val().hierachy) {
                $('#btnDeleteNode').prop("disabled", false);
            }
        })
    };
}

function getHiarechyParent(hierachy) {
    var arr = hierachy.split('.');
    var str = "";
    if (arr.length > 1) {
        for (var i = 0; i < arr.length - 1; i++) {
            str = str + arr[i]
            if (i < arr.length - 2) {
                str = str + ".";
            }
        }
    }
    else {
        str = hierachy;
    }
    return str;
}

//st: first Previous
//sn: second Current
function getRelationship(hierachyPre, genderPre, hierachyCur, genderCur) {
    var rePre2Cur = "";
    var reCur2Pre = "";
    var reSpoPre2Cur = "";
    var reSpoCur2Pre = "";
    var arrPre = hierachyPre.split('.');
    var arrCur = hierachyCur.split('.');
    var arrPreLen = arrPre.length;
    var arrCurLen = arrCur.length;

    //>= 5 cấp
    if (arrPreLen - arrCurLen >= 5) {
        if (genderCur == male) {
            reCur2Pre = "ông";
            reSpoCur2Pre = "bà";
        } else {
            reCur2Pre = "bà";
            reSpoCur2Pre = "ông";
        }
        if (genderPre == male) {
            rePre2Cur = "cháu trai";
            reSpoPre2Cur = "cháu";
        } else {
            rePre2Cur = "cháu gái";
            reSpoPre2Cur = "cháu";
        }
    }
    if (arrCurLen - arrPreLen >= 5) {
        if (genderPre == male) {
            rePre2Cur = "ông";
            reSpoPre2Cur = "bà";
        } else {
            rePre2Cur = "bà";
            reSpoPre2Cur = "ông";
        }
        if (genderCur == male) {
            reCur2Pre = "cháu trai";
            reSpoCur2Pre = "cháu";
        } else {
            reCur2Pre = "cháu gái";
            reSpoCur2Pre = "cháu";
        }
    }

    //= 4 cấp
    if (arrPreLen - arrCurLen == 4) {
        if (genderCur == male) {
            reCur2Pre = "ông kỵ";
            reSpoCur2Pre = "bà kỵ";
        } else {
            reCur2Pre = "bà kỵ";
            reSpoCur2Pre = "ông kỵ";
        }
        if (genderPre == male) {
            rePre2Cur = "chút trai";
            reSpoPre2Cur = "chút";
        } else {
            rePre2Cur = "chút gái";
            reSpoPre2Cur = "chút";
        }
    }
    if (arrCurLen - arrPreLen == 4) {
        if (genderPre == male) {
            rePre2Cur = "ông kỵ";
            reSpoPre2Cur = "bà kỵ";
        } else {
            rePre2Cur = "bà kỵ";
            reSpoPre2Cur = "ông kỵ";
        }
        if (genderCur == male) {
            reCur2Pre = "chút trai";
            reSpoCur2Pre = "chút";
        } else {
            reCur2Pre = "chút gái";
            reSpoCur2Pre = "chút";
        }
    }

    //= 3 cấp
    if (arrPreLen - arrCurLen == 3) {
        if (genderCur == male) {
            reCur2Pre = "ông cố";
            reSpoCur2Pre = "bà cố";
        } else {
            reCur2Pre = "bà cố";
            reSpoCur2Pre = "ông cố";
        }
        if (genderPre == male) {
            rePre2Cur = "chắt trai";
            reSpoPre2Cur = "chắt";
        } else {
            rePre2Cur = "chắt gái";
            reSpoPre2Cur = "chắt";
        }
    }
    if (arrCurLen - arrPreLen == 3) {
        if (genderPre == male) {
            rePre2Cur = "ông cố";
            reSpoPre2Cur = "bà cố";
        } else {
            rePre2Cur = "bà cố";
            reSpoPre2Cur = "ông cố";
        }
        if (genderCur == male) {
            reCur2Pre = "chắt trai";
            reSpoCur2Pre = "chắt";
        } else {
            reCur2Pre = "chắt gái";
            reSpoCur2Pre = "chắt";
        }
    }

    //2 cấp
    if (arrPreLen - arrCurLen == 2) {
        if (genderCur == male) {
            if (nodeDataParentPre.text.gender == male) {
                reCur2Pre = "ông nội";
                reSpoCur2Pre = "bà nội";
            } else {
                reCur2Pre = "ông ngoại";
                reSpoCur2Pre = "bà ngoại";
            }
        } else {
            if (nodeDataParentPre.text.gender == male) {
                reCur2Pre = "bà nội";
                reSpoCur2Pre = "ông nội";
            } else {
                reCur2Pre = "bà ngoại";
                reSpoCur2Pre = "ông ngoại";
            }
        }
        if (genderPre == male) {
            rePre2Cur = "cháu trai";
            reSpoPre2Cur = "cháu dâu";
        } else {
            rePre2Cur = "cháu gái";
            reSpoPre2Cur = "cháu rể";
        }
    }
    if (arrCurLen - arrPreLen == 2) {
        if (genderPre == male) {
            if (nodeDataParentCur.text.gender == male) {
                //Bố của bố
                rePre2Cur = "ông nội";
                //Vợ của bố của bố
                reSpoPre2Cur = "ông ngoại";
            } else {
                rePre2Cur = "ông ngoại";
                reSpoPre2Cur = "ông nội";
            }
        } else {
            if (nodeDataParentCur.text.gender == male) {
                rePre2Cur = "bà nội";
                reSpoPre2Cur = "bà ngoại";
            } else {
                rePre2Cur = "bà ngoại";
                reSpoPre2Cur = "bà nội";
            }
        }
        if (genderCur == male) {
            reCur2Pre = "cháu trai";
            reSpoCur2Pre = "cháu dâu";
        } else {
            reCur2Pre = "cháu gái";
            reSpoCur2Pre = "cháu rể";
        }
    }

    //1 cấp
    if (arrCurLen - arrPreLen == 1) {
        if (getHiarechyParent(hierachyCur) == hierachyPre) {
            if (genderCur == male) {
                //Con trai của bố/mẹ
                reCur2Pre = "con trai";
                //Vợ củ con gái bố/mẹ
                reSpoCur2Pre = "con dâu";
            } else {
                //Con gái của bố/mẹ
                reCur2Pre = "con gái";
                //Chồng của con gái bố/mẹ
                reSpoCur2Pre = "con rể";
            }
            if (genderPre == male) {
                //Bố
                rePre2Cur = "bố";
                //Mẹ
                reSpoPre2Cur = "mẹ";
            } else {
                //Mẹ
                rePre2Cur = "mẹ";
                //Bố
                reSpoPre2Cur = "bố";
            }
        } else if (hierachyCur > hierachyPre) {
            if (genderCur == male) {
                //Con trai của em trai/gái
                reCur2Pre = "cháu";
                //Vợ của con trai em trai/gái
                reSpoCur2Pre = "cháu dâu";
            }
            else {
                //Con gái của em trai/gái
                reCur2Pre = "cháu";
                //Chồng của con gái em trai/gái
                reSpoCur2Pre = "cháu rể";
            }
            if (genderPre == male) {
                //Anh trai của bố
                rePre2Cur = "bác";
                //Vợ của anh trai bó
                reSpoPre2Cur = "bác";
            } else {
                //Chị gái của bố
                rePre2Cur = "bác";
                //Chồng của chị gái bố
                reSpoPre2Cur = "bác";
            }
        }
        else if (hierachyCur < hierachyPre) {
            if (genderCur == male) {
                //Con trai của anh/chị
                reCur2Pre = "cháu";
                //Vợ của con trai anh/chị
                reSpoCur2Pre = "cháu dâu";
            } else {
                //Con gái của anh/chị
                reCur2Pre = "cháu";
                //Chồng của con gái anh/chị
                reSpoCur2Pre = "cháu rể";
            }
            if (genderPre == male) {
                if (nodeDataParentCur.text.gender == male) {
                    //Em trai của bố
                    rePre2Cur = "chú";
                    //Vợ của em trai bố
                    reSpoPre2Cur = "thím";
                } else {
                    //Em trai của mẹ
                    rePre2Cur = "cậu";
                    //Vợ của em trai mẹ
                    reSpoPre2Cur = "mợ";
                }
            } else {
                if (nodeDataParentCur.text.gender == male) {
                    //Em gái của bố
                    rePre2Cur = "cô";
                    //Chồng của em gái bố
                    reSpoPre2Cur = "chú";
                } else {
                    //Em gái của mẹ
                    rePre2Cur = "dì";
                    //Chồng của em gái mẹ
                    reSpoPre2Cur = "chú";
                }
            }
        }
    }
    if (arrPreLen - arrCurLen == 1) {
        if (getHiarechyParent(hierachyPre) == hierachyCur) {
            if (genderCur == male) {
                reCur2Pre = "bố";
                reSpoCur2Pre = "mẹ";
            } else {
                reCur2Pre = "bố";
                reSpoCur2Pre = "mẹ";
            }
            if (genderPre == male) {
                rePre2Cur = "con trai";
                reSpoPre2Cur = "con dâu";
            } else {
                rePre2Cur = "con gái";
                reSpoPre2Cur = "con rể";
            }
        } else if (hierachyPre > hierachyCur) {
            if (genderCur == male) {
                reCur2Pre = "bác trai";
                reSpoCur2Pre = "bác";
            } else {
                reCur2Pre = "bác gái";
                reSpoCur2Pre = "bác";
            }
            if (genderPre == male) {
                rePre2Cur = "cháu trai";
                reSpoPre2Cur = "cháu dâu";
            } else {
                rePre2Cur = "cháu gái";
                reSpoPre2Cur = "cháu rể";
            }
        } else if (hierachyPre < hierachyCur) {
            if (genderCur == male) {
                if (nodeDataParentPre.text.gender == male) {
                    reCur2Pre = "chú";
                    reSpoCur2Pre = "cô";
                }
                else {
                    reCur2Pre = "cậu";
                    reSpoCur2Pre = "mợ";
                }
            } else {
                if (nodeDataParentPre.text.gender == male) {
                    reCur2Pre = "cô";
                    reSpoCur2Pre = "chú";
                } else {
                    reCur2Pre = "dì";
                    reSpoCur2Pre = "chú";
                }
            }
            if (genderPre == male) {
                rePre2Cur = "cháu trai";
                reSpoPre2Cur = "cháu";
            } else {
                rePre2Cur = "cháu gái";
                reSpoPre2Cur = "cháu";
            }
        }
    }

    //Cùng cấp
    if (arrCurLen - arrPreLen == 0) {
        if (hierachyPre < hierachyCur) {
            if (getHiarechyParent(hierachyPre) == getHiarechyParent(hierachyCur)) {
                if (genderCur == male) {
                    reCur2Pre = "em ruột";
                    reSpoCur2Pre = "em dâu";
                } else {
                    reCur2Pre = "em ruột";
                    reSpoCur2Pre = "em rể";
                }
                if (genderPre == male) {
                    rePre2Cur = "anh ruột";
                    reSpoPre2Cur = "chị dâu";
                } else {
                    rePre2Cur = "chị ruột";
                    reSpoPre2Cur = "anh rể";
                }
            }
            else {
                if (genderCur == male) {
                    reCur2Pre = "em họ";
                    reSpoCur2Pre = "em";
                } else {
                    reCur2Pre = "em họ";
                    reSpoCur2Pre = "em";
                }
                if (genderPre == male) {
                    rePre2Cur = "anh họ";
                    reSpoPre2Cur = "chị";
                } else {
                    rePre2Cur = "chị họ";
                    reSpoPre2Cur = "anh";
                }
            }
        }
        if (hierachyPre > hierachyCur) {
            if (getHiarechyParent(hierachyPre) == getHiarechyParent(hierachyCur)) {
                if (genderCur == male) {
                    reCur2Pre = "anh ruột";
                    reSpoCur2Pre = "chị dâu";
                } else {
                    reCur2Pre = "chị ruột";
                    reSpoCur2Pre = "anh rể";
                }
                if (genderPre == male) {
                    rePre2Cur = "em ruột";
                    reSpoPre2Cur = "em dâu";
                } else {
                    rePre2Cur = "em ruột";
                    reSpoPre2Cur = "em rể";
                }
            }
            else {
                if (genderCur == male) {
                    reCur2Pre = "anh họ";
                    reSpoCur2Pre = "chị";
                } else {
                    reCur2Pre = "chị họ";
                    reSpoCur2Pre = "anh";
                }
                if (genderPre == male) {
                    rePre2Cur = "em họ";
                    reSpoPre2Cur = "em";
                } else {
                    rePre2Cur = "em họ";
                    reSpoPre2Cur = "em";
                }
            }
        }
    }

    return [rePre2Cur, reCur2Pre, reSpoPre2Cur, reSpoCur2Pre];

}

// Replaces all instances of the given substring.
String.prototype.replaceAll = function (
    strTarget, // The substring you want to replace
    strSubString // The string you want to replace in.
) {
    var strText = this;
    var intIndexOfMatch = strText.indexOf(strTarget);

    // Keep looping while an instance of the target string
    // still exists in the string.
    while (intIndexOfMatch != -1) {
        // Relace out the current instance.
        strText = strText.replace(strTarget, strSubString)

        // Get the index of any next matching substring.
        intIndexOfMatch = strText.indexOf(strTarget);
    }

    // Return the updated string with ALL the target strings
    // replaced out with the new substring.
    return (strText);
}

function createObject(objectTree) {
    var object =
    {
        "chart": {
            "connectors": {
                "type": "step"
            },
            "container": "#family-tree",
            "node": {
                "HTMLclass": "nodeDetail"
            },
            "nodeAlign": "BOTTOM"
        },
        "nodeStructure": objectTree
    };
    return object;
}



var objectTree =
{
    "HTMLclass": "male",
    "hierachy": "1",
    "children": [
        {
            "HTMLclass": "male",
            "hierachy": "1.2",
            "text": {
                "ID": "1.2",
                "birthday": "1990-10-29",
                "gender": "male",
                "name": "con 1",
                "spouse": "Vợ con 1"
            }
        },
    ],
    "text": {
        "ID": "1",
        "birthday": "1990-10-29",
        "gender": "male",
        "name": "Cha ông nội 1",
        "spouse": "Vợ cha ông nội"
    }
}