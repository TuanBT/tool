ancestor = "nguyen";

ref.on("value", function (snapshot) {
    //Draw Family Tree
    new Treant(createObject(snapshot.val().nguyen.people));
    tree = snapshot.val().nguyen;

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