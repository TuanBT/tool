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
var pathData;
var pathDataPre;
var id;
var preId;
var thisEle;
var thisElempre;

ref.on("value", function (snapshot) {
    //Draw Family Tree
    new Treant(createObject(snapshot.val().tree1.people));
    tree = snapshot.val();

    //Show node detail
    $(".nodeDetail").click(function () {
        preId = id;
        thisElempre = thisEle;
        id = $(this).find(".node-ID").text();
        thisEle = this;

        clickNodeId(id);
    });
})

$(document).ready(function () {
    //Update node
    function updateNode() {
        var nodeName = $("input[name=nodeName]").val();
        var nodeGender = $('input[name=nodeGender]:checked').val();
        var nodeBirthday = $("input[name=nodeBirthday]").val();
        var nodeSpouse = $("input[name=nodeSpouse]").val();
        var nodeDirect = $('input[name=nodeDirect]:checked').val();
        firebase.database().ref(pathData).update(
            {
                HTMLclass: nodeDirect ? nodeGender : "",
                text: {
                    ID: id,
                    name: nodeName,
                    spouse: nodeSpouse,
                    gender: nodeGender,
                    birthday: nodeBirthday,
                }
            }
        )
    }

    $("input.nodeInfo").focusout(function () {
        updateNode();
    })
    $('input[name=nodeGender]').change(function () {
        updateNode();
    })
    $('input[name=nodeDirect]').change(function () {
        updateNode();
    })

    //Add a node
    $("#btnAddNode").click(function () {
        ref.child(pathData + "children/").once("value", function (snapshot) {
            var nodeData = jsonPath(tree, "$.[?(@.hierachy == \"" + id + "\")]")[0];
            var numChild = snapshot.numChildren();
            var hierachyNum = numChild + 1;
            var nodeName = nodeData.hierachy + "." + hierachyNum;
            var nodeGender = "male";
            var nodeBirthday = "";
            var nodeSpouse = "";
            var nodeDirect = nodeData.HTMLclass == "male" ? "male" : "";
            // console.log("btnAddNode Numberchild: " + numChild);
            firebase.database().ref(pathData).child('children/' + numChild).set(
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

            id = nodeData.hierachy + "." + hierachyNum;
            clickNodeId(id);
        });
    });

    //Delete a node
    $("#btnDeleteNode").click(function () {
        firebase.database().ref(pathData).remove();
        $("#btnDeleteNode").hide();
        //Show detail of root
        clickNodeId(1);
    });

    var nodeDataPre;
    var nodeDataCur;
    //Swap a node
    $("#btnSwap").click(function () {
        nodeDataPre = jsonPath(tree, "$.[?(@.hierachy == \"" + preId + "\")]")[0];
        nodeDataCur = jsonPath(tree, "$.[?(@.hierachy == \"" + id + "\")]")[0];

        var preHierachy = nodeDataPre.hierachy;
        var curHierachy = nodeDataCur.hierachy;
        changeHierachy(nodeDataPre, curHierachy)
        changeHierachy(nodeDataCur, preHierachy)

        firebase.database().ref(pathData).set(
            nodeDataPre
        );
        firebase.database().ref(pathDataPre).set(
            nodeDataCur
        );

        $("#btnSwap").hide();

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
        $("#function-panel").show();
    })

    //Show info panel
    $("#btnShow").click(function () {
        $("#function-panel").hide();
        $("#info-panel").show();
        $(".chart").css("margin-left", "200px");
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

function clickNodeId(id) {
    var nodeData = jsonPath(tree, "$.[?(@.hierachy == \"" + id + "\")]");

    pathData = jsonPath(tree, "$.[?(@.hierachy == \"" + id + "\")]", { resultType: "PATH" }).toString();
    pathData = convertJsonPath2FirePath(pathData);

    console.log(pathData);
    console.log(id);

    pathDataPre = jsonPath(tree, "$.[?(@.hierachy == \"" + preId + "\")]", { resultType: "PATH" }).toString();
    pathDataPre = convertJsonPath2FirePath(pathDataPre);

    $("#btnAddNode").show();
    $(thisEle).addClass("first-choose");
    $(thisElempre).removeClass("first-choose");

    if (preId == undefined || id == undefined || preId == id) {
        $("#btnSwap").hide();
    } else {
        $("#btnSwap").show();
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
    $("#btnDeleteNode").hide();
    var array = pathData.replaceAll("/", ".").split(".");
    var strJsonPath = "";
    for (var i = 0; i < array.length - 2; i++) {
        strJsonPath = strJsonPath + array[i];
        if (i < array.length - 3) {
            strJsonPath = strJsonPath + ".";
        }
    }
    //Get the node last
    strJsonPath = strJsonPath + "[(@.length-1)]";
    var nodeData = jsonPath(tree, strJsonPath)[0];
    if (nodeData != undefined) {
        ref.child(pathData).once("value", function (snapshot) {
            if (snapshot.val().children === undefined && nodeData.hierachy == snapshot.val().hierachy) {
                $("#btnDeleteNode").show();
            }

        })
    };

    //Show button delete or not
    $("#btnDeleteNode").hide();
    var array = pathData.replaceAll("/", ".").split(".");
    var strJsonPath = "";
    for (var i = 0; i < array.length - 2; i++) {
        strJsonPath = strJsonPath + array[i];
        if (i < array.length - 3) {
            strJsonPath = strJsonPath + ".";
        }
    }
    //Get the node last
    strJsonPath = strJsonPath + "[(@.length-1)]";
    var nodeData = jsonPath(tree, strJsonPath)[0];
    if (nodeData != undefined) {
        ref.child(pathData).once("value", function (snapshot) {
            if (snapshot.val().children === undefined && nodeData.hierachy == snapshot.val().hierachy) {
                $("#btnDeleteNode").show();
            }
        })
    };
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

/*
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
    "nodeStructure": {
      "HTMLclass": "male",
      "hierachy": 1,
      "children": [
        {
          "HTMLclass": "male",
          "hierachy": 2,
          "text": {
            "ID": 2,
            "birthday": "1990-10-29",
            "gender": "male",
            "name": "con 1",
            "spouse": "Vợ con 1"
          }
        },
        {
          "HTMLclass": "female",
          "hierachy": 3,
          "text": {
            "ID": 3,
            "birthday": "1990-10-29",
            "gender": "female",
            "name": "con 2",
            "spouse": "chong con 2"
          }
        }
      ],
      "text": {
        "ID": 1,
        "birthday": "1990-10-29",
        "gender": "male",
        "name": "Cha ông nội 1",
        "spouse": "Vợ cha ông nội"
      }
    }
  }
  */

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
    "hierachy": 1,
    "children": [
        {
            "HTMLclass": "male",
            "hierachy": 2,
            "text": {
                "ID": 2,
                "birthday": "1990-10-29",
                "gender": "male",
                "name": "con 1",
                "spouse": "Vợ con 1"
            }
        },
    ],
    "text": {
        "ID": 1,
        "birthday": "1990-10-29",
        "gender": "male",
        "name": "Cha ông nội 1",
        "spouse": "Vợ cha ông nội"
    }
}