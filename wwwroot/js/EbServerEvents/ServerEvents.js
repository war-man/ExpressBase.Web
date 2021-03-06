﻿var EbServerEvents = function (options) {
    this.rTok = options.Rtoken || getrToken();
    this.ServerEventUrl = options.ServerEventUrl;
    this.Channels = options.Channels.join();
    this.Url = this.ServerEventUrl + "/event-stream?channels=" + this.Channels + "&t=" + new Date().getTime();
    this.sEvent = $.ss;

    this.onUploadSuccess = function (m, e) { };
    this.onShowMsg = function (m, e) { };
    this.onLogOut = function (m, e) { };
    this.onNotification = function (m, e) { };
    this.onExcelExportSuccess = function (m, e) { };

    this.onConnect = function (sub) {
        //console.log("You've connected! welcome " + sub.displayName);
        if (sub) {
            window.ebcontext.subscription_id = sub.id;
        }
    };

    this.onJoin = function (user) {
        //console.log("Welcome, " + user.displayName);
    };

    this.onLeave = function (user) {
        //console.log(user.displayName + " has left the building");
    };

    this.onHeartbeat = function (msg, e) {
        //if (console) console.log("onHeartbeat", msg, e);
    };

    this.onUploaded = function (m, e) {
        this.onUploadSuccess(m,e);
    };

    this.onMsgSuccess = function (m, e) {
        //console.log(m);
        this.onShowMsg(m, e);
    };

    this.onLogOutMsg = function (m, e) {
        //console.log(m);
        location.href = "../Tenantuser/Logout";
        this.onLogOut(m, e);
    };

    this.onNotifyMsg = function (m, e) {
        //console.log("Notification");
        this.onNotification(m, e);
    };

    this.stopListening = function () {
        this.ES.close();
        this.sEvent.eventSourceStop = true;
        //console.log("stopped listening");
    };

    this.onExportToExcel = function (m, e) {
        this.onExcelExportSuccess(m);
    };

    this.ES = new EventSourcePolyfill(this.Url, {
        headers: {
            'Authorization': 'Bearer ' + this.rTok,
        }
    });   

    this.ES.addEventListener('error', function (e) {
        console.log("ERROR!", e);
    }, false);

    this.sEvent.eventReceivers = { "document": document }; 

    $(document).bindHandlers({
        announce: function (msg) {
            console.log("announce");
        },
        toggle: function () {
            console.log("toggle");
        },
        removeReceiver: function (name) {
            delete $.ss.eventReceivers[name];
        },
        addReceiver: function (name) {
            this.sEvent.eventReceivers[name] = window[name];
        },
        startListening: function () {
            this.sEvent.reconnectServerEventsAuth();
        }
    }).on('customEvent', function (e, msg, msgEvent) {
        console.log("custom");
    });

    $(this.ES).handleServerEvents({
        handlers: {
            onConnect: this.onConnect.bind(this),
            onJoin: this.onJoin.bind(this),
            onLeave: this.onLeave.bind(this),
            onHeartbeat: this.onHeartbeat.bind(this),
            onUploadSuccess: this.onUploaded.bind(this),
            stopListening: this.stopListening.bind(this),
            onExportToExcel: this.onExportToExcel.bind(this),
            onMsgSuccess: this.onMsgSuccess.bind(this),
            onLogOut: this.onLogOutMsg.bind(this),
            onNotification: this.onNotifyMsg.bind(this)
        }
    });
};