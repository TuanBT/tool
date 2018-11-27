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
var lastID;
var id;
var preId;
var globalSnapshot;

ref.on("value", function (snapshot) {
    //Draw Family Tree
    new Treant(snapshot.val());
    lastID = snapshot.val().config.lastID;
    globalSnapshot = snapshot;

    //Show node detail
    $(".nodeDetail").click(function () {
        preId = id;
        id = parseInt($(this).find(".node-ID").text());
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
            var nodeData = jsonPath(globalSnapshot.val(), "$.[?(@.personID == " + id + ")]")[0];
            var nodeID = lastID + 1;
            var nodeName = nodeID;
            var nodeGender = "male";
            var nodeBirthday = "";
            var nodeSpouse = "";
            var nodeDirect = nodeData.HTMLclass == "male" ? "male" : "";
            var numChild = snapshot.numChildren();
            // console.log("btnAddNode Numberchild: " + numChild);
            firebase.database().ref(pathData).child('children/' + numChild).set(
                {
                    HTMLclass: nodeDirect,
                    personID: nodeID,
                    text: {
                        ID: nodeID,
                        name: nodeName,
                        spouse: nodeSpouse,
                        gender: nodeGender,
                        birthday: nodeBirthday,
                        children: [],
                    },

                }
            );

            firebase.database().ref().update({
                config: {
                    lastID: nodeID
                }
            });
            id = nodeID;
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

    //Swapp a node
    $("#btnSwapp").click(function () {
        var nodeDataPre = jsonPath(globalSnapshot.val(), "$.[?(@.personID == " + preId + ")]")[0];
        var nodeData = jsonPath(globalSnapshot.val(), "$.[?(@.personID == " + id + ")]")[0];
        var pathDataPre = jsonPath(globalSnapshot.val(), "$.[?(@.personID == " + preId + ")]", { resultType: "PATH" }).toString();
        pathDataPre = convertJsonPath2FirePath(pathDataPre);
        firebase.database().ref(pathData).set(
            nodeDataPre
        );
        firebase.database().ref(pathDataPre).set(
            nodeData
        );

        $("#btnSwapp").hide();

    })

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
        $(".chart").css("margin-left", "250px");
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
    var snapshot = globalSnapshot;
    var nodeData = jsonPath(snapshot.val(), "$.[?(@.personID == " + id + ")]");

    pathData = jsonPath(snapshot.val(), "$.[?(@.personID == " + id + ")]", { resultType: "PATH" }).toString();
    pathData = convertJsonPath2FirePath(pathData);
    // console.log("nodeDetalClick: " + pathData);

    $("#btnAddNode").show();

    if (preId == undefined || id == undefined || preId == id) {
        $("#btnSwapp").hide();
    } else {
        $("#btnSwapp").show();
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
    var nodeData = jsonPath(snapshot.val(), strJsonPath)[0];
    ref.child(pathData).once("value", function (snapshot) {
        if (snapshot.val().children === undefined && nodeData.personID == snapshot.val().personID) {
            $("#btnDeleteNode").show();
        }
    });

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
    var nodeData = jsonPath(snapshot.val(), strJsonPath)[0];
    ref.child(pathData).once("value", function (snapshot) {
        if (snapshot.val().children === undefined && nodeData.personID == snapshot.val().personID) {
            $("#btnDeleteNode").show();
        }
    });
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
    "config": {
      "lastID": 3
    },
    "nodeStructure": {
      "HTMLclass": "male",
      "personID": 1,
      "children": [
        {
          "HTMLclass": "male",
          "personID": 2,
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
          "personID": 3,
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