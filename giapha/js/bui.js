ancestor = "bui";

ref.on("value", function (snapshot) {
    //Draw Family Tree
    new Treant(createObject(snapshot.val().bui.people));
    tree = snapshot.val().bui;

    //Show node detail
    $(".nodeDetail").click(function () {
        // prePreId = preId;
        thisElePrePre = thisElePre;

        preId = curId;
        thisElePre = thisEleCur;

        curId = $(this).find(".node-ID").text();
        thisEleCur = this;

        clickNodeId();
    });
})