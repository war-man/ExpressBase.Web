﻿var splitWindow = function (parent_div, cont_box, sidediv, p_grid) {
    
    this.parent_div = parent_div;
    this.sidediv = sidediv;
    this.contBox = cont_box;
    this.pGrid = p_grid;
    this.wdId = 1;
    this.wScroll = 0;

    this.createWindows = function () {
        $("#" + this.parent_div).prepend("<div class='col-md-2 no-padd fd' id='" + this.sidediv + "'><div class='min-btn'>"
           +"<button class='btn-tb-com pull-right' onclick= fdBoxMin(); id = 'fd-min-btn' ><i class='fa fa-caret-left fa-lg'></i></button></div><div>");

        $("#" + this.parent_div).append("<div class='col-md-8 no-padd cont-wnd' id='" + this.contBox + "'>"
            + "<div class='sub-windows' id='sub0'><div class='sub-windows-head'>"
            + "<div class='pull-right' style= 'margin-top: 3px;' >"
            + "<button class='head-btn'><i class='fa fa-minus' aria-hidden='true'></i></button>"
            + "<button class='head-btn'><i class='fa fa-thumb-tack' aria-hidden='true'></i></button>"
            + "<button class='head-btn'><i class='fa fa-times' aria-hidden='true'></i></button>"
            + "</div ></div ></div > ");

        $("#" + this.parent_div).append("<div class='col-md-2 no-padd pg' id='" + this.pGrid + "'>"
            + "<div class='min-btn'>"
            + "<button class='btn-tb-com' onclick=pgBoxMin(); id='pg-min'><i class='fa fa-caret-right fa-lg'></i></button></div></div>");
    };

    fdBoxMin = function () {       
        $(this.sidediv).toggleClass("toggled");
          if ($(this.sidediv).hasClass("toggled")) {               
              //$(this.contBox).removeClass('col-md-8').addClass('col-md-10');
              $('#fd-min-btn').css('margin-right', '-25px').addClass("rotated");
           }
            else {
              //$(this.contBox).removeClass('col-md-10').addClass('col-md-8');
              $('#fd-min-btn').css('margin-right', '0').removeClass("rotated");
        }         
    };

    pgBoxMin = function () { 
        $(this.pGrid).toggleClass("pg-toggled");
        if ($(this.pGrid).hasClass("pg-toggled")) {
            $(this.contBox).removeClass('col-md-8').addClass('col-md-10');
            $('#pg-min').css('margin-left', '-19px').addClass("rotated");
            }
            else {
            $(this.contBox).removeClass('col-md-10').addClass('col-md-8');
                $('#pg-min').css('margin-left', '0').removeClass("rotated");
        }       
    };

    this.createContentWindow = function (id, type, prev) {// style='height:inherit;'
        if ($('.splitdiv_parent').hasClass("slick-slider")) {
            //$('.splitdiv_parent').slick('unslick');
            if (prev === undefined) {
                $('.splitdiv_parent').slick('slickAdd', `<div class='sub-windows' id='sub_window_dv${id}' tabindex= '1' eb-type="${type}">
                    <div class='split-inner'>
                    <div id="filterDisplay_dv${id}" class="filter-display"></div>
                    <div class='wrapper-cont' id='content_dv${id}' style='height:inherit;padding: 0;padding-right: 1px;'></div>
                    </div>
           </div>`);
            }
            else
                $("#" + prev).after(`<div class='sub-windows' id='sub_window_dv${id}' tabindex= '1' eb-type="${type}">
                    <div class='split-inner'>
                    <div id="filterDisplay_dv${id}" class="filter-display"></div>
                    <div class='wrapper-cont' id='content_dv${id}' style='height:inherit;padding: 0;padding-right: 1px;'></div>
                    </div>
           </div>`);
        }
        else {
            $('#'+this.parent_div).append( `<div class='sub-windows' id='sub_window_dv${id}' tabindex= '1' eb-type="${type}">
                    <div class='split-inner'>
                    <div id="filterDisplay_dv${id}" class="filter-display"></div>
                    <div class='wrapper-cont' id='content_dv${id}' style='height:inherit;padding: 0;padding-right: 1px;'></div>
                    </div>
           </div>`);
        }

        
        $('#sub_window_dv' + id).focusin(this.windowOnFocus.bind(this));
    };
    this.windowOnFocus = function () {
        
    };
    this.init = function () {
        $('#new').on('click', this.createContentWindow.bind(this));
    };
    this.init();
};