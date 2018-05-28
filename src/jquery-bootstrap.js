/****************************************************************************
	jquery-bootstrap.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window/*, document, undefined*/) {
	"use strict";

    /*

    Almost all elements comes in two sizes: normal and small set by options.small: ?lse/true

    In jquery-bootstrap.scss sizing class-postfix -xs is added (from Bootstrap 3)

    Elements to click or touch has a special implementation:
    For device with 'touch' the Bootstrap size 'normal' and 'small' are used
    For desktop (only mouse) we using smaller version (large = Bootstrap normal, normal = Bootstrap small, small = Bootstrap x-small)

    The variable window.bsIsTouch must be overwriten with the correct value in the application

    */

    //Create namespace
	var ns = window;

    ns.bsIsTouch =  true;

    $.EMPTY_TEXT = '___***EMPTY***___';

    //FONTAWESOME_PREFIX = the classname-prefix used when non is given. Fontawesome 4.X: 'fa', Fontawesome 5: Free: 'fas' Pro: 'far' or 'fal'
    $.FONTAWESOME_PREFIX = $.FONTAWESOME_PREFIX || 'fa';


    /******************************************************
    $divXXGroup
    ******************************************************/
    function $divXXGroup( groupTypeClass, options ){
        return $('<div/>')
                   ._bsAddBaseClassAndSize( $.extend({}, options, {
                       baseClass   : groupTypeClass,
                       useTouchSize: true
                   }));
    }



    //$._bsAdjustIconAndText: Adjust options to fit with {icon"...", text:{da:"", en:".."}
    // options == {da:"..", en:".."} => return {text: options}
    // options == array of ?? => array of $._bsAdjustIconAndText( ??? )
    // options == STRING           => return {text: options}

    $._bsAdjustIconAndText = function( options ){
        if (!options)
            return options;
        if ($.isArray( options )){
            var result = [];
            $.each( options, function(index, content){
                result.push( $._bsAdjustIconAndText(content) );
            });
            return result;
        }

        if ($.type( options ) == "object"){
            if (!options.icon && !options.text)
                return {text: options };
            else
                return options;
        }
        else
            //options == simple type (string, number etc.)
            return {text: options };

    };

    //$._bsAdjustOptions: Adjust options to allow text/name/title/header etc.
    $._bsAdjustOptions = function( options, defaultOptions, forceOptions ){
        //*********************************************************************
        //adjustContentOptions: Adjust options for the content of elements
        function adjustContentAndContextOptions( options, context ){
            options.icon     = options.icon || options.headerIcon || options.titleIcon;
            options.text     = options.text || options.header || options.title;

            options.iconClass = options.iconClass       || options.iconClassName       ||
                                options.headerIconClass || options.headerIconClassName ||
                                options.titleIconClass  || options.titleIconClassName;

            options.textClass = options.textClass   || options.textClassName   ||
                                options.headerClass || options.headerClassName ||
                                options.titleClass  || options.titleClassName;

            //If context is given => convert all function to proxy
            if (context)
                $.each( options, function( id, value ){
                    if ($.isFunction( value ))
                        options[id] = $.proxy( value, context );
                });

            return options;
        }
        //*********************************************************************

        options = $.extend( true, {}, defaultOptions || {}, options, forceOptions || {} );

        options.selected = options.selected || options.checked || options.active;
        options.list     = options.list     || options.buttons || options.items || options.children;

        options = adjustContentAndContextOptions( options, options.context );

        //Adjust options.content
        if (options.content){
            if ($.isArray( options.content ) )
                //Adjust each record in options.content
                for (var i=0; i<options.content.length; i++ )
                    options.content[i] = adjustContentAndContextOptions( options.content[i], options.context );
            else
                if ($.type( options.content ) == "object")
                    options.content = adjustContentAndContextOptions( options.content, options.context );
        }

        //Sert context = null to avoid "double" proxy
        options.context = null;

        return options;
    };


    /****************************************************************************************
    _bsGetSizeClass
    baseClass: "BASE" useTouchSize: false
        small: false => sizeClass = ''
        small: true  => sizeClass = "BASE-sm"

    baseClass: "BASE" useTouchSize: true
        small: false => sizeClass = 'BASE-sm'
        small: true  => sizeClass = "BASE-xs"
    ****************************************************************************************/
    $._bsGetSizeClass = function( options ){
        var sizeClassPostfix = '';

        if (options.useTouchSize){
            if (ns.bsIsTouch)
                sizeClassPostfix = options.small ? 'sm' : '';
            else
                sizeClassPostfix = options.small ? 'xs' : 'sm';
        }
        else
            sizeClassPostfix = options.small ? 'sm' : '';

        return sizeClassPostfix && options.baseClass ? options.baseClass + '-' + sizeClassPostfix : '';
    };


    /****************************************************************************************
    $._bsCreateElement = internal method to create $-element
    ****************************************************************************************/
    $._bsCreateElement = function( tagName, link, title, textStyle, className ){
        var $result;
        if (link){
            $result = $('<a/>');
            if ($.isFunction( link ))
                $result
                    .prop('href', 'javascript:undefined')
                    .on('click', link );
            else
                $result
                    .i18n(link, 'href')
                    .prop('target', '_blank');
        }
        else
            $result = $('<'+tagName+'/>');

        if (title)
            $result.i18n(title, 'title');

        $result._bsAddStyleClasses( textStyle || '' );

        if (className)
            $result.addClass( className );

        return $result;
    };

    /****************************************************************************************
    $._bsCreateIcon = internal method to create $-icon
    ****************************************************************************************/
    $._bsCreateIcon = function( options, $appendTo, title, className ){
        var $icon;

        if ($.type(options) == 'string')
            options = {class: options};

        if ($.isArray( options)){
            //Create a stacked icon
            $icon = $._bsCreateElement( 'span', null, title, null, 'fa-stack ' + (className || '')  );

            $.each( options, function( index, opt ){
                $._bsCreateIcon( opt, $icon );
            });
        }
        else {
            var allClassNames = options.icon || options.class || '';

            //Append $.FONTAWESOME_PREFIX if icon don't contain fontawesome prefix ("fa?")
            if (allClassNames.search(/(fa.?\s)|(\sfa.?(\s|$))/g) == -1)
                allClassNames = $.FONTAWESOME_PREFIX + ' ' + allClassNames;

            allClassNames = allClassNames + ' ' + (className || '');

            $icon = $._bsCreateElement( 'i', null, title, null, allClassNames );
        }
        $icon.appendTo( $appendTo );
        return $icon;
    };



    $.fn.extend({
        //_bsAddIdAndName
        _bsAddIdAndName: function( options ){
            this.attr('id', options.id || '');
            this.attr('name', options.name || options.id || '');
            return this;
        },

        /****************************************************************************************
        _bsAddBaseClassAndSize

        Add classes

        options:
            baseClass           [string]
            baseClassPostfix    [string]
            styleClass          [string]
            class               [string]
            textStyle           [string] or [object]. see _bsAddStyleClasses
        ****************************************************************************************/
        _bsAddBaseClassAndSize: function( options ){
            var classNames = options.baseClass ? [options.baseClass + (options.baseClassPostfix || '')] : [];

            classNames.push( $._bsGetSizeClass(options) );

            if (options.styleClass)
                classNames.push( options.styleClass );

            if (options.class)
                classNames.push( options.class );

            this.addClass( classNames.join(' ') );

            this._bsAddStyleClasses( options.textStyle );

            return this;
        },

        /****************************************************************************************
        _bsAddStyleClasses
        Add classes for text-styel

        options [string] or [object]
            Style for the contents. String or object with part of the following
            "left right center lowercase uppercase capitalize normal bold italic" or
            {left: true, right: true, center: true, lowercase: true, uppercase: true, capitalize: true, normal: true, bold: true, italic: true}
        ****************************************************************************************/
        _bsAddStyleClasses: function( options ){
            options = options || {};

            var _this = this,

                bsStyleClass = {
                    //Text color
                    "primary"     : "text-primary",
                    "secondary"   : "text-secondary",
                    "success"     : "text-success",
                    "danger"      : "text-danger",
                    "warning"     : "text-warning",
                    "info"        : "text-info",
                    "light"       : "text-light",
                    "dark"        : "text-dark",

                    //Align
                    "left"        : "text-left",
                    "right"       : "text-right",
                    "center"      : "text-center",

                    //Case
                    "lowercase"   : "text-lowercase",
                    "uppercase"   : "text-uppercase",
                    "capitalize"  : "text-capitalize",

                    //Weight
                    "normal"      : "font-weight-normal",
                    "bold"        : "font-weight-bold",
                    "italic"      : "font-italic"
                };

            $.each( bsStyleClass, function( style, className ){
                if (
                      ( (typeof options == 'string') && (options.indexOf(style) > -1 )  ) ||
                      ( (typeof options == 'object') && (options[style]) )
                    )
                    _this.addClass( className );
            });
            return this;
        },

        /****************************************************************************************
        _bsAddHtml
        Internal methods to add innerHTML to button or other element
        options: array of textOptions or textOptions
        textOptions: {
            icon     : String / {class, data, attr} or array of String / {className, data, attr}
            text     : String or array of String
            vfFormat : String or array of String
            vfValue  : any type or array of any-type
            vfOptions: JSON-object or array of JSON-object
            textStyle: String or array of String
            link     : String or array of String
            title    : String or array of String
            iconClass: string or array of String
            textClass: string or array of String
        }
        checkForContent: [Boolean] If true AND options.content exists => use options.content instead
        ****************************************************************************************/

        _bsAddHtml:  function( options, checkForContent, ignoreLink ){
            //**************************************************
            function getArray( input ){
                return input ? $.isArray( input ) ? input : [input] : [];
            }
            //**************************************************

            if (checkForContent && (options.content != null))
                return this._bsAddHtml( options.content );

            options = options || '';

            var _this = this;

            //options = array => add each
            if ($.isArray( options )){
                $.each( options, function( index, textOptions ){
                    _this._bsAddHtml( textOptions );
                });
                return this;
            }

            //Adjust icon and/or text if iot is not at format-options
            if (!options.vfFormat)
                options = $._bsAdjustIconAndText( options );

            this.addClass('container-icon-and-text');

            //If the options is a jQuery-object: append it and return
            if (options.jquery){
                this.append( options );
                return this;
            }

            //options = simple textOptions
            var iconArray       = getArray( options.icon ),
                textArray       = getArray( options.text ),
                vfFormatArray   = getArray( options.vfFormat ),
                vfValueArray    = getArray( options.vfValue ),
                vfOptionsArray  = getArray( options.vfOptions ),
                textStyleArray  = getArray( options.textStyle ),
                linkArray       = getArray( ignoreLink ? [] : options.link || options.onClick ),
                titleArray      = getArray( options.title ),
                iconClassArray  = getArray( options.iconClass ),
                textClassArray  = getArray( options.textClass );

            //Add icons (optional)
            $.each( iconArray, function( index, icon ){
                $._bsCreateIcon( icon, _this, titleArray[ index ], iconClassArray[index] );
            });

            //Add color (optional)
            if (options.color)
                _this.addClass('text-'+ options.color);

            //Add text
            $.each( textArray, function( index, text ){
                var $text = $._bsCreateElement( 'span', linkArray[ index ], titleArray[ index ], textStyleArray[ index ], textClassArray[index] );
                if ($.isFunction( text ))
                    text( $text );
                else
                    if (text == $.EMPTY_TEXT)
                        $text.html( '&nbsp;');
                    else
                        $text.i18n( text, 'html' );

                if (index < textClassArray.length)
                    $text.addClass( textClassArray[index] );

                //If the text is 'together' with an icon => add class "after-icon"
                if (index < iconArray.length)
                    $text.addClass( 'after-icon' );


                $text.appendTo( _this );
            });

            //Add value-format content
            $.each( vfValueArray, function( index, vfValue ){
                $._bsCreateElement( 'span', linkArray[ index ], titleArray[ index ], textStyleArray[ index ], textClassArray[index] )
                    .vfValueFormat( vfValue || '', vfFormatArray[index], vfOptionsArray[index] )
                    .appendTo( _this );
            });

            return this;
        },

        //_bsButtonOnClick
        _bsButtonOnClick: function(){
            var options = this.data('bsButton_options');
            $.proxy( options.onClick, options.context )( options.id, null, this );
            return false;
        },

        /****************************************************************************************
        _bsAppendContent( options, insideFormGroup )
        Create and append any content to this.
        options can be $-element, function, json-object or array of same

        The default bootstrap structure used for elements in a form is
        <div class="form-group">
            <div class="input-group">
                <div class="input-group-prepend">               //optional
                    <button class="btn btn-standard">..</buton> //optional 1-N times
                </div>                                          //optional

                <label class="has-float-label">
                    <input class="form-control form-control-with-label" type="text" placeholder="The placeholder...">
                    <span>The label</span>
                </label>

                <div class="input-group-append">                //optional
                    <button class="btn btn-standard">..</buton> //optional 1-N times
                </div>                                          //optional
            </div>
        </div>
        if insideFormGroup == true OR options.
        ****************************************************************************************/
        _bsAppendContent: function( options, insideFormGroup ){

            if (!options)
                return this;

            //Array of $-element, function etc
            if ($.isArray( options )){
                var _this = this;
                $.each(options, function( index, options){
                    _this._bsAppendContent(options, insideFormGroup);
                });
                return this;
            }

            //Function
            if ($.isFunction( options )){
                options( this, insideFormGroup );
                return this;
            }

            //json-object with options to create bs-elements
            if ($.isPlainObject(options)){
                var buildFunc = $.fn._bsAddHtml,
                    neverInsideFormGroup = false;
                if (options.type)
                    switch (options.type.toLowerCase()){
                        case 'input'        :   buildFunc = $.bsInput;          break;
                        case 'button'       :   buildFunc = $.bsButton;         break;
                        case 'select'       :   buildFunc = $.bsSelectBox;      break;
                        case 'selectlist'   :   buildFunc = $.bsSelectList;     break;
                        case 'checkbox'     :   buildFunc = $.bsCheckbox;       break;
                        case 'tabs'         :   buildFunc = $.bsTabs;           neverInsideFormGroup = true; break;
                        case 'table'        :   buildFunc = $.bsTable;          neverInsideFormGroup = true; break;
                        case 'accordion'    :   buildFunc = $.bsAccordion;      neverInsideFormGroup = true; break;
//                        case 'xx'           :   buildFunc = $.bsXx;               break;
                    }


                //Set the parent-element where to append to created element(s)
                var $parent = this,
                    insideInputGroup = false;
                if (insideFormGroup && !neverInsideFormGroup){
                    //Create outer form-group
                    insideInputGroup = true;
                    $parent = $divXXGroup('form-group', options).appendTo( $parent );
                }

                if (insideInputGroup || options.prepend || options.before || options.append || options.after){
                    //Create element inside input-group
                    $parent = $divXXGroup('input-group', options).appendTo( $parent );

                }

                //Build the element inside $parent
                buildFunc.apply( this, arguments ).appendTo( $parent );

                var prepend = options.prepend || options.before;
                if (prepend)
                    $('<div/>')
                        .addClass('input-group-prepend')
                        ._bsAppendContent( prepend )
                        .prependTo( $parent /*this*/);
                var append = options.append || options.after;
                if (append)
                    $('<div/>')
                        .addClass('input-group-append')
                        ._bsAppendContent( append )
                        .appendTo( $parent /*this*/);


                return this;
            }

            //Assume it is a $-element or other object that can be appended directly
            this.append( options );
            return this;
        }
    }); //$.fn.extend


	/******************************************
	Initialize/ready
	*******************************************/
	$(function() {
	});
	//******************************************



}(jQuery, this, document));