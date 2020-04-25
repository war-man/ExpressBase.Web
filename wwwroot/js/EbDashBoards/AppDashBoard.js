﻿var AppDashBoard = function (appid, apptype, appsettings) {
    this.objectTab = $("#Objects");
    this.ExportCollection = [];
    this.AppId = appid;
    this.AppType = apptype;
    this.AppSettings = appsettings;


    this.init = function () {
        this.cssConfigFn();
        $('#updateBotSettingsID').on('click', this.UpdateBotSettingsFn.bind(this));
    }
    this.searchObjects = function (e) {
        var srchBody = $(".raw-objectTypeWrprBlk:visible");
        var srch = $(e.target).val().toLowerCase();
        var count = 0;
        $.each(srchBody.find(".objitems"), function (i, obj) {
            var cmpstr = $(obj).find(".head4").text().toLowerCase();
            if (cmpstr.indexOf(srch) !== -1) {
                $(obj).show();
                count++;
            }
            else
                $(obj).hide();
        });
    };

    this.expand = function (e) {
        let trigger = $(e.target).closest(".sidebar-objtypes-listitem").children("a").attr("link-id");
        $(".raw-objectTypeWrprBlk").hide();
        $(".active_type").removeClass("active_type");
        $(e.target).closest(".sidebar-objtypes-listitem").addClass("active_type");
        $(`#${trigger}`).fadeIn();
    }

    this.export = function (e) {
        this.ExportCollection.length = 0;
        this.objectTab.find(`input[name="ExportMark"]`).each(function (i, o) {
            if ($(o).is(":checked")) {
                this.ExportCollection.push($(o).attr("objid"));
            }
        }.bind(this));
        if (this.ExportCollection.length > 0)
            this.startExp();
    };

    this.startExp = function () {
        var form = document.createElement("form");
        form.style.display = "none";
        form.setAttribute("method", "post");
        form.setAttribute("action", "../ImportExport/ExportOSE");
        var ids = document.createElement("input");
        ids.setAttribute("name", "ids");
        ids.setAttribute("value", this.ExportCollection.join());
        form.appendChild(ids);
        var appid = document.createElement("input");
        appid.setAttribute("name", "AppId");
        appid.setAttribute("value", this.AppId);
        form.appendChild(appid);
        document.body.appendChild(form);
        form.submit();
    };

    this.setUpImport4Mob = function () {
        $(".import_obj_link").off("click").on("click", this.objTypeClick.bind(this));
        $("#import_refsave").off("click").on("click", this.getSelRef.bind(this));
        $("#save_importref").off("click").on("click", this.saveAppSettingsMob.bind(this));
        $("#import_reftable_body").on("click", ".rm_refbtn", this.removeImportRef.bind(this));
        this.setRef();
    };

    this.objTypeClick = function (evt) {
        let div = $(evt.target).closest(".import_obj_link");
        let target = div.attr("exp-target");
        $(".import_obj_expand").hide();
        $(target).show();
    };

    this.refExist = function (ref) {
        let coll = this.AppSettings.DataImport.find(e => e.RefId === ref);
        if (coll === undefined || coll === null)
            return false;
        else return true;
    }

    this.getSelRef = function () {
        $(`.import_data_objects`).find(`input[name="importcheckbox"]`).each(function (i, o) {
            if ($(o).is(":checked")) {
                let ref = $(o).attr("refid");
                if (!this.refExist(ref)) {
                    let di = { TableName: "", RefId: ref };
                    this.AppSettings.DataImport.push(di);
                    this.addRef(di);
                }
            }
        }.bind(this));
        $("#import_data_mdl").modal("toggle");
    };

    this.addRef = function (o) {
        $("#import_reftable_body .empty_tr").hide();
        $("#import_reftable_body").append(`<tr>
                                    <td><input type="text" class="import_reftable_input" value="${o.TableName}" name="${o.RefId}_input"/></td>
                                    <td>${o.RefId}</td>
                                    <td class="text-center"><button class="rm_refbtn" ref="${o.RefId}"><i class="fa fa-close"></i></button></td>
                                </tr>`);
    };

    this.saveAppSettingsMob = function () {
        for (let i = 0; i < this.AppSettings.DataImport.length; i++) {
            this.AppSettings.DataImport[i].TableName = $(`input[name="${this.AppSettings.DataImport[i].RefId}_input"]`).val();
        }
        if (this.AppSettings.DataImport.length > 0)
            this.updateAppsettings();
    };

    this.removeImportRef = function (evt) {
        let div = $(evt.target).closest("button");
        let refid = div.attr("ref");
        for (let i = 0; i < this.AppSettings.DataImport.length; i++) {
            if (this.AppSettings.DataImport[i].RefId === refid) {
                this.AppSettings.DataImport.splice(i, 1);
            }
        }
        div.closest("tr").remove();
        $(`input[refid="${refid}"]`).prop("checked", false);
    };

    this.updateAppsettings = function () {
        $.ajax({
            url: "../Dev/UpdateAppSettingsMob",
            type: 'POST',
            data: {
                "settings": JSON.stringify(this.AppSettings),
                "appid": this.AppId,
                "type": this.AppType
            },
            success: function (result) {
                EbMessage("show", { Message: result.message });
            }.bind(this)
        })
    };

    this.setRef = function () {
        for (let i = 0; i < this.AppSettings.DataImport.length; i++) {
            $(`input[refid="${this.AppSettings.DataImport[i].RefId}"]`).prop("checked", true);
        }
    };

    this.start_exe = function () {
        $(".appdash_obj_container").off("keyup").on("keyup", "#obj_search_input", this.searchObjects.bind(this));
        $("#ExportBtn").off("click").on("click", this.export.bind(this));
        $(".sidebar-objtypes-listitem").off("click").on("click", this.expand.bind(this));
        if (this.AppType === 2) {
            this.setUpImport4Mob();
        }
    }
    //for bot
    this.cssConfigFn = function () {

        //let property = atob(this.AppSettings.CssContent).split(";");
        //for (i = 0; i < property.length; i++) {

        //    let props = property[i].trim();
        //    let cssProp = props.split(':');
        //    html += `<label >${cssProp[0]}</label>
        //            <input type='text' value='${cssProp[1]}' ><br><br>`;

        //}
        //$('#configcssTabContent #3tab').append(html);
        let cssobj = this.AppSettings.CssContent;
        for (let property in cssobj) {

            let html = "";
            for (let key in cssobj[property]) {
                html += `<label obname='${key}'>${key}</label>
                   <input type='text' obname=${key} value='${cssobj[property][key]}' ><br><br>`;
            }
            $(`#configcssTabContent #${property}`).append(html);
        }
    }
    this.UpdateBotSettingsFn = function () {
        var appSettings = {};
        let cssConstObj = {};

        let cssobj = this.AppSettings.CssContent;
        for (let property in cssobj) {
            let tempobj = {};
            for (let key in cssobj[property]) {
                let cssobjVal = $(`#configcssTabContent #${property} input[obname=${key}]`).val();
                tempobj[key] = cssobjVal;
            }
            cssConstObj[property] = tempobj;
        }
        appSettings["Name"] = $("#bot_name_txt").val();
        appSettings["WelcomeMessage"] = $("#bot_wc_msg").val();
        appSettings["ThemeColor"] = $("#bot_tm_color").val();
        appSettings["DpUrl"] = $("#bot_dp_url").val();
        appSettings["CssContent"] = cssConstObj
        $.ajax({
            type: "POST",
            url: "../Dev/UpdateAppSettings",
            data: { id: this.AppId, type: this.AppType, settings: JSON.stringify(appSettings) },
            success: function (data) {
                if (data > 0)
                    alert("Settings Updated Successfully");
                else
                    alert("Something went wrong");
            }
        });
    }
    this.start_exe();
    this.init();

}