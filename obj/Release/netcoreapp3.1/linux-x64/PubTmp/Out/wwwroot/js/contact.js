'use strict'

/* parameter */
const siteOptionsUri = window.location.origin + '/api/siteoptions';
const emailNotificationUri = window.location.origin + '/api/EmailNotification'

/* start here */
$(function () {
    /* site title */
    $.get(siteOptionsUri, function (responseData) {
        $('title').text('Contact — ' + responseData[0].siteTitle);
    }).catch(error => console.error('Unable to get site options: ' + error));
    
    $('#send-email').click(function () {
        $(this).attr('disabled', true).delay(2000).show(function () {
            $(this).removeAttr('disabled')
        });

        $('#contact-loading').addClass('loading-block');

        let empty = false;
        $('.item-hover').each(function () {
            if (($.trim($(this).text())).length === 0) {
                $(this).addClass('input-empty');
                empty = true;
            }
        });

        if (empty) {
            $('#contact-loading').removeClass('loading-block');
            $('#contact-tip').addClass('info');
            $('#contact-tip').text('The highlight field is required.').delay(5000).show(function () {
                $('#contact-tip').removeClass('info');
                $('#contact-tip').text('');
            });
        }
        else {
            let recipient = $.trim($('#recipient').text());
            let subject = $.trim($('#subject').text());
            let content = $.trim($('#content').text());

            let jsonData = {
                'recipient': recipient,
                'subject': subject,
                'content': content,
            };

            $.ajax({
                type: 'POST',
                url: `${emailNotificationUri}/SendEmail`,
                contentType: 'application/json',
                data: JSON.stringify(jsonData),
                success: function () {
                    $('#contact-loading').removeClass('loading-block');
                    $('#contact-tip').addClass('success');
                    $('#contact-tip').text('I have received your email.').delay(5000).show(function () {
                        $('#contact-tip').removeClass('success');
                        $('#contact-tip').text('');
                    });
                },
                error: function () {
                    $('#contact-loading').removeClass('loading-block');
                    $('#contact-tip').addClass('error');
                    $('#contact-tip').text('An error occurred.').delay(5000).show(function () {
                        $('#contact-tip').removeClass('error');
                        $('#contact-tip').text('');
                    });
                }
            }).catch(error => console.error('Unable to send email:' + error));
        }
    });

    /* detect changes*/
    $('.item-hover').on('input propertychange', function () {
        $(this).removeClass('input-empty');
    });

    $('#contact-loading-div').hide();
});