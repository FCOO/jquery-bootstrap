/****************************************************************************
	jquery-bootstrap-popover.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";

    /**********************************************************
    BLUR ISSUES ON SAFARI
    Due to an intended design in Safari a element only lose focus
    if another element get focus. Thatr means that onBlur isn't fired
    if the user tap or click on the body
    This is in oppersition to all other browser
    Therefore a fix is created
    **********************************************************/
    var popoverClassName = 'davs';

	$(function() { 
        var $body = $('body');

//	    $body.on("touchstart", function( event ){
	    $body.on("mousedown", function( event ){
			$('.'+popoverClassName).each(function () {
                var $this = $(this);
				// hide any open popover when the anywhere else in the body is clicked
				if (!$this.is(event.target) && $this.has(event.target).length === 0 && $('.popover').has(event.target).length === 0) {
//console.log('close', $this);
					$this.popover('hide');
				}
			});
		});
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
        header      : {icon, text, link, title} or [] of {icon, text, link, title}
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
            $header;

        //Add header (if any)
        if (options.header){
            $header =
                $('<div/>')
                    .addClass('popover-header-content')
                    ._bsAddHtml( options.header );

            if (options.close)
                $header
                    .append(
                        $('<i class="fa modal-close"/>')
                            .on('click', function(){
                                $this.popover('hide');
                            })
                    );
        }

        var popoverOptions = {
                trigger  :  options.trigger || 'click', //or 'hover' or 'focus' ORIGINAL='click'
                //delay    : { show: 0, hide: 1000 },
                toggle   :  options.toggle || 'popover',
                html     :  true,
                placement:  options.placement || (options.vertical ? 'top' : 'right'),
                container:  'body',
                template :  '<div class="popover ' + (options.small ? ' popover-sm' : '') + '" role="tooltip">'+
                                '<div class="popover-header"></div>' +
                                '<div class="popover-body"></div>' +
                                '<div class="popover-footer"></div>' +
                                '<div class="arrow"></div>' +
                            '</div>',

                title    : $header,
                content  : options.content,
                footer   : options.footer ? $('<div/>')._bsAddHtml( options.footer ) : ''
            };
        if (options.delay)
            popoverOptions.delay = options.delay;

        return this.each(function() {
            var $this = $(this);

            $this.addClass( popoverClassName );

//TEST            if (popoverOptions.trigger == 'click')
//TEST                $this.on('blur', popover_onBlur );

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

    function popover_onBlur(e){
        //If the focus is shifted to a element inside the popover => shift focus back to the element ELSE hide the popover
        if ( this.skipNextBlur || ( !!this._$popover_element &&
                                    !!e.relatedTarget &&
                                    $.contains( this._$popover_element[0], e.relatedTarget )
                                  )
            )
            this.focus();
        else
            $(this).popover('hide');
        this.skipNextBlur = false;
    }

    function popover_onShow(){
    }

    function popover_onShown(){
        //Find the popover-element. It has id == aria-describedby
        var $this = $(this),
            _this = this,
            popoverId = $this.attr('aria-describedby'),
            options = $this.data('popover_options');

        this._$popover_element = popoverId ? $('#' + popoverId) : null;
        if (this._$popover_element){

            //Translate content
            this._$popover_element.localize();

            //Prevent mousedown on header to close popover
            this._$popover_element.on('mousedown.bs.popover', function(){
                _this.skipNextBlur = true;
            });

            //Close the popup when anything is clicked
            if (options.closeOnClick){
                this._$popover_element.on('click.bs.popover', function(){
                    $this.popover('hide');
                });
            }
        }
    }

    function popover_onHide(){
        if (this._$popover_element)
            this._$popover_element.off('click.bs.popover mousedown.bs.popover');
    }

    function popover_onHidden(){
        //Reset this._$popover_element
        this._$popover_element = null;
    }




    /**********************************************************
    bsButtonGroupPopover( options ) - create a Bootstrap-popover with buttons
    **********************************************************/
    $.fn.bsButtonGroupPopover = function( options, isSelectList ){
        return this.bsPopover(  $.extend( options, {
                        content:  isSelectList ? $.bsSelectList( options ) : $.bsButtonGroup( options )
                    })
        );
    };


    /**********************************************************
    bsRadioButtonPopover( options ) - create a Bootstrap-popover with radio-buttons
    **********************************************************/
    $.fn.bsSelectListPopover = function( options ){
        return this.bsButtonGroupPopover( $.extend({}, options, {
                        postOnChange : $.proxy( selectListPopover_postOnChange, this ),
                        postCreate   : $.proxy( selectListPopover_postCreate, this ),
                    }),
                    true
        );
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




	/******************************************
	Initialize/ready
	*******************************************/
	$(function() {


	});
	//******************************************



}(jQuery, this, document));