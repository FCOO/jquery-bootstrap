/****************************************************************************
	jquery-bootstrap-button.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    var bsButtonClass = 'btn-standard';  //MUST correspond with $btn-style-name in src/_variables.scss

    /**********************************************************
    bsButton( options ) - create a Bootstrap-button
    Is also used to create list-items for select-lists
    **********************************************************/
    $.bsButton = function( options ){
        var optionToClassName = {
                primary        : 'primary',
                transparent    : 'transparent',
                semiTransparent: 'semi-transparent',
                square         : 'square',
                bigIcon        : 'big-icon',
                extraLargeIcon : 'extra-large-icon',
                selected       : 'active',
                focus          : 'init_focus'
            };


        options = options || {};
        options =
            $._bsAdjustOptions( options, {
                tagName         : 'a', //Using <a> instead of <button> to be able to control font-family
                baseClass       : 'btn',
                styleClass      : bsButtonClass,
                class           : function( opt ){
                                      var result = [opt.class || ''];
                                      $.each( optionToClassName, function( id, className ){
                                          if (opt[id] && (!$.isFunction(opt[id]) || opt[id]()))
                                              result.push(className);
                                      });
                                     return result.join(' ');
                                  } (options),
                useTouchSize    : true,
                addOnClick      : true,
                returnFromClick : false
            });

        var result = $('<'+ options.tagName + ' tabindex="0"/>');

        if (options.tagName == 'a'){
            if (options.link)
                result
                    .i18n($._bsAdjustText(options.link), 'href')
                    .prop('target', '_blank');
            else
                //Adding href that don't scroll to top to allow anchor to get focus
                result.prop('href', 'javascript:undefined');
        }

        result._bsAddBaseClassAndSize( options );
        if (!options.radioGroup)
            result._bsAddIdAndName( options );

        if (options.attr)
            result.attr( options.attr );

        if (options.prop)
            result.prop( options.prop );

        result.data('bsButton_options', options );

        if (options.addOnClick && options.onClick)
            result.on('click', $.proxy( result._bsButtonOnClick, result ) );

        result._bsAddHtml( options, false, true );

        if (options.radioGroup)
            options.radioGroup.addElement( result, options );

        return result;
    };

    /**********************************************************
    bsLinkButton( options ) - create a Bootstrap-button as a link
    **********************************************************/
    $.bsLinkButton = function( options ){
        return $.bsButton( $.extend({}, options, { styleClass: 'btn-link'}) );
    };

    /**********************************************************
    bsCheckboxButton( options ) - create a Bootstrap-button as a checkbox
    with 'blue' background when selected (active) and individuel icons
    options:
        icon: string or array[0-1] of string
        text: string or array[0-1] of string
    If icon and/or text is array[0-1] the first value is used when en button is unselected
    and the second when the button is selected.
    E.g. text: ['Unselected', 'Selected']
    **********************************************************/
    $.bsCheckboxButton = function( options ){
        //Clone options to avoid reflux
        options = $.extend({}, options);

        options.class = 'allow-zero-selected';

        //Use modernizr-mode and classes if icon and/or text containe two values
        if ($.isArray(options.icon) && (options.icon.length == 2)){
            options.icon = [[
                options.icon[0]+ ' icon-hide-for-active',
                options.icon[1]+ ' icon-show-for-active'
            ]];
            options.modernizr = true;
        }
        if ($.isArray(options.text)){
            options.textClassName = ['hide-for-active', 'show-for-active'];
            options.modernizr = true;
        }
        return $.bsButton( options ).checkbox( $.extend(options, {className: 'active'}) );
    };


    /**********************************************************
    bsStandardCheckboxButton( options ) - create a standard
    Bootstrap-button as a checkbox with check-icon in blue box
    **********************************************************/
    $.bsStandardCheckboxButton = function( options ){
        //Clone options to avoid reflux
        options = $.extend({}, options, {
            class    : 'allow-zero-selected',
            modernizr: true,
            icon: [[
                'fas fa-square text-checked      icon-show-for-checked', //"Blue" background
                'far fa-check-square text-white  icon-show-for-checked', //Check marker
                'far fa-square'                                          //Border
            ]]
        });
        return $.bsButton( options ).checkbox( $.extend(options, {className: 'checked'}) );
    };

    /**********************************************************
    bsButtonGroup( options ) - create a Bootstrap-buttonGroup
    **********************************************************/
    $.bsButtonGroup = function( options ){
        options =
            $._bsAdjustOptions( options, {
                tagName               : 'div',
                baseClass             : 'btn-group',
                leftClass             : 'btn-group-left', //Class for group when content is left-align
                centerClass           : '', //Class for group when content is center-align
                verticalClassPostfix  : '-vertical',
                horizontalClassPostfix: '',
                center                : !options.vertical, //Default: center on horizontal and left on vertical
                useTouchSize          : true,
                attr                  : { role: 'group' },
                buttonOptions         : {
                    onClick        : options.onClick,
                    returnFromClick: options.returnFromClick
                }
            });

        options.baseClassPostfix = options.vertical ? options.verticalClassPostfix : options.horizontalClassPostfix;
        var result = $('<'+ options.tagName + '/>')
                        ._bsAddIdAndName( options )
                        ._bsAddBaseClassAndSize( options );

        if (options.center)
            result.addClass( options.centerClass );
        else
            result.addClass( options.leftClass );

        if (options.verticalClassPostfix && options.vertical)
            result.addClass(options.baseClass + options.verticalClassPostfix );

        if (options.horizontalClassPostfix && !options.vertical)
            result.addClass(options.baseClass + options.horizontalClassPostfix );

        if (options.allowZeroSelected)
            result.addClass( 'allow-zero-selected' );

        if (options.fullWidth)
            result.addClass('btn-group-full-width');

        if (options.border)
            result.addClass('btn-group-border');

        if (options.attr)
            result.attr( options.attr );

        $.each( options.list, function(index, buttonOptions ){
            if (buttonOptions.id)
                $.bsButton( $.extend({}, options.buttonOptions, buttonOptions ) )
                    .appendTo( result );
            else
                $('<div/>')
                    .addClass('btn-group-header')
                    .addClass( buttonOptions.class )
                    ._bsAddHtml( buttonOptions )
                    .appendTo( result );
        });
        return result;
    };

    /**********************************************************
    bsRadioButtonGroup( options ) - create a Bootstrap-buttonGroup
    options:
        id               : id for the group
        onChange         : function(id, selected, $buttonGroup)
	    allowZeroSelected: boolean. If true it is allowed to des-select a selected radio-button.
	                       If allowZeroSelected=true onChange will also be called on the un-selected radio-input
        buttons          : as bsButtonGroup

    **********************************************************/
    $.bsRadioButtonGroup = function( options ){
        //Set options for RadioGroup
        $.each( options.list, function(index, buttonOptions ){
            buttonOptions = $._bsAdjustOptions( buttonOptions );
            if (buttonOptions.id && buttonOptions.selected && (!$.isFunction(buttonOptions.selected) || buttonOptions.selected()) ) {
                options.selectedId = buttonOptions.id;
                return false;
            }
        });

        var radioGroup =
                $.radioGroup(
                    $.extend({}, options, {
                        radioGroupId     : options.id,
                        className        : 'active',
                        allowZeroSelected: false
                    })
                );

        options =
            $._bsAdjustOptions( options, {}, {
                useTouchSize: true,
                addOnClick: false,
                buttonOptions: {
                    radioGroup: radioGroup
                }
            } );

        var result = $.bsButtonGroup( options );

        result.data('radioGroup', radioGroup );

        return result;
    };


}(jQuery, this, document));