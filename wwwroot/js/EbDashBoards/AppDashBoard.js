﻿var AppDashBoard = function (obtypes,objcoll) {
    this.ObjTypes = obtypes;
    this.ObjCollection = objcoll;
    this.objectTab = $("#Objects");
    this.objTypesImages = getEbObjectTypes();

    for (type in this.ObjTypes) {
        $("#object_types_drd").append(`<li class="drp_menuitems">
                       <a role="menuitem" tabindex="-1" href="../Eb_Object/Index?objid=null&objtype=${type}"">${this.ObjTypes[type]}</a></li>`);
    }
    
    this.apndObTypeClpsCont = function () {
        for (var otype in this.ObjCollection) {
            this.objectTab.append(`<div class="objContainer_f_app" style="width:50%;">
                                                <div class="objContainer2">
                                                    <div class="form-inline obType_wrapper_head appdash_obType_wrapper_head" obj_container="appdash_obtype_container${otype}" id="appdash_obType_wrapper_head${otype}"
                                                        len="${this.ObjCollection[otype].Objects.length}" data-toggle="collapse" data-target="#appdash_obtype_container${otype}" style="cursor:pointer;">
                                                       ${this.ObjTypes[otype]}s<span class="obj_count">(${this.ObjCollection[otype].Objects.length})</span>
                                                        <div class="btn_container pull-right">
                                                       <a class="btn btn-sm table-btn ob_search"><i class="material-icons">search</i></a>
                                                        <input type="text" search_body="appdash_obtype_container${otype}" class="form-control obj_search_input" placeholder="Search" style="display:none;"> 
                                                            <a class="btn new_btn pull-right" href="../Eb_Object/Index?objid=null&objtype=${otype}">
                                                            <i class="material-icons" style="pointer-events:none;">add</i></a>
                                                         </div>                                                    
                                                        </div>
                                                    <div class="obtype_container appdash_obtype_container collapse" id="appdash_obtype_container${otype}">
                                                        <div class="not-found" style="display:none;"></div>
                                                    </div>
                                                </div>
                                            </div>`);

            this.appendObjectList($(".appdash_obj_container #appdash_obtype_container" + otype), otype);
        }
        $(".appdash_obj_container .appdash_obType_wrapper_head").on("click", this.actionCollapse.bind(this));
        $(".appdash_obj_container .obj_search_input").off("click").on("click", function (e) { e.stopPropagation(); });
    };

    this.appendObjectList = function ($listContaner, otype) {
        if (!$.isEmptyObject(this.ObjCollection[otype])){
            for (var i = 0; i < this.ObjCollection[otype].Objects.length; i++) {
                var _obj = this.ObjCollection[otype].Objects[i];
                $listContaner.append(`<div class='col-md-6 objitems' name='objBox'>
                    <div class="object_container">
                        <div class='col-md-11 col-lg-11 col-sm-11 pd-0'>
                            <h4 class='head4'>${_obj.ObjName}</h4>
                            <p class='text-justify'>${_obj.Description || 'no description'}</p>
                            <div class="label_container">
                                <span name="Version" class="label">V.${_obj.VersionNumber}</span>
                                <span class="label">${_obj.EbType}</span>
                            </div>
                        </div>
                        <div class='col-md-1 pd-0 objbox-footer'>
                            <a href='../Eb_Object/Index?objid=${_obj.Id}&objtype=${_obj.EbObjectType}' class='btn'><i class="fa fa-pencil" aria-hidden="true"></i></a>
                        </div>
                    </div>
                </div>`);
            }
        }    
    };

    this.actionCollapse = function (e) {
        if (!$(e.target).hasClass("new_btn")) {
            var $div = $(e.target).closest(".appdash_obType_wrapper_head");
            if ($div.attr("aria-expanded") !== "true") {
                $div.closest(".objContainer_f_app").addClass("brd");
                $div.parent().parent().animate({ width: '100%' });
                $div.addClass("collapse_headBG").children(".btn_container").children("input").show();
                $div.children(".btn_container").children(".ob_search").hide();
                if (parseInt($div.attr("len")) < 1)
                    $("#" + $div.attr("obj_container")).children(".not-found").show().text("empty.");
                else
                    $("#" + $div.attr("obj_container")).children(".not-found").hide().text(" ");
            }
            else {
                $div.closest(".objContainer_f_app").removeClass("brd");
                $div.parent().parent().animate({ width: '50%' });
                $div.removeClass("collapse_headBG").children(".btn_container").children("input").hide();
                $div.children(".btn_container").children(".ob_search").show();
            }
        }
    };

    this.searchObjects = function (e) {
        var srchBody = $(e.target).attr("search_body");
        var srch = $(e.target).val().toLowerCase();
        var count = 0;
        $.each($("#" + srchBody).children(".objitems"), function (i, obj) {
            var cmpstr = $(obj).children().children(".col-md-11").find(".head4").text().toLowerCase();
            if (cmpstr.indexOf(srch) !== -1) {
                $(obj).show();
                count++;
            }
            else
                $(obj).hide();
        });
        if (count === 0)
            $(".appdash_obj_container #" + srchBody + " .not-found").show().text("Item not found....");
        else
            $(".appdash_obj_container #" + srchBody + " .not-found").hide().text("");
    };

    this.start_exe = function () {
        if (!$.isEmptyObject(this.ObjCollection)) {
            $(".appdash_obj_container .not-found").hide();
            this.apndObTypeClpsCont();
        }
        else
            $(".appdash_obj_container .not-found").show();
        
        $(".appdash_obj_container").off("keyup").on("keyup", ".obj_search_input", this.searchObjects.bind(this));
        $(".appdash_obj_container").off("click").on("click", ".new_btn", function (e) { e.stopPropagation(); });
    }

    this.start_exe();
}