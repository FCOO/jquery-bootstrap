/****************************************************************************
	jquery-bootstrap-popover.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window/*, document, undefined*/) {
	"use strict";

    /**********************************************************
    To sequre that all popovers are closed when the user click or
    tap outside the popover the following event are added
    **********************************************************/
    var popoverClassName        = 'has-popover',
        popoverCloseOnClick     = 'popover-close-on-click',
        no_popoverCloseOnClick  = 'no-' + popoverCloseOnClick;


    $.bsPopover_closeAll = function( checkFunc ){
        $('.'+popoverClassName).each(function () {
            var $this = $(this);
            if (!checkFunc || checkFunc($this))
                $this.popover('hide');
        });
    };


    $('body')
        .on("touchstart.jbs.popover mousedown.jbs.popover", function( event ){
            $.bsPopover_closeAll( function( $this ){

                // hide any open popover when the click is not inside the body of a popover
                return (!$this.is(event.target) && (!$this.has(event.target) || $this.has(event.target).length === 0) && (!$('.popover').has(event.target) || $('.popover').has(event.target).length === 0));
            });
        })
        //Close all popover on esc
		.on('keydown', function( event ){
            if (event.altKey || event.ctrlKey || event.metaKey)
                return;
            if (event.keyCode === 27)
                $.bsPopover_closeAll();
        });


    /***********************************************************
	Extend the $.fn.popover.Constructor.prototype.setContent to
    also construct footer
	***********************************************************/
    var Selector = {
        FOOTER: '.popover-footer'
    };

    $.fn.popover.Constructor.prototype.setContent = function (setContent) {
		return function () {

            //Add footer content
            var $tip = $(this.getTipElement());
            this.setElementContent($tip.find(Selector.FOOTER), this.config.footer);

            //Original function/method
            setContent.apply(this, arguments);
		};
	} ($.fn.popover.Constructor.prototype.setContent);


    /**********************************************************
    bsPopover( options ) - create a Bootstrap-popover
    options
        header      : See jquery-bootstrap-header.js
        close       : [Boolean] - show close cross in header
        trigger     : [String] 'click'	How popover is triggered - click | hover | focus | manual
        vertical    : [Boolean]
        closeOnClick: [Boolean] false - if true the popover will close when it is clicked
        placement   : [String] "top", "bottom", "left", "right". Default = 'right' for vertical: false and 'top' for vertical:true
        content     : The content (function, DOM-element, jQuery-object)
        footer      : {icon, text, link, title} or [] of {icon, text, link, title}
    **********************************************************/
    $.fn.bsPopover = function( options ){
        options = $._bsAdjustOptions( options );

        var $this = $(this),
            $header = '',
            $footer = '';

        //Add header (if any)
        if (options.header || options.close){
            options.icons = options.icons || {};
            options.headerClassName = 'popover-header-content';
            if (options.close)
                options.icons.close = {
                    onClick: function(){ $this.popover('hide'); }
                };

            $header =
                $('<div/>')
                    .addClass( no_popoverCloseOnClick )
                    ._bsHeaderAndIcons( options );
        }

        if (options.footer)
            $footer =
                $('<div/>')
                    .addClass( 'w-100 ' + no_popoverCloseOnClick )
                    ._bsAddHtml( options.footer );

        //If trigger == 'context' or 'contextmenu' use 'manual' and add event
        if ((options.trigger == 'context') || (options.trigger == 'contextmenu')){
            options.trigger = 'manual';
            this.on('contextmenu.jbs.popover', function(){
                $this.popover('show');
                return false;
            });
        }

        var popoverOptions = {
                trigger  :  options.trigger || 'click', //or 'hover' or 'focus' ORIGINAL='click'
                toggle   :  options.toggle || 'popover',
                html     :  true,
                placement:  options.placement || (options.vertical ? 'top' : 'right'),
                container:  'body',
                template :  '<div class="popover ' + (options.small ? ' popover-sm' : '') + ' ' + (options.closeOnClick ? popoverCloseOnClick : no_popoverCloseOnClick) + '" role="tooltip">'+
                                '<div class="popover-header"></div>' +
                                '<div class="popover-body"></div>' +
                                '<div class="popover-footer"></div>' +
                                '<div class="arrow"></div>' +
                            '</div>',

                title    : $header,
                content  : options.content,
                footer   : $footer
            };
        if (options.delay)
            popoverOptions.delay = options.delay;

        return this.each(function() {
            var $this = $(this);

            $this.addClass( popoverClassName );

            //This event fires immediately when the show instance method is called.
            $this.on('show.bs.popover', popover_onShow );

            //This event is fired when the popover has been made visible to the user (will wait for CSS transitions to complete).
            $this.on('shown.bs.popover', popover_onShown );

            //This event is fired immediately when the hide instance method has been called.
            $this.on('hide.bs.popover', popover_onHide );

            //This event is fired when the popover has finished being hidden from the user (will wait for CSS transitions to complete).
            $this.on('hidden.bs.popover', popover_onHidden );

            $this.data('popover_options', options);
            $this.popover( popoverOptions );

            if (options.postCreate)
              options.postCreate( options.content );

        });
    };

    function popover_onShow(){
        //If popover is opened by hover => close all other popover
        var $this = $(this),
            thisPopoverId = $this.attr('aria-describedby');

        if ($this.data('popover_options').trigger == 'hover')
            $.bsPopover_closeAll( function( $this2 ){
                return $this2.attr('aria-describedby') != thisPopoverId;
            });
    }

    function popover_onShown(){
        //Find the popover-element. It has id == aria-describedby
        var $this = $(this),
            popoverId = $this.attr('aria-describedby'),
            options = $this.data('popover_options'),
            popover = $this.data('bs.popover');

        this._$popover_element = popoverId ? $('#' + popoverId) : null;
        if (this._$popover_element){

            //Translate content
            this._$popover_element.localize();

            //On click: Check if the popover needs to close.
            this._$popover_element.on('click.jbs.popover', function(event){
                //Find first element with class 'popover-close-on-click' or 'no-popover-close-on-click'
                var $elem = $(event.target);
                while ($elem.length){
                    if ($elem.hasClass(popoverCloseOnClick)){
                        $this.popover('hide');
                        break;
                    }
                    if ($elem.hasClass(no_popoverCloseOnClick))
                        break;
                    $elem = $elem.parent();
                }
            });

            //If the popover was opened by hover => prevent it from closing when hover the popover itself
            if (options.trigger == 'hover'){
                var _clearTimeout = function(){
                        //Stop the hide by timeout
                        if (popover._timeout){
                            window.clearTimeout(popover._timeout);
                            popover._timeout = 0;
                        }
                    };

                $this.on('mouseenter.jbs.popover', _clearTimeout );

                this._$popover_element.on('mouseenter.jbs.popover', _clearTimeout );

                this._$popover_element.on('mouseleave.jbs.popover', function(){
                    //If not delay is given => close popover
                    if (!popover.config.delay || !popover.config.delay.hide) {
                        popover.hide();
                        return;
                    }

                    //Else: Set timeout to close popover
                    popover._timeout = window.setTimeout(
                        function(){ popover.hide(); },
                        popover.config.delay.hide
                    );
                });
            }
        }
    }

    function popover_onHide(){
        $(this).off('mouseenter.jbs.popover');
        if (this._$popover_element)
            this._$popover_element.off('click.jbs.popover mousedown.jbs.popover mouseenter.jbs.popover mouseleave.jbs.popover');
    }

    function popover_onHidden(){
        //Reset this._$popover_element
        this._$popover_element = null;
    }


    //adjustItemOptionsForPopover - Adjust class-name for buttons/items in a popover
    function adjustItemOptionsForPopover(options, listId){
        var result = $.extend({}, options);
        $.each(options[listId], function(index, itemOptions){
            var closeOnClickClass = '';
            //If item has individuel clickOnClick => use it
            if ($.type(itemOptions.closeOnClick) == 'boolean')
                closeOnClickClass = itemOptions.closeOnClick ? popoverCloseOnClick : no_popoverCloseOnClick;
            else
                if (!itemOptions.id && !itemOptions.list)
                    closeOnClickClass = no_popoverCloseOnClick;

            itemOptions.class = itemOptions.class || '';
            itemOptions.class = (itemOptions.class ? itemOptions.class + ' ' : '') + closeOnClickClass;

            //Adjust child-list (if any)
            result[listId][index] = adjustItemOptionsForPopover(itemOptions, listId);
        });
        return result;
    }


    /**********************************************************
    bsButtonGroupPopover( options ) - create a Bootstrap-popover with buttons
    **********************************************************/
    $.fn.bsButtonGroupPopover = function( options, isSelectList ){

        //Setting bsButton.options.class based on bsPopover.options.closeOnClick
        if (!isSelectList){
            options = adjustItemOptionsForPopover(options, 'buttons');
            options.returnFromClick = true;
        }

        var $content = isSelectList ? $.bsSelectList( options ) : $.bsButtonGroup( options );
        if (isSelectList)
            this.data('popover_radiogroup', $content.data('selectlist_radiogroup') );

        return this.bsPopover( $.extend( options, { content:  $content }) );
    };


    /**********************************************************
    bsRadioButtonPopover( options ) - create a Bootstrap-popover with radio-buttons
    Default is closeOnClick = true
    **********************************************************/
    $.fn.bsSelectListPopover = function( options ){
        return this.bsButtonGroupPopover( $.extend(
                        { closeOnClick: true },
                        options,
                        {
                            postOnChange : $.proxy( selectListPopover_postOnChange, this ),
                            postCreate   : $.proxy( selectListPopover_postCreate, this ),
                        }), true );
    };

    function selectListPopover_postCreate( content ){
        //Update this with the selected items html
        $.proxy( selectListPopover_postOnChange, this )( content.children('.active') );
    }

    function selectListPopover_postOnChange( $item ){
        var options = this.data('popover_options');
        if ($item && $item.length && options && options.syncHtml)
            //Update owner html to be equal to $item
            this.html( $item.html() );
    }

    /**********************************************************
    bsMenuPopover( options ) - create a Bootstrap-popover with a bsMenu
    **********************************************************/
    $.fn.bsMenuPopover = function( options ){
        options = adjustItemOptionsForPopover(options, 'list');
        return this.bsPopover( $.extend(options, {content: $.bsMenu(options)}) );
    };




}(jQuery, this, document));