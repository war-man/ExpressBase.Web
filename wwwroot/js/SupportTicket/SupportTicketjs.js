﻿var BugReport = function () {

    this.init2 = function () {
        this.AppendBugsfn();

        $(".edttkt").on("click", this.EditTicketfn.bind(this));
        $(".cloissue").on("click", this.CloseIssueModal.bind(this));
        $("#issueclosebtn").on("click", this.CloseTicketfn.bind(this));
        $("#newticket").on("click", this.NewTicketfn.bind(this));
        $("#mytktbtn").on("click", this.MyTicketfn.bind(this));



    };
    this.MyTicketfn=function () {
            location.href = '/SupportTicket/bugsupport';
        }

    this.AppendBugsfn = function () {
       
        $('#spt_table').find('thead tr').append('<th>Ticket Id</th>');
        $('#spt_table').find('thead tr').append('<th style="width: 400px;">Title</th>');
        if ((ebcontext.sid == "admin") || (ebcontext.user.wc == "tc")) {
            $('#spt_table').find('thead tr').append('<th>Solution Name</th>');
        }
        $('#spt_table').find('thead tr').append('<th>Priorty</th>');
        $('#spt_table').find('thead tr').append('<th>Age</th>');
        $('#spt_table').find('thead tr').append('<th>Status</th>');
        $('#spt_table').find('thead tr').append('<th>Assigned to</th>');

        $.each(tktob.supporttkt, function (i, obj) {
            let p = "tkt" + i;
            let html1 = null;
            if ((ebcontext.sid == "admin") || (ebcontext.user.wc == "tc")) {
                html1 += `<tr id="${p}" tabindex="${i}" class="tbltkt "> 
            <td>${obj.ticketid}</td> 
            <td>${obj.title}</td> 
            <td>${obj.Solution_name}</td> 
            <td>${obj.priority}</td> 
            <td>${obj.NoDays}d ${obj.NoHour}h</td> 
            <td>${obj.status}</td> 
            <td>${obj.assignedto}</td> 
             <td> 
                    <button class="btn btn-default btn-xs edttkt iosclk" style="color:blue" tktno="${obj.ticketid}" id="edt${obj.ticketid}">Edit <i class="fa fa-fw fa-edit  fa-lg fa-fw"></i></button>
                    <button class="btn btn-default btn-xs cloissue iosclk" style="color:red" tktno="${obj.ticketid}" id="cl${obj.ticketid}">Close issue  <i class="fa fa-fw fa-close fa-lg fa-fw"></i></button>

              </td>
         </tr>`;
            }
            else {
                html1 += `<tr id="${p}" tabindex="${i}" class="tbltkt"> 
            <td>${obj.ticketid}</td> 
            <td>${obj.title}</td>  
            <td>${obj.priority}</td> 
            <td>${obj.NoDays}d ${obj.NoHour}h</td> 
            <td>${obj.status}</td> 
            <td>${obj.assignedto}</td> 
             <td> 
                    <button class="btn btn-default btn-xs edttkt iosclk" style="color:blue" tktno="${obj.ticketid}" id="edt${obj.ticketid}">Edit <i class="fa fa-fw fa-edit  fa-lg fa-fw"></i></button>
                    <button class="btn btn-default btn-xs cloissue iosclk" style="color:red" tktno="${obj.ticketid}" id="cl${obj.ticketid}">Close issue  <i class="fa fa-fw fa-close fa-lg fa-fw"></i></button>
              </td>
         </tr>`;
            }

         $("#bugtblbody").append(html1);

            if (((obj.priority == "High") && (obj.NoDays > 3)) || ((obj.priority == "Medium") && (obj.NoDays > 7)) ){
                var lk = null;
                 lk= '#' + p;
                $(lk).addClass("trclr");
            }
            if (obj.status == "Closed") {
                var lk = null;
                lk = '#' + p;
                $(lk).removeClass("trclr");
            }
        });
       
       
        

    }



    this.EditTicketfn = function (ev) {

        let tktno = $(ev.target).closest('button').attr("tktno");
        $("#eb_common_loader").EbLoader("show");
        location.href = `/SupportTicket/EditTicket?tktno=${tktno}`;

    }

    this.CloseTicketfn = function (ev) {


        let tktno = $(ev.target).closest('button').attr("tktno");
        var reason= $("#reasontxt").val().trim();
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            url: "../SupportTicket/ChangeStatus",
            data: { tktno: tktno,reason:reason },
            cache: false,
            type: "POST",
            success: function () {
                $("#eb_common_loader").EbLoader("hide");
                $('#modal_close').show();
            }
        });

        location.href = '/SupportTicket/bugsupport';
    }

    this.CloseIssueModal=function(ev){
          let tktno = $(ev.target).closest('button').attr("tktno");
          $("#issueclosebtn").attr("tktno",tktno);
          $('#modal_close').modal('show');
    }

    this.NewTicketfn = function () {
        $("#eb_common_loader").EbLoader("show");
        let tktno = "newticket";
        location.href = `/SupportTicket/EditTicket?tktno=${tktno}`;
    }


    this.init2();
};





//for editticket.cshtml






var EditTicket = function () {

    this.init1 = function () {
        this.AppendTicketfn();
        $("#btnupdate").on("click", this.Updateticketfn.bind(this));
        $("#btnupdateadmin").on("click", this.UpdateAdminTicketfn.bind(this));
        $("#savebugid").on("click", this.Savebug.bind(this));
        $("#btncomment").on("click", this.Commentfn.bind(this));
        $("#mytktbtn").on("click", this.MyTicketfn.bind(this));
    };

    this.MyTicketfn=function () {
            location.href = '/SupportTicket/bugsupport';
        }

    this.AppendTicketfn = function () {
        if (new_mode == "True") {

        }
        else {
            $.each(tktdtl.supporttkt, function (i, obj) {
                $("#tktid").val(obj.ticketid);
                if (ebcontext.sid == "admin") {
                    $("#stsid").append(` <option selected="selected" hidden >${obj.status}</option>`);
                }
                else {
                    $("#stsid").val(obj.status);
                }
                $("#asgnid").val(obj.assignedto);
                $("#bugtitle").val(obj.title);
                if (ebcontext.user.wc == "tc") {
                    $("#soluid").append(` <option selected="selected" sol_id= ${obj.solutionid} hidden >${obj.Esolution_id}(${obj.Solution_name})</option>`);
                } 
                else {
                    //$("#soluid").val(obj.solutionid);
                    $("#soluid").val(`${obj.Esolution_id}(${obj.Solution_name})`);
                    $("#soluid").attr("sol_id", obj.solutionid);
                }
                
                $("#bugpriority").append(` <option selected="selected" hidden >${obj.priority}</option>`);
                $("#dtecrtd").val(obj.createdat);
                $("#dtemdfyd").val(obj.lstmodified);
                $("#descriptionid").val(obj.description);
                $("#remarkid").val(obj.remarks);
                $("#type_b_f").val(obj.type_b_f);
                document.getElementById('Bug').checked = false;
                if (obj.type_b_f == "Bug") {
                    document.getElementById("Bug").checked = true;
                }
                else {
                    document.getElementById("FeatureRequest").checked = true;
                }

            });


            $.each(sptHistroy.SpHistory, function (j, ob, ) {
                let stval = 0;
                let ftemp = null;
                let htm2 = null;
                if (ob.Field == "title") {
                    ftemp = "Title";
                }
                else if (ob.Field == "solution_id") {
                    ftemp = "Solution id";
                }
                else if (ob.Field == "date_created") {
                    ftemp = "Date created";
                    stval = 1;
                }
                else if (ob.Field == "type_bg_fr") {
                    ftemp = "Issue type";
                }
                else if (ob.Field == "priority") {
                    ftemp = "Priority";
                }
                else if (ob.Field == "status") {
                    ftemp = "Status";
                }
                else if (ob.Field == "description") {
                    ftemp = "Description";
                }
                else if (ob.Field == "comment") {
                    stval = 2;
                }
                else if (ob.Field == "assigned_to") {
                    ftemp = "Assigned to"
                }
                else if (ob.Field == "reason") {
                    stval = 3;

                }

                //if(ob.Field=="reason"){
                //    return true;
                //    }
                if (stval == 3) {
                    htm2 = ` <div class="hstry">
                                <div>
                                 <strong> ${ob.UserName} </strong>  has <b><i> closed  </i></b> the issue because of " ${ob.Value} "  on  ${ob.CreatedDate} at ${ob.CreatedTime}
                                </div>
                             </div>`
                }

               else if (stval == 0) {
                    htm2 = ` <div class="hstry">
                                <div>
                                 <strong> ${ob.UserName} </strong> changed <b><i> ${ftemp} </i></b> to " ${ob.Value} "  on  ${ob.CreatedDate} at ${ob.CreatedTime}
                                </div>
                             </div>`
                }
                else  if (stval == 1) {
                    htm2 = ` <div class="hstry">
                                <div>
                                <strong>  ${ob.UserName} </strong> <b><i> created issue </i></b>   on  ${ob.CreatedDate} at ${ob.CreatedTime}
                                </div>
                            </div>`
                }
                else if (stval == 2) {
                    htm2 = ` <div class="hstry">
                                <div>
                                 <strong> ${ob.UserName} </strong>:     <b> " </b> ${ob.Value} <b> " </b> on  ${ob.CreatedDate} at ${ob.CreatedTime}
                                </div>
                                <div class="hstdt">
                                 
                                </div>
                             </div>`
                }

                $("#hist_id").prepend(htm2);
            });
        }
    }


    this.Savebug = function () {
        let bfr = null
        let fill = this.validatefn();
        if (fill) {
            var data = new FormData();
            $("#eb_common_loader").EbLoader("show");
            var totalFiles = window.filearray.length;
            for (var i = 0; i < totalFiles; i++) {
                var file = window.filearray[i];
                data.append("imageUploadForm" + i, file);
            }
            var tlt = $("#bugtitle").val().trim();
            var sts = $("#stsid").val().trim();
            var desc = $("#descriptionid").val().trim();
            var priori = $("#bugpriority option:selected").text().trim();
            var solu = $("#soluid option:selected").attr('sol_id');
            var typ = $('input[name=optradio]:checked').val();
            data.append("title", tlt);
            data.append("descp", desc);
            data.append("priority", priori);
            data.append("stats", sts);
            data.append("solid", solu);
            data.append("type_f_b", typ);

            $.ajax({
                url: "../SupportTicket/SaveBugDetails",
                type: 'POST',
                data: data,
                processData: false,
                contentType: false,
                success: function () {
                    location.href = '/SupportTicket/bugsupport';
                    $("#eb_common_loader").EbLoader("hide");
                }
            });


        }
    }

    this.validatefn = function () {
        let sts = true

        let de = $("#descriptionid").val();
        if (de.length == 0) {
            $("#descrlbl").css("visibility", "visible");
            $("#descrlbl").show();
            $("#descriptionid").focus();
            //$('#name').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            //$('#name').removeClass('txthighlightred').addClass('txthighlight');
            $("#descrlbl").css("visibility", "hidden");
        }

        let bgt = $("#bugtitle").val();
        if (bgt.length == 0) {
            $("#titlelbl").css("visibility", "visible");
            $("#titlelbl").show();
            $("#bugtitle").focus();
            //$('#name').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            //$('#name').removeClass('txthighlightred').addClass('txthighlight');
            $("#titlelbl").css("visibility", "hidden");
        }
        return sts;
    }

    this.Updateticketfn = function () {
        let fill = this.validatefn();
        var valchng = 0;
        let  solu = null;
        if (fill) {
            var data = new FormData();

            $("#eb_common_loader").EbLoader("show");
            var totalFiles = window.filearray.length;
            for (var i = 0; i < totalFiles; i++) {
                var file = window.filearray[i];
                data.append("imageUploadForm" + i, file);
            }
            var tlt = $("#bugtitle").val().trim();
            var desc = $("#descriptionid").val().trim();
            var priori = $("#bugpriority option:selected").text().trim();
            if ((ebcontext.sid == "admin") || (ebcontext.user.wc == "tc")) {
                 solu = $("#soluid option:selected").attr('sol_id');
            }
            else
                 solu = $("#soluid").attr('sol_id');
            var tktid = $("#tktid").val();
            var typ = $('input[name=optradio]:checked').val();

            let updtkt = {};

            $.each(tktdtl.supporttkt, function (j, obj) {
                if (obj.title != tlt) {
                    updtkt.title = tlt;
                    valchng = 1;
                }
                if (obj.description != desc) {
                    updtkt.description = desc;
                    valchng = 1;
                }
                if (obj.priority != priori) {
                    updtkt.priority = priori;
                    valchng = 1;
                }
                if (obj.solutionid != solu) {
                    updtkt.solution_id = solu;
                    valchng = 1;
                }

                if (obj.type_b_f != typ) {
                    updtkt.type_bg_fr = typ;
                    valchng = 1;
                }

                if (obj.ticketid == tktid) {
                    data.append("tktid", tktid);
                }
                else {
                    valchng = 2;
                }

            });
            if (ebcontext.user.wc == "tc") {
                data.append("solu_id", solu);
            }

            let updtkt1 = JSON.stringify(updtkt);
            data.append("updtkt", updtkt1);
            data.append("filedelet", JSON.stringify(window.filedel));

            if ((valchng == 1) || (totalFiles > 0) || (window.filedel.length > 0)) {

                $.ajax({
                    url: "../SupportTicket/UpdateTicket",
                    type: 'POST',
                    data: data,
                    processData: false,
                    contentType: false,
                    success: function () {
                        location.href = '/SupportTicket/bugsupport';
                        $("#eb_common_loader").EbLoader("hide");
                    }
                });
            }
            else if (valchng == 0) {
                EbMessage("show", { Message: "No changes found", Background: 'red' });
                $("#eb_common_loader").EbLoader("hide");
            }
            else if (valchng == 2) {
                EbMessage("show", { Message: "Ticket id missmatch", Background: 'red' });
                $("#eb_common_loader").EbLoader("hide");
            }

        }

    }


    this.UpdateAdminTicketfn = function () {
        let fill = this.validatefn();
        var valchng = 0;
        if (fill) {
            var data = new FormData();
            $("#eb_common_loader").EbLoader("show");
            //var totalFiles = window.filearray.length;
            //for (var i = 0; i < totalFiles; i++) {
            //    var file = window.filearray[i];
            //    data.append("imageUploadForm" + i, file);
            //}
            // data.append("filedelet", JSON.stringify(window.filedel));
            var solu = $("#soluid").attr("sol_id");
            var tktid = $("#tktid").val();
            var typ = $('input[name=optradio]:checked').val();
            var sts = $("#stsid option:selected").text().trim();
            var asgned = $("#asgnid option:selected").text().trim();
            var priori = $("#bugpriority option:selected").text().trim();

            let updtkt = {};

            $.each(tktdtl.supporttkt, function (j, obj) {
                if (obj.assignedto != asgned) {
                    updtkt.assigned_to = asgned;
                    valchng = 1;
                }
                if (obj.status != sts) {
                    updtkt.status = sts;
                    valchng = 1;
                }
                if (obj.type_b_f != typ) {
                    updtkt.type_bg_fr = typ;
                    valchng = 1;
                }
                if (obj.priority != priori) {
                updtkt.priority = priori;
                valchng = 1;
                }
                if (obj.solutionid == solu) {
                    data.append("solid", solu);
                }
                else {
                    valchng = 3

                }
                if (obj.ticketid == tktid) {
                    data.append("tktid", tktid);
                }
                else {
                    valchng = 2;
                }

            });
            let updtkt1 = JSON.stringify(updtkt);
            data.append("updtkt", updtkt1);

            if (valchng == 1) {
                $.ajax({
                    url: "../SupportTicket/UpdateTicketAdmin",
                    type: 'POST',
                    data: data,
                    processData: false,
                    contentType: false,
                    success: function () {
                        location.href = '/SupportTicket/bugsupport';
                        $("#eb_common_loader").EbLoader("hide");
                    }
                });
            }
             else if (valchng == 0) {
                EbMessage("show", { Message: "No changes found", Background: 'red' });
                $("#eb_common_loader").EbLoader("hide");
            }
            else if (valchng == 2) {
                EbMessage("show", { Message: "Ticket id missmatch", Background: 'red' });
                $("#eb_common_loader").EbLoader("hide");
            }
        }

    }

    this.Commentfn = function () {

        var cmnt = $("#cmntid").val();
        var tkt = null;
        if (tktdtl.supporttkt[0].ticketid == $("#tktid").val()) {
            tkt = $("#tktid").val();
        }
        if ((cmnt != null)&&(cmnt!="")){
            $.ajax({
                url: "../SupportTicket/Comment",
                type: 'POST',
                data: { cmnt: cmnt, tktno: tkt },

                success: function () {
                    $("#cmntid").val('');
                    var htm2 = ` <div class="hstry">
                                <div>
                                 <strong> ${ebcontext.user.FullName} </strong> :   ${cmnt} 
                                </div>
                                
                             </div>`


                    $("#hist_id").prepend(htm2);

                    $("#eb_common_loader").EbLoader("hide");
                }
            });
        }
        else {
            EbMessage("show", { Message: "comment field cannot be null", Background: 'red' });
        }
    }


    this.init1();
};






/*! Image Uploader - v1.0.0 - 15/07/2019
 * Copyright (c) 2019 Christian Bayer; Licensed MIT */

(function ($) {
    window.filearray = [];
    window.filedel = [];
    var preloadedfile = 0;
    $.fn.imageUploader = function (options) {

        // Default settings
        let defaults = {
            preloaded: [],
            imagesInputName: 'images',
            preloadedInputName: 'preloaded',
            label: 'Drag & Drop files here or click to browse'
        };

        // Get instance
        let plugin = this;

        // Set empty settings
        plugin.settings = {};

        // Plugin constructor
        plugin.init = function () {

            // Define settings
            plugin.settings = $.extend(plugin.settings, defaults, options);

            // Run through the elements
            plugin.each(function (i, wrapper) {

                // Create the container
                let $container = createContainer();

                // Append the container to the wrapper
                $(wrapper).append($container);

                // Set some bindings
                $container.on("dragover", fileDragHover.bind($container));
                $container.on("dragleave", fileDragHover.bind($container));
                $container.on("drop", fileSelectHandler.bind($container));

                // If there are preloaded images
                if (plugin.settings.preloaded.length) {

                    // Change style
                    $container.addClass('has-files');

                    // Get the upload images container
                    let $uploadedContainer = $container.find('.uploaded');

                    // Set preloaded images preview
                    for (let i = 0; i < plugin.settings.preloaded.length; i++) {
                        $uploadedContainer.append(createImg(plugin.settings.preloaded[i].src, plugin.settings.preloaded[i].id, plugin.settings.preloaded[i].cntype, plugin.settings.preloaded[i].fileno, true));
                    }

                }

            });

        };


     //   let dataTransfer = new DataTransfer();

        let createContainer = function () {

            // Create the image uploader container
            let $container = $('<div>', { class: 'image-uploader bdrrds4' }),

                // Create the input type file and append it to the container
                $input = $('<input>', {
                    type: 'file',
                    id: plugin.settings.imagesInputName,
                    accept: 'image/jpeg,image/png,image/jpg,application/pdf',
                    name: plugin.settings.imagesInputName + '[]',
                    multiple: ''
                }).appendTo($container),

                // Create the uploaded images container and append it to the container
                $uploadedContainer = $('<div>', { class: 'uploaded', id: 'upld' }).appendTo($container),

                // Create the text container and append it to the container
                $textContainer = $('<div>', {
                    class: 'upload-text'
                }).appendTo($container),

                // Create the icon and append it to the text container
                $i = $('<i>', { class: 'material-icons', text: 'cloud_upload' }).appendTo($textContainer),

                // Create the text and append it to the text container
                $span = $('<span>', { text: plugin.settings.label }).appendTo($textContainer);


            // Listen to container click and trigger input file click
            $container.on('click', function (e) {
                // Prevent browser default event and stop propagation
                //prevent(e);
                e.preventDefault();
                e.stopPropagation();

                // Trigger input click
                $input.trigger('click');
            });

            // Stop propagation on input click
            $input.on("click", function (e) {
                e.stopPropagation();
            });

            // Listen to input files changed
            $input.on('change', fileSelectHandler.bind($container));

            return $container;
        };


        let prevent = function (e) {
            // Prevent browser default event and stop propagation
            e.preventDefault();
            e.stopPropagation();

        };
        //code review
        $(".uploaded-image").on("click", function (e) {

           // alert("The paragraph was clicked.");
        });

        let createImg = function (src, id, cntype, fileno) {
            var flurl = src;
            // Create the upladed image container
            let $container = $('<div>', { class: 'uploaded-image' });

            // Create the img tag

            if (cntype == 'application/pdf') {

                src = '/images/pdf-image.png';

                $img = $('<img>', { src: src, cntype: cntype, pd64: flurl }).appendTo($container);
                // $img = $('<iframe>', { src: src }).appendTo($container);

            }
            else {
                $img = $('<img>', { src: src, cntype: cntype }).appendTo($container);
            }

            $img.data('file_url', flurl);



            // Create the delete button
            $button = $('<button>', { class: 'delete-image' }).appendTo($container),

                // Create the delete icon
                $i = $('<i>', { class: 'material-icons', text: 'clear' }).appendTo($button);

            // If the images are preloaded
            if (plugin.settings.preloaded.length) {

                // Set a identifier
                $container.attr('data-preloaded', true);
                $container.attr('data-index', id);
                $container.attr('data-fileno', fileno);
                $container.attr('data-cntype', cntype);

                // Create the preloaded input and append it to the container
                let $preloaded = $('<input>', {
                    type: 'hidden',
                    name: plugin.settings.preloadedInputName + '[]',
                    value: id
                }).appendTo($container)

            } else {

                // Set the identifier
                $container.attr('data-index', id);

            }

            // Stop propagation on click
            $container.on("click", function (e) {
                var cntyp = $(e.target).closest('img').attr('cntype');
                if (cntyp == "application/pdf") {
                    $('#file_disp').html(` <iframe id="display_file" src="" frameborder="0" style=" display: block; border:none; height:550px; width:100%"></iframe>`);
                    var src1 = $(e.target).closest('img').attr('pd64');
                    //var src1 = $img.data('file_url');
                    $('#display_file').attr('src', src1);
                    $('#diplay_modal').modal('show');
                }
                else {
                    $('#file_disp').html(` <img id="display_file" class="col-lg-12 col-md-12 col-sm-12" src="" style="display: block; max-height:550px; width:100%" ">`);
                    var src1 = $(e.target).closest('img').attr('src');
                    $('#display_file').attr('src', src1)
                    $('#diplay_modal').modal('show');
                }

                //if (typeof (src1) !== 'undefined') {
                //    $('.edtsprt').html(`<iframe id="iframe" src=${src1}></iframe>`);
                //}


                // Prevent browser default event and stop propagation
                prevent(e);

            });

            // Set delete action
            $button.on("click", function (e) {
                // Prevent browser default event and stop propagation
                prevent(e);


                let flno = parseInt($container.data('fileno'));

                // If is not a preloaded image
                if (($container.data('index')) >= 0) {

                    // Get the image index
                    let index = parseInt($container.data('index'));

                    // Update other indexes
                    $container.parent().find('.uploaded-image[data-index]').each(function (i, cont) {
                        if (i > index) {
                            $(cont).attr('data-index', i - 1);
                        }
                    });

                    //remove from file array
                    window.filearray.splice(index, 1);

                    // Remove the file from input
                  //  dataTransfer.items.remove(index);
                }
                if (flno > 0) {
                    window.filedel.push(flno);
                }
                let $contParent = $container.parent();
                // Remove this image from the container
                $container.remove();

                var nm = (((preloadedfile - window.filedel.length) + filearray.length) < 10);

                // If there is no more uploaded files
                if (!$contParent.find('.uploaded-image').length) {

                    // Remove the 'has-files' class
                    $contParent.parent().removeClass('has-files');

                }

            });

            return $container;
        };

        let fileDragHover = function (e) {

            // Prevent browser default event and stop propagation
            prevent(e);

            // Change the container style
            if (e.type === "dragover") {
                $(this).addClass('drag-over');
            } else {
                $(this).removeClass('drag-over');
            }
        };

        let fileSelectHandler = function (e) {

            // Prevent browser default event and stop propagation
            prevent(e);

            // Get the jQuery element instance
            let $container = $(this);

            // Change the container style
            $container.removeClass('drag-over');

            // Get the files
            let files = e.target.files || e.originalEvent.dataTransfer.files;


            // Makes the upload
            setPreview($container, files);
        };

        let setPreview = function ($container, files) {

            // Add the 'has-files' class
            $container.addClass('has-files');

            // Get the upload images container
            let $uploadedContainer = $container.find('.uploaded'),

                // Get the files input
                $input = $container.find('input[type="file"]');

            if (typeof (tktdtl) !== 'undefined') {
                for (var p = 0; p < tktdtl.supporttkt.length; p++) {

                    preloadedfile = tktdtl.supporttkt[p].Fileuploadlst.length;
                }
            }


            // Run through the files
            $(files).each(function (i, file) {
                if ((files[i].type == "image/jpeg") || (files[i].type == "image/jpg") || (files[i].type == "application/pdf") || (files[i].type == "image/png")) {
                    if ((files[i].size) < 2097152) {
                        if (((preloadedfile - window.filedel.length) + filearray.length) < 10) {

                            //add it to file array
                            filearray.push(file);

                            // Add it to data transfer
                         //   dataTransfer.items.add(file);

                            // Set preview

                            //if (files[i].type == "application/pdf") {

                            //    $uploadedContainer.append(createImg('/images/pdf-image.png', dataTransfer.items.length - 1));
                            //}
                            //else
                            {
                                $uploadedContainer.append(createImg(URL.createObjectURL(file), filearray.length-1, files[i].type));
                            }

                        }
                        else {
                            EbMessage("show", { Message: "Maximum number of files reached ", Background: 'red' });
                        }
                    }
                    else {
                        EbMessage("show", { Message: "Maximum file size is 2MB", Background: 'red' });
                    }
                }
                else {
                    EbMessage("show", { Message: "Only image and pdf are allowed", Background: 'red' });
                }




            });

            // Update input files
          //  $input.prop('files', dataTransfer.files);

        };

        // Generate a random id
        let random = function () {
            return Date.now() + Math.floor((Math.random() * 100) + 1);
        };

        this.init();

        // Return the instance
        return this;
    };

}(jQuery));

