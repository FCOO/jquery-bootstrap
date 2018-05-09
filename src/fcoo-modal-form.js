/****************************************************************************
	fcoo-modal-form.js,

	(c) 2018, FCOO

	https://github.com/FCOO/fcoo-modal-form
	https://github.com/FCOO

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";

	//Create fcoo-namespace
	window.fcoo = window.fcoo || {};

	//If fcoo.namespace() is defined create a name-space
	var ns = window.fcoo.namespace ? window.fcoo.namespace(''/*Enter the fcoo-namespace here*/) : window.fcoo;
	//or var ns = window;

    var formId = 0,
        inputId = 0;


    var defaultOptions = {
            content: '',
            show: true,
            closeText : {da:'Annullér', en:'Cancel'},
            submitIcon: 'fa-check', //TEST skal være 'fa-i-ok', //or original 'fa-check',
            submitText: {da:'Ok', en:'Ok'},
            buttons     : [], //Extra button between
        }

    /************************************************************************
    BsModalForm( options )
    options:
        content: json-object with full content
        getValues: function( ??? )
        onSubmit : function( ??? )
    ************************************************************************/
    function BsModalForm( options ){
        var _this = this;
        this.options = $.extend(true, defaultOptions, options );

        this.options.id = this.options.id || 'bsModalFormId' + formId++;

        //this.inpt = simple object with all input-elements. Also convert element-id to unique id for input-element
        this.inputOptions = {};
        this.$elements = {};

        var types = ['input', 'select', 'selectlist', 'checkbox', 'radio', 'table'];
        function setId( dummy, obj ){
            if ($.isPlainObject(obj) && (obj.type !== undefined) && (types.indexOf(obj.type) >= 0) && obj.id){
                var newId = 'bsInputId' + inputId++;
                _this.inputOptions[obj.id] = obj;
                obj.id = newId;
            }
            else
                if ($.isPlainObject(obj) || ($.type(obj) == 'array'))
                    $.each( obj, setId );
        };
        setId( 'dummy', this.options.content);


        //Create the hidden submit-button
        var $hiddenSubmitButton = $('<button type="submit" style="display:none"/>');

/*
this.options.buttons.push({
            text     : 'test',
            onClick  : function(){
                _this.formValidation
                    .updateStatus('formId2', 'NOT_VALIDATED')
//                    .validateField('formId2');

            }
        });
*/
        //Add submit-button
        this.options.buttons.push({
            icon     : this.options.submitIcon,
            text     : this.options.submitText,
            className: 'primary min-width',
            focus    : true,
            onClick  : function(){ $hiddenSubmitButton.trigger('click'); }
        });

        //Create the form
        this.$form =
            $('<form/>')
                ._bsAppendContent( this.options.content, true )
                .append( $hiddenSubmitButton )

        //Create the modal
        this.options.content = this.$form;
        var show = this.options.show;
        this.options.show = false;

        this.$bsModal = $.bsModal( this.options );

        //Get the button used to submit the form
        var bsModalDialog = this.$bsModal.data('bsModalDialog'),
            $buttons = bsModalDialog.bsModal.$buttons,
            $button = $buttons[$buttons.length-1];

        //Create the formValidation
        this.$form.formValidation({
            framework: 'bootstrap4',
            autoFocus: false,
            message  : 'This value is not valid',
            excluded : ':disabled',

            button: {
                // The disabled class
                disabled: '' //TODO Check hvordan den bruges
            },

            icon: {}, //No icon used

            //live: String — Live validating mode. Can be one of three values:
            //live: 'enabled', // default	The plugin validates fields as soon as they are changed
            //live: 'disabled', // Disable the live validating. The error messages are only shown after the form is submitted
            live: 'submitted', // The live validating is enabled after the form is submitted

            verbose: false,

        });

        this.formValidation = this.$form.data('formValidation');

        //Add the validations - TODO
        $.each( this.inputOptions, function( id, options ){
            _this.formValidation.addField( options.id, {
                validators: {
                    notEmpty: {
                        message: 'The field '+id+' is required'
                    }
                }
            });
        });


        this.$form.on('success.form.fv', $.proxy( this.onSubmit, this ));

//TODO on('change.form.fv',...)

//this.formValidation.validate();
//console.log('isValid=',this.formValidation.isValid());

this.setValue('formId2', 'skide godt');
this.setValue('formId1', 'formSelect3');
//this.setValue('formId2-1', 'formSelect3');
this.setValue('mySelection', false);

        this.options.show = show;
        if (this.options.show)
            this.show();
        return this;
    }


    //Export to jQuery
    $.BsModalForm = BsModalForm;
    $.bsModalForm = function( options ){
        return new $.BsModalForm( options );
    };

	//Extend the prototype
	$.BsModalForm.prototype = {

        /*******************************************************
        _load
        *******************************************************/
        _load: function(){
            var _this = this;
        },

        /*******************************************************
        show
        *******************************************************/
        show: function(){
            this.$bsModal.show();
        },


        /*******************************************************
        getElement - id = the id used by the user
        *******************************************************/
        getElement: function( id ){
            var elemId = this.inputOptions[id].id;
            this.$elements[id] = this.$elements[id] || this.$form.find( '#'+ this.inputOptions[id].id );
            return this.$elements[id];
        },


setValue: function(id, value){
    var $elem = this.getElement(id);
    switch (this.inputOptions[id].type || 'input'){
        case 'input'   : $elem.val( value ); break;
        case 'select': $elem.val(value ).trigger('change'); break;
        case 'checkbox': $elem.prop('checked', !!value ); break;

    }
},

getValue: function(id){
    var $elem = this.getElement(id);
    switch (this.inputOptions[id].type || 'input'){
        case 'input'   : return $elem.val(); break;
        case 'checkbox': return !!$elem.prop('checked'); break;

    }
},



        /*******************************************************
        onSubmit = called when the form iss valid and submitted
        *******************************************************/
        onSubmit: function( e ){
            console.log('SUCCESS', e);
            e.preventDefault();
            return false;
        }
    };
}(jQuery, this, document));

/*
$(function() {
    $('#formTest').formValidation({
        framework: 'bootstrap4',
        autoFocus: false,
button: {
    // The submit buttons selector
    selector: '[type="submit"]:not([formnovalidate])', //TODO i modal: Select button outside form

    // The disabled class
    disabled: ''


},

   icon: {
//HER          valid: 'fa fa-check',
//HER          invalid: 'fa fa-times',
//HER          validating: 'fa fa-refresh',
//       feedback: '', //'_form-control-feedback'
            //      valid: 'fa fa-check',
            //      invalid: 'fa fa-times',
            //      validating: 'fa fa-refresh',
            //      feedback: 'form-control-feedback' <-
    },

//live: String — Live validating mode. Can be one of three values:

//live: 'enabled', // default	The plugin validates fields as soon as they are changed
//live: 'disabled', // Disable the live validating. The error messages are only shown after the form is submitted
live: 'submitted', // The live validating is enabled after the form is submitted


verbose: false,
//err: {
//    clazz: 'HER_form-control-feedback',
//},


        fields: {
            NIELS_ER_SMART: {
                validators: {
                    notEmpty: {
                        message: 'NIELS_ER_SMART is required'
                    }
                }
            },
            NIELS_ER_SMART3: {
                validators: {
                    notEmpty: {
                        message: 'NIELS_ER_SMART3 is required'
                    }
                }
            },
            TEST_SELECT: {
                validators: {
                    notEmpty: {
                        message: 'The %s is required'
                    }
                }
            },
            TEST_NAME: {
                validators: {
                    notEmpty: {
                        message: 'The %s is required'
                    },
                    stringLength: {
                        min: 6,
                        max: 30,
                        message: 'The name must be more than %s and less than %s characters long'
                    },
                    regexp: {
                        regexp: /^[a-zA-Z0-9_]+$/,
                        message: 'The name can only consist of alphabetical, number and underscore'
                    }
                }
            },
            TEST_DATE: {
                validators: {
                    notEmpty: {
                        message: 'The date is required'
                    },
                    numeric: {
                        message: 'The date must be a number'
                    }
                }
            },
            TEST_DATE2: {
                validators: {
                    notEmpty: {
                        message: 'The date2 is required'
                    },
                    numeric: {
                        message: 'The date2 must be a number'
                    }
                }
            }

        }
    })
});


*/