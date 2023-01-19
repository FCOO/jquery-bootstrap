/****************************************************************************
	jquery-bootstrap-button.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    var bsButtonClass = 'btn-jb';  //MUST correspond with $btn-style-name in src/_variables.scss

    /**********************************************************
    bsButton( options ) - create a Bootstrap-button
    Is also used to create list-items for select-lists
    **********************************************************/
    $.bsButton = function( options = {} ){
        var optionToClassName = {
                useStandardColor    : 'standard',
                primary             : 'primary',
                transparent         : 'transparent',
                transparentOnDark   : 'transparent-on-dark',
                semiTransparent     : 'semi-transparent',
                square              : 'square',
                bigSquare           : 'square big-square',
                bigIcon             : 'big-icon',
                extraLargeIcon      : 'extra-large-icon',
                selected            : 'selected',
                noBorder            : 'no-border',
                focus               : 'init_focus',
                truncate            : 'text-truncate',
                fullWidth           : 'w-100'
            };

        //Use standard color if not primary or transparent (any kind)
        if (options.useStandardColor === undefined){
            options.useStandardColor = true;
            ['primary'/*, 'transparent', 'transparentOnDark', 'semiTransparent'*/].forEach( function(id){
                if (options[id])
                    options.useStandardColor = false;
            });
        }

        //Add class-name corresponding to options
        var newClass = [options.class || ''];

        if (options._class)
            newClass.push(options._class);

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

        //Special case for empty button
        if (!options.icon && !options.text)
            options.icon = 'fa';

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
    with 'blue' background when selected and individuel icons
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
                options.icon[0]+ ' icon-hide-for-selected',
                options.icon[1]+ ' icon-show-for-selected'
            ]];
            options.modernizr = true;
        }
        if ($.isArray(options.text)){
            options.textClassName = ['hide-for-selected', 'show-for-selected'];
            options.modernizr = true;
        }
        return $.bsButton( options ).checkbox( $.extend(options, {className: 'selected'}) );
    };


    /**********************************************************
    bsStandardCheckboxButton( options ) - create a standard
    Bootstrap-button as a checkbox with check-icon in blue box
    **********************************************************/
    $.bsStandardCheckboxButton = function( options = {}){
        //Clone options to avoid reflux
        options = $.extend({}, options, {
            class    : 'allow-zero-selected' + (options.class ? ' '+options.class : ''),
            modernizr: true,
        });


        var icon = [
                ((options.type == 'radio') || options.isRadio || options.radio) ?
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

        if (options.semiSelected)
            options.selected = true;

        options.class = options.class + ' standard-checkbox';
        options.className_semi = 'semi-selected';

        //Bug fix: To avoid bsButton to add class 'active', selected is set to false in options for bsButton
        var bsButtonOptions = $.extend({}, options);
        bsButtonOptions.selected = false;
        var $result = $.bsButton( bsButtonOptions ).checkbox( $.extend(options, {className: 'checked'}) );

//        var $result = $.bsButton( bsButtonOptions ).checkbox( options );

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
    bsBigIconButton( options ) - create a big button with a large icon to the left
    and text and sub-text to the right
    options:
        icon   : STRING
        text   : STRING or {LANG: STRING}
        subtext: {LANG: STRING} or []{LANG: STRING}|STRING
        subtextSeparator: STRING - use to join subtext if it is an array
        big    : BOOLEAN
        bold   : BOOLEAN
    **********************************************************/
    $._bsBigIconButtonContent = function( options ){
        var big = !!options.big,
            separator = options.subtextSeparator || '',
            content = [],
            subtext;

        if (options.icon)
            content.push(
                $('<div/>')
                    ._bsAddHtml({icon: options.icon})
                    .addClass((big ? 'fa-2x' : '') + ' align-self-center flex-shrink-0 text-center')
                    .width('1.75em')
            );

        //Create subtext. It can be an array of STRING or {LANG: STRING}
        if (options.subtext){
            var subtextArray = $.isArray(options.subtext) ? options.subtext : [options.subtext];
            subtext = {};

            $.each( subtextArray, function(index, next_subtext){
                $.each($._bsAdjustText( next_subtext ), function(lang, text){
                    subtext[lang] = subtext[lang] || '';
                    if (subtext[lang] && text)
                        subtext[lang] += separator;
                    subtext[lang] += text;
                });
            });
        }

        content.push(
            $('<div/>')
                .addClass('flex-grow-1 no-margin-children d-flex flex-column justify-content-center')
                .css('min-height', options.minHeight ? options.minHeight : big ? '3em' : '2em')
                ._bsAddHtml([
                    {text: options.text,  textClass: 'text-center' + (options.bold ? ' fw-bold' : '') + (big ? ' font-size-larger' : '' )},
                    options.subtext ? {text: subtext, textClass: 'text-center text-wrap '             + (big ? '' : ' font-size-smaller')} : null
                ])
        );

        return content;
    };


    $.bsBigIconButton = function( options ){
        return $.bsButton({
            id          : options.id,
            class       : 'w-100 d-flex',
            content     : $._bsBigIconButtonContent( options ),
            allowContent: true,
            radioGroup  : options.radioGroup,
            onClick     : options.onClick,
        });

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
            case 'bigiconbutton'         : constructor = $.bsBigIconButton; break;
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
                fullWidthClass        : 'btn-group-full-width',
                centerInParentClass   : 'btn-group-center-in-parent',
                verticalClassPostfix  : '-vertical',
                horizontalClassPostfix: '',
                center                : !options.vertical, //Default: center on horizontal and left on vertical
                useTouchSize          : true,
                attr                  : { role: 'group' },
                inclHeader            : options.vertical,   //Default: Include headers (= items without onClick)
                buttonOptions         : {
                    onClick         : options.onClick,
                    returnFromClick : options.returnFromClick,
                    _class          : 'text-truncate'
                }
            });

        options.baseClassPostfix = options.vertical ? options.verticalClassPostfix : options.horizontalClassPostfix;

        var result = options.container || options.$container || $('<'+ options.tagName + '/>');
        result
            ._bsAddIdAndName( options )
            ._bsAddBaseClassAndSize( options );

        //Transfere generel button-options to buttonOptions
        $.each(['square', 'bigSquare', 'bigIcon', 'extraLargeIcon'], function(index, id){
            if ((options[id] !== undefined) && (options.buttonOptions[id] === undefined))
                options.buttonOptions[id] = options[id];
        });


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

        if (options.fullWidthClass && options.fullWidth)
            result.addClass(options.fullWidthClass);

        if (options.centerInParentClass && options.centerInParent)
            result.addClass(options.centerInParentClass);


        if (options.border)
            result.addClass('btn-group-border');

        if (options.noRoundBorder)
            result.addClass('btn-group-no-round-border');

        if (options.attr)
            result.attr( options.attr );

        var $previousButton = null,
            spaceAfter     = false;
        $.each( options.list, function(index, buttonOptions ){

           if ((buttonOptions.spaceBefore || buttonOptions.lineBefore || spaceAfter) && $previousButton){
                $previousButton.addClass('space-after');
            }

            spaceAfter      = buttonOptions.spaceAfter || buttonOptions.lineAfter;
            $previousButton = null;

            if (buttonOptions.id || buttonOptions.onClick  || buttonOptions.onChange)
                $previousButton =
                    $._anyBsButton( $.extend(true, {}, options.buttonOptions, buttonOptions ) )
                        .appendTo( result );
            else
                if (options.inclHeader)
                    //Create content as header
                    $('<div/>')
                        .addClass('btn header-content')
                        .toggleClass('header-main', !!buttonOptions.mainHeader)

                        .addClass( buttonOptions.class )
                        ._bsHeaderAndIcons( {header: buttonOptions} )
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
        options.items = options.items || options.list;
        options.list = options.list || options.items;

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
                        className        : 'selected',
                        className_semi   : 'semi-selected',
                        allowZeroSelected: false,
                    })
                );


        options =
            $._bsAdjustOptions( options, {}, {
                useTouchSize: true,
                addOnClick: false,
            });

        options.buttonOptions = options.buttonOptions || {};
        options.buttonOptions.radioGroup = radioGroup;
        options.buttonOptions.type = options.buttonType;

        var result = $.bsButtonGroup( options );
        result.data('radioGroup', radioGroup );
        return result;
    };


    /**********************************************************
    bsButtonBar( options ) - create a horizontal group of buttons
    options:
        inclHeader : false. If true buttons without id or onClick are included
        justify    : "start", "end", "center", "between", "around", or "evenly"
        buttons    : as bsButtonGroup
    **********************************************************/
    $.bsButtonBar = function( options ){
        options =
            $._bsAdjustOptions( options, {
                fullWidthClass  : 'w-100',
                fullWidth       : true,
                class           : 'm-0 p-0 d-flex flex-row flex-nowrap justify-content-'+(options.justify || options.align || 'center'),
            }, {
                baseClass   : 'btn-bar',
                vertical    : false,
                center      : true,
                useTouchSize: true,
                buttonOptions: {
                    _class: 'flex-shrink-1 text-truncate'
                }
            } );

        var result = $.bsButtonGroup( options );

        return result;
    };




}(jQuery, this, document));