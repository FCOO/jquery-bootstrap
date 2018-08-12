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
            content   : '',
            show      : false,
            closeText : {da:'Annullér', en:'Cancel'},
            submitIcon: 'fa-check',
            submitText: {da:'Ok', en:'Ok'},
            buttons   : [], //Extra button between
            static    : true, //Only close modal-form on (X)
        };


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
        getFormGroup
        *******************************************************/
        getFormGroup: function(){
            this.$formGroup = this.$formGroup || this.getElement().parents('.form-group').first();
            return this.$formGroup;
        },


        /*******************************************************
        setValue
        *******************************************************/
        setValue: function(value, validate){
            var $elem = this.getElement();
            switch (this.options.type || 'input'){
                case 'input'     : $elem.val( value );                   break;
                case 'select'    : $elem.val( value ).trigger('change'); break;
                case 'checkbox'  : $elem.prop('checked', !!value );      break;
                case 'selectlist': this.getRadioGroup().setSelected(value); break;
//TODO case 'radio': ... break;
                case 'slider'    :
                case 'timeslider': this.getSlider().setValue( value ); break;
                case 'text'      : break;
            }
            this.onChange();
            return validate ? this.validate() : this;
        },

        /*******************************************************
        getResetValue: function(){
        *******************************************************/
        getResetValue: function(){
            var result = null;
            switch (this.options.type || 'input'){
                case 'input'     : result = '';       break;
                case 'select'    : result = -1;       break;
                case 'checkbox'  : result = false;    break;
                case 'selectlist': result = this.getRadioGroup().options.list[0].id; break;
//TODO case 'radio': result = ... break;
                case 'slider'    :
                case 'timeslider': result = this.getSlider().result.min; break;
                case 'text'      : result = '';
            }
            return result;
        },

        /*******************************************************
        resetValue
        *******************************************************/
        resetValue: function( onlyResetValidation ){
            this.modalForm._resetInputValidation( this );
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
                result;
            switch (this.options.type || 'input'){
                case 'input'     : result = $elem.val();               break;
                case 'select'    : result = $elem.val();               break;
                case 'checkbox'  : result = !!$elem.prop('checked');   break;
                case 'selectlist': result = this.getRadioGroup().getSelected(); break;
//TODO case 'radio': ... break;
                case 'slider'    :
                case 'timeslider': result = this._getSliderValue(); break;
                case 'text'      : result = ' '; break;
            }
            return result || this.getResetValue();
        },

        /*******************************************************
        addValidation - Add the validations
        *******************************************************/
        addValidation: function(){
            this.getElement().on('change', $.proxy( this.onChange, this ));
            this.modalForm._addInputValidation( this );
        },

        /*******************************************************
        validate
        *******************************************************/
        validate: function(){
            this.modalForm._validateInput( this );
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

                //Reset the validation if the field is hidden
                if (!show){
                    this.getElement().prop('disabled', false);
                    this.resetValue( true );
                }

                this.getFormGroup().css('visibility', show ? 'visible' : 'hidden');
                this.getElement().prop('disabled', !show);

                this.modalForm._enableInputValidation( this, show );
            }
            return this;
        },
    }; //End of BsModalInput.prototype


    /************************************************************************
    *************************************************************************
    BsModalForm( options )
    options:
        content: json-object with full content
        onSubmit : function( values )
    *************************************************************************
    ************************************************************************/
    function BsModalForm( options ){
        var _this = this;
        this.options = $.extend(true, {}, defaultOptions, options );

        this.options.id = this.options.id || 'bsModalFormId' + formId++;

        this.options.onClose = $.proxy( this.onClose, this );

        //this.input = simple object with all input-elements. Also convert element-id to unique id for input-element
        this.inputs = {};

        var types = ['input', 'select', 'selectlist', 'checkbox', 'radio', 'table', 'slider', 'timeslider'];
        function setId( dummy, obj ){
            if ($.isPlainObject(obj) && (obj.type !== undefined) && (types.indexOf(obj.type) >= 0) && obj.id)
                _this.inputs[obj.id] = new BsModalInput( obj, _this );
            else
                if ($.isPlainObject(obj) || ($.type(obj) == 'array'))
                    $.each( obj, setId );
        }
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
        this.$form =
            $('<form/>')
                ._bsAppendContent( this.options.content, this.options.contentContext, true );

        //Create the modal
        this.options.content = this.$form;
        this.$bsModal = $.bsModal( this.options );

        //Append the hidden submit-button the the form
        this.$form.append( $hiddenSubmitButton );

        //Get the button used to submit the form
        var bsModalDialog = this.$bsModal.data('bsModalDialog'),
            $buttons = bsModalDialog.bsModal.$buttons;

        this.$submitButton = $buttons[$buttons.length-1];

        //Add the validator
        this._addValidation();

        //Add the validations
        this._eachInput( function( input ){
            input.addValidation();
        });

        //Add onSubmit
        this._addOnSubmit( $.proxy(this.onSubmit, this) );

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
        edit: function( values, tabIndexOrId ){
            this.$bsModal.show();

            if (tabIndexOrId !== undefined)
                this.$bsModal.bsSelectTab(tabIndexOrId);

            this.setValues( values, false, true );

            this.originalValues = this.getValues();

            //Reset validation
            this.$bsModal.find(':disabled').prop('disabled', false );
            this._resetValidation();

            this.showOrHide( null );

        },

        /*******************************************************
        onClose
        *******************************************************/
        onClose: function(){
            //Check if any of the new values are different from the original ones
            var _this = this,
                originalValues = this.originalValues,
                newValues = this.getValues(),
                different = false;

            $.each( newValues, function(id, value){
                if (originalValues.hasOwnProperty(id) && (originalValues[id] != value)){
                    different = true;
                    return false;
                }
            });

            if (!different)
                return true;

            var noty =
                $.bsNoty({
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
                                _this.originalValues = newValues;
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
        _addOnSubmit (*)
        *******************************************************/
        _addOnSubmit: function( onSubmitFunc ){
            this.$form.on('submit', onSubmitFunc );
        },

        /*******************************************************
        _addValidation (*)
        *******************************************************/
        _addValidation: function(){
        },

        /*******************************************************
        _resetValidation (*)
        *******************************************************/
        _resetValidation: function(){
        },

        /*******************************************************
        _addInputValidation (*)
        *******************************************************/
        _addInputValidation: function( /*bsModalInput*/ ){
        },

        /*******************************************************
        _validateInput (*)
        *******************************************************/
        _validateInput: function( /*bsModalInput*/ ){
        },

        /*******************************************************
        _resetInputValidation (*)
        *******************************************************/
        _resetInputValidation: function( /*bsModalInput*/ ){
        },

        /*******************************************************
        _enableInputValidation (*)
        *******************************************************/
        _enableInputValidation: function( /*bsModalInput, enabled*/ ){
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
        onSubmit: function( event/*, data*/ ){
            this.options.onSubmit ? this.options.onSubmit( this.getValues() ) : null;
            this.$bsModal._close();

            event.preventDefault();
            return false;
        },

    };
}(jQuery, this, document));

