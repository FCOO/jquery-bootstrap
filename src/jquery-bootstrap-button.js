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
    $.bsButton = function( options = {} ){
        var optionToClassName = {
                primary             : 'primary',
                transparent         : 'transparent',
                transparentOnDark   : 'transparent-on-dark',
                semiTransparent     : 'semi-transparent',
                square              : 'square',
                bigSquare           : 'square big-square',
                bigIcon             : 'big-icon',
                extraLargeIcon      : 'extra-large-icon',
                selected            : 'active',
                noBorder            : 'no-border',
                noShadow            : 'no-shadow',
                focus               : 'init_focus'
            };

        //Add class-name corresponding to options
        var newClass = [options.class || ''];
        $.each( optionToClassName, function( id, className ){
            if (options[id] && (!$.isFunction(options[id]) || options[id]()))
                newClass.push(className);
        });
        options.class = newClass.join(' ');

        options =
            $._bsAdjustOptions( options, {
                tagName         : 'a', //Using <a> instead of <button> to be able to control font-family
                baseClass       : 'btn',
                styleClass      : bsButtonClass,
                useTouchSize    : true,
                addOnClick      : true,
                returnFromClick : false
            });

        var result = $('<'+ options.tagName + ' tabindex="0"/>');

        //title are added to the button instead of only to the <span> with the text
        if (options.title){
            result.i18n(options.title, 'title');
            options.title = null;
        }

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

        result._bsAddHtml( options, false, true, options.allowContent );

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

        if (options.semiSelected)
            options.selected = true;

        options.class = 'allow-zero-selected' + (options.class ? ' '+options.class : '');
        options.className_semi = 'semi-selected';

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
    $.bsStandardCheckboxButton = function( options = {}){
        var icon = [
                options.type == 'radio' ?
                    //Radio-button icons
                    [
                        'fas fa-circle standard-checkbox-checked-color icon-show-for-checked',              //"Blue"/"Semi-selected-orange" background
                        $.FONTAWESOME_PREFIX_STANDARD + ' fa-dot-circle text-white icon-show-for-checked',  //Dot marker
                        $.FONTAWESOME_PREFIX_STANDARD + ' fa-circle'                                        //Border
                    ] :
                    //Checkbox-button icons
                    [
                        'fas fa-square standard-checkbox-checked-color icon-show-for-checked',                //"Blue"/"Semi-selected-orange" background
                        $.FONTAWESOME_PREFIX_STANDARD + ' fa-check-square text-white  icon-show-for-checked', //Check marker
                        $.FONTAWESOME_PREFIX_STANDARD + ' fa-square'                                          //Border
                    ]
            ];

        if (options.icon)
            icon.push(options.icon);

        options.icon = options.forceIcon || icon;

        //Clone options to avoid reflux
        options = $.extend({}, options, {
            class    : 'allow-zero-selected' + (options.class ? ' '+options.class : ''),
            modernizr: true,
        });

        if (options.semiSelected)
            options.selected = true;

        options.class = options.class + ' standard-checkbox';
        options.className_semi = 'semi-selected';

        //Bug fix: To avoid bsButton to add class 'active', selected is set to false in options for bsButton
        var bsButtonOptions = $.extend({}, options);
        bsButtonOptions.selected = false;
        var $result = $.bsButton( bsButtonOptions ).checkbox( $.extend(options, {className: 'checked'}) );

        return $result;
    };

    /**********************************************************
    bsIconCheckboxButton( options ) - create a square
    Bootstrap-button as a checkbox with two given icons for
    checked and no-checked. No blue color
    icon = ["ICONS WHEN UNSELECTED", "ICONS WHEN SELECTED", "ICONS ALWAYS SHOWN (optional)"]
    **********************************************************/
    $.bsIconCheckboxButton = function( options ){
        var icon = [
                options.icon[0] + ' icon-hide-for-checked',
                options.icon[1] + ' icon-show-for-checked'
            ];
        if (options.icon.length > 2)
            icon.push( options.icon[2] );

        return $.bsStandardCheckboxButton( $.extend({}, options, {square: true, forceIcon: [icon]}) );
    };




    /**********************************************************
    _anyBsButton( options )
    Create a specific variant of bs-buttons based on options.type
    **********************************************************/
    $._anyBsButton = function( options ){
        var type = options.type || 'button',
            constructor;

        switch (type.toLowerCase()){
            case 'button'                : constructor = $.bsButton; break;
            case 'checkboxbutton'        : constructor = $.bsCheckboxButton; break;
            case 'standardcheckboxbutton': constructor = $.bsStandardCheckboxButton; break;
            case 'iconcheckboxbutton'    : constructor = $.bsIconCheckboxButton; break;
            default                      : constructor = $.bsButton;
        }
        return constructor(options);
    },


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

        if (options.centerInParent)
            result.addClass('btn-group-center-in-parent');


        if (options.border)
            result.addClass('btn-group-border');

        if (options.attr)
            result.attr( options.attr );

        $.each( options.list, function(index, buttonOptions ){
            if (buttonOptions.id)
                $._anyBsButton( $.extend({}, options.buttonOptions, buttonOptions ) )
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