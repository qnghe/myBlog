'use strict'

/* parameter */
const siteOptionsUri = window.location.origin + '/api/siteoptions';
const aboutPageUri = window.location.origin + '/api/AboutPage';

$(function () {
    /* site title */
    $.get(siteOptionsUri, function (responseData) {
        $('title').text('About — ' + responseData[0].siteTitle);
    }).catch(error => console.error('Unable to get site options: ' + error));

    /* about page */
    $.get(aboutPageUri, function (responseData) {
        let aboutContent = Base64.decode(responseData[0].content);

        $('#about-title').text(responseData[0].title);
        $('#about-content').append(aboutContent);
        $('#about-loading-div').hide();
    }).catch(error => console.error('Unable to get about page: ' + error));

    /* animation of back to top div */
    $(window).scroll(function () {
        //console.log($(window).scrollTop());
        if ($(window).scrollTop() > 100) {
            $('#back-to-top').fadeIn();
        }
        else {
            $('#back-to-top').stop().fadeOut();
        }
    });

    $('#back-to-top').click(function () {
        $.scrollTo(0, 1000);
    });
});