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
            show      : false,
            closeText : {da:'Annullér', en:'Cancel'},
            submitIcon: 'fa-check', //TEST skal være 'fa-i-ok', //or original 'fa-check',
            submitText: {da:'Ok', en:'Ok'},
            buttons   : [], //Extra button between
            static    : true, //Only close modal-form on (X)
        }


    //BsModalinput = internal object representing an input-element in the form
    function BsModalInput( options, modalForm ){
        this.options = options;
        this.modalForm = modalForm;
        this.options.userId = this.options.id;
        this.options.id = 'bsInputId' + inputId++;
    }


    BsModalInput.prototype = {
        /*******************************************************
        getElement
        *******************************************************/
        getElement: function(){
            this.$element = this.$element || this.modalForm.$form.find( '#'+ this.options.id );
            return this.$element;
        },

        /*******************************************************
        getFormGroup
        *******************************************************/
        getFormGroup: function(){
            this.$formGroup = this.$formGroup || this.getElement().parents('.form-group').first();
            return this.$formGroup;
        },

        /*******************************************************
        setValue: function(value, validate){
        *******************************************************/
        setValue: function(value, validate){
            var $elem = this.getElement();
            switch (this.options.type || 'input'){
                case 'input'    : $elem.val( value );                   break;
                case 'select'   : $elem.val( value ).trigger('change'); break;
                case 'checkbox' : $elem.prop('checked', !!value );      break;
                //TODO case 'selectlist': ... break;
                //TODO case 'radio': ... break;
            }
            this.onChange();
            return validate ? this.validate() : this;
        },

        /*******************************************************
        getResetValue: function(){
        *******************************************************/
        getResetValue: function(){
            switch (this.options.type || 'input'){
                case 'input'    : return '';       break;
                case 'select'   : return -1;       break;
                case 'checkbox' : return false;    break;
                //TODO case 'selectlist': ... break;
                //TODO case 'radio': ... break;
            }
        },

        /*******************************************************
        resetValue
        *******************************************************/
        resetValue: function( onlyResetValidation ){
            this.modalForm.formValidation.resetField(this.options.id);
            if (!onlyResetValidation)
                return this.setValue( this.getResetValue() );
        },

        /*******************************************************
        getValue: function(){
        *******************************************************/
        getValue: function(){
            var $elem = this.getElement(),
                result;
            switch (this.options.type || 'input'){
                case 'input'    : result = $elem.val();               break;
                case 'select'   : result = $elem.val();               break;
                case 'checkbox' : result = !!$elem.prop('checked');   break;
                //TODO case 'selectlist': ... break;
                //TODO case 'radio': ... break;
            }
            return result || this.getResetValue();
        },

        /*******************************************************
        addValidation - Add the validations - TODO
        *******************************************************/
        addValidation: function(){
            //Set onChange
            this.getElement().on('change', $.proxy( this.onChange, this ));


//TEST
if (this.options.type != 'checkbox')
            this.modalForm.formValidation.addField( this.options.id, {
                validators: {
                    notEmpty: {
                        message: 'The field '+this.options.userId+' is required'
                    }
                }
            });
        },

        /*******************************************************
        validate TODO: Virker ikke (tror jeg)
        *******************************************************/
        validate: function(){
//            this.modalForm.formValidation.revalidateField( this.options.id );
            this.modalForm.formValidation.validateField( this.options.id );
            return this;
        },

        /*******************************************************
        onChange
        *******************************************************/
        onChange: function(){
            this.modalForm.showOrHide( this );
        },


        /*******************************************************
        showOrHide
        Show or hide the input if any of the id:value in options.showWhen or hideWhen exists
        *******************************************************/
        showOrHide: function( values ){
            if (this.options.showWhen || this.options.hideWhen){
                var show = !this.options.showWhen; //If showWhen is given default is false = not show
                $.each( this.options.hideWhen || {}, function( userId, value ){
                    if (values[userId] == value)
                        show = false;
                });
                $.each( this.options.showWhen || {}, function( userId, value ){
                    if (values[userId] == value)
                        show = true;
                });


                //Reset the validation if the filed is hidden
                if (!show){
                    this.getElement().prop('disabled', false);
                    this.resetValue( true );
                }

                this.getFormGroup().toggleClass('fv-do-not-validate', !show);
                this.getElement().prop('disabled', !show);



            }
            return this;
        },
    }


    /************************************************************************
    BsModalForm( options )
    options:
        content: json-object with full content
        getValues: function( ??? )
        onSubmit : function( ??? )
    ************************************************************************/
    function BsModalForm( options ){
//DEMO TEST
//*

options.content = {
    height: 200/16 + 'rem',
    scroll: true,
    hideNotSelectedText: true,
    type: 'tabs',
    list: [
        {_selected: true, icon: 'fa-home',  text:{da:'Hjem', en:'Home'}, content: 'FIRST Sint sit mollit irure quis est nostrud cillum consequat Lorem esse do quis dolor esse fugiat sunt do. Eu ex commodo veniam Lorem aliquip laborum occaecat qui Lorem esse mollit dolore anim cupidatat. Deserunt officia id Lorem nostrud aute id commodo elit eiusmod enim irure amet eiusmod qui reprehenderit nostrud tempor. FIRST Sint sit mollit irure quis est nostrud cillum consequat Lorem esse do quis dolor esse fugiat sunt do. Eu ex commodo veniam Lorem aliquip laborum occaecat qui Lorem esse mollit dolore anim cupidatat. Deserunt officia id Lorem nostrud aute id commodo elit eiusmod enim irure amet eiusmod qui reprehenderit nostrud tempor. FIRST Sint sit mollit irure quis est nostrud cillum consequat Lorem esse do quis dolor esse fugiat sunt do. Eu ex commodo veniam Lorem aliquip laborum occaecat qui Lorem esse mollit dolore anim cupidatat. Deserunt officia id Lorem nostrud aute id commodo elit eiusmod enim irure amet eiusmod qui reprehenderit nostrud tempor. FIRST Sint sit mollit irure quis est nostrud cillum consequat Lorem esse do quis dolor esse fugiat sunt do. Eu ex commodo veniam Lorem aliquip laborum occaecat qui Lorem esse mollit dolore anim cupidatat. Deserunt officia id Lorem nostrud aute id commodo elit eiusmod enim irure amet eiusmod qui reprehenderit nostrud tempor.'},
        {_selected: true, icon: 'fa-globe',title:{da:'Tidszone', en:'Time zone'}, content: options.content }
    ]
}
//*/




        var _this = this;
        this.options = $.extend(true, {}, defaultOptions, options );



        this.options.id = this.options.id || 'bsModalFormId' + formId++;

        //this.input = simple object with all input-elements. Also convert element-id to unique id for input-element
        this.inputs = {};

        var types = ['input', 'select', 'selectlist', 'checkbox', 'radio', 'table'];
        function setId( dummy, obj ){
            if ($.isPlainObject(obj) && (obj.type !== undefined) && (types.indexOf(obj.type) >= 0) && obj.id)
                _this.inputs[obj.id] = new BsModalInput( obj, _this );
            else
                if ($.isPlainObject(obj) || ($.type(obj) == 'array'))
                    $.each( obj, setId );
        };
        setId( 'dummy', this.options.content);

        //Create a hidden submit-button to be placed inside the form
        var $hiddenSubmitButton = $('<button type="submit" style="display:none"/>');

        //Add submit-button
        this.options.buttons.push({
            icon     : this.options.submitIcon,
            text     : this.options.submitText,
            className: 'primary min-width',
            focus    : true,
            onClick  : function(){ $hiddenSubmitButton.trigger('click'); }
        });

        this.options.show = false; //Only show using method edit(...)


        //Special version for forms with tabs
        if (this.options.content.type == 'tabs'){
            var $bsTabs =   $.bsTabs(this.options.content, true);

            //Create the form and move content inside the form
            $bsTabs._$contents.detach()
            this.$form =
                $('<form/>')
                    .append( $bsTabs._$contents );

            //Create the tabs-modal
            this.options.content = this.$form;
            this.$bsModal = $bsTabs.asModal( this.options );

        }
        else {

            //Create the form
            this.$form =
                $('<form/>')
                    ._bsAppendContent( this.options.content, true )

            //Create the modal
            this.options.content = this.$form;
            this.$bsModal = $.bsModal( this.options );
        }

        //Append the hidden submit-button the the form
        this.$form.append( $hiddenSubmitButton );

        //Get the button used to submit the form
        var bsModalDialog = this.$bsModal.data('bsModalDialog'),
            $buttons = bsModalDialog.bsModal.$buttons;

        this.$submitButton = $buttons[$buttons.length-1];

//test
$buttons[1].on('click', function(){
    //Reset
    _this.setValue('formId1', -1, true);
});

$buttons[2].on('click', function(){
//_this.formValidation.resetForm(false);
    _this.setValue('formId1', 'formSelect1');
    //_this.setValue('formId1', -1);
//console.log(_this.getValues());
});


        //Create the formValidation
        this.$form.formValidation({
            framework: 'bootstrap4',
            autoFocus: false,
            excluded : ':disabled',
            button: {}, //Using modal button instead
            icon  : {}, //No icon used
            //live: String — Live validating mode. Can be one of three values:
            //live: 'enabled', // default	The plugin validates fields as soon as they are changed
            //live: 'disabled', // Disable the live validating. The error messages are only shown after the form is submitted
            live: 'submitted', // The live validating is enabled after the form is submitted

            verbose: false,

        });

        this.formValidation = this.$form.data('formValidation');

        //Add the validations
        this._eachInput( function( input ){ input.addValidation(); });

        //Add events
        this.$form.on('success.form.fv', $.proxy( this.onSubmit, this ));
//Not used at the moment        this.$form.on('err.form.fv',     $.proxy( this.onError,  this ));

        this.$form.on('status.field.fv',    $.proxy( this.onFieldStatus,  this ));
//Not used at the moment        this.$form.on('err.field.fv',    $.proxy( this.onFieldError,  this ));


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
    *******************************************************/
	$.BsModalForm.prototype = {

        /*******************************************************
        edit
        *******************************************************/
        edit: function( values, tabIndexOrId ){
            this.$bsModal.show();

            if (tabIndexOrId !== undefined)
                this.$bsModal.bsSelectTab(tabIndexOrId);

            this.setValues( values, false, true );

            //Reset validation
            this.$bsModal.find(':disabled').prop('disabled', false );
            this.formValidation.resetForm(false);

            this.showOrHide( null );

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
        setValue
        *******************************************************/
        setValue: function(id, value){
            return this.inputs[id] ? this.inputs[id].setValue( value ) : null;
        },

        /*******************************************************
        setValues
        *******************************************************/
        setValues: function(values, validate, restUndefined){
            this._eachInput( function( input ){
                var value = values[input.options.userId];
                if ( value != undefined)
                    input.setValue(value, validate);
                else
                    if (restUndefined)
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
        onSubmit = called when the form is valid and submitted
        *******************************************************/
        onSubmit: function( /*event, data*/ ){
            this.options.onSubmit ? this.options.onSubmit( this.getValues() ) : null;
            this.$bsModal.modal('hide');

            event.preventDefault();
            return false;
        },

        /*******************************************************
        onFieldStatus = called when a field change its status
        *******************************************************/
        onFieldStatus: function( /*event, data*/ ){
            this.$submitButton.toggleClass(
                'disabled',
                this.formValidation.isValid() == false
            );
        },


        /*******************************************************
        onFieldError = called when a field is invalid - NOT USED AT THE MOMENT
        *******************************************************/
//        onFieldError: function( /*event, data*/ ){
//        },

        /*******************************************************
        onError = called when the form is invalid - NOT USED AT THE MOMENT
        *******************************************************/
//        onError: function( /*event, data*/ ){
//        }
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