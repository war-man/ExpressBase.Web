﻿function slideRight(leftDiv, rightDiv) {
    $stickBtn = $("<div id='stickBtnR' class='stickBtn' onclick=\"slideRight('" + leftDiv + "', '" + rightDiv + "')\">PropertyBox</div>");
    slide("right", leftDiv, rightDiv, $stickBtn);
};

function slideLeft(leftDiv, rightDiv) {
    $stickBtn = $("<div id='stickBtnL' class='stickBtn' onclick=\"slideLeft('" + leftDiv + "', '" + rightDiv + "')\">ToolBox</div>");
    slide("left", leftDiv, rightDiv, $stickBtn);
};

function slide(dir, leftDiv, rightDiv, $stickBtn) {
    var $leftDiv = $(leftDiv);
    var $rightDiv = $(rightDiv);

    var lW = parseFloat($leftDiv.css("width"));
    var rW = parseFloat($rightDiv.css("width"));

    if ($rightDiv.css("display") !== "none") {
        $rightDiv.data("width", rW);
        $rightDiv.animate({ width: 0 }, 300);
        $leftDiv.animate({ width: lW + rW + "px" }, 300);

        setTimeout(function () {
            $(document.body).append($stickBtn);
            $stickBtn.css("top", (198 + ($stickBtn.width() / 2)) + "px").css(dir, (0 - ($stickBtn.width() / 2)) + "px");
            $rightDiv.hide();
        }, 301);
    }
    else {
        rW = $rightDiv.data("width");
        if (dir === "right")
            $("#stickBtnR").remove();
        else
            $("#stickBtnL").remove();

        $rightDiv.show();
        $rightDiv.animate({ width: rW + "px" }, 300);
        $leftDiv.animate({ width: (lW - rW) + "px" }, 300);
    }
};



function getObjByval(ObjArray, key, val) {
    if (ObjArray === undefined)
        return false;
    return ObjArray.filter(function (obj) { return obj[key] == val; })[0];
};

jQuery.fn.outerHTML = function (s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};

function getKeyByVal(Obj, val) {
    var Key = null;
    $.each(Obj, function (_key, _val) {
        if (_val === val) {
            Key = _key;
            return;
        }
    });
    return Key;
};

function delKeyAndAfter(Obj, key) {
    var isReachKey = false;
    $.each(Obj, function (_key, _val) {
        if (key === _key) {
            isReachKey = true;
        }
        if (isReachKey)
            delete Obj[_key];
    });
};

function getBrowserName() {
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
};