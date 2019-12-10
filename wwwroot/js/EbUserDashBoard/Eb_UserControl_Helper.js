﻿let EbUserCtrlHelper = function (options) {
    this.options = options;

    this.init = function () {

        this.getUserControl();



    }
    this.getUserControl = function () {
        $.ajax({
            url: '../DashBoard/UserControlGetObj',
            type: 'POST',
            data: { refid: this.options.refId },
            success: this.getUserControlSuccess.bind(this)
        });
    }

    this.getUserControlSuccess = function (resp) {
        $(this.options.parentDiv).append(JSON.parse(resp).UcHtml); 

        if (JSON.parse(resp).UcHtml.includes("table")) {
            $(this.options.parentDiv).addClass("user-ctrl-row");
        }
        else {
            $(this.options.parentDiv).addClass("user-ctrl-col");
        }
        $(`[ctype="DataObject"]`).remove();
    }


    this.init();
}