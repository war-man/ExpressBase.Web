/*!
* Eb_FilterDialogRender.js
* to Render FilterDialogForm
* EXPRESSbase Systems Pvt. Ltd, author: Jith Job
*/


var a___MT = 0;

var Eb_FilterDialogRender = function (fObj, wc, curloc, userObj, submitId, onSubmitFn, initCompleteCallback) {
    console.log("Eb_FilterDialogRender ....");
    this.FormObj = fObj;
    this.userObject = userObj;
    this.submitId = submitId;
    this.formObject = {};
    this.initCompleteCallback = initCompleteCallback;
    this.onChangeExeFuncs = {};
    this.initControls = new InitControls();
    this.$submitBtn = $("#" + this.submitId);
    JsonToEbControls(this.FormObj);// here re-assign objectcoll with functions
    this.flatControls = getFlatCtrlObjs(this.FormObj);// objectcoll with functions
    this.flatControlsWithDG = this.flatControls;
    this.IsPSsInitComplete = {};
    this.Mode = { isEdit: false, isView: false, isNew: true };// to pass by reference

    this.onSubmitFn = onSubmitFn;
    this.FRC = new FormRenderCommon({ FO: this });

    this.IsFDValidationOK = this.FRC.AllRequired_valid_Check.bind(this.FRC);

    this.submit = function () {
        if (!this.FRC.AllRequired_valid_Check())
            return;
        if (this.onSubmitFn)
            this.onSubmitFn();
    }.bind(this);

    this.checkAllCtrlsInit_FireInitComplete = function () {
        let psFlag = true;
        let O_ctrls_Flag = this._all_OctrlsInit;

        if (this.PSs.length !== 0)
            psFlag = this._allPSsInit;

        if (psFlag && O_ctrls_Flag) {
            setTimeout(function () {
                this.initCompleteCallback();
            }.bind(this), 10);
        }
    };

    this.SetWatchers = function () {
        //this
        Object.defineProperty(this, "_allPSsInit", {
            set: function (value) {
                console.log("set : _allPSsInit");
                this._old_allPSsInit = value;

                if (value === true)
                    this.checkAllCtrlsInit_FireInitComplete();
            }.bind(this),

            get: function () {
                console.log("get : _allPSsInit");
                return this._old_allPSsInit;
            }.bind(this)
        });
        
        Object.defineProperty(this, "_all_OctrlsInit", {
            set: function (value) {
                this._old_all_OctrlsInit = value;
                if (value === true)
                    this.checkAllCtrlsInit_FireInitComplete();
            }.bind(this),

            get: function () {
                return this._old_all_OctrlsInit;
            }.bind(this)
        });
    };

    this.initDataModel = function () {
        this.DataMODEL= {};
        this.DataMODEL[this.FormObj.TableName] = [{
            RowId: 0,
            IsUpdate: false,
            Columns: []
        }];
        for (let i = 0; i < this.FormObj.Controls.$values.length; i++) {
            let ctrl = this.FormObj.Controls.$values[i];
            this.DataMODEL[this.FormObj.TableName][0].Columns.push(getSingleColumn(ctrl));
        }
    };

    this.init = function () {
        this._all_OctrlsInit = false;
        this._allPSsInit = false;
        this.initFormObject2();
        this.initDataModel();
        this.initFilterDialogCtrls();// order 1
        this.FRC.bindEbOnChange2Ctrls(this.FormObj.Controls.$values);// order 2
        this.FRC.setDefaultvalsNC(this.FormObj.Controls.$values);// order 2
        this.FRC.setValueExpValsNC(this.FormObj.Controls.$values);//
        this.FRC.bindFnsToCtrls(this.flatControls);// order 4
        this.PSs = getFlatObjOfType(this.FormObj, "PowerSelect");// all PSs in the formObject
        this.SetWatchers();
        $.each(this.PSs, function (i, ps) { this.IsPSsInitComplete[ps.EbSid_CtxId] = false; }.bind(this));

        this.FRC.fireInitOnchangeNC(this.flatControls);
        this._all_OctrlsInit = true;
        //this.bindFuncsToDom();
        this.FRC.populateDateCtrlsWithInitialVal(this.FormObj);
        this.FRC.populateRGCtrlsWithInitialVal(this.FormObj);
        this.FRC.populateSSCtrlsWithInitialVal(this.FormObj);
    };

    this.initFilterDialogCtrls = function () {
        $('.selectpicker').selectpicker();
        JsonToEbControls(this.FormObj);// here re-assign objectcoll with functions
        $.each(this.FormObj.Controls.$values, function (k, Obj) {
            let opt = {};
            if (Obj.ObjType === "PowerSelect" && !Obj.RenderAsSimpleSelect)
                opt.getAllCtrlValuesFn = this.getFormVals;
            else if (Obj.ObjType === "Date") {
                opt.formObject = this.formObject;
                opt.userObject = userObj;
            }

            this.initControls.init(Obj, opt);

            this.FRC.bindFnsToCtrl(Obj);
        }.bind(this));

        $.each(this.FormObj.Controls.$values, function (k, Obj) {
            this.FRC.fireInitOnchange(Obj);
        }.bind(this));
    };

    this.getFormVals = function () {
        return getValsFromForm(this.FormObj);
    }.bind(this);

    this.initFormObject2 = function () {
        $.each(this.FormObj.Controls.$values, function (k, cObj) {
            this.formObject[cObj.Name] = cObj;
        }.bind(this));
        //this.FRC.setUpdateDependentControlsFn();

    };

    this.initFormObject = function () {
        $.each(this.FormObj.Controls.$values, function (k, cObj) {
            this.formObject[cObj.Name] = cObj;

            Object.defineProperty(this.formObject, cObj.Name, {
                get: function () {
                    return this.getValue(this.FormObj.Controls.$values[k]);
                }.bind(this),
                set: function (val) {
                    this.setValue(this.FormObj.Controls.$values[k], val);
                }.bind(this)
            });
        }.bind(this));
    };

    this.getValue = function (ctrlObj) {
        return ctrlObj.getValue();
    };

    this.setValue = function (ctrlObj, val) {
        ctrlObj.setValue(val);
    };

    this.init();
    a___MT = this.DataMODEL;
};
