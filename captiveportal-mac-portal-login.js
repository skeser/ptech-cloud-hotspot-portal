<!-- Scripts-->
//$(function () {
$(document).ready(function(){

    //let test_mac = '00:00:00:00:00:03';
    //let test_ip = '10.1.1.3';
    //set_test_env();

    //let ZONE = 'captive_portal_ptech_cloud_hotspot_dev'; // for test
    let ZONE = $("#zone").val();

    let API_KEY = "162a93f8d95d3f7311af5b6af212901a";

    let FORM_TEXT = {};

    init();

    let PORTAL_ACTION_URL = $("#portal_action").val()

    let TENANT_SERVICE_URL = "https://hotspot.poyrazteknoloji.com/";

    let active_sms_code = false;

    // Geri sayım başlangıç değeri: 5 dakika (saniye cinsinden)
    let countdown = 5 * 60;

    // Geri sayımı gösteren HTML elementinin seçimi
    let countdownElement = $('#countdown');

    // 0-) TEXTS Loads with Language Lines-------------------------------------------------------------------------
    $.ajax({
        type: "GET",
        url: TENANT_SERVICE_URL + "api/v1/load_captive_portal_text",
        dataType: "json"
    }).done(function (response) {
        FORM_TEXT = response;
        set_captive_portal_form_text(FORM_TEXT);
    })
        .fail(function (xhr, status, error) {
            debugFail("load_captive_portal_text : fail", xhr, status, error);
            handlingPostFail("err : load_captive_portal_text service err");
        });

    // 1-) GET:is-alive --------------------------------------------------------------------------------------------
    /*
    $.ajax({
        type: "GET",
        url: TENANT_SERVICE_URL + "api/v1/ping",
        dataType: "json"
    }).done(function (response) {
        pingDone(response)
    })
        .fail(function (xhr, status, error) {
            debugFail("ping :", xhr, status, error);
            handlingPostFail("err : ping service unavailable (503)");
        });

     */

    // 2-) POST:router ------------------------------------------------------------------------------------
    let router_post_data = {
        mac: $("#mac_mac_check").val(),
        ip: $("#ip_mac_check").val(),
        API_KEY: API_KEY,
        ZONE : ZONE,
    };
    $.ajax({
        type: "POST",
        url: TENANT_SERVICE_URL + "api/v1/router",
        data: router_post_data
    }).done(function (response) {
        routerDone(response)
    })
        .fail(function (xhr, status, error) {
            debugFail("router_FAIL : ", xhr, status, error);
            handlingPostFail("err : service unavailable (router service fail)");
        });

    // X-POST:#code-form -----------------------------------------------------------------------------------
    $("#code-form").on("submit", function (event) {

        event.preventDefault();
        $(this).prop("disabled", true);
        processRequest(FORM_TEXT.mac_login_page.code_form.code_checking);

        let code_data = {
            code: $("#code").val(),
            mac: $("#mac_code").val(),
            ip: $("#ip_code").val(),
            API_KEY: API_KEY,
            ZONE : ZONE,
        };

        $.ajax({
            url: TENANT_SERVICE_URL + "api/v1/cod",
            type: "POST",
            data: code_data
        }).done(function (response) {
            $("#code-form").prop("disabled", false);
            codeFormPOSTDone(response)
        })
            .fail(function (xhr, status, error) {
                debugFail("code_form_POST_RESPONSE_FAIL : ", xhr, status, error);
                handlingPostFail("err : service unavailable (code service fail)");
            });
    });

    // X-POST:#phone-check-form -----------------------------------------------------------------------------------
    $("#phone-check-form").on("submit", function (event) {

        event.preventDefault();
        $(this).prop("disabled", true);
        processRequest(FORM_TEXT.mac_login_page.phone_check_form.phone_checking);

        let phone_check_data = {
            phone: $("#phone_check_phone").val(),
            mac: $("#mac_phone_check").val(),
            ip: $("#ip_phone_check").val(),
            API_KEY: API_KEY,
            ZONE : ZONE,
        };

        $.ajax({
            url: TENANT_SERVICE_URL + "api/v1/phone",
            type: "POST",
            data: phone_check_data
        }).done(function (response) {
            $("#phone-check-form").prop("disabled", false);
            registerFormPOSTDone(response)
        })
            .fail(function (xhr, status, error) {
                debugFail("phone_check_POST_RESPONSE_FAIL : ", xhr, status, error);
                handlingPostFail("err : service unavailable (phone_check service fail)");
            });
    });

    // 3-POST:#mac-register-form -----------------------------------------------------------------------------------
    $("#mac-register-form").on("submit", function (event) {

        event.preventDefault();
        $(this).prop("disabled", true);
        processRequest(FORM_TEXT.mac_login_page.register_form.registering);

        let mac_user_data = {
            phone: $("#cell_phone").val(),
            person: $("#person").val(),
            email: $("#email").val(),
            mac: $("#mac_mac_register").val(),
            ip: $("#ip_mac_register").val(),
            API_KEY: API_KEY,
            ZONE : ZONE,
        };

        $.ajax({
            url: TENANT_SERVICE_URL + "api/v1/register",
            type: "POST",
            data: mac_user_data
        }).done(function (response) {
            $("#mac-register-form").prop("disabled", true);
            registerFormPOSTDone(response)
        })
            .fail(function (xhr, status, error) {
                debugFail("register_form_POST_RESPONSE_FAIL : ", xhr, status, error);
                handlingPostFail("err : service unavailable (register service fail)");
            });
    });

    // 4-POST:#sms-request-form ------------------------------------------------------------------------------------
    $("#sms-request-form").on("submit", function (event) {

        event.preventDefault();
        $(this).prop("disabled", true);

        if (active_sms_code === false){

            processRequest(FORM_TEXT.mac_login_page.sms_request_form.code_sending);
        }
        active_sms_code = true;

        let smsRequestData = {
            phone: $("#cell_phone_sms_request").val(),
            mac: $("#mac_sms_request").val(),
            ip: $("#ip_sms_request").val(),
            API_KEY: API_KEY,
            ZONE : ZONE,
        };

        $.ajax({
            url: TENANT_SERVICE_URL + "api/v1/sms-request",
            type: "POST",
            data: smsRequestData
        })
            .done(function (response) {
                $("#sms-request-form").prop("disabled", true);
                smsRequestPOSTDone(response)
            })
            .fail(function (xhr, status, error) {
                debugFail("sms_request_post_fail : ", xhr, status, error);
                handlingPostFail("err : service unavailable (sms request(sending) service fail)");
            });

    });

    // 5-POST:#sms-validation-form ---------------------------------------------------------------------------------
    $("#sms-validation-form").on("submit", function (event) {

        event.preventDefault();
        $(this).prop("disabled", true);
        processRequest(FORM_TEXT.mac_login_page.sms_validation_form.validating_code);

        let smsValidateData = {
            phone_verification_code: $("#cell_phone_verification_code").val(),
            mac: $("#mac_sms_validation_code").val(),
            ip: $("#ip_sms_validation_code").val(),
            API_KEY: API_KEY,
            ZONE : ZONE,
        };

        $.ajax({
            url: TENANT_SERVICE_URL + "api/v1/sms-validate",
            type: "POST",
            data: smsValidateData
        })
            .done(function (response) {
                $("#sms-validation-form").prop("disabled", true);
                smsValidatePOSTDone(response)
            })
            .fail(function (xhr, status, error) {
                debugFail("sms_VALIDATE_POST_REPONSE_fail : ", xhr, status, error);
                handlingPostFail("err : service unavailable (sms validate service fail)");
            });
    });

    // functions : begin--------------------------------------------------------------------------------------------

    function set_test_env() {
        // for test on karakacan


        // 1:code service
        $('#mac_code').val(test_mac);
        $('#ip_code').val(test_ip);

        // 2:phone service
        $('#mac_phone_check').val(test_mac);
        $('#ip_phone_check').val(test_ip);

        // 3:register service
        $('#mac_mac_register').val(test_mac);
        $('#ip_mac_register').val(test_ip);

        // 4: sms_request
        $('#mac_sms_request').val(test_mac);
        $('#ip_sms_request').val(test_ip);

        // 5: sms_validation
        $('#mac_sms_validation_code').val(test_mac);
        $('#ip_sms_validation_code').val(test_ip);

        // 6: router service
        $('#mac_mac_check').val(test_mac);
        $('#ip_mac_check').val(test_ip);
    }

    function init() {

        $('#sms-validation-div').hide();
        $('#mac-register-div').hide();
        $('#code-div').hide();
        $('#phone-check-div').hide();

        $('#info').hide();
        $('#warn').hide();
        $('#error').hide();

    }

    function set_captive_portal_form_text(FORM_TEXT){

        // common
        document.title = FORM_TEXT.common.title;
        $('#tenant_name').text(FORM_TEXT.common.tenant_name);
        $('#page_name').text(FORM_TEXT.common.page_name);

        // code_form
        $('#code_form_info').text(FORM_TEXT.mac_login_page.code_form.info);
        $('#code_label').text(FORM_TEXT.mac_login_page.code_form.code_label);
        $('#code').attr('placeholder', FORM_TEXT.mac_login_page.code_form.code_placeholder);
        $('#code-form_submit_button').text(FORM_TEXT.mac_login_page.code_form.button_text);

        // phone_check_form
        $('#phone_check_form_info').text(FORM_TEXT.mac_login_page.phone_check_form.info);

        $('#phone_check_phone_label').text(FORM_TEXT.mac_login_page.phone_check_form.label);

        $('#phone_check_phone_country_code').text(FORM_TEXT.mac_login_page.phone_check_form.country_code);

        $('#phone_check_phone').attr('placeholder', FORM_TEXT.mac_login_page.phone_check_form.placeholder);
        $('#phone-check-form_submit_button').text(FORM_TEXT.mac_login_page.phone_check_form.button_text);

        //register_form
        $('#register_form_info').text(FORM_TEXT.mac_login_page.register_form.info);

        $('#cell_phone_label').text(FORM_TEXT.mac_login_page.register_form.cell_phone_label);
        $('#cell_phone_country_code').text(FORM_TEXT.mac_login_page.register_form.cell_phone_country_code);

        $('#person_label').text(FORM_TEXT.mac_login_page.register_form.person_label);
        $('#person').attr('placeholder', FORM_TEXT.mac_login_page.register_form.person_placeholder);


        $('#email_label').text(FORM_TEXT.mac_login_page.register_form.email_label);
        $('#email').attr('placeholder', FORM_TEXT.mac_login_page.register_form.email_placeholder);

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

    function processRequest(msg) {
        $('#warn').hide();
        $('#error').hide();
        $('#info').show().html(msg);
    }

    function handlingPostFail(message) {
        $('#mac-register-div').hide();
        $('#sms-validation-div').hide();
        $('#code-div').hide();

        $('#info').hide();
        $('#warn').hide();
        $('#error').show().html(message);
    }

    function redirectURL() {
        console.log("redirectURL worked..");
        $(location).attr('href', PORTAL_ACTION_URL);
    }

    function setCellPhoneInputText(cell_phone) {
        $('#cell_phone_sms_request').val(cell_phone);
        $('#cell_phone').val(cell_phone);
    }

    function debug(source, response) {
        console.log("BEGIN : DEBUG ");
        console.log("SOURCE : " + source);
        console.log("+type : " + response.type);
        console.log("+event_code : " + response.portal_code);
        console.log("+message : " + response.message);
        console.log("+phone : " + response.phone);
        console.log("+sms_mod : " + response.sms_mod);
        console.log("+API_KEY : " + API_KEY);
        //console.log("+test_mac: " + test_mac );
        //console.log("+test_ip: " + test_ip );
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
            location.reload();
        }
    }

    // 1- is_alive service -------------------------------------------------------------------------------------
    function pingDone(response) {
        debug("ping", response);

        if (response.portal_code === "ping.error.1") {
            $("#mac-register-div").hide();
            $("#code-div").hide();

            responseMessageGenerator(response);
        }
    }

    // 2- ROUTER service -------------------------------------------------------------------------------------
    function routerDone(response) {
        debug("router: service:", response);

        if (response.portal_code === "router.warn.7") {
            $('#code-div').show();
            //responseMessageGenerator(response);
        }

        if (response.portal_code === "router.warn.3" ||
            response.portal_code === "router.warn.2" ||
            response.portal_code === "router.warn.6") {
            responseMessageGenerator(response);
        }

        if (response.portal_code === "router.info.1") {
            responseMessageGenerator(response);
            redirectURL();
        }

        if (response.portal_code === "router.warn.1" || response.portal_code === "router.warn.4") {
            //$('#mac-register-div').show();
            $('#phone-check-div').show();
        }

        if (response.portal_code === "router.info.2") {
            responseMessageGenerator(response);
            redirectURL();
        }

        if (response.portal_code === "router.warn.5") {

            setCellPhoneInputText(response.phone);

            $('#sms-validation-div').show();

            responseMessageGenerator(response);
        }

        if (response.portal_code === "router.error.1") {
            responseMessageGenerator(response);
        }
    }

    // X- CODE FORM RESPONSE FUNCTIONS-------------------------------------------------------------------------------
    function codeFormPOSTDone(response) {
        debug("code response: ", response);

        if (response.portal_code === "code.error.1") {

            $('#code-div').hide();
            responseMessageGenerator(response);
        }

        if (response.portal_code === "code.warn.1") {

            $('#code-div').hide();
            responseMessageGenerator(response);
        }

        if (response.portal_code === "code.warn.2") {

            responseMessageGenerator(response);
        }

        if (response.portal_code === "code.info.1") {

            $('#code-div').hide();
            //$('#mac-register-div').show();
            $('#phone-check-div').show();


            responseMessageGenerator(response);
        }

        if (response.portal_code === "code.info.2") {

            $('#code-div').hide();
            $('#mac-register-div').hide()

            setCellPhoneInputText(response.phone);
            $('#sms-validation-div').show();

            responseMessageGenerator(response);
        }

        if (response.portal_code === "code.info.3") {

            $('#code-div').hide();
            responseMessageGenerator(response);
            redirectURL();
        }
    }

    // X- PHONE CHECK FORM RESPONSE FUNCTIONS-------------------------------------------------------------------------------


    // 3- MAC REGISTER FORM RESPONSE FUNCTIONS-------------------------------------------------------------------------------
    function registerFormPOSTDone(response) {
        debug("register response: ", response);

        // for phone service patches
        if (response.portal_code === "phone.warn.1") {

            $('#phone-check-div').hide();
            responseMessageGenerator(response);
        }

        if (response.portal_code === "phone.info.1") {

            $('#phone-check-div').hide();

            setCellPhoneInputText(response.phone);

            $('#mac-register-div').show();

            responseMessageGenerator(response);
        }
        // for phone service patches


        if (response.portal_code === "register.warn.2") {

            $('#mac-register-div').hide();

            responseMessageGenerator(response);
        }

        if (response.portal_code === "register.info.1") {

            $('#mac-register-div').hide();
            $('#phone-check-div').hide();


            responseMessageGenerator(response);

            redirectURL();
        }

        if (response.portal_code === "register.warn.3") {

            $('#mac-register-div').hide();

            setCellPhoneInputText(response.phone);
            $('#sms-validation-div').show();

            responseMessageGenerator(response);
        }
        // send_sms mode true , direct send sms !!
        if (response.portal_code === "sms_request.info.1" && response.sms_mod === 1) {

            $("#mac-register-div").hide();
            $("#phone-check-div").hide();
            $("#warn").hide();
            $("#info").hide();

            $("#sms_request_button_submit").hide();
            $("#sms-validation-div").show(); //

            startCountdown();

            setCellPhoneInputText(response.phone);
            $("#cell_phone_validation").attr("value", response.phone);

            responseMessageGenerator(response);
        }

        if (response.portal_code === "register.error.1") {

            $('#mac-register-div').hide();
            $('#sms-validation-div').hide();

            responseMessageGenerator(response);
        }
    }

    // POST:#mac-register-form -------------------------------------------------------------------------------------

    // 4- SMS_REQUEST_SERVICE_RESPONSE FUNCTIONS--------------------------------------------------------------------
    function smsRequestPOSTDone(response) {
        debug("sms_request service: ", response);

        if (response.portal_code === "sms_request.warn.1" || response.portal_code === "sms_request.warn.2") {

            $('#mac-register-div').hide();
            $('#sms-request-form').hide();

            responseMessageGenerator(response);
        }

        if (response.portal_code === "sms_request.info.1" && response.sms_mod === 0) {

            $("#mac-register-div").hide();
            $('#sms-request-form').hide();

            redirectURL();
        }

        if (response.portal_code === "sms_request.info.1" && response.sms_mod === 1) {

            // show SMS_VALIDATION form
            $("#warn").hide();

            startCountdown();

            setCellPhoneInputText(response.phone);
            $("#cell_phone_validation").attr("value", response.phone);


            $("#mac-register-div").hide();
            $("#sms-validation-div").show(); //

            responseMessageGenerator(response);
        }

        if (response.portal_code === "sms_request.warn.3" && response.sms_mod === 1) {

            active_sms_code = true;
            responseMessageGenerator(response);
        }

        if (response.portal_code === "sms_request.error.1" && response.sms_mod === 1) {

            responseMessageGenerator(response);
        }

        if (response.portal_code === "sms_request.error.2" && response.sms_mod === 1) {

            responseMessageGenerator(response);
        }

    }

    // END : 4- SMS_REQUEST_SERVICE_RESPONSE FUNCTIONS--------------------------------------------------------------

    // 5- SMS_VALIDATION_SERVICE_RESPONSE FUNCTIONS-----------------------------------------------------------------
    function smsValidatePOSTDone(response) {
        debug("sms_validate service: ", response);

        if (response.portal_code === "sms_validate.warn.1" || response.portal_code === "sms_validate.warn.2") {

            $('#mac-register-div').hide();
            $('#sms-request-form').hide();

            responseMessageGenerator(response);
        }

        if (response.portal_code === "sms_validate.warn.3") {

            $('#mac-register-div').hide();
            $("#sms-validation-div").show(); //

            responseMessageGenerator(response);
        }

        if (response.portal_code === "sms_validate.warn.4") {

            $("#mac-register-div").hide();
            $("#sms-validation-div").show(); //

            responseMessageGenerator(response);

        }
        if (response.portal_code === "sms_validate.error.3") {

            $("#mac-register-div").hide();
            $("#sms-validation-div").hide(); //

            responseMessageGenerator(response);

        }

        if (response.portal_code === "sms_validate.error.1") {

            $("#mac-register-div").hide();
            $("#sms-validation-div").show(); //

            responseMessageGenerator(response);

        }

        if (response.portal_code === "sms_validate.info.1") {

            $("#mac-register-div").hide();
            $("#sms-validation-div").hide(); //

            responseMessageGenerator(response);

            redirectURL();
        }

        if (response.portal_code === "sms_validate.error.1") {

            $("#mac-register-div").hide();
            $("#sms-validation-div").show(); //

            responseMessageGenerator(response);
        }
    }

    // END : 5- SMS_VALIDATION_SERVICE_RESPONSE FUNCTIONS-----------------------------------------------------------

    // functions : end----------------------------------------------------------------------------------------------
}); //document ready.