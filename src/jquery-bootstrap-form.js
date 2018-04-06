/****************************************************************************
	jquery-bootstrap-form.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    /******************************************************
    $.bsInput( options )
    Create a <input type="text" class="form-control"> inside a <label>
    ******************************************************/
    $.bsInput = function( options ){
        return  $('<input/>')
                    ._bsAddName( options )
                    .addClass('form-control-border form-control')
                    .attr('type', 'text')
                    ._wrapLabel(options);
    }



    /******************************************************
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
    ******************************************************/

    /******************************************************
    $.bsInputGroup
    Create <div class="input-group"> with a input-control inside as descripted above
    ******************************************************/
    $.bsInputGroup = function( options, type ){
        return $divXXGroup('input-group', options)
                   ._bsAppendElements(options, type || 'input');
    }

    /******************************************************
    $.bsFormGroup
    Create <div class="form-group"><div class="input-group"> with a input-control inside as descripted above
    ******************************************************/
    $.bsFormGroup = function( options, type ){
        return  $.bsInputGroup(options, type)
                    ._wrapFormGroup(options);
    }



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

    /******************************************************
    $.fn._wrapFormGroup( options )
    Wrap the element inside a form-group with a small-element to hold error-message
    Returne
    <div class="form-group [form-group-sm/xs]">
        element
    </div>
    ******************************************************/
    $.fn._wrapFormGroup = function(options){
        return $divXXGroup('form-group', options).append( this );
    }

    /******************************************************
    $.fn._wrapInputGroup( options )
    Wrap the element inside a input-group
    Returne
    <div class="input-group [input-group-sm/xs]">
        element
    </div>
    ******************************************************/
    $.fn._wrapInputGroup = function(options){
        return $divXXGroup('input-group', options).append( this );
    }

    /******************************************************
    _wrapLabel( options )
    Wrap the element inside a <label> and add
    options.placeholder and options.label
        <label class="has-float-label">
            <THIS placeholder="options.placeholder"/>
            <span>options.label</span>
        </label>
    Return the label-element
    ******************************************************/
    $.fn._wrapLabel = function(options){

        this.addClass('form-control-with-label');

        var $label = $('<label/>').addClass('has-float-label');
        $label.append( this );

        if (options.placeholder)
            this.i18n( options.placeholder, 'placeholder' );

        $('<span/>')
            ._bsAddHtml( options.label )
            .appendTo( $label )
            .on('mouseenter', function(){ $label.addClass('hover');    })
            .on('mouseleave', function(){ $label.removeClass('hover'); });

        return $label;
    };


    /******************************************************
    _bsAppendElements( options )
    options = {type, options} or $-element or [] of {type, options}/$-element

    Create and append $-elements to this
    ******************************************************/
    $.fn._bsAppendElements = function(options, defaultType){
        var _this = this;
        if ($.isArray( options ))
            $.each(options, function( index, options){
                _this._bsAppendElements(options);
            });
        else
            if ($.isPlainObject(options)){
                options.type = options.type || defaultType || 'input';
                switch (options.type.toLowerCase()){
                    case 'input'        :   $.bsInput( options ).appendTo( this );  break;
                    case 'button'       :   $.bsButton( options ).appendTo( this );  break;
                    case 'select'       :   $.bsSelectBox( options ).appendTo( this );  break;
                    case 'selectlist'   :   $.bsSelectList( options ).appendTo( this );  break;
                    case 'checkbox'     :   $.bsCheckbox( options ).appendTo( this );  break;
                    case 'XX'           :   break;
                }
                var prepend = options.prepend || options.before;
                if (prepend)
                    $('<div/>')
                        .addClass('input-group-prepend')
                        ._bsAppendElements( prepend )
                        .prependTo(this);
                var append = options.append || options.after;
                if (append)
                    $('<div/>')
                        .addClass('input-group-append')
                        ._bsAppendElements( append )
                        .appendTo(this);


            }
            else
                this.append( options ); //Assume it is a $-element

        return this;
    }




/*
    $.fn._NEWbsHeaderAndIcons = function(options){
        var $this = this;

        options = $.extend( true,
            {
                headerClassName: '',
                icons          : {}
            },
            options
        );

        this
            .addClass( options.headerClassName )
            ._bsAddHtml( options.header || $.EMPTY_TEXT );

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
            $.each( ['diminish', 'extend', 'close'], function( index, id ){
                var iconOptions = options.icons[id];
                if (iconOptions && iconOptions.onClick){
                    $('<i/>')
                        .addClass('header-icon header-icon-' + id )
                        .addClass( iconOptions.className || '')
                        .on('click', iconOptions.onClick)
                        .attr( iconOptions.attr || {})
                        .data( iconOptions.data || {})
                        .appendTo($iconContainer);

                    //Add alternative (swipe) event
                    if (iconOptions.altEvents)
                        $this.on( iconOptions.altEvents, iconOptions.onClick );
                }
            });
        }
        return this;
    };
*/
}(jQuery, this, document));