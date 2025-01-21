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
                validatorList       = Array.isArray(validators) ? validators : [validators],
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
                i18next.languages.forEach( lang => {
                    nextError[lang] = nextError[lang] ? nextError[lang].replace('%min', min).replace('%max', max) : '';
                });

                if (min !== undefined){
                    attr['min'+postfix] = min;
                    prop.required = true;
                }

                if (max !== undefined)
                    attr['max'+postfix] = max;
            }

            validatorList.forEach( validator => {
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
            errorList.forEach(error => {
                i18next.languages.forEach( lang => {
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