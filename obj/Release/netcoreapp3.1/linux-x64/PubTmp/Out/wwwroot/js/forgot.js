'use strict'

/* parameters */
const siteOptionsUri = window.location.origin + '/api/SiteOptions';
const userManagementUri = window.location.origin + '/api/UserManagement';


/* start here */
$(function () {
    $.get(siteOptionsUri, function (responseData) {
        $('title').text('Forgot — ' + responseData[0].siteTitle);
    }).catch(error => console.error('Unable to get site options: ' + error));

    $('.option-input').on('input propertychange', function () {
        $(this).removeClass('input-empty');
    });

    $('#forgot-username').keypress(function (event) {
        if (($.trim($(this).val())).length > 0) {
            if (event.keyCode === 13) {
                event.preventDefault();
                $('#get-new-password').click();
            }
        }
    });

    $('#get-new-password').click(function () {
        $(this).attr('disabled', true).delay(2000).show(function () {
            $(this).removeAttr('disabled')
        });

        $('#retrieve-loading').addClass('loading-blcok');

        let username = $.trim($('#forgot-username').val());

        if (username.length === 0) {
            $('#status').text('notice:');
            $('#message').text('The highlight field is required.');
            $('#forgot-username').addClass('input-empty');
            $('#retrieve-loading').removeClass('loading-blcok');
        }
        else {
            $.ajax({
                type: 'POST',
                url: `${userManagementUri}/RetrievePassword`,
                contentType: 'application/json',
                data: JSON.stringify({ 'username': username }),
                success: function (responseData) {
                    $('#retrieve-loading').removeClass('loading-blcok');
                    $('#status').text(`${responseData.status}:`);
                    $('#message').text(responseData.message);
                },
                error: function (jqXHR) {
                    $('#retrieve-loading').removeClass('loading-blcok');
                    $('#status').text(`${jqXHR.responseJSON.status}:`);
                    $('#message').text(jqXHR.responseJSON.message);
                }
            });
        }
    });
});