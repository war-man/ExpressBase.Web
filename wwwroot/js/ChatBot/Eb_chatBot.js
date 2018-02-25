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
    this.airformValues = {};
    this.formValuesWithType = {}
    this.formFunctions = {};
    this.formFunctions.visibleIfs = {};
    this.editingCtrlName = null;
    this.lastCtrlIdx = 0;
    this.FB = null;
    this.FBResponse = {};
    this.ssurl = ssurl;


    this.AirpotObj = new Airport();


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

        $("body").on("click", ".btn-box [for=bookaflight]", this.bookaflight);
        $("body").on("click", ".btn-box [for=rufrom]", this.rufrom);
        $("body").on("click", ".btn-box [for=near5]", this.near5);
        $("body").on("click", ".btn_book", this.btn_book);

        $("body").on("click", ".card-btn-cont .btn", this.ctrlSend);
        $('.msg-inp').on("keyup", this.txtboxKeyup);

        $("body").on("keyup", "._country_search_input", this.portSearch);
        $("body").on("click", ".locDDitem", this.locDDClick);
        $("body").on("click", ".airCtrlSend", this.airCtrlSend);
        this.radioHTML = `<div class="airctrl-wraper">
        <div id="Duration" name="Duration" type="RadioGroup">
            <div>
                <input type="radio" id="Halfday" value="hd" name="Duration" checked="checked" > <span id="HalfdayLbl"> One way </span><br>
            </div>
            <div>
                <input type="radio" id="Fullday" value="fd" name="Duration"> <span id="FulldayLbl"> Round trip  </span><br>
            </div>
            <div>
                <input type="radio" id="Multipledays" value="md" name="Duration"> <span id="MultipledaysLbl"> Multi-city  </span><br>
            </div>
        </div>
    </div>`;
        this.placeHTML = `
<div class="airctrl-wraper"> 
<div class="_search_country_cont"> 
                <div class="_search_box">
                    <input type="text" name="airctrl"  placeholder="enter text." class="form-control _country_search_input"/>
                    <span class="_icon_search"><i class="glyphicon glyphicon-search"></i></span>
                </div>
                <div class="_search_box_res">
                </div>
                </div>
            </div>`;
        this.dateHTML = `
<div class="airctrl-wraper"> 
<div class="ctrl-wraper"> 
        <div class="input-group" style="width:100%;">
            <input id="DepartDT" for="departon" name="airctrl" data-ebtype="6" data-toggle="tooltip" title="" class="date" type="text" name="airctrl" autocomplete="on" tabindex="0" style="width:100%; background-color:#ffffff;color:#333333;display:inline-block; @fontStyle@ " required="" placeholder="" maxlength="10">
            <span class="input-group-addon" onclick="$('#DepartDT').focus().focus()"> <i id="DepartDTTglBtn" class="fa  fa-calendar" aria-hidden="true"></i> </span>
        </div></div></div>
`;
        this.psngrtypeHTML = `
<div class="airctrl-wraper">
    <div class="pgr-block">
        <pgrlabel>Adults</pgrlabel><br>
        <select class="adults">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
        </select>
    </div>
    <div class="pgr-block">
        <pgrlabel>Children</pgrlabel><br>
        <select class="children">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
        </select>
    </div>
    <div class="pgr-block">
        <pgrlabel>Infants</pgrlabel><br>
        <select class="infants">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
    </div>
</div>`


        $("body").on("click", ".portclose", this.clearPortText);




        this.showDate();
    };

    this.btn_book = function (e) {
        var $btn = $(e.target).closest(".btn");
    };

    this.airCtrlSend = function (e) {
        var $btn = $(e.target).closest(".btn");
        var $inp = $btn.closest(".msg-wraper-bot").find("[name=airctrl]");
        var inpfor = $inp.attr("for");

        var val = $inp.val();

        var _for = $btn.attr("for");
        if (_for === "psngrtype") {
            inpfor = "passengertype";
            val = $(".adults").find(":selected").text();
            val = val + ", " + $(".children").find(":selected").text();
            val = val + ", " + $(".infants").find(":selected").text();
        }
        this.AirPostmenuClick(e, val);
        if (_for === "placefrom") {
            this.sendPlaceto();
            inpfor = "placefrom";
        }
        else if (_for === "placeto") {
            this.sendDeparton();
            inpfor = "placeto";
        }
        else if (_for === "psngrtype") {
            this.getFlightDtls();
        }
        else if (_for === "journytype") {
            this.journytype(e);
        }
        else if (_for === "departon") {
            this.sendPsngrtype();
            inpfor = "departon";
        }
        this.airformValues[inpfor] = val;

    }.bind(this);


    this.sendPsngrtype = function () {
        this.msgFromBot("Number of passengers ?");
        this.sendAirCtrl(this.psngrtypeHTML, "psngrtype");
    };

    this.sendPlaceFrom = function () {
        this.msgFromBot("Place From?");
        this.sendAirCtrl(this.placeHTML, "placefrom");
    };

    this.sendPlaceto = function () {
        this.msgFromBot("Place to?");
        this.sendAirCtrl(this.placeHTML, "placeto");
    };

    this.sendDeparton = function () {
        this.msgFromBot("Depart on ?");
        this.sendAirCtrl(this.dateHTML, "departon");
        this.initControls.Date("DepartDT");
    };

    this.bookaflight = function (e) {
        this.postmenuClick(e);
        if (this.CurFormIdx === 0) {
            this.msgFromBot("Journy type ?");
            this.sendAirCtrl(this.radioHTML, "journytype");
            this.airformValues["journytype"] = "oneway"
        }
    }.bind(this);

    this.rufrom = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.AirPostmenuClick(e);
        var idx = $btn.index()
        if (idx === 0)
            this.airYes();
        else if (idx === 1)
            this.airNo5();
        else if (idx === 2)
            this.airLetMe();
    }.bind(this);

    this.airYes = function () {
        this.sendPlaceto();
        this.airformValues["placefrom"] = "Cochin-COK";
    }.bind(this);

    this.airNo5 = function () {
        this.QueryBtnOnly(this.AirpotObj.nearest5Airports, "near5");
    }.bind(this);

    this.near5 = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.airformValues["placefrom"] = $btn.text();
        this.AirPostmenuClick(e);
        this.sendPlaceto();
    }.bind(this);

    this.journytype = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.AirPostmenuClick(e);
        this.sendMsg("One way");
        this.Query(`Are you travelling from ${this.AirpotObj.nearestAirport} ?`, ["yes", "No, Show me nearest 5 Airports", "No, Let me choose"], "rufrom");
    }.bind(this);

    this.airLetMe = function () {
        this.sendPlaceFrom();
    }.bind(this);

    this.contactSubmit = function (e) {
        this.msgFromBot("Thank you.");
        this.authenticateAnon($("#anon_mail").val().trim(), $("#anon_phno").val().trim());
        $(e.target).closest('.msg-cont').remove();
    }.bind(this);


    this.authenticateAnon = function (email, phno) {
        this.showTypingAnim();
        {// REAL
            //$.post("../bote/AuthAndGetformlist",
            //    {
            //        "cid": this.EXPRESSbase_SOLUTION_ID,
            //        "appid": this.EXPRESSbase_APP_ID,
            //        "socialId": null,
            //        "wc": "bc",
            //        "anon_email": email,
            //        "anon_phno": phno
            //    }, function (result) {
            //        this.hideTypingAnim();
            //        if (result === null)
            //            this.authFailed();
            //        this.formsDict = result[1];
            //        this.bearerToken = result[0].bearerToken;
            //        this.refreshToken = result[0].refreshToken;
            //        this.formNames = Object.values(this.formsDict);
            //        this.AskWhatU();

            //        /////////////////////////////////////////////////
            //        //setTimeout(function () {
            //        //    //$(".btn-box .btn:last").click();
            //        //    $(".btn-box").find("[idx=4]").click();
            //        //}.bind(this), this.typeDelay * 2 + 100);
            //    }.bind(this));
        }
        this.StartAirTicketFlow()
    }.bind(this);

    this.AirPostmenuClick = function (e, reply) {
        var $e = $(e.target);
        if (reply === undefined)
            reply = $e.text().trim();
        $e.closest('.msg-cont').remove();
        this.sendMsg(reply);
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


    this.QueryBtnOnly = function (OptArr, For, ids) {
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
            if (control.visibleIf.trim())//if visibleIf is Not empty
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

    this.ctrlSend = function (e) {
        console.log("ctrlSend()");
        var id = this.editingCtrlName || this.curCtrl.name;
        var $btn = $(e.target).closest(".btn");
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
        if (this.curCtrl && (this.curCtrl.objType === "Cards" || this.curCtrl.objType === "Locations"))
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
    this.sendAirCtrl = function (msg, _for) {
        var $ctrl = $(msg);
        $ctrl.find("[name=airctrl]").attr("for", _for);
        var $msg = this.$botMsgBox.clone();
        $msg.find('.msg-wraper-bot').append(msg).append('<button class="btn airCtrlSend" for="' + _for + '"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>');
        this.$chatBox.append($msg);

        $msg.find(".msg-wraper-bot").css("padding-right", "10px").css("width", "85%");
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
        {
            //$.post("../bote/AuthAndGetformlist",
            //    {
            //        "cid": this.EXPRESSbase_SOLUTION_ID,
            //        "appid": this.EXPRESSbase_APP_ID,
            //        "socialId": this.FBResponse.id,
            //        "wc": "bc",
            //        "anon_email": null,
            //        "anon_phno": null
            //    }, function (result) {
            //        this.hideTypingAnim();
            //        if (result === null)
            //            this.authFailed();
            //        this.formsDict = result[1];
            //        this.bearerToken = result[0].bearerToken;
            //        this.refreshToken = result[0].refreshToken;
            //        this.formNames = Object.values(this.formsDict);
            //        this.AskWhatU();

            //        /////////////////////////////////////////////////Form click
            //        setTimeout(function () {
            //            //$(".btn-box .btn:last").click();
            //            $(".btn-box").find("[idx=15]").click();
            //        }.bind(this), this.typeDelay * 2 + 100);
            //    }.bind(this));
        }

        this.StartAirTicketFlow()
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

    this.StartAirTicketFlow = function () {
        setTimeout(function () {
            this.hideTypingAnim();
            //this.AskWhatU();
            this.QueryBtnOnly(["Book a flight ticket"], "bookaflight");
        }.bind(this), this.typeDelay);
    };

    this.locDDClick = function (e) {
        $("._country_search_input").val(e.target.innerText);
        e.target.style.backgroundColor = "#3333aa"
        $("._search_box_res").hide(100);
        $("._country_search_input").siblings("span").children("i").removeClass("glyphicon glyphicon-search");
        $("._country_search_input").siblings("span").children("i").addClass("fa fa-close portclose");
    };

    this.portSearch = function func(e) {
        $targetval = $(e.target).val();
        if (e.keyCode === 38 || e.keyCode === 40)
            this.modifyPort(e.keyCode);
        else if (e.keyCode === 13) {
            var actElement = $('._search_box_res').children(".xx");
            $("._country_search_input").val(actElement.text());
            $("._search_box_res").hide(100);
            $("._country_search_input").siblings("span").children("i").removeClass("glyphicon glyphicon-search");
            $("._country_search_input").siblings("span").children("i").addClass("fa fa-close portclose");
        }
        else {
            $('._search_box_res').empty().show(100);
            if ($targetval !== "" && $targetval.length > 1) {
                for (index = 0; index < PortList.length; index++) {
                    if (PortList[index].name !== null) {
                        var airname = PortList[index].name.toLowerCase();
                        var aircode = PortList[index].iatacode.toLowerCase();
                        if (airname.startsWith($targetval.toLowerCase()) || aircode.startsWith($targetval.toLowerCase())) {
                            $('._search_box_res').append('<div tabindex="0" class="locDDitem">' + PortList[index].name + "-" + PortList[index].iatacode + "</div>");
                        }
                    }
                }
                $('._search_box_res div:eq(0)').addClass("xx");
                if (!$("._country_search_input").siblings("span").children("i").hasClass("glyphicon")) {
                    $("._country_search_input").siblings("span").children("i").removeClass("fa fa-close portclose");
                    $("._country_search_input").siblings("span").children("i").addClass("glyphicon glyphicon-search");
                }

            }

        }
    }.bind(this);

    this.modifyPort = function (keyCode, val) {
        var actElement = $('._search_box_res').children(".xx");
        if (keyCode === 38 && actElement.prev('div').length > 0) {
            actElement.removeClass("xx");
            currentElement = actElement.prev('div').addClass("xx");
        }
        else if (keyCode === 40 && actElement.next('div').length > 0) {
            actElement.removeClass("xx");
            currentElement = actElement.next('div').addClass("xx");
        }
    };

    this.clearPortText = function () {
        $("._country_search_input").val("");
        if (!$("._country_search_input").siblings("span").children("i").hasClass("glyphicon")) {
            $("._country_search_input").siblings("span").children("i").removeClass("fa fa-close portclose");
            $("._country_search_input").siblings("span").children("i").addClass("glyphicon glyphicon-search");
        }
    };

    this.getFlightDtls = function () {
        $.ajax({
            type: "POST",
            url: "../NDC/AirShoppingSearchAsync",
            data: {from: (this.airformValues["placefrom"]).split("-")[1], to : (this.airformValues['placeto']).split("-")[1], date: (this.airformValues['departon']).replace("/", "-").replace("/", "-")},
            success: this.getFlightDtlsSuccess.bind(this)
        });
    }

    this.getFlightDtlsSuccess = function (data) {
        this.$chatBox.append("<div id='draw'></div>");
        DrawInit(JSON.parse(data[0]), JSON.parse( data[1]), "draw");
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
















function DrawInit(jsonobj, jsonobj2, divid) {
    var newobj = [];
    this.ownerdata = [];
    this.ownerdata.push({ code: "XQ", Name: "Sun Express", Logo: "https://worldairlinenews.files.wordpress.com/2013/11/sunexpress-logo-1.jpg" });
    this.ownerdata.push({ code: "JW", Name: "Vanilla Air", Logo: "https://www.seatlink.com/images/logos/no-text/sm/vanilla-air.png" });

    var owner = jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:Owner"];
    var price = Array.isArray(jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"]) ? jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"][0]["ns2:PricedOffer"]["ns2:OfferPrice"]["ns2:RequestedDate"]["ns2:PriceDetail"]["ns2:BaseAmount"]["#text"] : jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"]["ns2:PricedOffer"]["ns2:OfferPrice"]["ns2:RequestedDate"]["ns2:PriceDetail"]["ns2:BaseAmount"]["#text"];
    var arrtime = Array.isArray(jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]) ? jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][0]["ns2:Arrival"]["ns2:Time"] : jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:Arrival"]["ns2:Time"];
    var deptime = Array.isArray(jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]) ? jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][0]["ns2:Departure"]["ns2:Time"] : jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:Departure"]["ns2:Time"];
    var duration = Array.isArray(jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]) ? jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][0]["ns2:FlightDetail"]["ns2:FlightDuration"]["ns2:Value"] : jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:FlightDetail"]["ns2:FlightDuration"]["ns2:Value"];


    var owner2 = jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:Owner"];
    var price2 = Array.isArray(jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"]) ? jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"][0]["ns2:PricedOffer"]["ns2:OfferPrice"]["ns2:RequestedDate"]["ns2:PriceDetail"]["ns2:BaseAmount"]["#text"] : jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"]["ns2:PricedOffer"]["ns2:OfferPrice"]["ns2:RequestedDate"]["ns2:PriceDetail"]["ns2:BaseAmount"]["#text"];
    var arrtime2 = Array.isArray(jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]) ? jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][0]["ns2:Arrival"]["ns2:Time"] : jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:Arrival"]["ns2:Time"];
    var deptime2 = Array.isArray(jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]) ? jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][0]["ns2:Departure"]["ns2:Time"] : jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:Departure"]["ns2:Time"];
    var duration2 = Array.isArray(jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]) ? jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][0]["ns2:FlightDetail"]["ns2:FlightDuration"]["ns2:Value"] : jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:FlightDetail"]["ns2:FlightDuration"]["ns2:Value"];


    newobj.push({ Depart: deptime, Arrive: arrtime, Duration: duration, Price: price, Airline: getName(owner), Logo: getLogo(owner) });
    newobj.push({ Depart: deptime2, Arrive: arrtime2, Duration: duration2, Price: price2, Airline: getName(owner2), Logo: getLogo(owner2) });

    getAirlines(newobj, $("#" + divid));
}

function getName(ownerid) {
    for (i = 0; i < this.ownerdata.length; i++)
        if (ownerid === this.ownerdata[i].code)
            return this.ownerdata[i].Name
}

function getLogo(ownerid) {
    for (i = 0; i < this.ownerdata.length; i++)
        if (ownerid === this.ownerdata[i].code)
            return this.ownerdata[i].Logo
}


function getAirlines(obj, $container) {
    if (!$.isEmptyObject(obj))
        this.drawAirlinesList(obj, $container);
};

function drawAirlinesList(obj, $container) {
    for (var i = 0; i < obj.length; i++) {
        $container.append(`<div class="airlne_container">
                    <div class="airline_head">
                    <span class="_logo_air"><img class="img-circle" src="${obj[i].Logo}" /></span>
                    ${obj[i].Airline}
                    <span class="_price_val pull-right">${obj[i].Price}</span>
                </div>
                <div class="airline_body">
                    <div class="Depart_time"><div class="_head_inner">Depart</div><div class="_head_body_inner">${obj[i].Depart}</div></div>
                    <div class="Arrive_time"><div class="_head_inner">Arrive</div><div class="_head_body_inner">${obj[i].Arrive}</div></div>
                    <div class="Duration_time"><div class="_head_inner">Duration</div><div class="_head_body_inner">${obj[i].Duration}</div></div>
                    <div class="_Price"><button class="btn btn_book">Book</button></div>
                </div>
            </div>`);
    };
}