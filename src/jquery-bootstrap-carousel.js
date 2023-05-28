/****************************************************************************
jquery-bootstrap-carousel.js
****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

/******************************************************************
bsCarousel( options )
options


    list: []{
        icon          : STRING
        text          : {da:STRING, en:STRING}
        subIcon       : STRING
        subText       : {da:STRING, en:STRING}
        url           : STRING
        onClick       : function(url, options)
        defaultOnClick: BOOLEAN                 //If true: As options.defaultOnClick
    }
    innerHeight     : INTEGER   //The height of the inner-container with the items
    fitHeight       : BOOLEAN   //If true and innerHeight is set: All images get max-height = innerHeight
    itemsMaxOwnSize : BOOLEAN   //If true, or innerHeight and fitHeight is set: Image size can be bigger that its original size

    itemOnClick     : function(url, options)
    defaultOnClick  : BOOLEAN   //If true and no itemOnClick or item.onClick: Click on image open a modal-window



    columns = [] of {
        vfFormat,
        vfOptions:  The content of a element can be set and updated using [jquery-value-format].
                    The options vfFormat and (optional) vfOptions defines witch format used to display the content

        align        :  'left','center','right'. Defalut = 'left'
        verticalAlign: 'top', 'middle','bottom'. Default = 'middle'
        noWrap       : false. If true the column will not be wrapped = fixed width
    }

    verticalBorder: [boolean] true. When true vertical borders are added together with default horizontal borders
    noBorder      : [boolean] true. When true no borders are visible

    align        : 'left','center','right'. Defalut = 'left' = default align for all columns
    verticalAlign: 'top', 'middle','bottom'. Default = 'middle' = default verticalAlign for all columns

<div id="..." class="carousel slide">
  <div class="carousel-indicators">
    <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
    <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="1" aria-label="Slide 2"></button>
    <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="2" aria-label="Slide 3"></button>
  </div>
  <div class="carousel-inner">





*******************************************************************/
    var bsCarouselId = 0;


    function defaultOnClick(url, options){
        $.bsModalFile(url, {header: options.text}).show();
    }

    function item_onClick(e){
        var $img = e && e.target ? $(e.target) : null;
        if (!$img) return false;

        var itemOptions = $img.data('bsc-item-options');

        if (itemOptions && itemOptions.onClick)
            itemOptions.onClick(itemOptions.url, itemOptions);
    }

    /**********************************************************
    bsCarousel( options ) - create a Bootstrap carousel
    **********************************************************/
    $.bsCarousel = function( options ){
        if (Array.isArray(options))
            options = {list: options};

        var id = options.id = options.id || 'bsCarousel_' + bsCarouselId++,
            multiItems = options.list.length > 1;
        this.options = options;

        var $result = $('<div data-bs-theme="dark"/>')
                .attr('id', id)
                .addClass('carousel carousel-dark slide')
                .toggleClass('items-max-own-size', !!(options.itemsMaxOwnSize || (options.innerHeight && options.fitHeight))),
            $indicators = $('<div/>')
                .addClass('carousel-indicators'),
            $inner = $('<div/>')
                .addClass('carousel-inner')
                .height(options.innerHeight)
                .appendTo($result);
        if (multiItems){
            $indicators.appendTo($result);

            $('<button class="carousel-control-prev" type="button" data-bs-target="#' + id + '" data-bs-slide="prev">')
                .append(
                    $('<span class="carousel-control-prev-icon" aria-hidden="true"></span>'),
                    $('<span class="visually-hidden">Previous</span>')
                )
                .appendTo($result);
            $('<button class="carousel-control-next" type="button" data-bs-target="#' + id + '" data-bs-slide="next">')
                .append(
                    $('<span class="carousel-control-next-icon" aria-hidden="true"></span>'),
                    $('<span class="visually-hidden">Next</span>')
                )
                .appendTo($result);
        }

        this.options.list.forEach( (item, index) => {
            var active = index == 0;

            item.index = index;

            if (multiItems)
                $('<button type="button" data-bs-target="#' + id + '" data-bs-slide-to="' + index + '"></button>')
                    .toggleClass('active', !!active)
                        .appendTo($indicators);

            var $item = $('<div/>')
                    .addClass('carousel-item')
                    .toggleClass('active', !!active)
                    .appendTo($inner),

                //The image
                $img = $('<img src="' + item.url + '"/>')
                    .addClass('d-block w-100')
                    .appendTo($item);
                if (options.innerHeight && options.fitHeight)
                    $img.css('max-height', options.innerHeight);

                //Find onClick (if any)
                item.onClick =
                    item.onClick ? item.onClick :
                    item.defaultOnClick ? defaultOnClick :
                    options.onClick ? options.onClick :
                    options.defaultOnClick ? defaultOnClick : null;
                if (item.onClick)
                    $img
                        .data('bsc-item-options', item)
                        .attr('role', 'button')
                        .on('click', item_onClick);



            //Caption
            if (item.icon || item.text || item.subIcon || item.subText){
                var $caption = $('<div />')
                        .addClass('carousel-caption _d-none')
                        .addClass('_d-md-block')     //<= set when the capition is visible. MANGLER skal justeres!!!
                        .appendTo($item);

                var $innerCation = $('<div/>')
                        .addClass('carousel-caption-inner w-100 d-flex flex-column align-items-center')
                        .appendTo($caption);



                    if (item.icon || item.text)
                        $('<div/>')
                            .addClass( $._bsGetSizeClass( {baseClass: 'caption', useTouchSize: true}) )
                            ._bsAddHtml({icon: item.icon, text: item.text})
                            .appendTo($innerCation);

                    if (item.subIcon || item.subText)
                        $('<div/>')
                            .addClass( $._bsGetSizeClass( {baseClass: 'caption', useTouchSize: true, small: true}) )
                            ._bsAddHtml({icon: item.subIcon, text: item.subText})
                            .appendTo($innerCation);
            }
        });

        return $result;
    };
}(jQuery, this, document));