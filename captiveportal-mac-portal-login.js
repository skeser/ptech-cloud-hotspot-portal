<!-- Scripts-->
$(function () {

    init();

    let PORTAL_ACTION_URL = $("#portal_action").val()

    let cell_phone = "undefined";

    let active_sms_code = false;

    // Geri sayım başlangıç değeri: 5 dakika (saniye cinsinden)
    let countdown = 5 * 60;

    // Geri sayımı gösteren HTML elementinin seçimi
    let countdownElement = $('#countdown');

    // 1-) GET:is-alive --------------------------------------------------------------------------------------------
    $.ajax({
        type: "GET",
        url: "http://portal.il.technexus.com/api/v1/is-alive",
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
        url: "http://portal.il.technexus.com/api/v1/mac-status-check",
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
            url: "http://portal.il.technexus.com/api/v1/mac-portal-form-save",
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
            $('#sms-request-form-result').html("please wait, sending..");
        }
        active_sms_code = true;

        let smsRequestData = {
            cell_phone: $("#cell_phone_sms_request").val(),
            mac: $("#mac_sms_request").val(),
            ip: $("#ip_sms_request").val(),
        };

        $.ajax({
            url: "http://portal.il.technexus.com/api/v1/sms-request-form",
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
            url: "http://portal.il.technexus.com/api/v1/sms-validation-form",
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

    $('#captive_portal_login_form').on("submit", function (event) {

        event.preventDefault();

        console.log("captive_portal_login_form worked you are use redirect to internet");
        alert("captive_portal_login_form worked you are use redirect to internet");
        return true;
    });

    // functions : begin--------------------------------------------------------------------------------------------

    function init() {
        $('#sms-validation-div').hide();
        $('#mac-register-div').hide();

        $('#info').hide();
        $('#warn').hide();
        $('#error').hide();
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

    function reConnect(xhr, url) {
        // Eğer xhr nesnesi açıksa, kapat
        if (xhr.readyState !== 0 && xhr.readyState !== 4) {
            xhr.abort();
        }

        // Yeni bir xhr nesnesi oluştur
        const newXhr = new XMLHttpRequest();
        newXhr.open("GET", url, true);

        // Yeni xhr nesnesinin hazır olduğunda gerçekleşecek işlemler
        newXhr.onload = function () {
            console.log("Uzak sunucuyla yeni bir bağlantı kuruldu.");
        };

        // Yeni xhr nesnesini döndür
        return newXhr;
    }

    function redirectURL() {
        location.reload();  //location.reload(true);
        $(location).attr('href', 'https://teamworking.vc/');
        window.open("https://teamworking.vc/", '_blank').focus();
    }

    function captive_portal_post_form() {
        let captivePortalFormData = {

            redirurl: $('#redirurl').val(),
            zone: $('#zone').val(),
            mac: $('#mac').val(),
            ip: $('#ip').val()
        };

        $.ajax({
            type: "POST",
            url: $('#portal_action').val(),
            data: captivePortalFormData
        }).done(function (response) {
            console.log("captiveportal form post success" + response);
        })
            .fail(function (xhr, status, error) {
                console.log("captiveportal form post NOT success" + error + xhr + status);
            });
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

            let xhr = new XMLHttpRequest();

            xhr.open("GET", PORTAL_ACTION_URL, true);
            xhr.send();

            xhr = reConnect(xhr, PORTAL_ACTION_URL);
            console.log("xhr : " + xhr);

            captive_portal_post_form();

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