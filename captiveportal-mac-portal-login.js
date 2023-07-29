<!-- Scripts-->
//$(function () {
$(document).ready(function(){

    let FORM_TEXT = {};

    init();

    let PORTAL_ACTION_URL = $("#portal_action").val();

    let TENANT_SERVICE_URL = "http://ptech-cloud-hotspot-service.local/";

    let cell_phone = "undefined";

    let active_sms_code = false;

    // Geri sayım başlangıç değeri: 5 dakika (saniye cinsinden)
    let countdown = 5 * 60;

    // Geri sayımı gösteren HTML elementinin seçimi
    let countdownElement = $('#countdown');

    // 0-) TEXTS Loads with Language Lines-------------------------------------------------------------------------
    $.ajax({
        type: "GET",
        url: TENANT_SERVICE_URL + "api/v1/lang_test",
        dataType: "json"
    }).done(function (response) {
        FORM_TEXT = response;
        //console.log("FORM_TEXTS:", response);
        set_form_text(FORM_TEXT);

        //console.log("title:", response.mac_login_page.register_form.info);
        //console.log("title:", response);
    })
        .fail(function (xhr, status, error) {
            debugFail("lang_test :", xhr, status, error);
            handlingPostFail("err : lang load service err");
        });

    // 1-) GET:is-alive --------------------------------------------------------------------------------------------
    $.ajax({
        type: "GET",
        url: TENANT_SERVICE_URL + "api/v1/is-alive",
        dataType: "json"
    }).done(function (response) {
        isAliveDone(response)
    })
        .fail(function (xhr, status, error) {
            debugFail("is_alive :", xhr, status, error);
            handlingPostFail("err : service unavailable (503)");
        });

    // 2-) POST:macStatusCheck ------------------------------------------------------------------------------------
    let mac_status_check_post_data = {
        mac: $("#mac_mac_check").val(),
        ip: $("#ip_mac_check").val()
    };
    $.ajax({
        type: "POST",
        url: TENANT_SERVICE_URL + "api/v1/mac-status-check",
        data: mac_status_check_post_data
    }).done(function (response) {
        macStatusCheckDone(response)
    })
        .fail(function (xhr, status, error) {
            debugFail("mac-check_FAIL : ", xhr, status, error);
            handlingPostFail("err : service unavailable (mac status check fail)");
        });

    // 3-POST:#mac-register-form -----------------------------------------------------------------------------------
    $("#mac-register-form").on("submit", function (event) {

        event.preventDefault();

        let interentUserData = {
            cell_phone: $("#cell_phone").val(),
            firstName: $("#firstName").val(),
            lastName: $("#lastName").val(),
            email: $("#email").val(),
            mac: $("#mac_mac_register").val(),
            ip: $("#ip_mac_register").val(),
        };

        $.ajax({
            url: TENANT_SERVICE_URL + "api/v1/mac-portal-form-save",
            type: "POST",
            data: interentUserData
        }).done(function (response) {
            macRegisterFormPOSTDone(response)
        })
            .fail(function (xhr, status, error) {
                debugFail("mac-register_form_POST_RESPONSE_FAIL : ", xhr, status, error);
                handlingPostFail("err : service unavailable (mac register service fail)");
            });
    });

    // 4-POST:#sms-request-form ------------------------------------------------------------------------------------
    $("#sms-request-form").on("submit", function (event) {

        event.preventDefault();
        if (active_sms_code === false){
            $('#sms-request-form-result').html(FORM_TEXT.mac_login_page.sms_request_form.code_sending);
        }
        active_sms_code = true;

        let smsRequestData = {
            cell_phone: $("#cell_phone_sms_request").val(),
            mac: $("#mac_sms_request").val(),
            ip: $("#ip_sms_request").val(),
        };

        $.ajax({
            url: TENANT_SERVICE_URL + "api/v1/sms-request-form",
            type: "POST",
            data: smsRequestData
        })
            .done(function (response) {
                smsRequestFormPOSTDone(response)
            })
            .fail(function (xhr, status, error) {
                debugFail("sms_request_form_post_fail : ", xhr, status, error);
                handlingPostFail("err : service unavailable (sms sending service fail)");
            });

    });

    // 5-POST:#sms-validation-form ---------------------------------------------------------------------------------
    $("#sms-validation-form").on("submit", function (event) {

        event.preventDefault();

        let smsValidateData = {
            cell_phone_verification_code: $("#cell_phone_verification_code").val(),
            cell_phone_validation: cell_phone,
            mac: $("#mac_sms_validation_code").val(),
            ip: $("#ip_sms_validation_code").val(),
        };

        $.ajax({
            url: TENANT_SERVICE_URL + "api/v1/sms-validation-form",
            type: "POST",
            data: smsValidateData
        })
            .done(function (response) {
                smsValidationFormPOSTDone(response)
            })
            .fail(function (xhr, status, error) {
                debugFail("sms_VALIDATION_form_POST_REPONSE_fail : ", xhr, status, error);
                handlingPostFail("err : service unavailable (sms validation service fail)");
            });
    });

    // functions : begin--------------------------------------------------------------------------------------------

    function init() {


        $('#sms-validation-div').hide();
        $('#mac-register-div').hide();

        $('#info').hide();
        $('#warn').hide();
        $('#error').hide();

        /*
                $('#mac-register-div').show();
        $('#sms-validation-div').show();
        $('#mac-register-div').show();

        $('#info').show();
        $('#warn').show();
        $('#error').show();

         */

    }

    function set_form_text(FORM_TEXT){
        // title
        document.title = FORM_TEXT.mac_login_page.title;

        //register_form

        $('#tenant_name').text(FORM_TEXT.mac_login_page.register_form.tenant_name);
        $('#register_form_info').text(FORM_TEXT.mac_login_page.register_form.info);

        $('#cell_phone_label').text(FORM_TEXT.mac_login_page.register_form.cell_phone_label);
        $('#cell_phone_country_code').text(FORM_TEXT.mac_login_page.register_form.cell_phone_country_code);

        $('#name_label').text(FORM_TEXT.mac_login_page.register_form.name_label);
        $('#firstName').attr('placeholder', FORM_TEXT.mac_login_page.register_form.name_placehodler);

        $('#last_name_label').text(FORM_TEXT.mac_login_page.register_form.last_name_label);
        $('#lastName').attr('placeholder', FORM_TEXT.mac_login_page.register_form.lastname_placehodler);

        $('#email_label').text(FORM_TEXT.mac_login_page.register_form.email_label);
        $('#email').attr('placeholder', FORM_TEXT.mac_login_page.register_form.email_placehodler);

        $('#mac-register-form_submit_button').text(FORM_TEXT.mac_login_page.register_form.button_text);

        //sms_request_form

        $('#sms_request_form_info').text(FORM_TEXT.mac_login_page.sms_request_form.info);
        $('#sms_request_cell_phone_label').text(FORM_TEXT.mac_login_page.sms_request_form.cell_phone_label);

        $('#sms_request_button_submit').text(FORM_TEXT.mac_login_page.sms_request_form.get_code_button_text);

        //sms_validation_form
        $('#sms_validate_form_info').text(FORM_TEXT.mac_login_page.sms_validation_form.code_label);

        $('#sms_validate_button_submit').text(FORM_TEXT.mac_login_page.sms_validation_form.validate_button_text);


    }

    function responseMessageGenerator(response) {
        if (response.type === "info") {
            $('#info').show().html(response.message);
            $('#warn').hide()
            $('#error').hide();
        }

        if (response.type === "warn") {
            $('#info').hide();
            $('#warn').show().html(response.message);
            $('#error').hide();
        }

        if (response.type === "error") {
            $('#info').hide();
            $('#warn').hide();
            $('#error').show().html(response.message);
        }
    }

    function handlingPostFail(message) {
        $('#mac-register-div').hide();
        $('#sms-validation-div').hide();

        $('#info').hide();
        $('#warn').hide();
        $('#error').show().html(message);
    }

    function redirectURL() {

        $(location).attr('href', PORTAL_ACTION_URL);

    }

    function setCellPhoneInputText(cell_phone) {
        $('#cell_phone_sms_request').val(cell_phone);
    }

    function debug(source, response) {
        console.log("BEGIN : DEBUG ");
        console.log("SOURCE : " + source);
        console.log("+type : " + response.type);
        console.log("+event_code : " + response.event_code);
        console.log("+message : " + response.message);
        console.log("+phone : " + response.phone);
        console.log("+sms_validation_mod : " + response.sms_validation_mod);
        console.log("END : DEBUG -------------------------------------------");
    }

    function debugFail(source, xhr, status, error) {
        console.log("BEGIN : debugFail")
        console.log("|xhr    : " + xhr);
        console.log("|status : " + status);
        console.log("|error  : " + error);
        console.log("END : debugFail")
    }

    // Geri sayım işlemini gerçekleştiren fonksiyon
    function startCountdown() {
        console.log("startCountdown worked")
        // Countdown değeri sıfırdan büyük olduğu sürece geri sayım devam eder
        if (countdown > 0) {
            // Countdown değeri 1 saniye azaltılır
            countdown--;

            // Geri sayım değeri dakika ve saniye cinsinden ayrıştırılır
            let minutes = Math.floor(countdown / 60);
            let seconds = countdown % 60;

            // Geri sayımı gösteren element güncellenir
            countdownElement.text(minutes + ":" + (seconds < 10 ? "0" : "") + seconds);

            // Geri sayımın 1 saniye sonrasında tekrarlanması için işlem 1 saniye geciktirilir
            setTimeout(startCountdown, 1000);
        } else {
            // Countdown sıfır olduğunda geri sayım sonlandırılır
            //countdownElement.text("Code Expired");
            //$("#sms-validation-form-result").html("Code Expired");
            location.reload();
        }
    }

    // 1- is_alive service -------------------------------------------------------------------------------------
    function isAliveDone(response) {
        debug("is_alive", response);

        if (response.event_code === "is_live-error-1") {
            $("#mac-register-div").hide();

            responseMessageGenerator(response);
        }
    }

    // 2- MAC check service -------------------------------------------------------------------------------------
    function macStatusCheckDone(response) {
        debug("mac-check", response);

        if (response.event_code === "mchk-warn-3" ||
            response.event_code === "mchk-warn-2" ||
            response.event_code === "mchk-warn-6") {
            responseMessageGenerator(response);
        }

        if (response.event_code === "mchk-info-1") {
            responseMessageGenerator(response);
            redirectURL();
        }

        if (response.event_code === "mchk-warn-1" || response.event_code === "mchk-warn-4") {
            $('#mac-register-div').show();
        }

        if (response.event_code === "mchk-info-2") {
            responseMessageGenerator(response);
            redirectURL();
        }

        if (response.event_code === "mchk-warn-5") {

            setCellPhoneInputText(response.phone);
            $('#sms-validation-div').show();

            responseMessageGenerator(response);
        }

        if (response.event_code === "mchk-error-1") {
            responseMessageGenerator(response);
        }
    }

    // 3- MAC REGISTER FORM RESPONSE FUNCTIONS-------------------------------------------------------------------------------
    function macRegisterFormPOSTDone(response) {
        debug("mac_register_form_response : ", response);

        if (response.event_code === "mreg-warn-2" || response.event_code === "mreg-warn-2") {

            $('#mac-register-div').hide();

            responseMessageGenerator(response);
        }

        if (response.event_code === "mreg-info-1") {

            $('#mac-register-div').hide();

            responseMessageGenerator(response);

            redirectURL();
        }

        if (response.event_code === "mreg-warn-3") {

            $('#mac-register-div').hide();

            setCellPhoneInputText(response.phone);
            $('#sms-validation-div').show();

            responseMessageGenerator(response);
        }

        if (response.event_code === "mreg-error-1") {

            $('#mac-register-div').hide();
            $('#sms-validation-div').hide();

            responseMessageGenerator(response);
        }
    }

    // POST:#mac-register-form -------------------------------------------------------------------------------------

    // 4- SMS_REQUEST_SERVICE_RESPONSE FUNCTIONS--------------------------------------------------------------------
    function smsRequestFormPOSTDone(response) {
        debug("sms_request_service_form_post_done : ", response);

        if (response.event_code === "sms_req-warn-1" || response.event_code === "sms_req-warn-2") {

            $('#mac-register-div').hide();
            $('#sms-request-form').hide();

            responseMessageGenerator(response);
        }

        if (response.event_code === "sms_req-info-1" && response.sms_validation_mod === 0) {

            $("#mac-register-div").hide();
            $('#sms-request-form').hide();

            redirectURL();
        }

        if (response.event_code === "sms_req-info-1" && response.sms_validation_mod === 1) {

            // show SMS_VALIDATION form
            $("#warn").hide();
            $("#sms-validation-form-result").html("");

            startCountdown();

            setCellPhoneInputText(response.phone);
            $("#cell_phone_validation").attr("value", response.phone);


            $("#mac-register-div").hide();
            $("#sms-validation-div").show(); //

            $("#sms-request-form-result").html(response.message);
        }

        if (response.event_code === "sms_req-warn-3" && response.sms_validation_mod === 1) {

            active_sms_code = true;
            $('#sms-request-form-result').html("");
            responseMessageGenerator(response);
        }

        if (response.event_code === "sms_req-error-1" && response.sms_validation_mod === 1) {

            responseMessageGenerator(response);
        }

        if (response.event_code === "sms_req-error-2" && response.sms_validation_mod === 1) {

            responseMessageGenerator(response);
        }

    }

    // END : 4- SMS_REQUEST_SERVICE_RESPONSE FUNCTIONS--------------------------------------------------------------

    // 5- SMS_VALIDATION_SERVICE_RESPONSE FUNCTIONS-----------------------------------------------------------------
    function smsValidationFormPOSTDone(response) {
        debug("sms_validation_form_post_DONE", response);

        if (response.event_code === "sms_val-warn-1" || response.event_code === "sms_val-warn-2") {

            $('#mac-register-div').hide();
            $('#sms-request-form').hide();

            responseMessageGenerator(response);
        }

        if (response.event_code === "sms_val-warn-3") {

            $('#mac-register-div').hide();
            $("#sms-validation-div").show(); //

            responseMessageGenerator(response);
        }

        if (response.event_code === "sms_val-warn-4") {

            $("#mac-register-div").hide();
            $("#sms-validation-div").show(); //

            $("#sms-validation-form-result").html(response.message);

        }

        if (response.event_code === "sms_val-error-1") {

            $("#mac-register-div").hide();
            $("#sms-validation-div").show(); //

            //$("#sms-validation-form-result").html("response.message");
            responseMessageGenerator(response);

        }

        if (response.event_code === "sms_val-info-1") {

            $("#mac-register-div").hide();
            $("#sms-validation-div").hide(); //

            responseMessageGenerator(response);

            redirectURL();
        }

        if (response.event_code === "sms_val-error-1") {

            $("#mac-register-div").hide();
            $("#sms-validation-div").show(); //

            responseMessageGenerator(response);
        }
    }

    // END : 5- SMS_VALIDATION_SERVICE_RESPONSE FUNCTIONS-----------------------------------------------------------

    // functions : end----------------------------------------------------------------------------------------------
}); //document ready.