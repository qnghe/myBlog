'use strict'

/* parameters */
const siteOptionsUri = window.location.origin + '/api/SiteOptions';
const authenticateUri = window.location.origin + '/api/Authenticate';

/* start here */
$(function () {
    $.get(siteOptionsUri, function (responseData) {
        $('title').text('Login — ' + responseData[0].siteTitle);
    }).catch(error => console.error('Unable to get site options: ' + error));

    let userCredentials = JSON.parse(localStorage.getItem('credentials'));

    if (userCredentials !== null) {
        $('#login-username').val(userCredentials.username);
        $('#login-password').val(Base64.decode(userCredentials.password));
        $('#remember-me').prop('checked', true);
    }

    $('.option-input').on('input propertychange', function () {
        $(this).removeClass('input-empty');
        $('#error-tip').parents('.option-pre').hide();
    });

    $('#login-username').keypress(function (event) {
        if (($.trim($(this).val())).length > 0) {
            if (event.keyCode === 13) {
                event.preventDefault();
                $('#login-password').focus();
            }
        }
    });

    $('#login-password').keypress(function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('#login-button').click();
        }
    });

    $('#login-button').click(function () {
        $(this).attr('disabled', true).delay(2000).show(function () {
            $(this).removeAttr('disabled')
        });

        $('#login-loading').addClass('loading-block');

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
            $('#login-loading').removeClass('loading-block');
        }
        else {
            let username = $.trim($('#login-username').val());
            let password = $.trim($('#login-password').val());
            let rememberMe = $('#remember-me').is(':checked');

            let jsonData = {
                'username': username,
                'password': password
            }

            if (username.length > 0 && password.length > 0) {

                $.ajax({
                    type: 'POST',
                    url: `${authenticateUri}/login`,
                    contentType: 'application/json',
                    data: JSON.stringify(jsonData),
                    success: function (responseData) {
                        if (rememberMe) {
                            localStorage.setItem('credentials', JSON.stringify({
                                'username': username,
                                'password': Base64.encode(password)
                            }));
                        }
                        else {
                            localStorage.removeItem('credentials');
                        }

                        localStorage.setItem('access', JSON.stringify(responseData));
                        window.location.assign(window.location.origin + '/en/dashboard/');
                        $('#login-loading-div').css('display', 'flex');
                    },
                    error: function () {
                        $('#error-tip').text('Invalid credentials.');
                        $('#forget-navigation').show();
                        $('#error-tip').parents('.option-pre').show();
                        $('#login-loading').removeClass('loading-block');
                    }
                }).catch(error => console.error('Unable to register user: ' + error));
            }
        }
    });
});