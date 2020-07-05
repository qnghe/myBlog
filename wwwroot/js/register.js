'use strict'

/* parameters */
const siteOptionsUri = window.location.origin + '/api/SiteOptions';
const authenticateUri = window.location.origin + '/api/Authenticate';

/* start here */
$(function () {
    $.get(siteOptionsUri, function (responseData) {
        $('title').text('Register — ' + responseData[0].siteTitle);
    }).catch(error => console.error('Unable to get site options: ' + error));

    $('.option-input').on('input propertychange', function () {
        $(this).removeClass('input-empty');
        $('#error-tip').parents('.option-pre').hide();
    });

    $('#register-username').keypress(function (event) {
        if (($.trim($(this).val())).length > 0) {
            if (event.keyCode === 13) {
                event.preventDefault();
                $('#register-email').focus();
            }
        }
    });

    $('#register-email').keypress(function (event) {
        if (($.trim($(this).val())).length > 0) {
            if (event.keyCode === 13) {
                event.preventDefault();
                $('#register-password').focus();
            }
        }
    });

    $('#register-password').keypress(function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('#register-button').click();
        }
    });

    $('#register-button').click(function () {
        $(this).attr('disabled', true).delay(2000).show(function () {
            $(this).removeAttr('disabled')
        });

        $('#register-loading').addClass('loading-block');

        let empty = false;
        $('.option-input').each(function () {
            if (($.trim($(this).val())).length === 0) {
                $(this).addClass('input-empty');
                empty = true;
            }
        });

        if (empty) {
            $('#error-tip').text('The highlight filed is required.');
            $('#error-tip').parents('.option-pre').show();
            $('#register-loading').removeClass('loading-block');
        }
        else {
            let username = $.trim($('#register-username').val());
            let email = $.trim($('#register-email').val());
            let password = $.trim($('#register-password').val());

            let jsonData = {
                'username': username,
                'email': email,
                'password': password
            }

            if (username.length > 0 && email.length > 0 && password.length > 0) {

                $.ajax({
                    type: 'POST',
                    url: `${authenticateUri}/register`,
                    contentType: 'application/json',
                    data: JSON.stringify(jsonData),
                    success: function () {
                        $.ajax({
                            type: 'POST',
                            url: `${authenticateUri}/login`,
                            contentType: 'application/json',
                            data: JSON.stringify({ 'username': username, 'password': password }),
                            success: function (responseData) {
                                localStorage.setItem('access', JSON.stringify(responseData));
                                window.location.assign(window.location.origin + '/en/dashboard/');
                                $('#register-loading-div').css('display', 'flex');
                            },
                        }).catch(error => console.error('Unable to register user: ' + error));
                    },
                    statusCode: {
                        400: function (jqXHR) {
                            $('#error-tip').text(jqXHR.responseJSON.errors.Email[0]);
                            $('#error-tip').parents('.option-pre').show();
                            $('#register-loading').removeClass('loading-block');
                        },
                        500: function (jqXHR) {
                            $('#error-tip').text(jqXHR.responseJSON.message);
                            $('#error-tip').parents('.option-pre').show();
                            $('#register-loading').removeClass('loading-block');
                        }
                    }
                }).catch(error => console.error('Unable to register user: ' + error));
            }
        }
    });
});