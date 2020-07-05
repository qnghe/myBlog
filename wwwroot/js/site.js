'use strict'

/* parameter */
const categoriesUri = window.location.origin + '/api/categories';
const siteOptionsUri = window.location.origin + '/api/siteoptions';
const publishedPostsUri = window.location.origin + '/api/publishedposts';
const nothingFound = $('<div><h1 class="published-post-title">Nothing Found</h1><p class="text-center">It seems I can’t find what you’re looking for.</p></div>');

const access = JSON.parse(localStorage.getItem('access'));

/* regular functions */
function getSpecificPost(postId) {
    $('#post-item-main').empty();
    $('#post-loading-div').css('display', 'flex');
    $.get(`${publishedPostsUri}/${postId}`, function (responseData) {
        let demoPost = $('#demo-post').find('.published-post-content-main').first().clone(true);
        demoPost.find('.published-post-title').text(responseData.postTitle);
        demoPost.find('.post-modified-time').text(responseData.displayReadableDate);
        demoPost.find('.author-name').text(responseData.postAuthor);
        demoPost.find('.published-post-content').append(Base64.decode(responseData.postContent));
        demoPost.find('.published-post-category').text(responseData.postCategory);

        $('#post-item-main').append(demoPost);
        $('#post-loading-div').hide();
        $('#main-loading-div').hide();
    }).catch(error => console.error('Unable to get specific post: ' + error));
}

function displaySpecificPost(specificObject) {
    $('#page-navigation').empty();
    let category = specificObject.attr('href').split('/')[0];
    let postId = specificObject.attr('href').split('/')[1];
    $('.menu-li').removeClass('menu-li-active');
    $(category).parents('.menu-li').addClass('menu-li-active');
    getSpecificPost(postId);
}

function getPosts(itemsPerPage, pageNumber, category, searchString) {
    $.get(`${publishedPostsUri}/Page?itemsPerPage=${itemsPerPage}&pageNumber=${pageNumber}&isDraft=false&category=${category}&searchString=${searchString}`, function (responseData) {
        $.each(responseData, function (item) {
            let demoArticle = $('#demo-article').find('.post-article').first().clone(true);
            let postId = responseData[item].id;
            let postTitle = responseData[item].postTitle;
            let postCategory = responseData[item].postCategory;
            let postFirstLine = Base64.decode(responseData[item].postFirstLine);
            let postAuthor = responseData[item].postAuthor;
            let displayReadableDate = responseData[item].displayReadableDate;

            let linkTitle = '';

            if (postTitle.split(' ').length > 9) {
                linkTitle = postTitle.split(' ').slice(0, 9).join('-') + '...';
            }
            else {
                linkTitle = postTitle.split(' ').join('-');
            }

            demoArticle.attr('id', `post-${postId}`);
            demoArticle.find('.post-article-h2-a').attr('href', `#${postCategory}/${postId}/${linkTitle}/`);
            demoArticle.find('.post-article-h2-a').text(postTitle);
            demoArticle.find('.post-article-category-a').attr('href', `#${postCategory}/`);
            demoArticle.find('.post-article-category-a').attr('menu-id', postCategory);
            demoArticle.find('.post-article-category-a').text(postCategory);
            demoArticle.find('.post-first-line').text(postFirstLine);
            demoArticle.find('.author-name').text(postAuthor);
            demoArticle.find('.post-display-readable-date').text(displayReadableDate);
            demoArticle.find('.read-more-div-a').attr('href', `#${postCategory}/${postId}/${linkTitle}/`);

            $('#post-item-main').append(demoArticle);
        });

        $('#main-loading-div').hide();
        $('#post-loading-div').hide();
        $('#page-navigation').show();

        /* post category click function*/
        $('.post-article-category-a').click(function () {
            let menuId = $(this).attr('menu-id');
            let isActive = $(`#${menuId}`).parents('.menu-li').hasClass('menu-li-active');
            if (isActive) {
                return;
            }
            else {
                $(`#${menuId}`).click();
            }
        });

        /* post read more function */
        $('.read-more-div-a').off("click").on("click", function () {
            displaySpecificPost($(this));
        });

        $('.post-article-h2-a').off("click").on("click", function () {
            displaySpecificPost($(this));
        });
    }).catch(error => console.error('Unable to get post: ' + error));
}

function displayPosts(uri, category, searchString) {
    $('#post-item-main').empty();
    $('#post-loading-div').css('display', 'flex');

    $.get(uri, function (responseData) {
        let postCount = responseData.length;
        if (postCount > 0) {
            $('#page-navigation').pagination({
                dataSource: function (done) {
                    let result = [];
                    for (let i = 1; i < postCount + 1; i++) {
                        result.push(i);
                    }
                    done(result);
                },
                pageSize: 9,
                prevText: 'Previous',
                nextText: 'Next',
                ellipsisText: '..',
                pageRange: 1,
                autoHidePrevious: true,
                autoHideNext: true,
                ulClassName: 'paginationjs-ul',
                callback: function (data, pagination) {
                    //if ($(window).scrollTop() > 390) {
                    //    $.scrollTo(350, 1000);
                    //}
                    $('#post-item-main').empty();
                    $('#page-navigation').hide();
                    $('#post-loading-div').css('display', 'flex');
                    getPosts(pagination.pageSize, pagination.pageNumber, category, searchString);
                },
            });
        }
        else {
            $('#post-loading-div').hide();
            $('#post-item-main').empty().append(nothingFound);
            $('#page-navigation').empty();
        }
        
    }).catch(error => console.error('Unable to get filtered posts: ' + error));
}


$(function () {

    if (access !== null) {
        $('#log-in').attr('href', 'dashboard/');
        $('#log-in').text('Dashboard');
    }
    else {
        $('#log-in').attr('href', 'login/');
        $('#log-in').text('Log in');
    }

    /* identify request hash */
    let requestHash = window.location.hash;
    let requestHashArray = requestHash.split('/');
    let requestLink = '';

    /* site options */
    $.get(siteOptionsUri, function (responseData) {
        $('title').text('Home — ' + responseData[0].siteTitle);
        $('#site-title-a').text(responseData[0].siteTitle);
        $('#site-tagline').text(responseData[0].siteTagline);
        $('#blog-title').text(responseData[0].siteTitle);
        $('#footer-text').text(responseData[0].siteFooter);
    }).catch(error => console.error('Unable to get site options: ' + error));

    /* menu animation and function */
    $.get(categoriesUri, function (responseData) {
        $('#menu-ul').empty();
        $.each(responseData, function (item) {
            let demoMenuLi = $('#demo-menu-li').find('.menu-li').first().clone(true);
            demoMenuLi.children('.menu-a').attr('href', `#${responseData[item].categoryName}/`);
            demoMenuLi.children('.menu-a').attr('id', responseData[item].categoryName.split(' ').join('-'));
            demoMenuLi.children('.menu-a').text(responseData[item].categoryName);
            $('#menu-ul').append(demoMenuLi);
        });

        /* menu click function */
        $('.menu-a').click(function () {
            $('.menu-li').removeClass('menu-li-active');
            $(this).parents('.menu-li').addClass('menu-li-active');
            let category = $(this).attr('id');
            displayPosts(`${publishedPostsUri}/filter?date=henry&category=${category}&searchString=H&isDraft=false`, category, 'H');
        });

        /* determine the request link to render the category */
        if (((requestHashArray.length == 1) && (requestHashArray[0] !== '')) || ((requestHashArray.length == 2) && (requestHashArray[1] == ''))) {
            requestLink = requestHashArray[0].slice(1);
            $(`#${requestLink}`).click();
        }
        else if (((requestHashArray.length == 3) && (requestHashArray[1] !== '')) || ((requestHashArray.length == 4) && (requestHashArray[3] == ''))) {
            $(requestHashArray[0]).parents('.menu-li').addClass('menu-li-active');
            getSpecificPost(requestHashArray[1]);
        }
        else {
            displayPosts(`${publishedPostsUri}?isDraft=false`,'henry', 'H');
        }
    }).catch(error => console.error('Unable to get category: ' + error));

    $(window).scroll(function () {
        let stickyTop = $('#menu-div').offset().top;
        if (stickyTop > 389) {
            $('#menu-div').find('.menu-a').css({
                'font-size': 'initial',
                'padding': '.5rem .5rem'
            });
        }
        else {
            $('#menu-div').find('.menu-a').css({
                'font-size': 'large',
                'padding': '1rem .5rem'
            });
        }
    });

    /* search input animation and function */
    $('.search-div').find('input').focusin(function () {
        $('.search-div').addClass('search-div-focus');
    });
    $('.search-div').find('input').focusout(function () {
        $('.search-div').removeClass('search-div-focus');
    });

    $('#search-button').click(function () {
        $('.menu-li').removeClass('menu-li-active');
        let searchString = $.trim($('#search-input').val().toLowerCase());
        if (searchString.length > 0) {
            displayPosts(`${publishedPostsUri}/filter?date=henry&category=henry&searchString=${searchString}&isDraft=false`, 'henry', searchString);
        }
        else {
            return;
        }
    });

    /* detect search input */
    $('#search-input').keypress(function () {
        if (event.keyCode === 13) {
            $('#search-button').click();
        }
    });

    /* recent posts function*/
    $.get(`${publishedPostsUri}/Sort?sortOrder=DisplayModifiedTime&isDraft=false`, function (responseData) {
        $('#recent-posts-ul').empty();
        $.each(responseData, function (item) {
            let demoRecentPostLi = $('#demo-recent-posts-ul').find('.recent-posts-li').first().clone(true);
            let postId = responseData[item].id;
            let postTitle = responseData[item].postTitle;
            let postCategory = responseData[item].postCategory;

            let linkTitle = '';

            if (postTitle.split(' ').length > 9) {
                linkTitle = postTitle.split(' ').slice(0, 9).join('-') + '...';
            }
            else {
                linkTitle = postTitle.split(' ').join('-');
            }

            demoRecentPostLi.find('.recent-posts-a').attr('href', `#${postCategory}/${postId}/${linkTitle}/`);
            demoRecentPostLi.find('.recent-posts-a').text(postTitle);

            $('#recent-posts-ul').append(demoRecentPostLi);
        });

        $('.recent-posts-a').click(function () {
            displaySpecificPost($(this));
        });

    }).catch(error => console.error('Unable to get recent post: ' + error));

    /* animation of back to top div */
    $(window).scroll(function () {
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

    /* footer function */
    let today = new Date();
    let year = today.getFullYear() > 2020 ? '2020 - ' + today.getFullYear() : '2020 - ';
    $('#copyright').text(year);

});