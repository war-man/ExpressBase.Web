﻿var formBuilder = function (toolBoxid, formid) {
    this.id,
    this.toolBoxid = toolBoxid;
    this.formid = formid;
    this.ComboBoxCounter = 0;
    this.NumericBoxCounter = 0;
    this.DateCounter = 0;
    this.ButtonCounter = 0;
    this.GridViewCounter = 0;
    this.TextBoxCounter = 0;
    this.CreatePG = function (control) {
        //control objects
        {
            var TextBoxObj = {
                props: {
                    id: "ID",
                    Name: control.attr("id"),
                    Label: "",
                    Value: "",
                    Textmode: "",
                    TextTransform: "Normal",
                    Font: "consolace",
                    LabelForeColor: "a3ac03",
                    LabelBackColor: "ffac03",
                    TextForeColor: "a3aff3",
                    TextBackColor: "f3acff",
                    Height: "100",
                    AutoCompleteOff: false
                },
                meta: {
                    id: { browsable: false },
                    AutoCompleteOff: { group: 'Behavior ', name: 'AutoCompleteOff', type: 'boolean' },
                    height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
                    LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                    LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                    TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                    TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                    TextTransform: { group: 'Behavior ', name: 'TextTransform', type: 'BootstrapDD', options: ['Normal', "lower case", "UPPER CASE"] },
                }

            }

            var DateObj = {
                props: {
                    Name: control.attr("id"),
                    Label: "",
                    Value: "",
                    Font: "consolace",
                    LabelForeColor: "a3ac03",
                    LabelBackColor: "ffac03",
                    TextForeColor: "a3aff3",
                    TextBackColor: "f3acff",
                    Height: "100",
                    MinDate: "",
                    MaxDate: "",
                },
                meta: {
                    MinDate: { group: 'Layout ', name: 'MinDate', type: 'date', options: { min: 21, max: 500, step: 1 } },
                    MaxDate: { group: 'Layout ', name: 'MinDate', type: 'date', options: { min: 21, max: 500, step: 1 } },
                    height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
                    LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                    LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                    TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                    TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                }
            };

            var NumericBoxObj = {
                props: {
                    Name: control.attr("id"),
                    Label: "",
                    Value: "",
                    Font: "consolace",
                    LabelForeColor: "a3ac03",
                    LabelBackColor: "ffac03",
                    TextForeColor: "a3aff3",
                    TextBackColor: "f3acff",
                    Height: "100",
                    MaxValue: 0,
                    MinValue: 0,
                },
                meta: {
                    MaxValue: { group: 'Layout ', name: 'MaxValue', type: 'number', options: { min: 21, max: 500, step: 1 } },
                    MinValue: { group: 'Layout ', name: 'MinValue', type: 'number', options: { min: 21, max: 500, step: 1 } },
                    height: { group: 'Layout ', name: 'height', type: 'number', options: { min: 21, max: 500, step: 1 } },
                    LabelForeColor: { group: 'Layout', name: 'LabelForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                    LabelBackColor: { group: 'Layout', name: 'LabelBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                    TextForeColor: { group: 'Layout', name: 'TextForeColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                    TextBackColor: { group: 'Layout', name: 'TextBackColor', type: 'color', options: { preferredFormat: 'hex' } }, fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
                }
            };
        }

        $('#propGrid').empty();
        $('#propHead').empty().html("<strong> " + control.attr("id") + "</strong>");
        var Props = null;
        var Props = null;

        //$.each(colExt, function (i, obj) {
        if (control.attr("ebtype").trim() === "TextBox") {
            Props = control.data("propsObj") || TextBoxObj.props
            metaObj = TextBoxObj.meta;
        }
        else if (control.attr("ebtype").trim() === "Date") {
            Props = control.data("propsObj") || DateObj.props,
            metaObj = DateObj.meta;
        }
        else if (control.attr("ebtype").trim() === "NumericBox") {
            Props = control.data("propsObj") || NumericBoxObj.props;
            metaObj = NumericBoxObj.meta;
        }
        //else
        // alert("No matching case found for " + obj.name + "!! \n type : '" + RowObj.type.toString().trim() + "'");
        //});

        // This is the metadata object that describes the target object properties (optional)
        var DDid = null;
        var LDDid = null;
        var theCustomTypes = {
            icon: {
                html: function (elemId, name, value, meta) { // custom renderer for type (required)
                    return '<i class="fa fa-' + value + '"></i>';
                },
                valueFn: function () { return 'Icon field value'; }
            },
            BootstrapDD: {
                html: function (elemId, name, value, meta) { // custom renderer for type (required)
                    var _html = "<div class='dropdown'>" +
        "<button id=" + elemId + " name=" + name + " class='btn btn-dafault dropdown-toggle' type='button' style='min-width: 100px; padding:0px;' data-toggle='dropdown'><div style='display: inline-block; overflow: hidden; text-overflow: ellipsis; '>" + value +
        " </div><span class='caret' style='vertical-align: super'></span></button>" +
                    "<ul class='dropdown-menu'>"
                    $.each(meta.options, function (i, val) { _html += "<li><a href='#'>" + val + "</a></li>"; })
                    _html += "</ul></div>";
                    DDid = elemId;
                    return _html.toString();
                },
                valueFn: function () {
                    return $('#' + DDid).text().trim();
                }
            },
            linkDD: {
                html: function (elemId, name, value, meta) { // custom renderer for type (required)
                    var txt = "";
                    var _html = "<div class='dropdown'>" +
        "<button id=" + elemId + " name='Select dv' class='btn btn-dafault dropdown-toggle' type='button' style='min-width: 100px; padding:0px;' data-toggle='dropdown'>" +
        "$$text" +
        " <span class='caret'></span></button>" +
                    "<ul class='dropdown-menu'>"
                    $.each(meta.options, function (i, val) {
                        _html += "<li><a  id=" + elemId + i + "  href='#' data-dvid='" + val.value + "'>" + val.text + "</a></li>"
                        if (value !== null) {
                            if (val.value.toString() === value.toString())
                                txt = val.text;
                        }
                    })
                    _html += "</ul></div>";
                    LDDid = elemId;
                    return _html.toString().replace("$$text", txt);
                },
                valueFn: function () {
                    return parseInt($('#' + LDDid).attr("data-dvid"));
                }
            }
        };

        setTimeout(function () {
            $('#Table_Settings_wrapper').css("width", "813px");
            $('#Table_Settings_wrapper table:eq(0)').css("min-width", "813px");
            $('#Table_Settings_wrapper table:eq(1)').css("min-width", "805px");
            $('#form-buider-propGrid').css("visibility", "visible");
            $('#propGrid table').removeClass("pgTable").addClass("table-bordered table-hover");
            $('.dropdown ul li').click(function () {
                $(this).parent().siblings('[data-toggle=dropdown]').text($(this).text());
                $(this).parent().siblings('[data-toggle=dropdown]').attr("data-dvid", $(this).children().attr("data-dvid"));
                saveObj();
            });
            $('#propGrid table td').find("input").change(function () { saveObj(); });
        }, 1);

        $('#propGrid').jqPropertyGrid(Props, { meta: metaObj, customTypes: theCustomTypes });
        var fObj
        function saveObj() {
            fObj = $('#propGrid').jqPropertyGrid('get');
            fObj["type"] = control.attr("ebtype");
            var first = JSON.stringify(fObj, null, '\t');
            $('#txtValues').val(first + '\n\n');
            control.data("propsObj", fObj);

            FormControls[control.attr("id")] = control.data("propsObj");

        };
        //}

        //$('#btnGetValues').click(function () {
        //    saveObj();
        //});

        $('.selectpicker').on('change', function () {
            var selected = $(this).find("option:selected").val();
            $("#" + selected).focus();
        });
    };

    this.drake = dragula([document.getElementById( this.toolBoxid), document.getElementById(this.formid)], {
        removeOnSpill: false,
        copy: function (el, source) { return (source.className !== 'tdDropable' && source.className !== 'form-buider-form'); },
        copySortSource: true,
        mirrorContainer: document.body,
        accepts: this.acceptFn,
    });

    this.acceptFn = function (el, target, source, sibling) {
        // prevent tool box copy
        if ($(source).attr("id") === "form-buider-toolBox" && $(target).attr("id") === "form-buider-toolBox") {
            console.log("1 $(source).attr(id) === form-buider-toolBox && $(target).attr(id) === form-buider-toolBox")
            return false;
        }
        // allow copy except toolbox
        if ($(source).attr("id") === "form-buider-toolBox" && $(target).attr("id") !== "form-buider-toolBox") {
            console.log("2 $(source).attr(id) !== form-buider-toolBox && $(target).attr(id) !== form-buider-toolBox")
            return true;
        }
        // sortable with in the container
        if ($(source).attr("id") !== "form-buider-toolBox" && source === target) {
            console.log("3 $(source).attr(id) !== form-buider-toolBox && source === target")
            return true;
        }
        else {
            console.log("else");
            console.log("class:" + $(source).attr("class"));
            console.log("100 source id: " + ($(source).attr("id") + ", target id:" + $(target).attr("id")));
            return true;
        } 

    };

    this.controlOnFocus = function (e) {
        var control = $(e.target).closest(".controlTile");
        e.stopPropagation();
        control.children('.ctrlHead').show();
        this.CreatePG(control);

    };

    this.pushContainers = function (i) { if (!this.drake.containers.contains(document.getElementsByClassName("tdDropable")[i])) this.drake.containers.push(document.getElementsByClassName("tdDropable")[i]); };

    this.onDropFn = function (el, target, source, sibling) {
        if ($(source).attr("id") === "form-buider-toolBox") {
            el.className = 'controlTile';
            $(el).attr("tabindex", "1");
            $(el).attr("onclick", "event.stopPropagation();$(this).focus()");
            //$(el).attr("onfocus", "event.stopPropagation();$(this).children('.ctrlHead').show(); CreatePropGrid($(this));");
            $(el).attr("onfocusout", "$(this).children('.ctrlHead').hide()");
            
            $(el).on("focus",this.controlOnFocus.bind(this))

            $(el).attr("ebtype", $(el).text().trim());
            if ($(el).text().trim() === "TextBox") {
                $(el).attr("id",  "TextBox" + this.TextBoxCounter++);
                $(el).html("<input type='text' readonly style='width:100%' />");
            }
            else if ($(el).text().trim() === "ComboBox") {
                $(el).attr("id", "ComboBox" + this.ComboBoxCounter++);
                $(el).html("<div role='form' data-toggle='validator' style=' width: inherit;'><input type='hidden' name='acmasteridHidden4val' data-ebtype='16' id='acmasterid'> <div id='acmasteridLbl' style='display: inline-block;'></div> <div id='acmasteridWraper' data-toggle='tooltip' title='' data-original-title=''><div style='display: inline-block; width: 33%; margin-right: -4px;'><div class='input-group'><div class='dropdown v-select searchable' id='acmasterid0'><div type='button' class='dropdown-toggle clearfix' style='border-top-left-radius: 5px; border-bottom-left-radius: 5px;'> <input debounce='0' type='search'  readonly  placeholder='label0' class='form-control' id='acmaster1_xid' style='width: 100%; background-color: #fff;'> <i role='presentation' class='open-indicator' style='display: none;'></i> <div class='spinner' style='display: none;'>Loading...</div></div> <!----></div> <span class='input-group-addon' style='border-radius: 0px;'><i id='acmasteridTglBtn' aria-hidden='true' class='fa  fa-search'></i></span></div></div> <div style='display: inline-block; width: 33%; margin-right: -4px;'><div class='input-group'><div class='dropdown v-select searchable' id='acmasterid1'><div type='button' class='dropdown-toggle clearfix'> <input debounce='0' type='search' placeholder='label1' readonly class='form-control' id='acmaster1_name' style='width: 100%; background-color: #fff;'> <i role='presentation' class='open-indicator' style='display: none;'></i> <div class='spinner' style='display: none;'>Loading...</div></div> <!----></div> <span class='input-group-addon' style='border-radius: 0px;'><i id='acmasteridTglBtn' aria-hidden='true' class='fa  fa-search'></i></span></div></div> <div style='display: inline-block; width: 33%; margin-right: -4px;'><div class='input-group'><div class='dropdown v-select searchable' id='acmasterid2'><div type='button' class='dropdown-toggle clearfix'> <input debounce='0' type='search' readonly placeholder='label2' class='form-control' id='tdebit' style='width: 100%; background-color: #fff;'> <i role='presentation' class='open-indicator' style='display: none;'></i> <div class='spinner' style='display: none;'>Loading...</div></div> <!----></div> <span class='input-group-addon'><i id='acmasteridTglBtn' aria-hidden='true' class='fa  fa-search'></i></span></div></div></div> <div id='acmasterid_loadingdiv' class='ebCombo-loader'><i id='acmasterid_loading-image' class='fa fa-spinner fa-pulse fa-2x fa-fw' style='display: none;'></i><span class='sr-only'>Loading...</span></div> <center><div id='acmasteridDDdiv' class='DDdiv expand-transition' style='width: 600px; display: none;'><table id='acmasteridtbl' class='table table-striped table-bordered' style='width: 100%;'></table></div></center></div>");
            }
            else if ($(el).text().trim() === "NumericBox") {
                $(el).attr("id", "NumericBox" + this.NumericBoxCounter++);
                $(el).html("<div class='Eb-ctrlContainer'  style='width:100%; min-height: 12px;'><span id='nameLbl' >Amount</span><div  class='input-group'><span class='input-group-addon'>$</span><input type='text'  class='numinput' name='name'  data-toggle='tooltip' title='toolTipText' id='name' style='width:100%; display:inline-block;' /></div><span class='helpText'> helpText </span></div>");
            }
            else if ($(el).text().trim() === "Date") {
                $(el).attr("id", "Date" + this.DateCounter++);
                $(el).html("<div style='width:100%;' class='Eb-ctrlContainer'><span id='datefromLbl' style='background-color:#000000; color:#000000;'></span><div class='input-group' style='width:100%;'><input id='datefrom' data-ebtype='5' data-toggle='tooltip' title='' class='date' type='text' name='datefrom' autocomplete='on' value='01-01-0001 05:30:00 AM' readonly style='width:100%; height:21px; background-color:#FFFFFF; color:#000000; display:inline-block;  ' placeholder='' maxlength='10' data-original-title=''><span class='input-group-addon'> <i id='datefromTglBtn' class='fa  fa-calendar' aria-hidden='true'></i> </span></div><span class='helpText'>  </span></div>");
            }
            else if ($(el).text().trim() === "Button") {
                $(el).attr("id", "Button" + this.ButtonCounter++);
                $(el).html("<div class='btn btn-default'>Button</div>");
            }
            else if ($(el).text().trim() === "GridView") {
                $(el).attr("id", "GridView" + this.GridViewCounter++);
                el.className = 'gridCont';
                $(el).html("<table style='width:100%'><tr><td class='tdDropable' ></td> <td class='tdDropable'></td style='min-height:20px;'> </tr></table>");
            }
            $(el).focus();
            //console.log("props:" + $(el).data("propsObj"));

            var _html = $(el).html();
            $(el).html("<div class='ctrlHead' style='display:none;'><i class='fa fa-arrows moveBtn' aria-hidden='true'></i><a href='#' class='close' style='cursor:default' data-dismiss='alert' aria-label='close' title='close'>×</a><i class='fa fa-bars moveBtn' style='float:right; color: black; margin-top: 5px;margin-right: 4px;' aria-hidden='true'></i></div>" + _html);
            $.each($(".tdDropable"), this.pushContainers.bind(this));
            $(".controls-dd-cont select").append("<option id='SelOpt" + $(el).attr("id") + "'>" + $(el).attr("id") + "</option>");
            $('.selectpicker').selectpicker('refresh');
            $(el).find(".close").on("click", function () { $("#SelOpt" + $(this).parent().parent().attr("id")).remove(); $('.selectpicker').selectpicker('refresh'); $(this).parent().parent().remove().hide(); });
        }
        else
            console.log("else : removed");
    }
    this.drake.on("drop", this.onDropFn.bind(this));
};