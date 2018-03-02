﻿var Eb_chatBot = function (_solid, _appid, _themeColor, _botdpURL, ssurl) {
    this.EXPRESSbase_SOLUTION_ID = _solid;
    this.EXPRESSbase_APP_ID = _appid;
    this.ebbotThemeColor = _themeColor;
    this.botdpURL = 'url(' + _botdpURL + ')center center no-repeat';
    this.$chatCont = $('<div class="eb-chat-cont"></div>');
    this.$chatBox = $('<div class="eb-chatBox"></div>');
    this.$inputCont = $('<div class="eb-chat-inp-cont"><input type="text" class="msg-inp"/><button class="btn btn-info msg-send"><i class="fa fa-paper-plane" aria-hidden="true"></i></button></div>');
    this.$poweredby = $('<div class="poweredby-cont"><div class="poweredby"><i>powered by</i> EXPRESSbase</div></div>');
    this.$msgCont = $('<div class="msg-cont"></div>');
    this.$botMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-bot"><div class="msg-wraper-bot"></div></div>'));
    this.$botMsgBox.prepend('<div class="bot-icon"></div>');
    this.$userMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-user"><div class="msg-wraper-user"></div></div>'));
    this.$userMsgBox.append('<div class="bot-icon-user"></div>');
    this.ready = true;
    this.isAlreadylogined = true;
    this.bearerToken = null;
    this.refreshToken = null;
    this.initControls = new InitControls(this);
    this.typeDelay = 10;
    this.ChartCounter = 0;
    this.formsList = {};
    this.formsDict = {};
    this.formNames = [];
    this.curForm = {};
    this.formControls = [];
    this.formValues = {};
    this.formValuesWithType = {}
    this.formFunctions = {};
    this.formFunctions.visibleIfs = {};
    this.editingCtrlName = null;
    this.lastCtrlIdx = 0;
    this.FB = null;
    this.FBResponse = {};
    this.ssurl = ssurl;
    this.userLoc = {};

    this.init = function () {
        $("body").append(this.$chatCont);
        this.$chatCont.append(this.$chatBox);
        this.$chatCont.append(this.$inputCont);
        this.$chatCont.append(this.$poweredby);
        this.$TypeAnim = $(`<div><svg class="lds-typing" width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                    <circle cx="27.5" cy="40.9532" r="5" fill="#999">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.5s"></animate>
                    </circle>
                    <circle cx="42.5" cy="56.4907" r="5" fill="#aaa">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.375s"></animate>
                    </circle>
                    <circle cx="57.5" cy="62.5" r="5" fill="#bbb">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.25s"></animate>
                    </circle>
                </svg><div>`);

        var html = document.getElementsByTagName('html')[0];
        html.style.setProperty("--botdpURL", this.botdpURL);
        //html.style.setProperty("--botThemeColor", this.ebbotThemeColor);

        var $botMsgBox = this.$botMsgBox.clone();
        $botMsgBox.find('.msg-wraper-bot').html(this.$TypeAnim.clone()).css("width", "82px");
        this.$TypeAnimMsg = $botMsgBox;
        $("body").on("click", ".eb-chat-inp-cont .msg-send", this.send_btn);
        $("body").on("click", ".msg-cont [name=ctrlsend]", this.ctrlSend);
        $("body").on("click", ".msg-cont [name=ctrledit]", this.ctrlEdit);
        $("body").on("click", ".eb-chatBox [name=formsubmit]", this.formSubmit);
        $("body").on("click", "[name=contactSubmit]", this.contactSubmit);
        $("body").on("click", ".btn-box [for=form-opt]", this.startFormInteraction);
        $("body").on("click", ".btn-box [for=continueAsFBUser]", this.continueAsFBUser);
        $("body").on("click", ".btn-box [for=fblogin]", this.FBlogin);
        $("body").on("click", ".card-btn-cont .btn", this.ctrlSend);
        $('.msg-inp').on("keyup", this.txtboxKeyup);
        this.showDate();
    };

    this.contactSubmit = function (e) {
        this.msgFromBot("Thank you.");
        this.authenticateAnon($("#anon_mail").val().trim(), $("#anon_phno").val().trim());
        $(e.target).closest('.msg-cont').remove();
    }.bind(this);

    this.authenticateAnon = function (email, phno) {
        this.showTypingAnim();

        $.post("../bote/AuthAndGetformlist",
            {
                "cid": this.EXPRESSbase_SOLUTION_ID,
                "appid": this.EXPRESSbase_APP_ID,
                "socialId": null,
                "wc": "bc",
                "anon_email": email,
                "anon_phno": phno
            }, function (result) {
                this.hideTypingAnim();
                if (result === null)
                    this.authFailed();
                this.formsDict = result[1];
                this.bearerToken = result[0].bearerToken;
                this.refreshToken = result[0].refreshToken;
                this.formNames = Object.values(this.formsDict);
                this.AskWhatU();

                /////////////////////////////////////////////////
                //setTimeout(function () {
                //    //$(".btn-box .btn:last").click();
                //    $(".btn-box").find("[idx=4]").click();
                //}.bind(this), this.typeDelay * 2 + 100);
            }.bind(this));
    }.bind(this);

    this.postmenuClick = function (e, reply) {
        var $e = $(e.target);
        if (reply === undefined)
            reply = $e.text().trim();
        var idx = parseInt($e.attr("idx"));
        $e.closest('.msg-cont').remove();
        this.sendMsg(reply);
        $('.eb-chat-inp-cont').hide();
        this.CurFormIdx = idx;
    }.bind(this);

    this.FBlogin = function (e) {
        this.postmenuClick(e);
        if (this.CurFormIdx === 0)
            this.login2FB();
        else
            this.collectContacts();
    }.bind(this);

    this.collectContacts = function () {
        this.msgFromBot("OK, No issues. Can you Please provide your contact Details ? so that i can understand you better.");
        this.msgFromBot($('<div class="contct-cont"><div class="contact-inp-wrap"><input id="anon_mail" type="email" class="plain-inp"><i class="fa fa-envelope-o" aria-hidden="true"></i></div><div class="contact-inp-wrap"><input id="anon_phno" type="tel" class="plain-inp"><i class="fa fa-phone" aria-hidden="true"></i></div><button name="contactSubmit" class="contactSubmit">Submit <i class="fa fa-chevron-right" aria-hidden="true"></i></button>'));
    };

    this.continueAsFBUser = function (e) {
        this.postmenuClick(e, "");
        if (this.CurFormIdx === 0)
            this.authenticate();
        else
            this.FB.logout(function (response) {
                this.msgFromBot("You are successfully logout from our App");
            }.bind(this));
    }.bind(this);

    this.startFormInteraction = function (e) {
        this.curRefid = $(e.target).attr("refid");
        this.curObjType = $(e.target).attr("obj-type");
        this.postmenuClick(e);
        this.getForm(this.curRefid);///////////////////
    }.bind(this);

    this.getForm = function (RefId) {
        this.showTypingAnim();
        if (!this.formsList[RefId]) {
            $.post("../Bote/GetCurForm", {
                "refreshToken": this.refreshToken,
                "bearerToken": this.bearerToken,
                "refid": RefId
            }, function (data) {
                this.hideTypingAnim();

                if (typeof data === "string") {
                    data = JSON.parse(data);
                    data.objType = data.ObjType;
                }


                this.formsList[RefId] = data;
                if (data.objType === "BotForm") {
                    this.curForm = data;
                    this.setFormControls();
                }
                else if (data.objType === "TableVisualization") {
                    data.BotCols = JSON.parse(data.BotCols);
                    data.BotData = JSON.parse(data.BotData);
                    this.curTblViz = data;
                    this.showTblViz();
                }
                else if (data.objType === "ChartVisualization") {
                    this.curChartViz = data;
                    this.showChartViz();
                }
            }.bind(this));
        }
        else {
            this.hideTypingAnim();
            this.curForm = this.formsList[RefId];

            var data = this.formsList[RefId];
            if (data.objType === "BotForm")
                this.curForm = data;
            else if (data.objType === "TableVisualization")
                this.curTblViz = data;
            else if (data.objType === "ChartVisualization")
                this.showChartViz();//////////////////////////////////////////////////////////////////////////////////

            this.setFormControls();
        }
    }

    this.showTblViz = function (e) {
        var $tableCont = $('<div class="table-cont">' + this.curTblViz.BareControlHtml + '</div>');
        this.$chatBox.append($tableCont.hide());
        this.showTypingAnim();
        $(`#${this.curTblViz.EbSid}`).DataTable({
            processing: true,
            serverSide: false,
            dom: 'rt',
            columns: this.curTblViz.BotCols,
            data: this.curTblViz.BotData,
            initComplete: function () {
                this.hideTypingAnim();
                this.AskWhatU();
                $tableCont.show(100);
            }.bind(this)
            //dom: "rt",
            //ajax: {
            //    url: 'http://localhost:8000/ds/data/' + this.curTblViz.DataSourceRefId,
            //    type: 'POST',
            //    timeout: 180000,
            //    data: function (dq) {
            //        delete dq.columns; delete dq.order; delete dq.search;
            //        dq.RefId = this.curTblViz.DataSourceRefId;
            //        return dq;
            //    }.bind(this),
            //    dataSrc: function (dd) {
            //        return dd.data;
            //    },
            //    beforeSend: function (xhr) {
            //        xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //    }.bind(this),
            //    crossDomain: true
            //}
        });
    }.bind(this);

    this.showChartViz = function (e) {
        this.showTypingAnim();
        $.ajax({
            type: 'POST',
            url: 'http://localhost:8000/ds/data/' + this.curChartViz.DataSourceRefId,
            data: { draw: 1, RefId: this.curChartViz.DataSourceRefId, Start: 0, Length: 50, TFilters: [] },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            }.bind(this),
            success: this.getDataSuccess.bind(this),
            error: function () { }
        });
    }.bind(this);

    this.getDataSuccess = function (result) {
        this.Gdata = result.data;
        $canvasDiv = $('<div class="chart-cont">' + this.curChartViz.BareControlHtml + '</div>');
        $canvasDiv.find("canvas").attr("id", $canvasDiv.find("canvas").attr("id") + ++this.ChartCounter);
        this.$chatBox.append($canvasDiv);
        this.drawGeneralGraph();
        this.hideTypingAnim();
        this.AskWhatU();
    };

    this.drawGeneralGraph = function () {
        this.getBarData();
        this.gdata = {
            labels: this.XLabel,
            datasets: this.dataset,
        };
        this.animateOPtions = (this.curChartViz.ShowValue) ? new animateObj(0) : false;
        this.goptions = {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: (this.type !== "pie") ? true : false,
                        labelString: (this.curChartViz.YaxisTitle !== "") ? this.curChartViz.YaxisTitle : "YLabel",
                        fontColor: (this.curChartViz.YaxisTitleColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.YaxisTitleColor : "#000000"
                    },
                    stacked: false,
                    gridLines: {
                        display: (this.curChartViz.Type !== "pie") ? true : false
                    },
                    ticks: {
                        fontSize: 10,
                        fontColor: (this.curChartViz.YaxisLabelColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.YaxisLabelColor : "#000000"
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: (this.type !== "pie") ? true : false,
                        labelString: (this.curChartViz.XaxisTitle !== "") ? this.curChartViz.XaxisTitle : "XLabel",
                        fontColor: (this.curChartViz.XaxisTitleColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.XaxisTitleColor : "#000000"
                    },
                    gridLines: {
                        display: (this.type !== "pie") ? true : false
                    },
                    ticks: {
                        fontSize: 10,
                        fontColor: (this.curChartViz.XaxisLabelColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.XaxisLabelColor : "#000000"
                    }
                }]
            },
            zoom: {
                // Boolean to enable zooming
                enabled: true,

                // Zooming directions. Remove the appropriate direction to disable 
                // Eg. 'y' would only allow zooming in the y direction
                mode: 'x',
            },
            pan: {
                enabled: true,
                mode: 'x',
            },
            legend: {
                //onClick: this.legendClick.bind(this)
            },

            tooltips: {
                enabled: this.curChartViz.ShowTooltip
            },
            animation: this.animateOPtions

        };
        if (this.curChartViz.Xaxis.$values.length > 0 && this.curChartViz.Xaxis.$values.length > 0)
            this.drawGraph();

    };

    this.getBarData = function () {
        this.Xindx = [];
        this.Yindx = [];
        this.dataset = [];
        this.XLabel = [];
        this.YLabel = [];
        var xdx = [], ydx = [];
        if (this.curChartViz.Xaxis.$values.length > 0 && this.curChartViz.Yaxis.$values.length > 0) {

            $.each(this.curChartViz.Xaxis.$values, function (i, obj) {
                xdx.push(obj.data);
            });

            $.each(this.curChartViz.Yaxis.$values, function (i, obj) {
                ydx.push(obj.data);
            });

            $.each(this.Gdata, this.getBarDataLabel.bind(this, xdx));

            for (k = 0; k < ydx.length; k++) {
                this.YLabel = [];
                for (j = 0; j < this.Gdata.length; j++)
                    this.YLabel.push(this.Gdata[j][ydx[k]]);
                if (this.curChartViz.Type !== "googlemap") {
                    if (this.curChartViz.Type !== "pie") {
                        this.piedataFlag = false;
                        this.dataset.push(new datasetObj(this.curChartViz.Yaxis.$values[k].name, this.YLabel, this.curChartViz.LegendColor.$values[k].color, this.curChartViz.LegendColor.$values[k].color, false));
                    }
                    else {
                        this.dataset.push(new datasetObj4Pie(this.curChartViz.Yaxis.$values[k].name, this.YLabel, this.curChartViz.LegendColor.$values[k].color, this.curChartViz.LegendColor.$values[k].color, false));
                        this.piedataFlag = true;
                    }
                }
            }
        }
    };

    this.getBarDataLabel = function (xdx, i, value) {
        for (k = 0; k < xdx.length; k++)
            this.XLabel.push(value[xdx[k]]);
    };

    this.drawGraph = function () {
        var canvas = document.getElementById(this.curChartViz.EbSid + this.ChartCounter);
        this.chartApi = new Chart(canvas, {
            type: this.curChartViz.Type,
            data: this.gdata,
            options: this.goptions,
        });
    };

    this.txtboxKeyup = function (e) {
        if (e.which === 13)/////////////////////////////
            this.send_btn();
    }.bind(this);

    this.send_btn = function () {
        window.onmessage = function (e) {
            if (e.data === 'hello') {
                //alert('It works!8888888888888888888888');
            }
        };

        var $e = $('.msg-inp');
        var msg = $e.val().trim();
        if (!msg) {
            $e.val('');
            return;
        };
        this.sendMsg(msg);
        $('.eb-chatBox').scrollTop(99999999999);
        $e.val('');

    }.bind(this);

    this.greetings = function (name) {
        var time = new Date().getHours();
        var greeting = null;
        if (time < 12) {
            greeting = "Good morning!";
        }
        else if (time >= 12 && time < 16) {
            greeting = 'Good afternoon!';
        }
        else {
            greeting = 'Good evening!';
        }
        if (this.isAlreadylogined) {
            this.Query(`Hello ${this.FBResponse.name}, ${greeting}`, [`Continue as ${this.FBResponse.name} ?`, `Not ${this.FBResponse.name}?`], "continueAsFBUser");

            /////////////////////////////////////////////////
            setTimeout(function () {
                $(".btn-box").find("[idx=0]").click();
            }.bind(this), this.typeDelay * 2 + 100);
        }
        else {
            this.msgFromBot(`Hello ${this.FBResponse.name}, ${greeting}`);
            setTimeout(function () {
                this.authenticate();
            }.bind(this), 901);
        }
    }.bind(this);

    this.Query = function (msg, OptArr, For, ids) {
        this.msgFromBot(msg);
        var Options = this.getButtons(OptArr, For, ids);
        this.msgFromBot($('<div class="btn-box" >' + Options + '</div>'));
    };


    this.getButtons = function (OptArr, For, ids) {
        var Html = '';
        $.each(OptArr, function (i, opt) {
            Html += `<button for="${For}" class="btn" idx="${i}" refid="${(ids !== undefined) ? ids[i] : i}">${opt} </button>`;
        });
        return Html;
    };

    this.setFormControls = function () {
        this.formControls = [];
        $.each(this.curForm.controls, function (i, control) {
            if (control.visibleIf && control.visibleIf.trim())//if visibleIf is Not empty
                this.formFunctions.visibleIfs[control.ebSid] = new Function("form", atob(control.visibleIf));
            this.formControls.push($(`<div class='ctrl-wraper'>${control.bareControlHtml}</div>`));
        }.bind(this));
        this.getControl(0);
    }.bind(this);

    this.getValue = function ($input) {
        var inpVal;
        if ($input[0].tagName === "SELECT")
            inpVal = $input.find(":selected").text();
        else if ($input.attr("type") === "password")
            inpVal = $input.val().replace(/(^.)(.*)(.$)/, function (a, b, c, d) { return b + c.replace(/./g, '*') + d });
        else if ($input.attr("type") === "file") {
            inpVal = $input.val().split("\\");
            inpVal = inpVal[inpVal.length - 1];
        }
        else if ($input.attr("type") === "RadioGroup") {
            inpVal = $(`input[name=${this.curCtrl.name}]:checked`).val()
        }
        else
            inpVal = $input.val();
        return inpVal.trim();
    }

    this.chooseClick = function (e) {
        $(e.target).attr("idx", this.lastCtrlIdx);
        this.ctrlSend(e);
    }.bind(this)

    this.ctrlSend = function (e) {
        console.log("ctrlSend()");
        var id = this.editingCtrlName || this.curCtrl.name;
        var $btn = $(e.target).closest("button");
        var $msgDiv = $btn.closest('.msg-cont');
        var next_idx = parseInt($btn.attr('idx')) + 1;
        this.lastCtrlIdx = (next_idx > this.lastCtrlIdx) ? next_idx : this.lastCtrlIdx;
        var $input = $('#' + id);
        //$input.off("blur").on("blur", function () { $btn.click() });//when press Tab key send
        this.lastval = this.getValue($input);
        if (this.curCtrl.objType === "ImageUploader") {
            this.replyAsImage($msgDiv, $input[0], next_idx);
            this.formValues[id] = this.lastval;// last value set from outer fn
            this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.ebDbType];
        }
        else if (this.curCtrl.objType === "RadioGroup") {
            this.sendCtrlAfter($msgDiv.hide(), $('#' + id).val() + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
            this.formValues[id] = this.lastval;
            this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.ebDbType];
            this.callGetControl(this.lastCtrlIdx);
        }
        else {
            if (this.curCtrl.objType === "Cards") {
                this.lastval = $btn.closest(".card-cont").find(".card-label").text();
            }
            else if (this.curCtrl.objType === "InputGeoLocation") {
                this.lastval = $("#" + id + "lat").val() + ", " + $("#" + id + "long").val();
            }
            else {
                this.lastval = this.lastval || $('#' + id).val();
            }
            this.sendCtrlAfter($msgDiv.hide(), this.lastval + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
            this.formValues[id] = this.lastval;
            this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.ebDbType];
            this.callGetControl(this.lastCtrlIdx);
        }
        this.editingCtrlName = null;
        this.lastval = null;
    }.bind(this);

    this.callGetControl = function (idx) {
        if (idx !== this.formControls.length) {
            if (!this.formValues[this.editingCtrlName]) {
                if (!this.formFunctions.visibleIfs[this.curForm.controls[idx].ebSid] || this.formFunctions.visibleIfs[this.curForm.controls[idx].ebSid](this.formValues))//checks isVisible or no isVisible defined
                    this.getControl(idx);
                else {
                    this.lastCtrlIdx++;
                    this.callGetControl(idx + 1);
                }
            }
            else
                this.enableCtrledit(idx);
        }
        else {
            if ($("[name=formsubmit]").length === 0) {
                this.msgFromBot('Are you sure? Can I submit?');
                this.msgFromBot($('<div class="btn-box"><button name="formsubmit" class="btn">Sure</button><button class="btn">Cancel</button></div>'));
            }
            this.enableCtrledit();
        }
    };

    this.getControl = function (idx) {
        if (idx === this.formControls.length)
            return;
        var $CtrlCont;
        var $ctrlCont = $(this.formControls[idx][0].outerHTML);
        var control = this.formControls[idx][0].outerHTML;
        this.curCtrl = this.curForm.controls[idx || 0];
        if (this.curCtrl && (this.curCtrl.objType === "Cards" || this.curCtrl.objType === "Locations" || this.curCtrl.objType === "InputGeoLocation"))
            $CtrlCont = $(control);
        else
            $CtrlCont = $(this.wrapIn_chat_ctrl_cont(idx, control));
        var lablel = this.curCtrl.label + ' ?';
        if (this.curCtrl.helpText)
            lablel += ` (${this.curCtrl.helpText})`;
        this.msgFromBot(lablel);
        this.msgFromBot($CtrlCont);
    }.bind(this);

    this.wrapIn_chat_ctrl_cont = function (idx, control) {
        return '<div class="chat-ctrl-cont">' + control + '<button class="btn" idx=' + idx + ' name="ctrlsend"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button></div>';
    };

    this.replyAsImage = function ($prevMsg, input, idx) {
        console.log("replyAsImage()");
        var ctrlname = this.curCtrl.name;
        var fname = input.files[0].name;
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                this.sendImgAfter($prevMsg.hide(), e.target.result, ctrlname, fname);
                $(`[for=${ctrlname}] .img-loader:last`).show(100);
                this.uploadImage(e.target.result, ctrlname, idx);
            }.bind(this);
            reader.readAsDataURL(input.files[0]);
        }
    };

    this.sendImgAfter = function ($prevMsg, path, ctrlname, filename) {
        console.log("sendImgAfter()");
        var $msg = this.$userMsgBox.clone();
        $msg.find(".msg-wraper-user").css("padding", "5px");
        var $imgtag = $(`<div class="img-box" for="${ctrlname}"><div class="img-loader"></div><span class="img-edit"  idx="${this.curForm.controls.indexOf(this.curCtrl)}"  for="${ctrlname}" name="ctrledit"><i class="fa fa-pencil" aria-hidden="true"></i></span><img src="${path}" alt="amal face" width="100%"><div class="file-name">${filename}</div>${this.getTime()}</div>`);
        $msg.find('.msg-wraper-user').append($imgtag);
        $msg.insertAfter($prevMsg);
        $('.eb-chatBox').scrollTop(99999999999);
    };

    this.uploadImage = function (url, ctrlname, idx) {
        console.log("uploadImage");
        var URL = url.substring(url.indexOf(",/") + 1);
        $.post("../Bote/UploadImageOrginal", {
            'base64': URL,
            "filename": ctrlname,
            "refreshToken": this.refreshToken,
            "bearerToken": this.bearerToken
        }).done(function (result) {
            $(`[for=${ctrlname}] .img-loader:last`).hide(100);
            this.callGetControl(idx);
            this.lastval = result;
        }.bind(this))
    };

    this.ctrlEdit = function (e) {
        var $btn = $(e.target).closest("span");
        var idx = $btn.attr('idx');
        $('.msg-cont-bot [idx=' + idx + ']').closest('.msg-cont').show(200);
        $btn.closest('.msg-cont').remove();
        this.editingCtrlName = this.curForm.controls[idx].name;
        $("#" + this.editingCtrlName).click().select();
        this.disableCtrledit();
    }.bind(this);

    this.sendMsg = function (msg) {
        if (!msg)
            return;
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').text(msg).append(this.getTime());
        this.$chatBox.append($msg);
        $('.eb-chatBox').scrollTop(99999999999);
    };

    this.sendCtrl = function (msg) {
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').append(msg).append(this.getTime());
        this.$chatBox.append($msg);
        $('.eb-chatBox').scrollTop(99999999999);
    };

    this.sendCtrlAfter = function ($prevMsg, msg) {
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').html(msg).append(this.getTime());;
        $msg.insertAfter($prevMsg);
        $('.eb-chatBox').scrollTop(99999999999);
    };

    this.startTypingAnim = function ($msg) {
        $msg.find('.msg-wraper-bot').html(this.$TypeAnim.clone());
    }.bind(this);

    this.showTypingAnim = function () {
        this.$chatBox.append(this.$TypeAnimMsg);
    }.bind(this);

    this.hideTypingAnim = function () {
        this.$TypeAnimMsg.remove();
    }.bind(this);

    this.msgFromBot = function (msg) {
        var $msg = this.$botMsgBox.clone();
        this.$chatBox.append($msg);
        this.startTypingAnim($msg);
        if (this.ready) {
            setTimeout(function () {
                if (msg instanceof jQuery) {
                    $msg.find('.bot-icon').remove();
                    $msg.find('.msg-wraper-bot').css("border", "none").css("background-color", "transparent").css("width", "99%").html(msg);
                    $msg.find(".msg-wraper-bot").css("padding-right", "3px");

                    if (this.curCtrl && (this.curCtrl.objType === "Cards" || this.curCtrl.objType === "Locations")) {
                        $msg.find(".ctrl-wraper").css("width", "100%").css("border", 'none');
                        $msg.find(".msg-wraper-bot").css("margin-left", "12px");
                    }

                    if (this.curCtrl && $('#' + this.curCtrl.name).length === 1 && ($msg.find(".ctrl-wraper").length === 1)) {
                        this.loadcontrol();
                    }
                    if (this.curForm)
                        $msg.attr("form", this.curForm.name);
                }
                else
                    $msg.find('.msg-wraper-bot').text(msg).append(this.getTime());
                this.ready = true;
            }.bind(this), this.typeDelay);
            this.ready = false;
        }
        else {
            $msg.remove();
            setTimeout(function () {
                this.msgFromBot(msg);
            }.bind(this), this.typeDelay + 1);
        }
        $('.eb-chatBox').scrollTop(99999999999);
    }.bind(this);

    //load control script
    this.loadcontrol = function () {
        if (!this.curCtrl)
            return;
        if (this.initControls[this.curCtrl.objType] !== undefined)
            this.initControls[this.curCtrl.objType](this.curCtrl);
    }.bind(this);

    this.formSubmit = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.showConfirm();
    }.bind(this);

    this.showConfirm = function () {
        this.formFunctions.visibleIfs = {};
        this.lastCtrlIdx = 0;
        $(`[form=${this.curForm.name}]`).remove();
        var msg = `Your ${this.curForm.name} application submitted successfully`;
        this.msgFromBot(msg);
        this.DataCollection();
        this.AskWhatU();
    }.bind(this);

    this.DataCollection = function () {
        $.ajax({
            type: "POST",
            url: this.ssurl + "/bots",
            data: {
                TableName: this.curForm.name, Fields: JSON.stringify(this.formValuesWithType)
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            }.bind(this),
            success: this.ajaxsuccess.bind(this),
        });
        this.formValues = {};
    };

    this.ajaxsuccess = function () {

    };

    this.AskWhatU = function () {
        this.Query("What do you want to do ?", this.formNames, "form-opt", Object.keys(this.formsDict));
    };

    this.showDate = function () {
        this.$chatBox.append(`<div class="chat-date"><span>13-Nov-17</span></div>`);
    };

    this.getTime = function () {
        return `<div class='msg-time'>${new Date().getHours() % 12 + ':' + new Date().getMinutes() + 'pm'}</div>`;
    };

    this.loadCtrlScript = function () {
        $("head").append(this.CntrlHeads);
    };

    this.authFailed = function () {
        alert("auth failed");
    };

    this.enableCtrledit = function () {
        $('[name="ctrledit"]').show(50);
    };

    this.disableCtrledit = function () {
        $('[name="ctrledit"]').hide(50);
    };

    this.authenticate = function () {
        this.showTypingAnim();

        $.post("../bote/AuthAndGetformlist",
            {
                "cid": this.EXPRESSbase_SOLUTION_ID,
                "appid": this.EXPRESSbase_APP_ID,
                "socialId": this.FBResponse.id,
                "wc": "bc",
                "anon_email": null,
                "anon_phno": null
            }, function (result) {
                this.hideTypingAnim();
                if (result === null)
                    this.authFailed();
                this.formsDict = result[1];
                this.bearerToken = result[0].bearerToken;
                this.refreshToken = result[0].refreshToken;
                this.formNames = Object.values(this.formsDict);
                this.AskWhatU();

                /////////////////////////////////////////////////Form click
                //setTimeout(function () {
                //    //$(".btn-box .btn:last").click();
                //    $(".btn-box").find("[idx=15]").click();
                //}.bind(this), this.typeDelay * 2 + 100);ctr
            }.bind(this));
    }.bind(this);

    this.FBLogined = function () {
        this.FB.api('/me?fields=id,name,picture', function (response) {
            this.FBResponse = response;
            this.$userMsgBox.find(".bot-icon-user").css('background', `url(${this.FBResponse.picture.data.url})center center no-repeat`);
            this.greetings();
        }.bind(this));
    }.bind(this);

    this.FBNotLogined = function () {
        this.isAlreadylogined = false;
        this.Query("Hello I am EBbot, Nice to meet you. Do you mind loging into facebook?", ["Login to facebook", "No, Sorry"], "fblogin");
    }.bind(this);

    this.login2FB = function () {
        this.FB.login(function (response) {
            if (response.authResponse) {
                statusChangeCallback(response);
            } else {
                this.collectContacts();
            }
        }.bind(this), { scope: 'email' });
    }
    this.init();
};

var datasetObj = function (label, data, backgroundColor, borderColor, fill) {
    this.label = label;
    this.data = data;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.fill = fill;
};

function getToken() {
    var b = document.cookie.match('(^|;)\\s*bToken\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}