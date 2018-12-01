//FireBase
var config = {
    apiKey: "AIzaSyAR8cYUbTWgB72t4-N21gyR5F2P9vaRm7o",
    authDomain: "tree-family-tuan.firebaseapp.com",
    databaseURL: "https://tree-family-tuan.firebaseio.com",
    projectId: "tree-family-tuan",
    storageBucket: "tree-family-tuan.appspot.com",
    messagingSenderId: "75284012167"
};
firebase.initializeApp(config);

// Get a reference to the database service
var ref = firebase.database().ref();
var curId;
var thisEleCur;
var pathDataCur;
var preId;
var thisElePre;
var pathDataPre;
// var prePreId;
var thisElePrePre;
// var pathDataPrePre;
var male = "male";
var female = "female";
var ndmale = "ndmale";
var ndfemale = "ndfemale";

ref.on("value", function (snapshot) {
    //Draw Family Tree
    new Treant(createObject(snapshot.val().tree1.people));
    tree = snapshot.val();

    //Show node detail
    $(".nodeDetail").click(function () {
        // prePreId = preId;
        thisElePrePre = thisElePre;

        preId = curId;
        thisElePre = thisEleCur;

        curId = $(this).find(".node-ID").text();
        thisEleCur = this;

        clickNodeId(curId);
    });
})

$(document).ready(function () {
    //Update node
    function updateNode() {
        var nodeName = $("input[name=nodeName]").val();
        var nodeGender = $('input[name=nodeGender]:checked').val();
        var nodeBirthday = $("input[name=nodeBirthday]").val();
        var nodeSpouse = $("input[name=nodeSpouse]").val();
        // var nodeDirect = nodeDirect;

        firebase.database().ref(pathDataCur).update(
            {
                text: {
                    name: nodeName,
                    spouse: nodeSpouse,
                    gender: nodeGender,
                    birthday: nodeBirthday,
                }
            }
        )
    }

    function updateNodeGender() {
        var nodeGender = $('input[name=nodeGender]:checked').val();
        var nodeData = jsonPath(tree, "$.[?(@.hierachy == \"" + curId + "\")]")[0];

        nodeData.text.gender = nodeGender;
        if (nodeData.HTMLclass == male || nodeData.HTMLclass == female) {
            nodeData.HTMLclass = nodeData.text.gender == male ? male : female;
        } else {
            nodeData.HTMLclass = nodeData.text.gender == male ? ndmale : ndfemale
        }

        changeDirect(nodeData, nodeData.HTMLclass);
        firebase.database().ref(pathDataCur).update(
            nodeData
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
            clickNodeId(curId);
        });
    });

    //Delete a node
    $("#btnDeleteNode").click(function () {
        firebase.database().ref(pathDataCur).remove();
        $('#btnDeleteNode').prop("disabled", true);
        //Show detail of root
        clickNodeId(1);
    });

    var nodeDataPre;
    var nodeDataCur;
    //Swap a node
    $("#btnSwapNode").click(function () {
        nodeDataPre = jsonPath(tree, "$.[?(@.hierachy == \"" + preId + "\")]")[0];
        nodeDataCur = jsonPath(tree, "$.[?(@.hierachy == \"" + curId + "\")]")[0];

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

function clickNodeId(curId) {
    var nodeData = jsonPath(tree, "$.[?(@.hierachy == \"" + curId + "\")]");

    pathDataCur = jsonPath(tree, "$.[?(@.hierachy == \"" + curId + "\")]", { resultType: "PATH" }).toString();
    pathDataCur = convertJsonPath2FirePath(pathDataCur);

    console.log(pathDataCur);
    console.log(curId);

    pathDataPre = jsonPath(tree, "$.[?(@.hierachy == \"" + preId + "\")]", { resultType: "PATH" }).toString();
    pathDataPre = convertJsonPath2FirePath(pathDataPre);

    $('#btnAddNode').prop("disabled", false);
    $(thisEleCur).addClass("first-choose");
    $(thisElePre).removeClass("first-choose");
    $(thisElePre).addClass("second-choose");
    $(thisElePrePre).removeClass("second-choose");

    if (preId == undefined || curId == undefined || preId == curId || preId.split('.').length != curId.split('.').length) {
        $('#btnSwapNode').prop("disabled", true);
    } else {
        $('#btnSwapNode').prop("disabled", false);
    }

    if (nodeData != undefined) {
        var data = nodeData[0];
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
    for (var i = 0; i < array.length - 2; i++) {
        strJsonPath = strJsonPath + array[i];
        if (i < array.length - 3) {
            strJsonPath = strJsonPath + ".";
        }
    }

    //Show relationShip
    var nodeDataPre = jsonPath(tree, "$.[?(@.hierachy == \"" + preId + "\")]");

    if (nodeData.length > 0 && nodeDataPre.length > 0) {
        var relationshipStr = getRelationship(nodeDataPre[0].hierachy, nodeDataPre[0].text.gender, nodeData[0].hierachy, nodeData[0].text.gender);
        $('.name-pre').html(nodeDataPre[0].text.name);
        $('.relation-name-pre').html("là " + relationshipStr[0] + " của");
        $('.relation-name-cur').html("là " + relationshipStr[1] + " của");
        $('.name-cur').html(nodeData[0].text.name);
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

function getParentHiarechy(hierachy) {
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
    var arrPre = hierachyPre.split('.');
    var arrCur = hierachyCur.split('.');
    var arrPreLen = arrPre.length;
    var arrCurLen = arrCur.length;

    //>2 cấp
    if (arrPreLen - arrCurLen >= 2) {
        if (genderCur == male) {
            reCur2Pre = "ông";
        } else {
            reCur2Pre = "bà";
        }
        if (genderPre == male) {
            rePre2Cur = "cháu trai";
        } else {
            rePre2Cur = "cháu gái";
        }
    }
    if (arrCurLen - arrPreLen >= 2) {
        if (genderCur == male) {
            reCur2Pre = "cháu trai";
        } else {
            reCur2Pre = "cháu gái";
        }
        if (genderPre == male) {
            rePre2Cur = "ông";
        } else {
            rePre2Cur = "bà";
        }
    }

    //1 cấp
    if (arrCurLen - arrPreLen == 1) {
        if (getParentHiarechy(hierachyCur) == hierachyPre) {
            if (genderCur == male) {
                reCur2Pre = "con trai";
            } else {
                reCur2Pre = "con gái";
            }
            if (genderPre == male) {
                rePre2Cur = "bố";
            } else {
                rePre2Cur = "mẹ";
            }
        } else if (hierachyCur > hierachyPre) {
            if (genderCur == male) {
                reCur2Pre = "cháu trai";
            }
            else {
                reCur2Pre = "cháu gái";
            }
            if (genderPre == male) {
                rePre2Cur = "bác trai";
            } else {
                rePre2Cur = "bác gái";
            }
        }
        else if (hierachyCur < hierachyPre) {
            if (genderCur == male) {
                reCur2Pre = "cháu trai";
            } else {
                reCur2Pre = "cháu gái";
            }
            if (genderPre == male) {
                rePre2Cur = "chú";
            } else {
                rePre2Cur = "cô";
            }
        }
    }
    if (arrPreLen - arrCurLen == 1) {
        if (getParentHiarechy(hierachyPre) == hierachyCur) {
            if (genderCur == male) {
                reCur2Pre = "bố";
            } else {
                reCur2Pre = "bố";
            }
            if (genderPre == male) {
                rePre2Cur = "con trai";
            } else {
                rePre2Cur = "con gái";
            }
        } else if (hierachyPre > hierachyCur) {
            if (genderCur == male) {
                reCur2Pre = "bác trai";
            } else {
                reCur2Pre = "bác trai";
            }
            if (genderPre == male) {
                rePre2Cur = "cháu trai";
            } else {
                rePre2Cur = "cháu gái";
            }
        } else if (hierachyPre < hierachyCur) {
            if (genderCur == male) {
                reCur2Pre = "chú";
            } else {
                reCur2Pre = "cô";
            }
            if (genderPre == male) {
                rePre2Cur = "cháu trai";
            } else {
                rePre2Cur = "cháu gái";
            }
        }
    }

    //Cùng cấp
    if (arrCurLen - arrPreLen == 0) {
        if (hierachyPre < hierachyCur) {
            if (getParentHiarechy(hierachyPre) == getParentHiarechy(hierachyCur)) {
                if (genderCur == male) {
                    reCur2Pre = "em trai ruột";
                } else {
                    reCur2Pre = "em gái ruột";
                }
                if (genderPre == male) {
                    rePre2Cur = "anh ruột";
                } else {
                    rePre2Cur = "chị ruột";
                }
            }
            else {
                if (genderCur == male) {
                    reCur2Pre = "em trai họ";
                } else {
                    reCur2Pre = "em gái họ";
                }
                if (genderPre == male) {
                    rePre2Cur = "anh họ";
                } else {
                    rePre2Cur = "chị họ";
                }
            }
        }
        if (hierachyPre > hierachyCur) {
            if (getParentHiarechy(hierachyPre) == getParentHiarechy(hierachyCur)) {
                if (genderCur == male) {
                    reCur2Pre = "anh ruột";
                } else {
                    reCur2Pre = "chị ruột";
                }
                if (genderPre == male) {
                    rePre2Cur = "em trai ruột";
                } else {
                    rePre2Cur = "em gái ruột";
                }
            }
            else {
                if (genderCur == male) {
                    reCur2Pre = "anh họ";
                } else {
                    reCur2Pre = "chị họ";
                }
                if (genderPre == male) {
                    rePre2Cur = "em trai họ";
                } else {
                    rePre2Cur = "em gái họ";
                }
            }
        }
    }

    return [rePre2Cur, reCur2Pre];

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
            "container": "#custom-colored",
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