/****************************************************************************
	fcoo-bootstrap.js, 

	(c) 2017, FCOO

	https://github.com/FCOO/fcoo-bootstrap
	https://github.com/FCOO

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";
	
    /*
    


    */
    

    function baseClassAndSize( className, size ){
    }
    
    //Internal methods to add innerHTML to button or other element
    function addHtml( $element, options ){
        var html = '';
        if (options.icon)
            html = '<i class="fa ' + options.icon + '"></i>';
        if (options.text)
          html = html + (html ? ' ' : '') + options.text;
        $element.html( html );
        return $element;
    }

    /**********************************************************
    bsButton( options ) - create a Bootstrap-button
    **********************************************************/
    $.bsButton = function( options ){
        options.tagName = options.tagName || 'button';
        var result = $('<'+ options.tagName + '/>');
        result
            .addClass('btn btn-secondary' )
            .addClass('btn-' + (options.size || 'sm') );
        if (options.id)
            result.attr('id', options.id);
        if (options.color)
            result.addClass('color-'+ options.color);
        if (options.active || options.selected || options.checked)  
            result.addClass('active');
        if (options.class)
            result.addClass(options.class);

        if (options.onClick)
            result.on('click', $.proxy( options.onClick, options.context ) );

        addHtml( result, options );
        return result;
    }


    /**********************************************************
    bsButtonGroup( options ) - create a Bootstrap-buttonGroup
    **********************************************************/
    $.bsButtonGroup = function( options ){
        var result = $('<div/>');
        result
            .addClass('btn-group' + (options.vertical ? '-vertical' : ''))
            .addClass('btn-group-sm')
            .attr('role', 'group');
        for (var i=0; i<options.buttons.length; i++ )
            result.append( 
                $.bsButton( options.buttons[i] ) 
            );
        return result;
    }


    /**********************************************************
    bsRadioButtonGroup( options ) - create a Bootstrap-buttonGroup
    options:
        id               : id for hen group
        onChange         : function(id, selected, $buttonGroup)
	    allowZeroSelected: boolean. If true it is allowed to des-select a selected radio-button.
	                       If allowZeroSelected=true onChange will also be called on the un-selected radio-input
        buttons          : as bsButtonGroup
    **********************************************************/
    function onClickOnRadioButton( event ){
        var $button = $(event.currentTarget),
            buttonId = $button.attr('id'),
            wasSelected = $button.hasClass('active'),
            isSelected = !wasSelected,
            $groupDiv = $button.parent(),
            options = $groupDiv.data('radioOptions');

        if (options.allowZeroSelected || isSelected){
            $button.siblings().removeClass('active');          
            $button.toggleClass('active', isSelected);
    
            $.proxy( options.onChange, options.context)( buttonId, isSelected, $groupDiv );
        }            
   }; 

    $.bsRadioButtonGroup = function( options ){
        $.each( options.buttons, function( index, buttonOptions ){
            buttonOptions.onClick = onClickOnRadioButton;
        });
        options.onChange = options.onChange || function(){};
        var result = $.bsButtonGroup( options);
        result.data('radioOptions', options );

        return result;
    }


    /**********************************************************
    bsButtonPopover( options ) - create a Bootstrap-popover with buttons
    **********************************************************/
    $.fn.bsButtonPopover = function( options, isRadioButtons ){
        options.trigger = options.trigger || 'click';
        var result = this.popover({
                trigger  : options.trigger,
                toggle   : options.toggle || 'popover', 
                html     : true,
                container: 'body',
                placement: options.placement || options.vertical ? 'top' : 'right',
                template : '<div class="popover" role="tooltip"><div class="popover-arrow"></div><div class="popover-content popover-content-buttongroup"></div></div>',
                content  : isRadioButtons ? $.bsRadioButtonGroup( options ) : $.bsButtonGroup( options ),

        });
        if (options.trigger == 'click')
            this.on('blur', function(){
                $(this).popover('hide');
            });

        return result;
    }


    /**********************************************************
    bsRadioButtonPopover( options ) - create a Bootstrap-popover with radio-buttons
    **********************************************************/
    function radioButtonPopover_onChange( id, selected, $radioButtonGroup){
        var options = $radioButtonGroup.data('radioOptions');

        //Call original onChange function
        options._onChange( id, selected, $radioButtonGroup);

        if (options.syncHtml)
            //Update owner html to 
            updatePopoverOwner( options.$popoverOwner, $radioButtonGroup );
    }
    function updatePopoverOwner( $popoverOwner, $radioButtonGroup ){
        var $activeButton = $radioButtonGroup.find('.active');
        if ($activeButton.length)
            $popoverOwner.html( $activeButton.html() );
    }

    $.fn.bsRadioButtonPopover = function( options ){
        options = $.extend({}, options, {
            syncHtml     : true,
            callOnInit   : false,
            $popoverOwner: this,
            _onChange    : $.proxy( options.onChange, options.context)
        });
        if (options.syncHtml)
            //Create a temp radioButtonGroup to get selected id
            updatePopoverOwner( this, $.bsRadioButtonGroup( options ) );

        options.onChange = radioButtonPopover_onChange;
        return this.bsButtonPopover( options, true );
    }














/*
	function FcooBootstrap( $elem, options) {
		this.VERSION = "{VERSION}";
		this.options = $.extend({
			//Default options
		}, options || {} );


		//If FcooBootstrap is a extention of class "ParentClass" include the next line 
		//window.ParentClass.call(this, input, options, plugin_count );

	
	}
  
  // expose access to the constructor
  ns.FcooBootstrap = FcooBootstrap;


	//fcooBootstrap as jQuery prototype
	$.fn.fcooBootstrap = function (options) {
		return this.each(function() {
			if (!$.data(this, "fcooBootstrap"))
				$.data(this, "fcooBootstrap", new window.FcooBootstrap(this, options, plugin_count++));
		});
	};


	//Extend the prototype
	ns.FcooBootstrap.prototype = {

		//myMethod
		myMethod: function( arg1, arg2 ){
		},
		


	};

	//If FcooBootstrap is a extention of class "ParentClass" include the next line 
	//window.FcooBootstrap.prototype = $.extend( {}, window.ParentClass.prototype, window.FcooBootstrap.prototype );
*/

	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { 

	
	}); 
	//******************************************



}(jQuery, this, document));