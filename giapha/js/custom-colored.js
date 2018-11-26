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

ref.on("value", function (snapshot) {
    //Draw Family Tree
    new Treant(snapshot.val());
    lastID = snapshot.val().config.lastID;

    //Show node detail
    $(".nodeDetail").click(function () {
        id = parseInt($(this).find(".node-ID").text());
        var nodeData = jsonPath(snapshot.val(), "$.[?(@.personID == " + id + ")]");

        pathData = jsonPath(snapshot.val(), "$.[?(@.personID == " + id + ")]", { resultType: "PATH" }).toString();
        pathData = pathData.replaceAll('$', '');
        pathData = pathData.replaceAll('\'', '');
        pathData = pathData.replaceAll('][', '\/');
        pathData = pathData.replaceAll('[', '');
        pathData = pathData.replaceAll(']', '/');
        // console.log("nodeDetalClick: " + pathData);

        if (nodeData != null) {
            var data = nodeData[0];

            //Add to view detail
            $("p.nodeName").html(data.text.name);
            $("p.nodeGender").html(data.text.gender);
            $("p.nodeBirthday").html(data.text.birthday);
            $("p.nodeSpouse").html(data.text.spouse);
            $("p.nodeDirect").html(data.HTMLclass != "" ? "true" : "false");

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
    });
})

$(document).ready(function () {

    //Update node
    $("#btnUpdateNode").click(function () {
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
        );
    });

    //Add a node
    $("#btnAddNode").click(function () {
        var nodeID = lastID + 1;
        var nodeName = $("input[name=nodeNameAdd]").val();
        var nodeGender = $('input[name=nodeGenderAdd]:checked').val();
        var nodeBirthday = $("input[name=nodeBirthdayAdd]").val();
        var nodeSpouse = $("input[name=nodeSpouseAdd]").val();
        var nodeDirect = $('input[name=nodeDirectAdd]:checked').val();

        ref.child(pathData + "children/").once("value", function (snapshot) {
            var numChild = snapshot.numChildren();
            // console.log("btnAddNode Numberchild: " + numChild);
            var textRef = firebase.database().ref(pathData).child('children/' + numChild);
            textRef.set({
                HTMLclass: nodeDirect?nodeGender:"",
                personID: nodeID,
                text: {
                    ID: nodeID,
                    name: nodeName, 
                    spouse: nodeSpouse,
                    gender: nodeGender,
                    birthday: nodeBirthday,
                },

            });

            firebase.database().ref().update({
                config: {
                    lastID: nodeID
                }
            });

        });
    });
});




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
var config = {
        container: "#custom-colored",

        nodeAlign: "BOTTOM",
        
        connectors: {
            type: 'step'
        },
        node: {
            HTMLclass: 'nodeExample1'
        }
    },
    ceo = {
        text: {
            name: "Mark Hill",
            title: "Chief executive officer",
            contact: "Tel: 01 213 123 134",
        },
        image: "./img/headshots/2.jpg"
    },

    cto = {
        parent: ceo,
        HTMLclass: 'light-gray',
        text:{
            name: "Joe Linux",
            title: "Chief Technology Officer",
        },
        image: "./img/headshots/1.jpg"
    },
    cbo = {
        parent: ceo,
        childrenDropLevel: 2,
        HTMLclass: 'blue',
        text:{
            name: "Linda May",
            title: "Chief Business Officer",
        },
        image: "./img/headshots/5.jpg"
    },
    cdo = {
        parent: ceo,
        HTMLclass: 'gray',
        text:{
            name: "John Green",
            title: "Chief accounting officer",
            contact: "Tel: 01 213 123 134",
        },
        image: "./img/headshots/6.jpg"
    },
    cio = {
        parent: cto,
        HTMLclass: 'light-gray',
        text:{
            name: "Ron Blomquist",
            title: "Chief Information Security Officer"
        },
        image: "./img/headshots/8.jpg"
    },
    ciso = {
        parent: cto,
        HTMLclass: 'light-gray',
        text:{
            name: "Michael Rubin",
            title: "Chief Innovation Officer",
            contact: "we@aregreat.com"
        },
        image: "./img/headshots/9.jpg"
    },
    cio2 = {
        parent: cdo,
        HTMLclass: 'gray',
        text:{
            name: "Erica Reel",
            title: "Chief Customer Officer"
        },
        link: {
            href: "http://www.google.com"
        },
        image: "./img/headshots/10.jpg"
    },
    ciso2 = {
        parent: cbo,
        HTMLclass: 'blue',
        text:{
            name: "Alice Lopez",
            title: "Chief Communications Officer"
        },
        image: "./img/headshots/7.jpg"
    },
    ciso3 = {
        parent: cbo,
        HTMLclass: 'blue',
        text:{
            name: "Mary Johnson",
            title: "Chief Brand Officer"
        },
        image: "./img/headshots/4.jpg"
    },
    ciso4 = {
        parent: cbo,
        HTMLclass: 'blue',
        text:{
            name: "Kirk Douglas",
            title: "Chief Business Development Officer"
        },
        image: "./img/headshots/11.jpg"
    },

    chart_config = [
        config,
        ceo,cto,cbo,
        cdo,cio,ciso,
        cio2,ciso2,ciso3,ciso4
    ];*/

// Another approach, same result
// JSON approach

/*
text: {
    name: "name",
    spouse: "spouse",
},
children: [
    {
        text: {
            name: "name",
            spouse: "spouse",
        },
    },
]
*/


var chart_config2 = {
    chart: {
        container: "#custom-colored",
        nodeAlign: "BOTTOM",
        connectors: {
            type: 'step'
        },
        node: {
            HTMLclass: 'nodeDetail'
        }
    },
    nodeStructure: {
        text: {
            ID: "1",
            name: "Cha ông nội",
            birthday: "1990-10-29",
            spouse: "Vợ cha ông nội",
        },
        HTMLclass: 'male',
        children: [
            {
                text: {
                    ID: "2",
                    name: "Ông nội",
                    spouse: "Vợ ông nội",
                },
                HTMLclass: 'male',
                children: [
                    {
                        text: {
                            name: "Bùi ... Lễ",
                            spouse: "... Ngãi",
                        },
                        HTMLclass: 'male',
                        children: [
                            {
                                text: {
                                    name: "Bùi Trung Hiếu",
                                    spouse: "Thơm",
                                },
                                HTMLclass: 'male',
                                children: [
                                    {
                                        text: {
                                            name: "Con Hiếu 1",
                                            spouse: "",
                                        },
                                        HTMLclass: 'male',
                                        children: [
                                            {
                                                text: {
                                                    ID: "2",
                                                    name: "Ông nội",
                                                    spouse: "Vợ ông nội",
                                                },
                                                HTMLclass: 'male',
                                                children: [
                                                    {
                                                        text: {
                                                            name: "Bùi ... Lễ",
                                                            spouse: "... Ngãi",
                                                        },
                                                        HTMLclass: 'male',
                                                        children: [
                                                            {
                                                                text: {
                                                                    name: "Bùi Trung Hiếu",
                                                                    spouse: "Thơm",
                                                                },
                                                                HTMLclass: 'male',
                                                                children: [
                                                                    {
                                                                        text: {
                                                                            name: "Con Hiếu 1",
                                                                            spouse: "",
                                                                        },
                                                                        HTMLclass: 'male',
                                                                    },
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        text: {
                                                            name: "Bùi Tiến Dũng",
                                                            spouse: "Nguyễn Thị Huế",
                                                        },
                                                        HTMLclass: 'male',
                                                        children: [
                                                            {
                                                                text: {
                                                                    name: "Bùi Tiến Tuân",
                                                                    spouse: "Nguyễn Thị Minh Trang",
                                                                },
                                                                HTMLclass: 'male',
                                                            },
                                                            {
                                                                text: {
                                                                    name: "Bùi Thanh Mai",
                                                                    spouse: "",
                                                                },
                                                                HTMLclass: 'female',
                                                            },
                                                            {
                                                                text: {
                                                                    name: "Bùi Ngọc Huyền",
                                                                    spouse: "",
                                                                },
                                                                HTMLclass: 'female',
                                                            }
                                                        ]
                                                    },
                                                ]
                                            },
                                        ]
                                    },
                                    {
                                        text: {
                                            name: "Con Hiếu 2",
                                            spouse: "",
                                        },
                                        HTMLclass: 'male',
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        text: {
                            name: "Bùi ... Lễ",
                            spouse: "... Ngãi",
                        },
                        HTMLclass: 'male',
                        children: [
                            {
                                text: {
                                    name: "Bùi Trung Hiếu",
                                    spouse: "Thơm",
                                },
                                HTMLclass: 'male',
                                children: [
                                    {
                                        text: {
                                            name: "Con Hiếu 1",
                                            spouse: "",
                                        },
                                        HTMLclass: 'male',
                                        children: [
                                            {
                                                text: {
                                                    ID: "2",
                                                    name: "Ông nội",
                                                    spouse: "Vợ ông nội",
                                                },
                                                HTMLclass: 'male',
                                                children: [
                                                    {
                                                        text: {
                                                            name: "Bùi ... Lễ",
                                                            spouse: "... Ngãi",
                                                        },
                                                        HTMLclass: 'male',
                                                        children: [
                                                            {
                                                                text: {
                                                                    name: "Bùi Trung Hiếu",
                                                                    spouse: "Thơm",
                                                                },
                                                                HTMLclass: 'male',
                                                                children: [
                                                                    {
                                                                        text: {
                                                                            name: "Con Hiếu 1",
                                                                            spouse: "",
                                                                        },
                                                                        HTMLclass: 'male',
                                                                    },
                                                                    {
                                                                        text: {
                                                                            name: "Con Hiếu 2",
                                                                            spouse: "",
                                                                        },
                                                                        HTMLclass: 'male',
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        text: {
                                                            name: "Bùi Tiến Dũng",
                                                            spouse: "Nguyễn Thị Huế",
                                                        },
                                                        HTMLclass: 'male',
                                                        children: [
                                                            {
                                                                text: {
                                                                    name: "Bùi Tiến Tuân",
                                                                    spouse: "Nguyễn Thị Minh Trang",
                                                                },
                                                                HTMLclass: 'male',
                                                            },
                                                            {
                                                                text: {
                                                                    name: "Bùi Thanh Mai",
                                                                    spouse: "",
                                                                },
                                                                HTMLclass: 'female',
                                                            },
                                                            {
                                                                text: {
                                                                    name: "Bùi Ngọc Huyền",
                                                                    spouse: "",
                                                                },
                                                                HTMLclass: 'female',
                                                            }
                                                        ]
                                                    },
                                                ]
                                            },
                                        ]
                                    },
                                    {
                                        text: {
                                            name: "Con Hiếu 2",
                                            spouse: "",
                                        },
                                        HTMLclass: 'male',
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        text: {
                            name: "Bùi ... Lễ",
                            spouse: "... Ngãi",
                        },
                        HTMLclass: 'male',
                        children: [
                            {
                                text: {
                                    name: "Bùi Trung Hiếu",
                                    spouse: "Thơm",
                                },
                                HTMLclass: 'male',
                                children: [
                                    {
                                        text: {
                                            name: "Con Hiếu 1",
                                            spouse: "",
                                        },
                                        HTMLclass: 'male',
                                        children: [
                                            {
                                                text: {
                                                    ID: "2",
                                                    name: "Ông nội",
                                                    spouse: "Vợ ông nội",
                                                },
                                                HTMLclass: 'male',
                                                children: [
                                                    {
                                                        text: {
                                                            name: "Bùi ... Lễ",
                                                            spouse: "... Ngãi",
                                                        },
                                                        HTMLclass: 'male',
                                                        children: [
                                                            {
                                                                text: {
                                                                    name: "Bùi Trung Hiếu",
                                                                    spouse: "Thơm",
                                                                },
                                                                HTMLclass: 'male',
                                                                children: [
                                                                    {
                                                                        text: {
                                                                            name: "Con Hiếu 1",
                                                                            spouse: "",
                                                                        },
                                                                        HTMLclass: 'male',
                                                                    },
                                                                    {
                                                                        text: {
                                                                            name: "Con Hiếu 2",
                                                                            spouse: "",
                                                                        },
                                                                        HTMLclass: 'male',
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        text: {
                                                            name: "Bùi Tiến Dũng",
                                                            spouse: "Nguyễn Thị Huế",
                                                        },
                                                        HTMLclass: 'male',
                                                        children: [
                                                            {
                                                                text: {
                                                                    name: "Bùi Tiến Tuân",
                                                                    spouse: "Nguyễn Thị Minh Trang",
                                                                },
                                                                HTMLclass: 'male',
                                                            },
                                                            {
                                                                text: {
                                                                    name: "Bùi Thanh Mai",
                                                                    spouse: "",
                                                                },
                                                                HTMLclass: 'female',
                                                            },
                                                            {
                                                                text: {
                                                                    name: "Bùi Ngọc Huyền",
                                                                    spouse: "",
                                                                },
                                                                HTMLclass: 'female',
                                                            }
                                                        ]
                                                    },
                                                ]
                                            },
                                        ]
                                    },
                                    {
                                        text: {
                                            name: "Con Hiếu 2",
                                            spouse: "",
                                        },
                                        HTMLclass: 'male',
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        text: {
                            name: "Bùi Tiến Dũng",
                            spouse: "Nguyễn Thị Huế",
                        },
                        HTMLclass: 'male',
                        children: [
                            {
                                text: {
                                    name: "Bùi Tiến Tuân",
                                    spouse: "Nguyễn Thị Minh Trang",
                                },
                                HTMLclass: 'male',
                            },
                            {
                                text: {
                                    name: "Bùi Thanh Mai",
                                    spouse: "",
                                },
                                HTMLclass: 'female',
                            },
                            {
                                text: {
                                    name: "Bùi Ngọc Huyền",
                                    spouse: "",
                                },
                                HTMLclass: 'female',
                            }
                        ]
                    },
                ]
            },
        ]
    }
};