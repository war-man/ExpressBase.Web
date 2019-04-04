﻿/*!
* WebFormRender.js
* to Render WebForm
* EXPRESSbase Systems Pvt. Ltd , Jith Job
*/
const WebFormRender = function (option) {
    this.FormObj = option.formObj;
    this.$saveBtn = $('#' + option.headerBtns['Save']);
    this.$deleteBtn = $('#' + option.headerBtns['Delete']);
    this.$editBtn = $('#' + option.headerBtns['Edit']);
    this.$cancelBtn = $('#' + option.headerBtns['Cancel']);
    this.Env = option.env;
    this.Cid = option.cid;
    this.initControls = new InitControls(this);
    //this.editModeObj = option.editModeObj;
    this.formRefId = option.formRefId || "";
    this.rowId = option.rowId;
    this.mode = option.mode;
    this.userObject = option.userObject;
    this.EditModeFormData = option.formData === null ? null : option.formData.MultipleTables;//EditModeFormData
    this.FormDataExtended = option.formData === null ? null : option.formData.ExtendedTables;
    this.DisableDeleteData = option.formData === null ? {} : option.formData.DisableDelete;
    this.DisableCancelData = option.formData === null ? {} : option.formData.DisableCancel;
    this.FormDataExtdObj = { val: this.FormDataExtended };
    this.Mode = { isEdit: this.mode === "Edit Mode", isView: this.mode === "View Mode", isNew: this.mode === "New Mode" };// to pass by reference
    this.flatControls = getFlatCtrlObjs(this.FormObj);// here without functions
    this.formValues = {};
    this.formValidationflag = true;
    this.isEditModeCtrlsSet = false;
    this.DGBuilderObjs = {};
    this.uniqCtrlsInitialVals = {};
    this.FRC = new FormRenderCommon({
        FO: this
    });

    this.updateCtrlUI = function (cObj) {
        $.each(cObj, function (prop, val) {
            //prop = prop.charAt(0).toUpperCase() + prop.slice(1);
            let meta = getObjByval(AllMetas["Eb" + cObj.ObjType], "name", prop);
            if (meta) {
                let NSS = meta.UIChangefn;
                if (NSS) {
                    let NS1 = NSS.split(".")[0];
                    let NS2 = NSS.split(".")[1];
                    try {
                        EbOnChangeUIfns[NS1][NS2](cObj.EbSid_CtxId, cObj);
                    }
                    catch (e) {
                        alert(e.message);
                    }
                }
            }
        });
    };

    this.setFormObject = function () {
        let flatControlsWithDG = this.flatControls.concat(this.DGs);// all DGs in the formObject + all controls as flat
        $.each(flatControlsWithDG, function (i, ctrl) {
            this.formObject[ctrl.Name] = ctrl;
        }.bind(this));
    };

    this.initDGs = function () {
        $.each(this.DGs, function (k, DG) {
            this.DGBuilderObjs[DG.Name] = this.initControls.init(DG, { Mode: this.Mode, formObject: this.formObject, userObject: this.userObject, FormDataExtdObj: this.FormDataExtdObj });
        }.bind(this));
    };

    this.bindFnsToctrls = function (Obj) {
        if (Obj.Required)
            this.bindRequired(Obj);
        if (Obj.Unique)
            this.bindUniqueCheck(Obj);
        if (Obj.OnChangeFn && Obj.OnChangeFn.Code && Obj.OnChangeFn.Code.trim() !== "")
            this.bindOnChange(Obj);
        if (Obj.Validators.$values.length > 0)
            this.bindValidators(Obj);
    };

    this.initNCs = function () {


        let allFlatControls = getInnerFlatContControls(this.FormObj).concat(this.flatControls);
        $.each(allFlatControls, function (k, Obj) {
            this.updateCtrlUI(Obj);
        }.bind(this));

        $.each(this.flatControls, function (k, Obj) {
            let opt = {};

            if (Obj.ObjType === "PowerSelect")
                opt.getAllCtrlValuesFn = this.getWebFormVals;
            else if (Obj.ObjType === "FileUploader")
                opt.FormDataExtdObj = this.FormDataExtdObj;

            this.initControls.init(Obj, opt);

            this.bindFnsToctrls(Obj);

            if (Obj.DefaultValue)
                Obj.setValue(Obj.DefaultValue);

            if (Obj.IsDisable)
                Obj.disable();
        }.bind(this));
    };

    this.initWebFormCtrls = function () {
        JsonToEbControls(this.FormObj);
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here with functions
        this.formObject = {};// for passing to user defined functions
        this.DGs = getFlatObjOfType(this.FormObj, "DataGrid");// all DGs in the formObject
        this.setFormObject();
        this.initDGs();
        this.initNCs();

        $.each(this.DGs, function (k, DG) {
            let _DG = new ControlOps[DG.ObjType](DG);
            if (_DG.OnChangeFn.Code === null)
                _DG.OnChangeFn.Code = "";
            this.bindOnChange(_DG);
        }.bind(this));
    };

    this.bindOnChange = function (control) {
        control.bindOnChange(new Function("form", "user", `event`, atob(control.OnChangeFn.Code)).bind("this-placeholder", this.formObject, this.userObject));
    };

    this.bindValidators = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.FRC.isValidationsOK.bind(this.FRC, control));
    };

    this.bindRequired = function (control) {
        if (control.ObjType === "SimpleSelect")
            $("#cont_" + control.EbSid_CtxId + " .dropdown-toggle").on("blur", this.FRC.isRequiredOK.bind(this.FRC, control)).on("focus", this.FRC.removeInvalidStyle.bind(this, control));
        else
            $("#" + control.EbSid_CtxId).on("blur", this.FRC.isRequiredOK.bind(this.FRC, control)).on("focus", this.FRC.removeInvalidStyle.bind(this, control));
    };

    this.bindUniqueCheck = function (control) {
        $("#" + control.EbSid_CtxId).keyup(debounce(this.checkUnique.bind(this, control), 500)); //delayed check 
            ///.on("blur.dummyNameSpace", this.checkUnique.bind(this, control));
    };

    //this.unbindUniqueCheck = function (control) {
    //    $("#" + control.EbSid_CtxId).off("blur.dummyNameSpace");
    //};

    this.isSameValInUniqCtrl = function (ctrl) {
        let val = ctrl.getValue();
        return val === this.uniqCtrlsInitialVals[ctrl.EbSid];
    };

    this.checkUnique = function (ctrl) {/////////////// move
        if (Object.entries(this.uniqCtrlsInitialVals).length !== 0 && this.isSameValInUniqCtrl(ctrl))// avoid check if edit mode and value is same as initial
            return;
        if (ctrl.ObjType === "Numeric" && ctrl.getValue() === 0)// avoid check if numeric and value is 0
            return;

        //let unique_flag = true;
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        let val = ctrl.getValue();
        if (isNaNOrEmpty(val))
            return;
        //this.hideLoader();
        //this.showLoader();
        hide_inp_loader($ctrl, this.$saveBtn);
        show_inp_loader($ctrl, this.$saveBtn);
        $.ajax({
            type: "POST",
            url: "../WebForm/DoUniqueCheck",
            data: {
                TableName: this.FormObj.TableName, Field: ctrl.Name, Value: ctrl.getValue(), type: "Eb" + ctrl.ObjType
            },
            success: function (isUnique) {
                //this.hideLoader();
                hide_inp_loader($ctrl, this.$saveBtn);
                if (!isUnique) {
                    //unique_flag = false;
                    $ctrl.attr("uniq-ok", "false");
                    this.FRC.addInvalidStyle(ctrl, "This field is unique, try another value");
                }
                else {
                    $ctrl.attr("uniq-ok", "true");
                    this.FRC.removeInvalidStyle(ctrl);
                }
                //return unique_flag;
            }.bind(this)
        });
    };

    this.getWebFormVals = function () {
        return getValsFromForm(this.FormObj);
    }.bind(this);

    //this.j = function (p1) {
    //    let VMs = this.initializer.Vobj.valueMembers;
    //    let DMs = this.initializer.Vobj.displayMembers;

    //    if (VMs.length > 0)// clear if already values there
    //        this.initializer.clearValues();

    //    let valMsArr = p1[0].split(",");
    //    let DMtable = p1[1];


    //    $.each(valMsArr, function (i, vm) {
    //        VMs.push(vm);
    //        $.each(this.DisplayMembers.$values, function (j, dm) {
    //            valMsArr;
    //            DMtable;

    //            $.each(DMtable, function (j, r) {
    //                if (getObjByval(r.Columns, "Name", this.ValueMember.name).Value === vm) {
    //                    let _dm = getObjByval(r.Columns, "Name", dm.name).Value;
    //                    DMs[dm.name].push(_dm);
    //                }
    //            }.bind(this));
    //        }.bind(this));
    //    }.bind(this));
    //};

    this.setNCCSingleColumns = function (NCCSingleColumns_flat_editmode_data) {
        $.each(NCCSingleColumns_flat_editmode_data, function (i, SingleColumn) {
            if (SingleColumn.Name === "id")
                return true;
            let ctrl = getObjByval(this.flatControls, "Name", SingleColumn.Name);
            if (ctrl.ObjType === "PowerSelect") {
                //ctrl.setDisplayMember = this.j;
                ctrl.setDisplayMember([SingleColumn.Value, this.FormDataExtended[ctrl.EbSid]]);
            }
            else
                ctrl.setValue(SingleColumn.Value);
        }.bind(this));
    };

    this.getNCCTblNames = function (FormData) {
        let NCCTblNames = [];
        let FlatContControls = getFlatContControls(this.FormObj);
        $.each(FlatContControls, function (i, CC) {
            let TableName = CC.TableName.trim();
            if (!CC.IsSpecialContainer && TableName !== '')
                NCCTblNames.push(TableName);
        });
        return NCCTblNames;
    };

    this.getNCCSingleColumns_flat = function (EditModeFormData, NCCTblNames) {
        let NCCSingleColumns_flat = [];
        $.each(NCCTblNames, function (i, TblName) {
            let SingleRowColums = EditModeFormData[TblName][0].Columns;
            NCCSingleColumns_flat = NCCSingleColumns_flat.concat(SingleRowColums);
        });
        return NCCSingleColumns_flat;
    };

    this.ClearControls = function (isForceClear = false) {
        $.each(this.allFlatControls, function (control) {
            if (!control.IsMaintainValue && !isForceClear)
                control.clear();
        });
    };

    this.setEditModeCtrls = function () {
        if (this.isEditModeCtrlsSet) {// if already set while mode switching
            $.each(this.DGs, function (k, DG) {
                this.DGBuilderObjs[DG.Name].SwitchToEditMode();
            }.bind(this));
            return;
        }
        let EditModeFormData = this.EditModeFormData;
        let NCCTblNames = this.getNCCTblNames(EditModeFormData);
        //let DGTblNames = this.getSCCTblNames(EditModeFormData, "DataGrid");
        $.each(this.DGs, function (k, DG) {
            if (!EditModeFormData.hasOwnProperty(DG.TableName))
                return true;
            let SingleTable = EditModeFormData[DG.TableName];
            DG.setEditModeRows(SingleTable);
        }.bind(this));

        let NCCSingleColumns_flat_editmode_data = this.getNCCSingleColumns_flat(EditModeFormData, NCCTblNames);
        this.setNCCSingleColumns(NCCSingleColumns_flat_editmode_data);
        this.isEditModeCtrlsSet = true;
    };

    //this.getEditModeFormData = function (rowId) {
    //    this.showLoader();
    //    $.ajax({
    //        type: "POST",
    //        url: "../WebForm/getRowdata",
    //        data: {
    //            refid: this.formRefId, rowid: parseInt(rowId)
    //        },
    //        error: function (xhr, ajaxOptions, thrownError) {
    //            this.hideLoader();
    //            EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
    //        }.bind(this),
    //        success: function (data) {
    //            this.EditModeFormData = data.formData.multipleTables;
    //            this.setEditModeCtrls();
    //            this.hideLoader();
    //        }.bind(this),
    //    });
    //};

    this.getDG_FVWTObjColl = function () {
        let FVWTObjColl = {};
        $.each(this.DGs, function (i, DG) {
            FVWTObjColl[DG.TableName] = DG.ChangedRowObject();
        });
        return FVWTObjColl;
    };

    this.ProcRecurForVal = function (src_obj, FVWTObjColl) {
        let _val = null;
        $.each(src_obj.Controls.$values, function (i, obj) {
            if (obj.IsContainer) {
                if (obj.IsSpecialContainer)
                    return true;
                if (obj.TableName === "" || obj.TableName === null)
                    obj.TableName = src_obj.TableName;
                if (FVWTObjColl[obj.TableName] === undefined) {
                    let rowId = this.Mode.isEdit ? this.EditModeFormData[obj.TableName][0].rowId : 0;
                    FVWTObjColl[obj.TableName] = [{
                        RowId: rowId,
                        IsUpdate: false,
                        Columns: []
                    }];
                }
                this.ProcRecurForVal(obj, FVWTObjColl);
            }
            else if (obj.ObjType !== "FileUploader" && !obj.DoNotPersist) {
                FVWTObjColl[src_obj.TableName][0].Columns.push(getSingleColumn(obj));
            }
        }.bind(this));

    };

    this.getFormTables = function () {
        let FormTables = {};
        FormTables[this.FormObj.TableName] = [{
            RowId: this.rowId,
            IsUpdate: false,
            Columns: []
        }];
        this.ProcRecurForVal(this.FormObj, FormTables);
        return FormTables;
    };

    this.getExtendedTables = function () {
        let ExtendedTables = {};
        $.each(uploadedFileRefList, function (key, values) {
            ExtendedTables[key] = [];
            //ExtendedTables[key] = [{
            //    IsUpdate: false,
            //    Columns: []
            //}];
            for (let i = 0; i < values.length; i++) {
                let SingleColumn = {};
                SingleColumn.Name = key;
                SingleColumn.Value = values[i];
                SingleColumn.Type = EbEnums.EbDbTypes.Decimal;
                ExtendedTables[key].push({
                    IsUpdate: false,
                    Columns: [SingleColumn]
                });
                //ExtendedTables[key][0].Columns.push(SingleColumn);
            }
        });
        return ExtendedTables;
    };

    this.getFormValuesObjWithTypeColl = function () {
        let WebformData = {};
        WebformData.MasterTable = this.FormObj.TableName;

        let formTables = this.getFormTables();
        let gridTables = this.getDG_FVWTObjColl();

        WebformData.MultipleTables = $.extend(formTables, gridTables);
        WebformData.ExtendedTables = this.getExtendedTables();
        return JSON.stringify(WebformData);
    };

    this.ajaxsuccess = function (_respObj) {
        this.hideLoader();
        //let msg = "";
        let respObj = JSON.parse(_respObj);
        if (this.rowId > 0) {// if edit mode 
            if (respObj.RowAffected > 0) {// edit success from editmode
                EbMessage("show", { Message: "DataCollection success", AutoHide: true, Background: '#1ebf1e' });
                //msg = `Your ${this.FormObj.EbSid_CtxId} form submitted successfully`;
                this.EditModeFormData = respObj.FormData.MultipleTables;
                this.FormDataExtdObj.val = respObj.FormData.ExtendedTables;
                this.SwitchToViewMode();
            }
            else {
                EbMessage("show", { Message: "Something went wrong", AutoHide: true, Background: '#bf1e1e' });
                //msg = `Your ${this.FormObj.EbSid_CtxId} form submission failed`;
            }
        }
        else {
            if (respObj.RowId > 0) {// if insertion success -NewToedit
                EbMessage("show", { Message: "DataCollection success", AutoHide: true, Background: '#1ebf1e' });
                this.rowId = respObj.RowId;
                this.EditModeFormData = respObj.FormData.MultipleTables;
                this.FormDataExtdObj.val = respObj.FormData.ExtendedTables;
                this.SwitchToViewMode();
            }
            else {
                EbMessage("show", { Message: "Something went wrong", AutoHide: true, Background: '#bf1e1e' });
            }
        }
    };

    this.isAllUniqOK = function() {
        let unique_flag = true;
        let $notOk1stCtrl = null;
        $.each(this.flatControls, function (i, control) {
            if (!control.Unique)
                return true;
            let $ctrl = $("#" + control.EbSid_CtxId);
            if ($ctrl.attr("uniq-ok") === "false") {
                this.FRC.addInvalidStyle(control, "This field is unique, try another value");
                unique_flag = false;
                if (!$notOk1stCtrl)
                    $notOk1stCtrl = $ctrl;
            }
        }.bind(this));

        if ($notOk1stCtrl)
            $notOk1stCtrl.select();
        return unique_flag;
    };

    this.saveForm = function () {
        if (!this.FRC.AllRequired_valid_Check())
            return;
        if (!this.isAllUniqOK())
            return;
        //if (!this.FRC.AllUnique_Check())
        //    return;
        this.showLoader();
        let currentLoc = store.get("Eb_Loc-" + _userObject.CId + _userObject.UserId) || _userObject.Preference.DefaultLocation;
        $.ajax({
            type: "POST",
            //url: this.ssurl + "/bots",
            url: "../WebForm/InsertWebformData",
            data: {
                TableName: this.FormObj.TableName,
                ValObj: this.getFormValuesObjWithTypeColl(),
                RefId: this.formRefId,
                RowId: this.rowId,
                CurrentLoc: currentLoc
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
            }.bind(this),
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.ajaxsuccess.bind(this)
        });

    };

    this.SwitchToViewMode = function () {
        this.Mode.isView = true;
        this.Mode.isEdit = false;
        this.Mode.isNew = false;
        setHeader("View Mode");
        this.BeforeModeSwitch("View Mode");
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here re-assign objectcoll with functions
        this.setEditModeCtrls();
        $.each(this.flatControls, function (k, ctrl) {
            ctrl.disable();
        }.bind(this));
    };

    this.SwitchToEditMode = function () {
        this.Mode.isEdit = true;
        this.Mode.isView = false;
        this.Mode.isNew = false;
        this.setEditModeCtrls();
        this.BeforeModeSwitch("Edit Mode");
        setHeader("Edit Mode");
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here re-assign objectcoll with functions
        $.each(this.flatControls, function (k, ctrl) {
            if (!ctrl.IsDisable)
                ctrl.enable();
            if (ctrl.Unique)
                this.uniqCtrlsInitialVals[ctrl.EbSid] = ctrl.getValue();

        }.bind(this));
    };

    this.BeforeModeSwitch = function(newMode){
        if (newMode === "View Mode") {
            this.flatControls = getFlatCtrlObjs(this.FormObj);
            $.each(this.flatControls, function (k, ctrl) {
                if (ctrl.ObjType === "RadioButton" && ctrl.Name === "eb_default") {
                    let c = getObjByval(this.EditModeFormData[this.FormObj.TableName][0].Columns, "Name", "eb_default");
                    if (c !== undefined && c.Value === "T") {
                        if (this.userObject.Roles.contains("SolutionOwner") || this.userObject.Roles.contains("SolutionAdmin") || this.userObject.Roles.contains("SolutionPM"))
                            return;
                        this.$saveBtn.prop("disabled", true);
                        this.$deleteBtn.prop("disabled", true);
                        this.$editBtn.prop("disabled", true);
                        this.$cancelBtn.prop("disabled", true);
                        //this.$saveBtn.prop("title", "Save Disabled");                        
                    }
                    return;                    
                }
            }.bind(this));
            $.each(this.FormObj.DisableDelete.$values, function (k, v) {
                if (!v.IsDisabled && !v.IsWarningOnly) {
                    if (this.DisableDeleteData[v.Name]) {
                        this.$deleteBtn.prop("disabled", true);
                        return;
                    }
                }
            }.bind(this));
            $.each(this.FormObj.DisableCancel.$values, function (k, v) {
                if (!v.IsDisabled && !v.IsWarningOnly) {
                    if (this.DisableCancelData[v.Name]) {
                        this.$cancelBtn.prop("disabled", true);
                        return;
                    }
                }
            }.bind(this));
        }
        else {
            this.$saveBtn.prop("disabled", false);
            this.$deleteBtn.prop("disabled", false);
            this.$editBtn.prop("disabled", false);
            this.$cancelBtn.prop("disabled", false);
        }
    };

    this.deleteForm = function () {
        EbDialog("show",
            {
                Message: "Are you sure to delete this data entry?",
                Buttons: {
                    "Yes": {
                        Background: "green",
                        Align: "left",
                        FontColor: "white;"
                    },
                    "No": {
                        Background: "violet",
                        Align: "right",
                        FontColor: "white;"
                    }
                },
                CallBack: function (name) {
                    if (name === "Yes") {
                        this.showLoader();
                        $.ajax({
                            type: "POST",
                            url: "../WebForm/DeleteWebformData",
                            data: { RefId: this.formRefId, RowId: this.rowId },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                if (result > 0) {
                                    EbMessage("show", { Message: 'Deleted Successfully', AutoHide: true, Background: '#00aa00' });
                                    setTimeout(function () { window.close(); }, 3000);
                                }
                                else if (result === -1) {
                                    EbMessage("show", { Message: 'Delete operation failed due to validation.', AutoHide: true, Background: '#aa0000' });
                                }
                                else {
                                    EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#aa0000' });
                                }
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
    };

    this.cancelForm = function () {
        EbDialog("show",
            {
                Message: "Are you sure to cancel this data entry?",
                Buttons: {
                    "Yes": {
                        Background: "green",
                        Align: "left",
                        FontColor: "white;"
                    },
                    "No": {
                        Background: "violet",
                        Align: "right",
                        FontColor: "white;"
                    }
                },
                CallBack: function (name) {
                    if (name === "Yes") {
                        this.showLoader();
                        $.ajax({
                            type: "POST",
                            url: "../WebForm/CancelWebformData",
                            data: { RefId: this.formRefId, RowId: this.rowId },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                if (result > 0) {
                                    EbMessage("show", { Message: 'Canceled Successfully', AutoHide: true, Background: '#00aa00' });
                                    setTimeout(function () { window.close(); }, 3000);
                                }
                                else if (result === -1) {
                                    EbMessage("show", { Message: 'Cancel operation failed due to validation.', AutoHide: true, Background: '#aa0000' });
                                }
                                else {
                                    EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#aa0000' });
                                }
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
    };

    this.showLoader = function () {
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
    };

    this.hideLoader = function () {
        $("#eb_common_loader").EbLoader("hide");
    };

    this.windowKeyDown = function (event) {
        if (event.ctrlKey || event.metaKey) {
            if (event.which === 83) {
                event.preventDefault();
                if (this.Mode.isEdit || this.Mode.isNew)
                    this.saveForm();
            }
        }

        if (event.altKey || event.metaKey) {
            if (event.which === 78) {
                event.preventDefault();
                if ($("#webformnew").css("display") !== "none")
                    window.location.href = window.location.href;
            }
        }
    }.bind(this);

    this.init = function () {
        $('[data-toggle="tooltip"]').tooltip();// init bootstrap tooltip
        $("[eb-form=true]").on("submit", function () { event.preventDefault(); });
        this.$saveBtn.on("click", this.saveForm.bind(this));
        this.$deleteBtn.on("click", this.deleteForm.bind(this));
        this.$cancelBtn.on("click", this. cancelForm.bind(this));
        this.$editBtn.on("click", this.SwitchToEditMode.bind(this));
        $(window).off("keydown").on("keydown", this.windowKeyDown);
        this.initWebFormCtrls();

        if (this.Mode.isNew && this.EditModeFormData)
            this.setEditModeCtrls();

        if (this.mode === "View Mode") {
            this.setEditModeCtrls();
            this.SwitchToViewMode();
        }
    };

    this.init();
};