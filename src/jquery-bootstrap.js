/****************************************************************************
	jquery-bootstrap.js, 

	(c) 2017, FCOO

	https://github.com/FCOO/jquery-bootstrap
	https://github.com/FCOO

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";
	
    /*
    

    Many of the elements comes in tree different sizes: large, normal, small set by the options.size

    In jquery-bootstrap.scss sizing class-postfix -xs is added (from Bootstrap 3)

    Since some of the 'large' Bootstrap elements are a bit to larges it is possible to use 
    'normal' as large, 'small' as normal and 'extra-small' as 'small on desktop and still use original size on touch devices
    The variable window.bsIsTouch must be overwriten with the correct value in the application

    */

    //Create namespace
	var ns = window; 

    ns.bsIsTouch     =  true; //false;        

    $._bsGetSizeClass = function( options ){
        var size = '';
        switch (options.size || 'normal'){
            case 'small': size = ns.bsIsTouch ? 'sm' : 'xs'; break;
            case 'large': size = ns.bsIsTouch ? 'lg' :   ''; break;
            default     : size = ns.bsIsTouch ?   '' : 'sm'; 
        }
        return size ? options.baseClass+'-'+size : '';
    };

    ns._bsGetSmallerSize = function( size ){
        return (size || 'normal') == 'large' ? 'normal' : 'small';
    };



    //$._bsAdjustOptions( options [, defaultOptions ): Adjust options to allow text/name/title/header etc.
    $._bsAdjustOptions = function( options, defaultOptions, forceOptions ){
        
        options = $.extend( true, defaultOptions || {}, options, forceOptions || {} );

        options.icon     = options.icon || options.headerIcon || options.titleIcon;
        options.text     = options.text || options.header || options.title || options.name;

        options.iconClass = options.iconClass       || options.iconClassName       || 
                            options.headerIconClass || options.headerIconClassName ||
                            options.titleIconClass  || options.titleIconClassName;

        options.textClassName = options.textClass   || options.textClassName   || 
                                options.headerClass || options.headerClassName || 
                                options.titleClass  || options.titleClassName;
        
        options.selected = options.selected || options.checked || options.active;

        options.list = options.list || options.buttons || options.items || options.children;

        
        return options;
    };

    $.fn.extend({
        /****************************************************************************************
        _bsAddBaseClassAndSize

        Add classes

        options:
            baseClass           [string]
            baseClassPostfix    [string]
            addSizeClass        [boolean]
            styleClass          [string]
            class               [string]
            textStyle           [string] or [object]. see _bsAddStyleClasses
        ****************************************************************************************/
        _bsAddBaseClassAndSize: function( options ){
            var classNames = options.baseClass ? [options.baseClass + (options.baseClassPostfix || '')] : [],
                sizeClass = '';
            if (options.addSizeClass && options.baseClass){
                sizeClass = $._bsGetSizeClass( options );
                if (sizeClass)
                  classNames.push( sizeClass );
            }

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
            var styles = "left right center lowercase uppercase capitalize normal bold italic".split(' '),
                classes = "text-left text-right text-center text-lowercase text-uppercase text-capitalize font-weight-normal font-weight-bold font-italic".split(' ');
                
            for (var i=0; i<styles.length; i++ ){
                var nextStyle = styles[i]; 
                if (  
                      ( (typeof options == 'string') && (options.indexOf(nextStyle) > -1 )  ) ||
                      ( (typeof options == 'object') && (options[nextStyle]) ) 
                    )
                    this.addClass( classes[i] );                    
            }
            return this;
        },

        /****************************************************************************************
        _bsAddHtml
        Internal methods to add innerHTML to button or other element
        options: array of textOptions or textOptions
        textOptions: {
            icon     : String or array of String
            text     : String or array of String
            textStyle: String or array of String
            link     : String or array of String
            title    : String or array of String
            iconClass: string or array of String
            textClass: string or array of String
    }
        ****************************************************************************************/

        _bsAddHtml:  function( options ){
            options = options || '';
            function getArray( input ){ return input ? $.isArray( input ) ? input : [input] : []; }
            var _this = this;
    
            //Simple version: options == string
            if ($.type( options ) !== "object")
                return this._bsAddHtml( {text: options} );              
            
            //options = array => add each with space between            
            if ($.isArray( options )){
                $.each( options, function( index, textOptions ){
                    if (index)
                        _this.append('&nbsp;');                      
                    _this._bsAddHtml( textOptions );
                });        
                return this;    
            }
           
            //options = simple textOptions
            var iconArray      = getArray( options.icon ),
                textArray      = getArray( options.text ),
                textStyleArray = getArray( options.textStyle ),
                linkArray      = getArray( options.link ),
                titleArray     = getArray( options.title ),
                iconClassArray = getArray( options.iconClass ),
                textClassArray = getArray( options.textClass );

            //Add icons (optional)
            $.each( iconArray, function( index, icon ){
                var $icon = $('<i/>').addClass('fa '+icon);
                if (index < iconClassArray.length)
                    $icon.addClass( iconClassArray[index] );
                $icon.appendTo( _this );                
            });
                
            //Add color (optional)
            if (options.color)
                _this.addClass('text-'+ options.color);

            if (options.icon && options.text)
                _this.append('&nbsp;');

            $.each( textArray, function( index, text ){
                var link = linkArray[ index ],
                    title = titleArray[ index ],
                    textStyle = textStyleArray[ index ] || '',
                    $text;
                if (link){
                    $text = $('<a/>');
                    if ($.isFunction( link ))
                        $text
                            .prop('href', 'javascript:undefined')
                            .on('click', link );
                    else 
                        $text
                            .i18n(link, 'href')
                            .prop('target', '_blank');

                }
                else
                    $text = $('<span/>');

                if (title)
                    $text.i18n(title, 'title');

                $text._bsAddStyleClasses( textStyle );
                
                if ($.isFunction( text ))
                    text( $text );
                else
                    $text.i18n( text );

                if (index < textClassArray.length)
                    $text.addClass( textClassArray[index] );
                $text.appendTo( _this );                
            });
            
            
            return this;
        },

        //_bsButtonOnClick
        _bsButtonOnClick: function(){
            var options = this.data('bsButton_options');
            $.proxy( options.onClick, options.context )( options.id, null, this );
            return false;
        }


    }); //$.fn.extend



	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { 

	
	}); 
	//******************************************



}(jQuery, this, document));