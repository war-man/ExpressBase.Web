﻿const EbReview = function (ctrl, options) {
    this.formRenderer = options.formRenderer;
    this.ctrl = ctrl;
    ctrl._Builder = this;
    this.DataMODEL = this.formRenderer.DataMODEL[this.ctrl.TableName];
    this.userObj = options.userObject;
    this.FormSaveFn = options.formsaveFn;
    this.TableId = `tbl_${this.ctrl.EbSid_CtxId}`;
    this.$container = $(`#cont_${this.ctrl.EbSid_CtxId}`);
    this.$table = $(`#${this.TableId}`);
    this.$tableBody = $(`#${this.TableId} tbody`);
    this.Mode = options.Mode;
    this.stages = this.ctrl.FormStages.$values;
    this.FirstStage = this.stages[0];
    this.nextRole = this.stages[0].ApproverRole + "";
    this.$curActiveRow = null;

    ctrl.setEditModeRows = function (SingleTable) {/////////// need change
        return this.setEditModeRows(SingleTable);
    }.bind(this);

    ctrl.disableAllCtrls = function () {
        this.disableAllCtrls();
    }.bind(this);

    this.hide = function () {
        this.$container.hide();
    };

    this.show = function () {
        this.$container.show();
    };

    this.setRowData = function ($row, latestRowData) {
        $.each(latestRowData, function (i, cell) {
            if (cell.Name === "status")
                $row.find("[col='status'] .selectpicker").selectpicker('val', cell.Value);
            else if (cell.Name === "remarks")
                $row.find("[col='remarks'] .fs-textarea").val(cell.Value);
            else if (cell.Name === "eb_created_at") {
                $row.find("[col='review-dtls'] .fs-time").text(cell.Value);
            }
            else if (cell.Name === "eb_created_by_name") {
                $row.find("[col='review-dtls'] .fs-uname").text(cell.Value);
            }
            else if (cell.Name === "eb_created_by_id") {
                let url = `url(../images/dp/${cell.Value}.png)`;
                $row.find("[col='review-dtls'] .fs-dp").css("background-image", url);
            }
        }.bind(this));
    };

    this.ctrl.ChangedRowObject = function () {
        return this.changedRowWT();
    }.bind(this);

    this.changedRowWT = function () {
        let SingleTable = [];
        SingleTable.push(this.getCurRowValues());
        console.log(SingleTable);
        return SingleTable;
    };

    this.getCurRowValues = function () {
        let action_unique_id = this.$curActiveRow.find("[col='status'] .selectpicker").selectpicker('val');
        let comments = this.$curActiveRow.find("[col='remarks'] .fs-textarea").val();

        for (let j = 0; j < this.stageDATA.Columns.length; j++) {
            let column = this.stageDATA.Columns[j];
            if (column.Name === "action_unique_id") {
                column.Value = action_unique_id;
            }
            else if (column.Name === "comments") {
                column.Value = comments;
            }
        }
        return this.stageDATA;
    };

    this.confirmBoxCallBack = function (btnTxt) {
        if (btnTxt === "Yes")
            this.FormSaveFn();
    };

    this.switch2editMode = function () {
        this.disableAllCtrls();
    };

    this.switch2viewMode = function (DataMODEL) {
        this.show();
        this.DataMODEL = DataMODEL;
        this.init();
    };

    this.submit = function () {
        EbDialog("show", {
            Message: "Are you sure, you want to submit ?",
            Buttons: {
                "Yes": {
                    Background: "green",
                    Align: "right",
                    FontColor: "white;"
                },
                "No": {
                    Background: "red",
                    Align: "left",
                    FontColor: "white;"
                }
            },
            CallBack: this.confirmBoxCallBack.bind(this)
        });
    }.bind(this);

    this.disableAllCtrls = function () {
        $('.selectpicker').selectpicker();
        this.$table.find(".fstd-div .fs-textarea").attr('disabled', 'disabled').css('pointer-events', 'none');
        this.$table.find("td[col='status'] .dropdown-toggle").attr('disabled', 'disabled').css('pointer-events', 'none').find(".bs-caret").hide();
        this.$submit.hide();
        this.$container.find("tr").attr("active", "false");
    };

    this.enableRow = function () {
        let $row = this.$tableBody.find("tr[rowid=0]");
        this.$curActiveRow = $row;
        if (!$row)
            return;

        this.stageDATA = getObjByval(this.DataMODEL, "RowId", 0);

        this.hasPermission = getObjByval(this.stageDATA.Columns, "Name", "has_permission").Value === "F";
        this.isFormDataEditable = getObjByval(this.stageDATA.Columns, "Name", "is_form_data_editable").Value === "F";

        if (!this.stageDATA || this.hasPermission)
            return;

        $row.find(".fstd-div .fs-textarea").prop('disabled', false).css('pointer-events', 'inherit');
        $row.find("td[col='status'] .dropdown-toggle").prop('disabled', false).css('pointer-events', 'inherit').find(".bs-caret").show();
        this.$submit.show(300);
        $row.attr("active", "true");
    };


    this.drawTable = function () {
        this.$tableBody.empty();
        for (let i = 0; i < this.DataMODEL.length; i++) {
            let row = this.DataMODEL[i];
            let ebsid = getObjByval(row.Columns, "Name", "stage_unique_id").Value;
            let stage = getObjByval(this.stages, "EbSid", ebsid);
            let html = stage.Html;

            html = html.replace("@rowid@", row.RowId);
            html = html.replace("@slno@", i + 1);
            for (let j = 0; j < row.Columns.length; j++) {
                let column = row.Columns[j];
                if (column.Name === "eb_created_by") {
                    let userId = column.Value.split("$$")[0];
                    let userName = column.Value.split("$$")[1];
                    let url = `url(../images/dp/${userId}.png)`;
                    html = html.replace("@dpstyle@", `style='background-image:${url}'`)
                        .replace("@uname@", userName);
                }
                //else if (column.Name === "eb_created_by") {
                //    html = html.replace("@uname@", column.Value);
                //}
                else if (column.Name === "eb_created_at") {
                    html = html.replace("@time@", column.Value);
                }
                else if (column.Name === "comments") {
                    html = html.replace("@comment@", column.Value);
                }
            }
            this.$tableBody.append(html);
        }
    };

    this.init = function () {
        this.ctrl.__ready = true;
        this.$submit = this.$container.find(".fs-submit");
        this.$container.on("click", ".fs-submit", this.submit);

        this.drawTable();
        this.disableAllCtrls();
        this.enableRow();
    };

    //this.init();
};