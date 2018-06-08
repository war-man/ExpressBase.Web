﻿
var EbTableVisualization = function EbTableVisualization(id, jsonObj) {
    this.$type = 'ExpressBase.Objects.EbTableVisualization, ExpressBase.Objects';
    this.EbSid = id;
    this.ObjType = 'TableVisualization';
    this.rowGrouping = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn, ExpressBase.Objects]], System.Private.CoreLib", "$values": [] }; this.LeftFixedColumn = 0; this.RightFixedColumn = 0; this.PageLength = 0; this.DataSourceRefId = ''; this.Description = ''; this.Columns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] }; this.DSColumns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] }; this.data = { "$type": "System.Object, System.Private.CoreLib" }; this.Pippedfrom = ''; this.IsPaged = ''; this.IsPaging = false; this.Name = id;


    this.$Control = $("            <div id='cont_@name@' Ctype='TableVisualization' class='Eb-ctrlContainer'>                <table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>            </div>".replace(/@id/g, this.EbSid));
    this.BareControlHtml = `<table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>`.replace(/@id/g, this.EbSid);
    this.DesignHtml = "            <div id='cont_@name@' Ctype='TableVisualization' class='Eb-ctrlContainer'>                <table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>            </div>";
    var MyName = this.constructor.name;
    this.RenderMe = function () {
        var NewHtml = this.$BareControl.outerHTML(), me = this, metas = AllMetas[MyName];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', me[name]);
            }
        });
        if (!this.IsContainer)
            $('#' + id).html($(NewHtml).html());
    };
    if (jsonObj) {
        if (jsonObj.IsContainer)
            jsonObj.Controls = new EbControlCollection({});
        jsonObj.RenderMe = this.RenderMe;
        jsonObj.Html = this.Html;
        jsonObj.Init = this.Init;
        $.extend(this, jsonObj);
        //if(this.Init)
        //    jsonObj.Init(id);
    }
    else {
        if (this.Init)
            this.Init(id);
    }
};

var z = 100;

//var EbSelect = function (name, ds_id, dropdownHeight, vmName, dmNames, maxLimit, minLimit, required, servicestack_url, vmValues, ctrl) {
var EbSelect = function (ctrl) {
    //parameters   
    this.ComboObj = ctrl;
    this.name = ctrl.name;
    this.dsid = ctrl.dataSourceId;
    this.idField = "name";
    if (!(Object.keys(ctrl.valueMember).includes("name")))//////////////////
        this.idField = "columnName";////////////////////////
    this.vmName = ctrl.valueMember[this.idField]; //ctrl.vmName;
    this.dmNames = ctrl.displayMembers.map(function (obj) { return obj[this.idField]; }.bind(this));//['acmaster1_xid', 'acmaster1_name', 'tdebit']; //ctrl.dmNames;
    this.maxLimit = (ctrl.maxLimit === 0) ? 9999999999999999999999 : ctrl.maxLimit;
    this.minLimit = ctrl.minLimit;//ctrl.minLimit;
    this.multiSelect = (ctrl.maxLimit > 1);
    this.required = ctrl.required;//ctrl.required;
    this.servicestack_url = "";//ctrl.servicestack_url;
    //this.vmValues = (ctrl.vmValues !== null) ? ctrl.vmValues : [];
    this.dropdownHeight = (ctrl.dropdownHeight === 0) ? "400" : ctrl.dropdownHeight;


    //local variables
    this.container = this.name + "Container";
    this.DTSelector = '#' + this.name + 'tbl';
    this.NoOfFields = this.dmNames.length;
    this.Vobj = null;
    this.datatable = null;
    this.clmAdjst = 0;


    ctrl.DisplayMembers = [];
    ctrl.ValueMembers = [];
    this.valueMembers = ctrl.ValueMembers;
    this.localDMS = ctrl.DisplayMembers;

    this.currentEvent = null;
    this.IsDatatableInit = false;

    $.each(this.dmNames, function (i, name) { this.localDMS[name] = [] }.bind(this));

    this.VMindex = null;
    this.DMindexes = [];
    this.cellTr = null;
    this.Msearch_colName = '';
    this.cols = [];
    // functions

    //init() for event binding....
    this.init = function () {
        $('#' + this.name + 'Wraper [class=open-indicator]').hide();
        $(document).mouseup(this.hideDDclickOutside.bind(this));//hide DD when click outside select or DD &  required ( if  not reach minLimit) 
        $('#' + this.name + 'Wraper  [class=input-group-addon]').off("click").on("click", this.toggleIndicatorBtn.bind(this)); //search button toggle DD
        $('#' + this.name + 'tbl').keydown(function (e) { if (e.which === 27) this.Vobj.hideDD(); }.bind(this));//hide DD on esc when focused in DD
        $('#' + this.name + 'Wraper').on('click', '[class= close]', this.tagCloseBtnHand.bind(this));//remove ids when tagclose button clicked
        $('#' + this.name + 'Wraper [type=search]').keydown(this.SearchBoxEveHandler.bind(this));//enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating

        //set id for searchBox
        $('#' + this.name + 'Wraper  [type=search]').each(this.srchBoxIdSetter.bind(this));


        //styles
        $('#' + this.name + 0).children().css("border-top-left-radius", "5px");
        $('#' + this.name + 0).children().css("border-bottom-left-radius", "5px");
    };

    this.srchBoxIdSetter = function (i) {
        $('#' + this.name + 'Wraper  [type=search]:eq(' + i + ')').attr('id', this.dmNames[i]);
    };

    //enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating
    this.SearchBoxEveHandler = function (e) {
        var search = $(e.target).val().toString();
        if (e.which === 13)
            this.Vobj.showDD();
        if ((e.which === 8 || e.which === 46) && search === '' && this.Vobj.valueMembers.length > 0) {
            this.Vobj.valueMembers.pop();
            $.each(this.dmNames, this.popDmValues.bind(this));
        }
        if (e.which === 40)
            this.Vobj.showDD();
        if (e.which === 32)
            this.Vobj.showDD();
        if (e.which === 27)
            this.Vobj.hideDD();
    };

    this.popDmValues = function (i) {
        this.Vobj.displayMembers[this.dmNames[i]].pop(); //= this.Vobj.displayMembers[this.dmNames[i]].splice(0, this.maxLimit);
    };

    // init datatable
    this.InitDT = function () {
        this.IsDatatableInit = true;
        //this.EbObject = new EbObjects["EbTableVisualization"]("Container");
        //this.EbObject.DataSourceRefId = this.dsid;
        var o = new Object();
        o.containerId = this.name + "Container";
        o.dsid = this.dsid;
        o.tableId = this.name + "tbl";
        o.showSerialColumn = true;
        o.showCheckboxColumn = this.ComboObj.multiSelect;
        o.showFilterRow = true;
        o.scrollHeight = this.scrollHeight + "px";
        o.fnDblclickCallback = this.dblClickOnOptDDEventHand.bind(this);
        o.fnKeyUpCallback = this.xxx.bind(this);
        o.arrowFocusCallback = this.arrowSelectionStylingFcs;
        o.arrowBlurCallback = this.arrowSelectionStylingBlr;
        o.fninitComplete = this.initDTpost.bind(this);
        //o.hiddenFieldName = this.vmName;
        o.keyPressCallbackFn = this.DDKeyPress.bind(this);
        o.columns = this.ComboObj.columns;//////////////////////////////////////////////////////
        this.datatable = new EbBasicDataTable(o);
        //this.datatable.Api.on('key-focus', this.arrowSelectionStylingFcs);
        //this.datatable.Api.on('key-blur', this.arrowSelectionStylingBlr);
        //$.ajax({
        //    type: "POST",
        //    url: "../DS/GetColumns",
        //    data: { DataSourceRefId: this.dsid },
        //    success: function (Columns) {
        //        this.DTColumns = JSON.parse(Columns).$values;
        //        //$.LoadingOverlay('hide');
        //    }.bind(this)
        //});
        //this.datatable = $(this.DTSelector).DataTable({//change ebsid to name
        //    processing: true,
        //    serverSide: true,
        //    dom: 'rt',
        //    columns: this.DTColumns,
        //    ajax: {
        //        url: "../dv/getData",
        //        type: 'POST',
        //        data: function (dq) {
        //            delete dq.columns; delete dq.order; delete dq.search;
        //            dq.RefId = this.dsid;
        //            dq.Params = { Name: "id", Value: "ac", Type: "11" };
        //        }.bind(this),
        //        dataSrc: function (dd) {
        //            return dd.data;
        //        },
        //    },
        //    initComplete: function () {
        //        this.hideTypingAnim();
        //        this.AskWhatU();
        //        $tableCont.show(100);
        //    }.bind(this)

        //});
        //settings: {
        //    hideCheckbox: (this.multiSelect === false) ? true : false,
        //    scrollY: "200px",//this.dropdownHeight,
        //},
        //filterParams: { colName: "id", FilterValue: "ac" }, //{ id : "ac", }
        //initComplete: this.initDTpost.bind(this),
        //fnDblclickCallbackFunc: this.dblClickOnOptDDEventHand.bind(this),
        //fnKeyUpCallback:
        //fnClickCallbackFunc:
        //});
    };

    this.xxx = function (e, dt, type, indexes) {
        console.log("keysssss");
    }

    this.DDKeyPress = function (e, datatable, key, cell, originalEvent) {
        console.log(5);
        if (key === 13)
            this.DDEnterKeyPress(e, datatable, key, cell, originalEvent);
        else if (key === 32) {
            if (originalEvent.target.type !== "checkbox")
                this.DDSpaceKeyPress(e, datatable, key, cell, originalEvent);
        }
    }

    this.DDSpaceKeyPress = function (e, datatable, key, cell, originalEvent) {
        var row = datatable.row(cell.index().row);
        var $tr = $(row.nodes());
        $tr.dblclick();
    }

    this.DDEnterKeyPress = function (e, datatable, key, cell, originalEvent) {
        var row = datatable.row(cell.index().row);
        var $tr = $(row.nodes());
        $tr.dblclick();
        this.Vobj.hideDD();
    }

    this.initDTpost = function (data) {
        $.each(this.datatable.Api.settings().init().columns, this.dataColumIterFn.bind(this));
        $(this.DTSelector + ' tbody').on('click', "input[type='checkbox']", this.checkBxClickEventHand.bind(this));//checkbox click event 
        $(this.DTSelector + ' tbody').on('focus', "td", function () {
            console.log("td focus")
        });
        this.datatable.Api.rows('.odd:eq(0)').select();
        //$('#' + this.name + '_loading-image').hide();
    };

    this.dataColumIterFn = function (i, value) {
        if (value.name === this.vmName)
            this.VMindex = value.data;

        $.each(this.dmNames, function (j, dmName) { if (value.name === dmName) { this.DMindexes.push(value.data); } }.bind(this));
    };

    //double click on option in DD
    this.dblClickOnOptDDEventHand = function (e) {
        this.currentEvent = e;
        var idx = this.datatable.ebSettings.Columns.$values.indexOf(getObjByval(this.datatable.ebSettings.Columns.$values, "name", this.vmName));
        var vmValue = this.datatable.Api.row($(e.target).closest("tr")).data()[idx];
        if (!(this.Vobj.valueMembers.contains(vmValue))) {
            if (this.maxLimit === 1) {
                this.Vobj.valueMembers = [vmValue];
                this.Vobj.hideDD();
                $.each(this.dmNames, this.setDmValues.bind(this));
            }
            else if (this.Vobj.valueMembers.length !== this.maxLimit) {
                this.Vobj.valueMembers.push(vmValue);
                $.each(this.dmNames, this.setDmValues.bind(this));
                $($(e.target).closest("tr")).find('[type=checkbox]').prop('checked', true);
            }
        }
        else {
            this.delDMs($(e.target));
            $(e.target).closest("tr").find("." + this.name + "tbl_select").prop('checked', false);
        }
    };

    this.setDmValues = function (i, name) {
        var idx = this.datatable.ebSettings.Columns.$values.indexOf(getObjByval(this.datatable.ebSettings.Columns.$values, "name", name));
        if (this.maxLimit === 1)
            this.localDMS[name].shift();
        this.localDMS[name].push(this.datatable.Api.row($(this.currentEvent.target).closest("tr")).data()[idx]);
        console.log("DISPLAY MEMBER 0 a=" + this.Vobj.displayMembers[0]);
    };

    this.ajaxDataSrcfn = function (dd) {
        $('#' + this.name + '_loadingdiv').hide();
        this.clmAdjst = this.clmAdjst + 1;
        if (this.clmAdjst < 3)
            setTimeout(function () {
                $('#' + this.name + 'tbl').DataTable().columns.adjust().draw();
                console.log('le().columns.adjust()');
            }, 520);
        setTimeout(function () { this.Vobj.updateCk(); }.bind(this), 1);
        return dd.data;
    };

    this.toggleIndicatorBtn = function (e) {
        this.Vobj.toggleDD();
    };

    this.getSelectedRow = function () {
        console.log(100);
        var res = [];
        var temp = [];
        $.each(this.valueMembers, function (idx, item) {
            var obj = {};
            var rowData = this.datatable.getRowDataByUid(item);
            $.extend(temp, this.ComboObj.columns);
            temp.sort(this.ColumnsComparer);
            var colNames = temp.map((obj, i) => { return obj.name; });
            $.grep(temp, function (obj, i) {
                return obj.name;
            });
            $.each(rowData, function (i, cellData) {
                obj[colNames[i]] = cellData;
            });
            res.push(obj);
        }.bind(this));
        console.log(res);
        this.ComboObj.selectedRow = res;
        return res;
    }.bind(this);

    this.ColumnsComparer = function (a, b) {
        if (a.data < b.data) return -1;
        if (a.data > b.data) return 1;
        if (a.data === b.data) return 0;
    };

    this.Renderselect = function () {
        this.Vobj = new Vue({
            el: '#' + this.name + 'Container',
            data: {
                options: [],
                displayMembers: this.localDMS,
                valueMembers: this.valueMembers,
                DDstate: false
            },
            watch: {
                valueMembers: this.V_watchVMembers.bind(this)
            },
            methods: {
                toggleDD: this.V_toggleDD.bind(this),
                showDD: this.V_showDD.bind(this),
                hideDD: function () { this.DDstate = false; },
                updateCk: this.V_updateCk.bind(this)
            }
        });
        this.init();
    };

    //init Vselect
    this.initVselect = function () {
        //hiding v-select native DD
        $('#' + this.container + ' [class=expand]').css('display', 'none');
        this.Vobj.valueMembers = this.values;
        this.Vobj.displayMembers;
    };

    //single select & max limit
    this.V_watchVMembers = function (VMs) {
        this.ComboObj.tempValue = [...this.Vobj.valueMembers]
        $("#" + this.name).val(this.Vobj.valueMembers);
        //single select
        if (this.maxLimit === 1 && VMs.length > 1) {
            this.Vobj.valueMembers = this.Vobj.valueMembers.splice(1, 1);////
            $.each(this.dmNames, this.trimDmValues.bind(this));
        }
        //max limit
        else if (VMs.length > this.maxLimit) {
            this.Vobj.valueMembers = this.Vobj.valueMembers.splice(0, this.maxLimit);
            $.each(this.dmNames, this.trimDmValues.bind(this));
        }
        this.getSelectedRow();
        console.log("VALUE MEMBERS =" + this.Vobj.valueMembers);
        console.log("DISPLAY MEMBER 0 =" + this.Vobj.displayMembers[this.dmNames[0]]);
        console.log("DISPLAY MEMBER 1 =" + this.Vobj.displayMembers[this.dmNames[1]]);
        console.log("DISPLAY MEMBER 3 =" + this.Vobj.displayMembers[this.dmNames[3]]);
    };

    this.trimDmValues = function (i) {
        if (this.maxLimit === 1) {   //single select
            this.Vobj.displayMembers[this.dmNames[i]].shift(); //= this.Vobj.displayMembers[this.dmNames[i]].splice(1, 1);
        }
        else {                        //max limit
            this.Vobj.displayMembers[this.dmNames[i]].pop(); //= this.Vobj.displayMembers[this.dmNames[i]].splice(0, this.maxLimit);
        }
    };

    this.V_toggleDD = function (e) {
        if (!this.IsDatatableInit)
            this.InitDT();
        this.Vobj.DDstate = !this.Vobj.DDstate;
        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },500);
    };

    this.V_showDD = function () {
        alert("Roby focus on the first row");
        if (!this.IsDatatableInit)
            this.InitDT();
        this.Vobj.DDstate = true;
        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },520);
        //setTimeout(this.colAdjust, 520);
    };

    //this.colAdjust = function () { $('#' + this.name + 'tbl').DataTable().columns.adjust().draw(); }

    this.V_updateCk = function () {// API..............
        console.log("colAdjust---------- ");
        $("#" + this.container + ' table:eq(1) tbody [type=checkbox]').each(function (i, chkbx) {
            var $row = $(chkbx).closest('tr');
            var datas = $(this.DTSelector).DataTable().row($row).data();
            if (this.Vobj.valueMembers.contains(datas[this.VMindex]))
                $(chkbx).prop('checked', true);
            else
                $(chkbx).prop('checked', false);
        }.bind(this));
        // raise error msg
        setTimeout(this.RaiseErrIf.bind(this), 30);
    };

    this.RaiseErrIf = function () {
        if (this.Vobj.valueMembers.length !== this.Vobj.displayMembers[this.dmNames[0]].length) {
            alert('valueMember and displayMembers length miss match found !!!!');
            console.error('valueMember and displayMembers length miss match found !!!!');
            console.log('valueMembers=' + this.Vobj.valueMember);
            console.log('displayMember[0] = ' + this.Vobj.displayMember[this.dmNames[0]]);
        }
    };

    this.arrowSelectionStylingFcs = function (e, datatable, cell, originalEvent) {
        $(":focus").blur();
        var row = datatable.row(cell.index().row);
        var $tr = $(row.nodes());
        $tr.find('.focus').removeClass('focus');
        $tr.addClass('selected-row');
        $tr.find('td').css("border-color", "transparent");
    };

    this.arrowSelectionStylingBlr = function (e, datatable, cell) {
        var row = datatable.row(cell.index().row);
        var $tr = $(row.nodes());
        $tr.find('td').css("border-color", "#ddd");
        $tr.removeClass('selected-row');
    };

    this.tagCloseBtnHand = function (e) {
        $(this.DTSelector + ' [type=checkbox][value=' + this.Vobj.valueMembers.splice(delid(), 1) + ']').prop("checked", false);
        $.each(this.dmNames, function (i, name) {
            this.Vobj.displayMembers[name].splice(delid(), 1);
        }.bind(this));
    };

    this.checkBxClickEventHand = function (e) {
        this.currentEvent = e;
        var $row = $(e.target).closest('tr');
        var datas = $(this.DTSelector).DataTable().row($row).data();
        if (!(this.Vobj.valueMembers.contains(datas[this.VMindex]))) {
            if (this.maxLimit === 0 || this.Vobj.valueMembers.length !== this.maxLimit) {
                this.Vobj.valueMembers.push(datas[this.VMindex]);
                $.each(this.dmNames, this.setDmValues.bind(this));
                $(this.currentEvent.target).prop('checked', true);
            }
            else
                $(this.currentEvent.target).prop('checked', false);
        }
        else {
            this.delDMs($(e.target));
            $(this.currentEvent.target).prop('checked', false);
        }
    };

    this.delDMs = function ($e) {
        var $row = $e.closest('tr');
        var datas = $(this.DTSelector).DataTable().row($row).data();
        var vmIdx2del = this.Vobj.valueMembers.indexOf(datas[this.VMindex]);
        this.Vobj.valueMembers.splice(vmIdx2del, 1);
        $.each(this.dmNames, function (i) { this.Vobj.displayMembers[this.dmNames[i]].splice(vmIdx2del, 1); }.bind(this));
    };

    this.makeInvalid = function (msg) {
        $('#' + this.name + 'Wraper').closest(".ctrl-wraper").css("box-shadow", "0 0 5px 1px rgb(174, 0, 0)").siblings("[name=ctrlsend]").prop('disabled', true);
        $('#' + this.name + "errormsg").text(msg).show().animate({ opacity: "1" }, 300);
    };

    this.makeValid = function () {
        $('#' + this.name + 'Wraper').closest(".ctrl-wraper").css("box-shadow", "inherit").siblings("[name=ctrlsend]").prop('disabled', false);
        $('#' + this.name + "errormsg").hide().animate({ opacity: "0" }, 300);
    };

    this.hideDDclickOutside = function (e) {
        var container = $('#' + this.name + 'DDdiv');
        var container1 = $('#' + this.name + 'Container');
        if ((!container.is(e.target) && container.has(e.target).length === 0) && (!container1.is(e.target) && container1.has(e.target).length === 0)) {
            this.Vobj.hideDD();/////
            if (this.Vobj.valueMembers.length < this.minLimit && this.minLimit !== 0) {
                this.makeInvalid('This field  require minimum ' + this.minLimit + ' values');
            }
            else {
                if (this.required && this.Vobj.valueMembers.length === 0) {
                    document.getElementById(this.dmNames[0]).setCustomValidity('This field  is required');
                }
                else {
                    this.makeValid();
                }

            }
        }
    };

    this.Renderselect();
};