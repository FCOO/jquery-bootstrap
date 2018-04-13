/****************************************************************************
	jquery-bootstrap-form.js,

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
        ******************************************************/
        bsInput: function( options ){
            return  $('<input/>')
                        ._bsAddIdAndName( options )
                        .addClass('form-control-border form-control')
                        .attr('type', 'text')
                        ._wrapLabel(options);
        },

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
        bsInputGroup: function( options, type ){
            options.type = options.type || 'input';
            return $divXXGroup('input-group', options)
                       ._bsAppendContent(options);
        },

        /******************************************************
        $.bsFormGroup
        Create <div class="form-group"><div class="input-group"> with a input-control inside as descripted above
        ******************************************************/
        bsFormGroup: function( options, type ){
            return  $.bsInputGroup(options, type)
                        ._wrapFormGroup(options);
        }

    }); //$.extend({


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


    $.fn.extend({
        /******************************************************
        $.fn._wrapFormGroup( options )
        Wrap the element inside a form-group with a small-element to hold error-message
        Return
        <div class="form-group [form-group-sm/xs]">
            element
        </div>
        ******************************************************/
        _wrapFormGroup: function(options){
            return $divXXGroup('form-group', options).append( this );
        },

        /******************************************************
        $.fn._wrapInputGroup( options )
        Wrap the element inside a input-group
        Return
        <div class="input-group [input-group-sm/xs]">
            element
        </div>
        ******************************************************/
        _wrapInputGroup: function(options){
            return $divXXGroup('input-group', options).append( this );
        },

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
        _wrapLabel: function(options){
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
        },


    }); //$.fn.extend({


}(jQuery, this, document));