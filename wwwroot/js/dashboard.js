'use strict'

/* parameter */
const categoriesUri = window.location.origin + '/api/Categories';
const siteOptionsUri = window.location.origin + '/api/SiteOptions';
const publishedPostsUri = window.location.origin + '/api/PublishedPosts';
const aboutPageUri = window.location.origin + '/api/AboutPage';
const userManagementUri = window.location.origin + '/api/UserManagement';

const access = JSON.parse(localStorage.getItem('access'));

if (access === null) {
    window.location.assign(window.location.origin + '/en/login/');
}

let decodedToken = jwt_decode(access.token);
const name = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].toLowerCase();

/* regular functions */
function renderResultTip(category, status, message) {
    let counts = $('#result-tip').find('.tip-item').length;
    let categoryExists = $('#result-tip').find(`#${category}`).length;

    if (counts > 2) {
        $('#result-tip').find('.tip-item').first().stop().slideUp(function () {
            $(this).remove();
        });
    }

    if (categoryExists === 0) {
        let demoTip = $('#demo-tip').clone(true);
        demoTip.attr('id', category);

        function process(status, message) {
            demoTip.find('.status').addClass(status);
            demoTip.find('.status').text(status);
            demoTip.find('.tip-item-body').text(message);
            $('#result-tip').append(demoTip);
            demoTip.fadeIn(250).delay(5000).slideUp(function () {
                $(this).remove();
            });

            demoTip.find('.close').click(function () {
                demoTip.stop().fadeOut(function () {
                    $(this).remove();
                });
            });
        }

        switch (status) {
            case 'success':
                process('success', message);
                break;
            case 'error':
                process('error', message);
                break;
            default:
                process('notice', message);
                break;
        }
    }
}

function renderMenu(data) {
    $('#menu-main-ul').empty();

    $.each(data, function (index, value) {
        let demoMenuMainLi = $('#demo-menu-li').clone(true);

        demoMenuMainLi.removeAttr('id');
        demoMenuMainLi.attr({
            'menu-id': value.id,
            'sequence-id': value.sequenceNumber,
        });
        demoMenuMainLi.find('.category-name').text(value.categoryName);
        demoMenuMainLi.find('.category-name').attr('previous-category', value.categoryName);

        $('#menu-main-ul').append(demoMenuMainLi);
    });
}

function getFirstLineOfPost() {

    let firstLine = $('#post-editor');
    while (firstLine[0] !== undefined) {
        firstLine = firstLine[0].childNodes[0];
    }
    
    return $(firstLine).text();
}

function sortByDate(isDraft) {
    $('#all-dates').find('.custom-option').remove();
    $.ajax({
        type: 'GET',
        url: `${publishedPostsUri}/date?isDraft=${isDraft}`,
        headers: {
            'Authorization': 'Bearer ' + access.token,
        },
        success: function (responseData) {
            $.each(responseData, function (index, value) {
                let newOption = $('<option class="custom-option" value="' + value.displayDate + '">' + value.displayDate + '</option>');
                $('#all-dates').append(newOption);
            });
        },
    }).catch(error => console.error('Unable to get display date: ' + error));
}

function sortByCategory(isDraft) {
    $('#all-categories').find('.custom-option').remove();
    $.ajax({
        type: 'GET',
        url: `${publishedPostsUri}/category?isDraft=${isDraft}`,
        headers: {
            'Authorization': 'Bearer ' + access.token,
        },
        success: function (responseData) {
            let categories = '';
            $.each(responseData, function (index, value) {
                categories += value + ',';
                return categories;
            });
            $('#category-string').text(categories);

            $.ajax({
                type: 'GET',
                url: categoriesUri,
                headers: {
                    'Authorization': 'Bearer ' + access.token,
                },
                success: function (responseData) {
                    let allCategories = $('#category-string').text();
                    $.each(responseData, function (index, value) {
                        if (allCategories.includes(value.categoryName)) {
                            let newOption = $('<option class="custom-option" value="' + value.categoryName + '">' + value.categoryName + '</option>');
                            $('#all-categories').append(newOption);
                        }
                    });
                },
            }).catch(error => console.error('Unable to get category: ' + error));
        },
    }).catch(error => console.error('Unable to sort category: ' + error));
}

function dashboardGetPosts(isDraft) {
    $('#post-loading').css('display', 'flex');
    $('#dashboard-posts-content-tbody').empty();

    $.get(`${publishedPostsUri}?isDraft=${isDraft}`, function (responseData) {
        $('#post-loading').hide();
        $('#posts-filtered-number').text(responseData.length + ' items');

        $.each(responseData, function (index, value) {
            let demoPost = $('#demo-post').clone(true);

            let postTitle = value.postTitle;
            let linkTitle = '';

            if (postTitle.split(' ').length > 9) {
                linkTitle = postTitle.split(' ').slice(0, 9).join('-') + '...';
            }
            else {
                linkTitle = postTitle.split(' ').join('-');
            }

            demoPost.removeAttr('id');
            demoPost.attr('post-id', value.id);
            demoPost.find('.title-strong-a').text(postTitle);
            demoPost.find('.title-strong-a').attr('href', `${window.location.origin}/en/#${value.postCategory}/${value.id}/${linkTitle}/`);
            demoPost.find('.author-cell').text(value.postAuthor);
            demoPost.find('.categories-cell').text(value.postCategory);
            demoPost.find('.published-time').text((value.displayPublishedTime).split(' ')[0]);
            demoPost.find('.published-time').attr('title', value.displayPublishedTime);
            demoPost.find('.modified-time').text((value.displayModifiedTime).split(' ')[0]);
            demoPost.find('.modified-time').attr('title', value.displayModifiedTime);
            let postCategoryArray = ((value.postCategory).toLowerCase()).split(' ');
            let postCategoryString = postCategoryArray.join('-');
            demoPost.find('.edit-a').addClass('post-edit');
            demoPost.find('.edit-a').attr({
                'href': `#${postCategoryString}/${value.id}/edit-post/`,
                'post-id': value.id
            });
            demoPost.find('.post-delete-span').attr('post-id', value.id);

            if (index % 2 == 1) {
                demoPost.addClass('even-item');
            }

            $('#dashboard-posts-content-tbody').append(demoPost);
        });

        $('#dashboard-posts-content-table-div').hide().slideDown();
    }).catch(error => console.error('Unable to get post data: ' + error));
}

function filterPosts(date, category, searchString, isDraft) {
    $('#post-loading').css('display', 'flex');
    $('#dashboard-posts-content-tbody').empty();

    $.ajax({
        type: 'GET',
        url: `${publishedPostsUri}/filter?date=${date}&category=${category}&searchString=${searchString}&isDraft=${isDraft}`,
        success: function (responseData) {
            $('#post-loading').hide();
            $('#posts-filtered-number').text(responseData.length + ' items');

            $.each(responseData, function (index, value) {
                let demoPost = $('#demo-post').clone(true);

                let postTitle = value.postTitle;
                let linkTitle = '';

                if (postTitle.split(' ').length > 9) {
                    linkTitle = postTitle.split(' ').slice(0, 9).join('-') + '...';
                }
                else {
                    linkTitle = postTitle.split(' ').join('-');
                }

                demoPost.find('.title-strong-a').text(postTitle);
                demoPost.find('.title-strong-a').attr('href', `${window.location.origin}/en/#${value.postCategory}/${value.id}/${linkTitle}/`);
                demoPost.find('.author-cell').text(value.postAuthor);
                demoPost.find('.categories-cell').text(value.postCategory);
                demoPost.find('.published-time').text((value.displayPublishedTime).split(' ')[0]);
                demoPost.find('.published-time').attr('title', value.displayPublishedTime);
                demoPost.find('.modified-time').text((value.displayModifiedTime).split(' ')[0]);
                demoPost.find('.modified-time').attr('title', value.displayModifiedTime);
                let postCategoryArray = ((value.postCategory).toLowerCase()).split(' ');
                let postCategoryString = postCategoryArray.join('-');
                demoPost.find('.edit-a').addClass('post-edit');
                demoPost.find('.edit-a').attr({
                    'href': `#${postCategoryString}/${value.id}/edit-post/`,
                    'post-id': value.id
                });
                demoPost.find('.post-delete-span').attr('post-id', value.id);

                if (index % 2 == 1) {
                    demoPost.addClass('even-item');
                }

                $('#dashboard-posts-content-tbody').append(demoPost);
            });

            $('#dashboard-posts-content-table-div').hide().slideDown();
        },
    }).catch(error => console.error('Unable to get post data: ' + error));
}

function getNumbersOfPosts() {
    $.ajax({
        type: 'GET',
        url: `${publishedPostsUri}/numbers`,
        headers: {
            'Authorization': 'Bearer ' + access.token,
        },
        success: function (responseData) {
            $('#number-of-published-posts').text(`(${responseData.numberOfPublishedPosts})`);
            $('#number-of-draft-posts').text(`(${responseData.numberOfDraftPosts})`);
        },
    }).catch(error => console.error('Unable to get posts numbers: ' + error));
}

function addNewPost(inputData, preview) {
    $.ajax({
        type: 'POST',
        url: publishedPostsUri,
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + access.token,
        },
        data: JSON.stringify(inputData),
        success: function (responseData) {
            $('#edit-loading-block').removeClass('loading-block');

            let linkTitle = '';

            if (((responseData.postTitle).split(' ')).length > 9) {
                linkTitle = responseData.postTitle.split(' ').slice(0, 9).join('-') + '...';
            }
            else {
                linkTitle = responseData.postTitle.split(' ').join('-');
            }

            if (preview) {
                renderResultTip('post-add-success', 'success', 'Saved post to draft.');
                window.open(`${window.location.origin}/en/#draft/${responseData.id}/${linkTitle}`);
            }
            else {
                if (responseData.isDraft) {
                    renderResultTip('post-add-success', 'success', 'Saved post to draft.');
                }
                else {
                    renderResultTip('post-add-success', 'success', 'Published new post. Redirect to post summary in 3 seconds.');
                    $(this).delay(3000).show(function () {
                        $('#dashboard-left-menu-posts').click();
                    });
                }
            }
        },
    }).catch(error => console.error('Unable to add new post: ' + error));
}

function updatePost(inputData, itemId, preview) {

    let linkTitle = '';

    if (((inputData.postTitle).split(' ')).length > 9) {
        linkTitle = inputData.postTitle.split(' ').slice(0, 9).join('-') + '...';
    }
    else {
        linkTitle = inputData.postTitle.split(' ').join('-');
    }

    $.ajax({
        type: 'PUT',
        url: `${publishedPostsUri}/${itemId}`,
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + access.token,
        },
        data: JSON.stringify(inputData),
        success: function () {
            $('#edit-loading-block').removeClass('loading-block');
            if (preview) {
                renderResultTip('post-update-success', 'success', 'Saved post to draft.');
                window.open(`${window.location.origin}/en/#draft/${itemId}/${linkTitle}`);
            }
            else {
                if (inputData.isDraft) {
                    renderResultTip('post-update-success', 'success', 'Saved post to draft.');
                }
                else {
                    renderResultTip('post-update-success', 'success', 'Published new post. Redirect to post summary in 3 seconds.');
                    $(this).delay(3000).show(function () {
                        $('#dashboard-left-menu-posts').click();
                    });
                }
            }
        },
    }).catch(error => console.error('Unable to update post: ' + error));
}

function updateAbout(inputData) {
    $.ajax({
        type: 'PUT',
        url: `${aboutPageUri}/${inputData.id}`,
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + access.token,
        },
        data: JSON.stringify(inputData),
        success: function () {
            renderResultTip('about-update-success', 'success', 'About page was updated.');
            $('#edit-loading-block').removeClass('loading-block');
        },
    }).catch(error => console.error('Unable to update about page: ' + error));
}

function renderUsers(data) {
    $('#dashboard-users-content--tbody').empty();

    $.each(data, function (index, value) {
        let demoUserTr = $('#demo-user-tr').clone(true);

        demoUserTr.removeAttr('id');
        demoUserTr.find('.username-strong-span').text(value.username);
        demoUserTr.find('.email-address').attr('href', `mailto:${value.email}`).text(value.email);
        demoUserTr.find('.userrole-cell').text(value.userRole);
        demoUserTr.find('.postnumber-cell').text(value.postNumber);
        demoUserTr.find('.edit-a').attr('href', '#profile/');

        if (index % 2 == 1) {
            demoUserTr.addClass('even-item');
        }

        $('#dashboard-users-content--tbody').append(demoUserTr);
    });
}

function getNumberOfUsers() {
    $.ajax({
        type: 'GET',
        url: `${userManagementUri}/UserCount`,
        headers: {
            'Authorization': 'Bearer ' + access.token,
        },
        success: function (responseData) {
            $('#number-of-all-users').text(`(${responseData.alluser})`);
            $('#number-of-administrator-users').text(`(${responseData.admin})`);
            $('#number-of-manager-users').text(`(${responseData.manager})`);
            $('#number-of-subscriber-users').text(`(${responseData.subscriber})`);
        }
    }).catch(error => console.error('Unable to get user count: ' + error));
}

function getUsers(option, userRole, username) {
    $('#dashboard-users-content-table-div').hide();
    $('#user-loading').css('display', 'flex');

    switch (option) {
        case 'filterUser':
            $.ajax({
                type: 'POST',
                url: `${userManagementUri}/FilterUser`,
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Bearer ' + access.token,
                },
                data: JSON.stringify({ 'userRole': userRole }),
                success: function (responseData) {
                    renderUsers(responseData);
                    $('#user-loading').hide();
                    $('#dashboard-users-content-table-div').slideDown();

                }
            }).catch(error => console.error('Unable to get users: ' + error));
            break;
        case 'searchUser':
            $.ajax({
                type: 'POST',
                url: `${userManagementUri}/SearchUser`,
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Bearer ' + access.token,
                },
                data: JSON.stringify({ 'username': username }),
                success: function (responseData) {
                    renderUsers(responseData);
                    $('#user-loading').hide();
                    $('#dashboard-users-content-table-div').slideDown();
                },
                error: function (jqXHR) {
                    renderResultTip('user-search-error', 'error', jqXHR.responseJSON.message);
                    $('#user-loading').hide();
                }
            }).catch(error => console.error('Unable to search user: ' + error));
            break;
        default:
            $.ajax({
                type: 'GET',
                url: `${userManagementUri}/GetUsers`,
                headers: {
                    'Authorization': 'Bearer ' + access.token,
                },
                success: function (responseData) {
                    renderUsers(responseData);
                    $('#user-loading').hide();
                    $('#dashboard-users-content-table-div').slideDown();
                }
            }).catch(error => console.error('Unable to get users: ' + error));
    }
}

function updateCategoryOfPost(previousCategory, newCategory) {
    $.ajax({
        type: 'PUT',
        url: `${publishedPostsUri}/UpdatePostCategory?previousCategoryName=${previousCategory}&newCategoryName=${newCategory}`,
        success: function () {
            renderResultTip('menu-success', 'success', 'Category was updated.');
            $('#save-menu-loading').hide();
        },
    }).catch(error => console.error('Unable to update post: ' + error));
}

function addOrUpdatePost(isDraft, preview) {
    let postId = parseInt($('#post-edit-title').attr('edit-id'));
    let postTitle = $.trim($('#post-edit-title').text());
    let modified = $('#post-edit-title').attr('modified');
    let postOriginalFirstLine = '';
    let encodedPostFirstLine = '';
    let postOriginalContent = $('#post-editor');
    postOriginalContent.find('a').attr('target', '_blank')
    let postOriginalContentHtml = $.trim(postOriginalContent.html());
    let postOriginalContentText = $.trim($('#post-editor').text());
    let postContentDiv = '<div>' + postOriginalContentHtml + '</div>';
    let encodedPostContent = '';
    let postAuthor = $('#profile-name').text();
    let requestHash = window.location.hash
    let postCategoryArray = (requestHash.substring(1, requestHash.indexOf('/'))).split('-');
    let postCategoryString = postCategoryArray.join(' ');


    if ((postTitle.length > 0) && (postOriginalContentText.length > 0)) {

        if (modified === 'true') {
            $('#edit-loading-block').addClass('loading-block');
            $('#post-edit-title').attr('modified', 'false');

            postOriginalFirstLine = $.trim(getFirstLineOfPost());
            encodedPostFirstLine = Base64.encode(postOriginalFirstLine);

            if ($('#post-editor')[0].firstChild.nodeName == '#text') {
                encodedPostContent = Base64.encode(postContentDiv);
            }
            else {
                encodedPostContent = Base64.encode(postOriginalContentHtml);
            }

            if ($('#post-edit-title').hasClass('modify-post')) {
                postAuthor = $('#post-edit-title').attr('author-name');
                postCategoryString = $('#post-edit-title').attr('category-name');
                let publishedTime = $('#post-edit-title').attr('published-time');

                let jsonData = {
                    'id': postId,
                    'postTitle': postTitle,
                    'postFirstLine': encodedPostFirstLine,
                    'postContent': encodedPostContent,
                    'postAuthor': postAuthor,
                    'postCategory': postCategoryString,
                    'isDraft': isDraft,
                    'publishedTime': publishedTime,
                };

                updatePost(jsonData, postId, preview);
            }
            else if ($('#post-edit-title').hasClass('modify-about')) {
                let jsonData = {
                    'id': postId,
                    'title': postTitle,
                    'content': encodedPostContent,
                }

                updateAbout(jsonData);
            }
            else {

                let jsonData = {
                    'postTitle': postTitle,
                    'postFirstLine': encodedPostFirstLine,
                    'postContent': encodedPostContent,
                    'postAuthor': postAuthor,
                    'postCategory': postCategoryString,
                    'isDraft': isDraft,
                };

                addNewPost(jsonData, preview);
            }
        }
        else {
            renderResultTip('post-no-change', 'notice', 'No changes have been made.');
        }
    }
    else {
        if (postTitle.length == 0) {
            renderResultTip('post-title-empty', 'notice', 'Post title is empty.');
        }

        if (postOriginalContentText.length == 0) {
            renderResultTip('post-content-empty', 'notice', 'Post content is empty.');
        }
    }
    
}

/* start here */
$(function () {
    /* validate access */
    if (access !== null) {
        $.ajax({
            type: 'GET',
            url: `${userManagementUri}/ValidateToken`,
            headers: {
                'Authorization': 'Bearer ' + access.token,
            },
            success: function () {
/*-----------------------*/
                /* site title */
                $.get(siteOptionsUri, function (responseData) {
                    $('title').text('Dashboard — ' + responseData[0].siteTitle);
                });

                $('[data-toggle="popover"]').popover();

                $('#profile-name').text(name);

                if (userRole === 'subscriber') {
                    $('.dashboard-left-menu-li').hide();
                    $('#dashboard-left-menu-profile').parents('.dashboard-left-menu-li').show();
                }

                if (userRole === 'manager') {
                    $('#dashboard-left-menu-about').parents('.dashboard-left-menu-li').hide();
                    $('#dashboard-left-menu-users').parents('.dashboard-left-menu-li').hide();
                    $('#dashboard-left-menu-settings').parents('.dashboard-left-menu-li').hide();
                }

                $('#statis-content').show();
                $('#dashboard-loading-div').hide();

                $('#log-out-div').click(function () {
                    localStorage.removeItem('access');
                    window.location.assign(window.location.origin + '/en/login/');
                });

                /* dashboard left menu animation */
                $('.dashboard-left-menu-a-origin').click(function () {
                    let contentId = $(this).attr('content-id');
                    $('.dashboard-left-menu-a-origin').addClass('dashboard-left-menu-a').removeClass('dashboard-left-menu-a-active');
                    $('.dashboard-menu-arrow').hide();
                    $(this).addClass('dashboard-left-menu-a-active').removeClass('dashboard-left-menu-a');
                    $(this).children('.dashboard-menu-arrow').show();
                    $('.dashboard-content').hide();
                    $(`#${contentId}`).show();
                });

                /* dashboard left menu's menu function */
                $('#dashboard-left-menu-menu').click(function () {
                    $('#menu-loading-div').css('display', 'flex');
                    $('#menu-content-div').hide();
                    $.ajax({
                        type: 'GET',
                        url: categoriesUri,
                        success: function (data) {
                            renderMenu(data);

                            $('#menu-loading-div').hide();
                            $('#menu-content-div').slideDown();
                        }
                    }).catch(error => console.error('Unable to get data from category uri: ' + error));
                });

                /* menu expand button click animation */
                $('.expand-button').click(function () {
                    let menuMainLi = $(this).parents('.menu-main-li');
                    let isClosed = $(this).hasClass('expand-button-close');

                    menuMainLi.find('.item-manage-div').slideToggle();

                    if (isClosed) {
                        $(this).parent('.expand-button-div').addClass('dropup');
                        $(this).addClass('expand-button-open').removeClass('expand-button-close');
                        menuMainLi.find('.category-input').val(menuMainLi.find('.category-name').text());

                        menuMainLi.find('.category-input').focus();
                    }
                    else {
                        $(this).parent('.expand-button-div').removeClass('dropup');
                        $(this).addClass('expand-button-close').removeClass('expand-button-open');
                    }
                });

                /* category input function */
                $('.category-input').on('input propertychange', function () {
                    let inputValue = $.trim($(this).val());
                    $(this).parents('.menu-main-li').find('.category-name').text(inputValue);
                    $('#save-menu-button').attr('modified', 'true');
                });

                /* remove button click animation and function */
                $('.category-remove-action').click(function () {
                    $(this).parents('.menu-main-li').slideUp(function () {
                        let itemId = parseInt($(this).attr('menu-id'));
                        if (itemId == 'none') {
                            $(this).remove();
                        }
                        else {
                            $(this).remove();

                            $.ajax({
                                type: 'DELETE',
                                url: `${categoriesUri}/${itemId}`,
                                headers: {
                                    'Authorization': 'Bearer ' + access.token,
                                },
                                success: function () {
                                    renderResultTip('menu-delete-success', 'success', 'Category was deleted.');
                                    $('#save-menu-button').attr('modified', true);
                                },
                                error: function () {
                                    renderResultTip('menu-delete-error', 'error', 'Delete failed.');
                                }
                            }).catch(error => console.error('Unable to delete item from category uri: ' + error));
                        }
                    });
                });

                /* cancel button click animation */
                $('.category-cancel-action').click(function () {
                    $(this).parents('.menu-main-li').find('.expand-button').click();
                });

                /* menu add new button function */
                $('#menu-add-new-button').click(function () {
                    let demoMenuMainLi = $('#demo-menu-li').clone(true);
                    demoMenuMainLi.removeAttr('id');
                    demoMenuMainLi.attr('menu-id', 'none');
                    demoMenuMainLi.find('.category-name').text('New Category');
                    demoMenuMainLi.appendTo($('#menu-main-ul'));
                    $('#save-menu-button').attr('modified', 'true');
                });

                /* menu item draggable */
                let menuMainUl = document.getElementById('menu-main-ul');
                let liSortable = Sortable.create(menuMainUl, {
                    animation: 150,
                    ghostClass: 'menu-main-li-drag',
                });

                /* detect changes */
                $('#menu-main-ul').on('dragend', function () {
                    $('#save-menu-button').attr('modified', 'true');
                });

                $('#post-edit-title').on('input propertychange', function () {
                    $('#post-edit-title').attr('modified', 'true');
                });

                $('#post-editor').on('input propertychange', function () {
                    $('#post-edit-title').attr('modified', 'true');
                });

                /* save menu button function */
                $('#save-menu-button').click(function () {
                    $(this).attr('disabled', true).delay(2000).show(function () {
                        $(this).removeAttr('disabled')
                    });

                    let i = 1;
                    let modified = $('#save-menu-button').attr('modified');

                    if (modified === 'true') {
                        $('#save-menu-loading').css('display', 'flex');
                        $('#save-menu-button').attr('modified', 'false');
                        $('#menu-main-ul').find('.menu-main-li').each(function (index, value) {
                            let targetMenuLi = $(this);
                            targetMenuLi.attr('sequence-id', i++);
                            let itemId = targetMenuLi.attr('menu-id');
                            let itemName = $.trim((targetMenuLi.find('.category-name').text()).toLowerCase());
                            let itemSequenceId = parseInt(targetMenuLi.attr('sequence-id'));
                            if (itemId == 'none') {
                                let jsonData = {
                                    'categoryName': itemName,
                                    'sequenceNumber': itemSequenceId,
                                };

                                $.ajax({
                                    type: 'POST',
                                    url: categoriesUri,
                                    contentType: 'application/json',
                                    headers: {
                                        'Authorization': 'Bearer ' + access.token,
                                    },
                                    data: JSON.stringify(jsonData),
                                    success: function (responseData) {
                                        renderResultTip('menu-success', 'success', 'Category was added.');
                                        $('#save-menu-loading').hide();
                                        targetMenuLi.attr('menu-id', responseData.id);
                                    },
                                    error: function (jqXHR) {
                                        renderResultTip('menu-error', 'error', jqXHR.responseJSON.message);
                                        if (jqXHR.responseJSON.message.includes('exists')) {
                                            $(value).find('.item-summary-div').addClass('item-exists').delay(3000).show(function () {
                                                $(this).removeClass('item-exists')
                                            });
                                        }
                                        $('#save-menu-loading').hide();
                                    }
                                }).catch(error => console.error('Unable to add new item to category uri: ' + error));
                            }
                            else {
                                let previousCategoryName = $.trim((targetMenuLi.find('.category-name').attr('previous-category')).toLowerCase());
                                let jsonData = {
                                    'id': parseInt(itemId),
                                    'categoryName': itemName,
                                    'sequenceNumber': itemSequenceId,
                                };

                                $.ajax({
                                    type: 'PUT',
                                    url: `${categoriesUri}/${parseInt(itemId)}`,
                                    contentType: 'application/json',
                                    headers: {
                                        'Authorization': 'Bearer ' + access.token,
                                    },
                                    data: JSON.stringify(jsonData),
                                    success: function () {
                                        if (previousCategoryName !== itemName) {
                                            updateCategoryOfPost(previousCategoryName, itemName);
                                        }
                                        else {
                                            renderResultTip('menu-success', 'success', 'Category was updated.');
                                            $('#save-menu-loading').hide();
                                        }
                                    },
                                    error: function (jqXHR) {
                                        renderResultTip('menu-error', 'error', jqXHR.responseJSON.message);
                                        $('#save-menu-loading').hide();
                                    }
                                }).catch(error => console.error('Unable to update item in category uri: ' + error));
                            }
                        });
                    }
                    else {
                        renderResultTip('menu-no-change', 'notice', 'No changes have been made.');
                    }
                });

                /* dashboard left menu's post function */
                $('#dashboard-left-menu-posts').click(function () {
                    $('#published-posts').click();
                });

                /*post add new button animation and function */
                $('#add-new-post').click(function () {
                    $('.dashboard-content').hide();
                    $('#dashboard-choose-category').show();
                    $.get(categoriesUri, function (responseData) {
                        $('#category-list').empty();
                        $.each(responseData, function (item) {
                            let demoCategoryListLi = $('#demo-category-list-li').clone(true);
                            let categoryNameArray = ((responseData[item].categoryName).toLowerCase()).split(' ');
                            let categoryNameString = categoryNameArray.join('-');
                            demoCategoryListLi.find('.dashboard-choose-category-item').attr('href', `#${categoryNameString}/add-new-post/`);
                            demoCategoryListLi.find('.dashboard-choose-category-item').text(responseData[item].categoryName);
                            $('#category-list').append(demoCategoryListLi);
                        });
                    });
                });

                /* choose category add new function */
                $('#add-new-category').click(function () {
                    $('#dashboard-left-menu-menu').click();
                });

                /* choose category new post animation and function */
                $('.dashboard-choose-category-item').click(function () {
                    $('.dashboard-content').hide();
                    $('#post-operation').text('Add Post');
                    $('#post-save-draft-button').removeAttr('disabled');
                    $('#post-save-draft-button').css('opacity', '1');
                    $('#post-preview-button').removeAttr('disabled');
                    $('#post-preview-button').css('opacity', '1');
                    $('#post-save-draft-button').show();
                    $('#post-publish-button').text('Publish');
                    $('#post-edit-title').removeClass('modify-post');
                    $('#post-edit-title').removeClass('modify-about');
                    $('#post-edit-title').removeAttr('edit-id');
                    $('#post-edit-title').removeAttr('author-name');
                    $('#post-edit-title').removeAttr('category-name');
                    $('#post-edit-title').removeAttr('published-time');

                    $('#dashboard-edit-post-header-div').hide();
                    $('#dashboard-edit-page-outer-div').hide();
                    $('#dashboard-edit-page-content').show();
                    $('#edit-loading').hide();

                    $('#dashboard-edit-post-header-div').slideDown();
                    $('#dashboard-edit-page-outer-div').slideDown();
                    $('#post-edit-title').empty().focus();
                    $('#post-editor').empty();
                });

                /* dashboard search button function */
                $('#post-search-button').click(function () {
                    $(this).attr('disabled', true).delay(1000).show(function () {
                        $(this).removeAttr('disabled')
                    });
                    let searchString = $.trim($('#post-search-input').val().toLowerCase());

                    if (searchString.length > 0) {
                        filterPosts('henry', 'henry', searchString, false);
                    }
                    else {
                        renderResultTip('post-search', 'notice', 'Enter a character.');
                    }
                });

                /* post search enter */
                $('#post-search-input').keypress(function (event) {
                    if (event.keyCode === 13) {
                        $('#post-search-button').click();
                    }
                });

                /*number row a click animation*/
                $('.number-a').click(function () {
                    $('.number-a').removeClass('number-a-active');
                    $(this).addClass('number-a-active');
                });

                /* list published posts */
                $('#published-posts').click(function () {
                    getNumbersOfPosts();
                    sortByDate(false);
                    sortByCategory(false);
                    dashboardGetPosts(false);
                });

                /* list draft posts */
                $('#draft-posts').click(function () {
                    getNumbersOfPosts();
                    sortByDate(true);
                    sortByCategory(true);
                    dashboardGetPosts(true);
                });

                /* bulk select post */
                $('#posts-bulk-checkbox').click(function () {
                    let checkboxes = $('.post-checkbox');

                    if ($(this).is(':checked')) {
                        checkboxes.prop('checked', true);
                    }
                    else {
                        checkboxes.prop('checked', false);
                    }
                });

                /* bulk post action */
                $('#posts-apply-button').click(function () {
                    $(this).attr('disabled', true).delay(1000).show(function () {
                        $(this).removeAttr('disabled')
                    });
                    if ($('#bulk-delete-posts').val().toLowerCase() === 'delete') {
                        let hasChecked = $('#dashboard-posts-content-tbody').find('input:checked').length;

                        if (hasChecked > 0) {
                            $('#dashboard-posts-content-tbody').find('input:checked').each(function (index, value) {

                                let itemId = parseInt($(value).parents('.item-summary').attr('post-id'));
                                $(value).parents('.item-summary').remove();

                                $.ajax({
                                    type: 'DELETE',
                                    url: `${publishedPostsUri}/${itemId}`,
                                    headers: {
                                        'Authorization': 'Bearer ' + access.token,
                                    },
                                    success: function (responseData) {
                                        getNumbersOfPosts();
                                        renderResultTip('post-bulk-delete-success', 'success', 'Post was deleted.');
                                        sortByDate(responseData.isDraft);
                                        sortByCategory(responseData.isDraft);
                                    },
                                    error: function () {
                                        renderResultTip('post-bulk-delete-error', 'error', 'Delete failed.');
                                    }
                                }).catch(error => console.error('Unable to delete post: ' + error));
                            });
                        }
                        else {
                            renderResultTip('post-select', 'notice', 'Select a post.');
                        }
                    }
                    else {
                        renderResultTip('option-select', 'notice', 'Select an option.');
                    }
                });

                /* filter post */
                $('#posts-filter-button').click(function () {
                    $(this).attr('disabled', true).delay(1000).show(function () {
                        $(this).removeAttr('disabled')
                    });

                    let selectedDate = $('#all-dates').val();
                    let selectedCategory = $('#all-categories').val();
                    let isDraft = false;

                    if ($('#draft-posts').hasClass('number-a-active')) {
                        isDraft = true;
                    }

                    filterPosts(selectedDate, selectedCategory, 'H', isDraft);
                });

                /* add new post */
                $('#number-of-all-posts').click(function () {
                    for (let i = 1; i < 21; i++) {
                        let postTitle = "post-" + i;
                        let postFirstLine = Base64.encode('post-' + i + '-content');
                        let postContent = Base64.encode('post-' + i + '-content');
                        let postAuthor = 'Henry';
                        let postCategory = 'category' + (i % 5);

                        if ((i % 5) == 0) {
                            postCategory = 'category5';
                        }

                        let jsonData = {
                            'postTitle': postTitle,
                            'postFirstLine': postFirstLine,
                            'postContent': postContent,
                            'postAuthor': postAuthor,
                            'postCategory': postCategory,
                            'isDraft': false,
                        }

                        addNewPost(jsonData);
                    }
                });


                /* tr hover animation */
                $('.item-summary').hover(
                    function () {
                        $(this).find('.actions-div').css('opacity', '1');
                    },
                    function () {
                        $(this).find('.actions-div').css('opacity', '0');
                    }
                );

                /* post item edit function */
                $('.edit-a').click(function () {
                    if ($(this).hasClass('post-edit')) {
                        $('.dashboard-content').hide();
                        $('#post-operation').text('Edit Post');
                        $('#post-save-draft-button').removeAttr('disabled');
                        $('#post-save-draft-button').css('opacity', '1');
                        $('#post-preview-button').removeAttr('disabled');
                        $('#post-preview-button').css('opacity', '1');
                        $('#post-publish-button').text('Update');
                        $('#edit-loading').css('display', 'flex');
                        $('#dashboard-edit-post-header-div').hide();
                        $('#dashboard-edit-page-outer-div').hide();
                        $('#dashboard-edit-page-content').show();
                        let itemId = parseInt($(this).attr('post-id'));
                        $('#post-edit-title').removeClass('modify-about').addClass('modify-post');
                        $('#post-edit-title').attr('edit-id', itemId);

                        $.get(`${publishedPostsUri}/${itemId}`, function (responseData) {
                            $('#edit-loading').hide();
                            $('#post-edit-title').attr('author-name', responseData.postAuthor);
                            $('#post-edit-title').attr('category-name', responseData.postCategory);
                            $('#post-edit-title').attr('published-time', responseData.publishedTime);
                            $('#post-edit-title').empty().text(responseData.postTitle);
                            let decodedPostConetent = Base64.decode(responseData.postContent);
                            $('#post-editor').empty().append(decodedPostConetent);

                            $('#dashboard-edit-post-header-div').slideDown();
                            $('#dashboard-edit-page-outer-div').slideDown();
                        });
                    }
                    else {
                        let targetItem = $(this).parents('.item-summary');
                        let username = targetItem.find('.username-strong-span').text();
                        $('.dashboard-left-menu-a-origin').addClass('dashboard-left-menu-a').removeClass('dashboard-left-menu-a-active');
                        $('.dashboard-menu-arrow').hide();
                        $('#dashboard-left-menu-profile').addClass('dashboard-left-menu-a-active').removeClass('dashboard-left-menu-a');
                        $('#dashboard-left-menu-profile').children('.dashboard-menu-arrow').show();
                        $('.dashboard-content').hide();
                        $('.profile-input').addClass('loading-input');
                        $('#dashboard-profile-content').show();

                        $.ajax({
                            type: 'POST',
                            url: `${userManagementUri}/GetUserProfile`,
                            contentType: 'application/json',
                            headers: {
                                'Authorization': 'Bearer ' + access.token,
                            },
                            data: JSON.stringify({ 'username': username }),
                            success: function (responseData) {
                                $('#user-login').val(responseData.username);
                                $('#user-email').val(responseData.email);
                                $('#user-role').val(responseData.userRole);
                                $('#post-count').val(responseData.postNumber);
                                $('#current-password').val('');
                                $('#new-password').val('');
                                $('#confirm-password').val('');
                                $('.profile-input').removeClass('loading-input');
                            }
                        }).catch(error => console.error('Unable to get user profile: ' + error));
                    }
                });

                /* post item delete animation and function*/
                $('.post-delete-span').click(function () {
                    let targetPost = $(this).parents('.item-summary');
                    let itemId = parseInt($(this).attr('post-id'));
                    targetPost.remove();

                    $.ajax({
                        type: 'DELETE',
                        url: `${publishedPostsUri}/${itemId}`,
                        headers: {
                            'Authorization': 'Bearer ' + access.token,
                        },
                        success: function (responseData) {
                            getNumbersOfPosts();
                            renderResultTip('post-delete-success', 'success', 'Post was deleted.');
                            sortByDate(responseData.isDraft);
                            sortByCategory(responseData.isDraft);
                        },
                        error: function () {
                            renderResultTip('post-delete-error', 'error', 'Deleted failed.');
                        }
                    }).catch(error => console.error('Unable to delete post: ' + error));
                });

                /* edit post action tool tip animation*/
                $('.post-content-action').tooltip();

                /* edit option hover animation */
                $('.post-item-hover').hover(
                    function () {
                        $(this).find('.post-item-tip').show(100);
                    },
                    function () {
                        $(this).find('.post-item-tip').hide(100);
                    }
                );

                /* post title animation */
                $(window).scroll(function () {
                    let stickyTop = $('.dashboard-edit-page-header-div').offset().top;
                    if (stickyTop >= 120) {
                        $('.post-title').css('font-size', '2rem');
                    }
                    else {
                        $('.post-title').css('font-size', '2.5rem');
                    }
                });

                /* post editor */
                $('#post-editor').wysiwyg();

                /* post content clean up function */
                $('#clean-up-content').click(function () {
                    $('#post-editor').empty();
                });

                /* edit item focus in animation */
                $('.post-item-focus').focusin(function () {
                    $('.post-content-main-div').removeClass('post-item-active');
                    $(this).parents('.post-content-main-div').addClass('post-item-active');
                });

                /* post save draft button function */
                $('#post-save-draft-button').click(function () {
                    $(this).attr('disabled', true).delay(2000).show(function () {
                        $(this).removeAttr('disabled')
                    });
                    addOrUpdatePost(true, false);
                });

                /* post preview button function */
                $('#post-preview-button').click(function () {
                    $(this).attr('disabled', true).delay(2000).show(function () {
                        $(this).removeAttr('disabled')
                    });
                    $('#post-edit-title').attr('modified', 'true');
                    addOrUpdatePost(true, true);
                });

                /* post publish button function */
                $('#post-publish-button').click(function () {
                    $(this).attr('disabled', true).delay(2000).show(function () {
                        $(this).removeAttr('disabled')
                    });
                    addOrUpdatePost(false, false);
                });

                /* dashboard left menu's about page function */
                $('#dashboard-left-menu-about').click(function () {
                    $('#post-operation').text('About Page');
                    $('#post-publish-button').text('Update');
                    $('#post-save-draft-button').attr('disabled', 'disabled');
                    $('#post-save-draft-button').css('opacity', '0');
                    $('#post-preview-button').attr('disabled', 'disabled');
                    $('#post-preview-button').css('opacity', '0');
                    $('#post-edit-title').removeClass('modify-post').addClass('modify-about');
                    $('#post-edit-title').removeAttr('author-name');
                    $('#post-edit-title').removeAttr('category-name');
                    $('#post-edit-title').removeAttr('published-time');

                    $('#edit-loading').css('display', 'flex');
                    $('#dashboard-edit-post-header-div').hide();
                    $('#dashboard-edit-page-outer-div').hide();
                    $('#dashboard-edit-page-content').show();

                    $.get(aboutPageUri, function (responseData) {
                        $('#edit-loading').hide();
                        $('#post-edit-title').attr('edit-id', responseData[0].id);
                        $('#post-edit-title').empty().text(responseData[0].title);
                        $('#post-editor').empty().append(Base64.decode(responseData[0].content));

                        $('#dashboard-edit-post-header-div').slideDown();
                        $('#dashboard-edit-page-outer-div').slideDown();
                    }).catch(error => console.error('Unable to get about page: ' + error));
                });


                /* dashboard left menu's user function */
                $('#dashboard-left-menu-users').click(function () {
                    $('#all-users').click();
                    getNumberOfUsers();
                });

                /* search user function */
                $('#user-search-button').click(function () {
                    $(this).attr('disabled', true).delay(2000).show(function () {
                        $(this).removeAttr('disabled')
                    });

                    let searchString = $.trim($('#user-search-input').val().toLowerCase());

                    if (searchString.length > 0) {
                        getUsers('searchUser', 'any', searchString);
                    }
                    else {
                        renderResultTip('user-search', 'notice', 'Enter a character.');
                    }
                });

                /* search user input */
                $('#user-search-input').keypress(function (event) {
                    if (event.keyCode === 13) {
                        $('#user-search-button').click();
                    }
                });

                /* all users animation and function */
                $('#all-users').click(function () {
                    getUsers();
                });

                /* admins animation and function */
                $('#administrator').click(function () {
                    getUsers('filterUser', 'Administrator');
                });

                /* managers animation and function */
                $('#manager').click(function () {
                    getUsers('filterUser', 'Manager');
                });

                /* subscribers animation and function */
                $('#subscriber').click(function () {
                    getUsers('filterUser', 'Subscriber');
                });

                /* bulk select user */
                $('#users-bulk-checkbox').click(function () {
                    let checkboxes = $('.user-checkbox');

                    if ($(this).is(':checked')) {
                        checkboxes.prop('checked', true);
                    }
                    else {
                        checkboxes.prop('checked', false);
                    }
                });

                /* bulk user action */
                $('#users-apply-button').click(function () {
                    $(this).attr('disabled', true).delay(1000).show(function () {
                        $(this).removeAttr('disabled')
                    });

                    if ($('#bulk-delete-users').val().toLowerCase() === 'delete') {
                        let hasChecked = $('#dashboard-users-content--tbody').find('input:checked').length;

                        if (hasChecked > 0) {
                            $('#dashboard-users-content--tbody').find('input:checked').each(function (index, value) {

                                let username = $(value).parents('.item-summary').find('.username-strong-span').text();
                                $(value).parents('.item-summary').remove();

                                $.ajax({
                                    type: 'DELETE',
                                    url: `${userManagementUri}/DeleteUser`,
                                    contentType: 'application/json',
                                    headers: {
                                        'Authorization': 'Bearer ' + access.token,
                                    },
                                    data: JSON.stringify({ 'username': username }),
                                    success: function (responseData) {
                                        renderResultTip('user-bulk-delete-success', 'success', 'User was deleted.');
                                        getNumberOfUsers();
                                    },
                                    error: function () {
                                        renderResultTip('user-bulk-delete-error', 'success', 'Delete failed.');
                                    }
                                }).catch(error => console.error('Unable to delete user: ' + error));
                            });
                        }
                        else {
                            renderResultTip('user-select', 'notice', 'Select a user.');
                        }
                    }
                    else {
                        renderResultTip('option-select', 'notice', 'Select an option.');
                    }
                });

                /* change role button */
                $('#change-role-button').click(function () {
                    $(this).attr('disabled', true).delay(1000).show(function () {
                        $(this).removeAttr('disabled')
                    });

                    let newRole = $('#all-roles').val();
                    let hasChecked = $('#dashboard-users-content--tbody').find('input:checked').length;

                    if (newRole.toLowerCase() == "henry") {
                        renderResultTip('role-choose', 'notice', 'Choose a role.');
                    }
                    else {
                        if (hasChecked > 0) {
                            $('#dashboard-users-content--tbody').find('input:checked').each(function (index, value) {

                                let username = $(value).parents('.item-summary').find('.username-strong-span').text();
                                let userRole = $(value).parents('.item-summary').find('.userrole-cell').text();

                                if (userRole !== newRole) {
                                    let jsonData = {
                                        'username': username,
                                        'userRole': newRole
                                    };

                                    $.ajax({
                                        type: 'PUT',
                                        url: `${userManagementUri}/ChangeUserRole`,
                                        contentType: 'application/json',
                                        headers: {
                                            'Authorization': 'Bearer ' + access.token,
                                        },
                                        data: JSON.stringify(jsonData),
                                        success: function (responseData) {
                                            $(value).parents('.item-summary').find('.userrole-cell').text(responseData.userRole);
                                            renderResultTip('role-update-success', 'success', 'User role was updated.');
                                        }
                                    }).catch(error => console.error('Unable to change user role: ' + error));
                                }
                                else {
                                    renderResultTip('user-in-role', 'notice', 'User is in the current role.');
                                }
                            });
                        }
                        else {
                            renderResultTip('user-select', 'notice', 'Select a user.');
                        }
                    }
                });

                /* user delete animation and function */
                $('.user-delete-span').click(function () {
                    let targetItem = $(this).parents('.item-summary');
                    let username = targetItem.find('.username-strong-span').text();

                    targetItem.remove();

                    $.ajax({
                        type: 'DELETE',
                        url: `${userManagementUri}/DeleteUser`,
                        contentType: 'application/json',
                        headers: {
                            'Authorization': 'Bearer ' + access.token,
                        },
                        data: JSON.stringify({ 'username': username }),
                        success: function () {
                            renderResultTip('user-delete-success', 'success', 'User was deleted.');
                            getNumberOfUsers();
                        },
                        error: function () {
                            renderResultTip('user-delete-error', 'error', 'Delete failed.');
                        }
                    });
                });

                /* dashboard left menu's profile function */
                $('#dashboard-left-menu-profile').click(function () {
                    $('.profile-input').addClass('loading-input');
                    let username = $.trim($('#profile-name').text());

                    $.ajax({
                        type: 'POST',
                        url: `${userManagementUri}/GetUserProfile`,
                        contentType: 'application/json',
                        headers: {
                            'Authorization': 'Bearer ' + access.token,
                        },
                        data: JSON.stringify({ 'username': username }),
                        success: function (responseData) {
                            $('#user-login').val(responseData.username);
                            $('#user-email').val(responseData.email);
                            $('#user-role').val(responseData.userRole);
                            $('#post-count').val(responseData.postNumber);
                            $('.profile-input').removeClass('loading-input');
                        }
                    }).catch(error => console.error('Unable to get user profile: ' + error));
                });

                /* change password */
                $('#change-password').click(function () {
                    $(this).attr('disabled', true).delay(2000).show(function () {
                        $(this).removeAttr('disabled')
                    });

                    $('#change-password-loading').css('display', 'flex');

                    let username = $('#user-login').val();
                    let currentPasswod = $('#current-password').val();
                    let newPassword = $('#new-password').val();
                    let confirmPassword = $('#confirm-password').val();

                    let empty = false;

                    $('.profile-input').each(function () {
                        if ($(this).val().length === 0) {
                            $(this).addClass('input-empty');
                            empty = true;
                        }
                    });

                    if (empty) {
                        renderResultTip('profile-field-required', 'Error', 'The highlight field is required.');
                        $('#change-password-loading').hide();
                        return;
                    }
                    else {
                        if (currentPasswod.length > 0 && newPassword.length > 0 && confirmPassword.length > 0) {
                            if (confirmPassword !== newPassword) {
                                renderResultTip('notice', 'The new password do not match.');
                                $('#new-password').addClass('input-empty');
                                $('#confirm-password').addClass('input-empty');
                                $('#change-password-loading').hide();
                            }
                            else {

                                let jsonData = {
                                    'username': username,
                                    'currentPassword': currentPasswod,
                                    'newPassword': confirmPassword
                                };

                                $.ajax({
                                    type: 'PUT',
                                    url: `${userManagementUri}/ChangePassword`,
                                    contentType: 'application/json',
                                    headers: {
                                        'Authorization': 'Bearer ' + access.token,
                                    },
                                    data: JSON.stringify(jsonData),
                                    success: function () {
                                        renderResultTip('profile-update-success', 'success', 'User password was changed.');
                                        $('#change-password-loading').hide();
                                        $('#current-password').val('');
                                        $('#new-password').val('');
                                        $('#confirm-password').val('');
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        renderResultTip('profile-update-error', 'error', jqXHR.responseJSON.message);
                                        $('#change-password-loading').hide();
                                    }
                                }).catch(error => console.error('Unable to change user password:' + error));
                            }
                        }
                    }
                });

                /* detect changes of profile input */
                $('.profile-input').on('input propertychange', function () {
                    $(this).removeClass('input-empty');
                });

                $('.profile-input').keypress(function (event) {
                    if (event.keyCode === 13) {
                        $('#change-password').click();
                    }
                });

                /* dashboard left menu's settings function */
                $('#dashboard-left-menu-settings').click(function () {
                    $('.settings-input').addClass('loading-input');
                    $('#save-settings').attr('modified', 'false');

                    $.get(siteOptionsUri, function (responseData) {
                        $('#site-title').val(responseData[0].siteTitle);
                        $('#site-title').attr('edit-id', responseData[0].id);
                        $('#tagline').val(responseData[0].siteTagline);
                        $('#site-footer').val(responseData[0].siteFooter);
                        $('#smtp-host').val(responseData[0].smtpHost);
                        $('#smtp-port').val(responseData[0].smtpPort);
                        $('#smtp-encryption').val(responseData[0].encryption);
                        $('#smtp-username').val(responseData[0].smtpUser);
                        $('#smtp-password').val('');

                        $('.settings-input').removeClass('loading-input');
                    }).catch(error => console.error('Unable to get data from siteOptions uri: ' + error));
                });

                /* save settings button's function */
                $('#save-settings').click(function () {
                    $(this).attr('disabled', true).delay(2000).show(function () {
                        $(this).removeAttr('disabled')
                    });

                    $('#save-settings-loading').css('display', 'flex');
                    let empty = false;
                    $('.settings-input').each(function () {
                        if ($(this).val().length === 0) {
                            $(this).addClass('input-empty');
                            empty = true;
                        }
                    });

                    if (empty) {
                        renderResultTip('setting-field-required', 'Error', 'The highlight field is required.');
                        $('#save-settings-loading').hide();
                        return;
                    }
                    else {
                        let itemId = parseInt($('#site-title').attr('edit-id'));
                        let siteTitle = $.trim($('#site-title').val());
                        let siteTagline = $.trim($('#tagline').val());
                        let siteFooter = $.trim($('#site-footer').val());
                        let smtpHost = $.trim($('#smtp-host').val());
                        let smtpPort = parseInt($('#smtp-port').val());
                        let encryption = false;
                        if ($.trim($('#smtp-encryption').val()) === 'true') {
                            encryption = true;
                        }
                        let smtpUsername = $.trim($('#smtp-username').val());
                        let smtpPassword = $.trim($('#smtp-password').val());

                        let jsonData = {
                            'id': itemId,
                            'siteTitle': siteTitle,
                            'siteTagline': siteTagline,
                            'siteIcon': "blog.png",
                            'headerImage': "headerimage.png",
                            'siteFooter': siteFooter,
                            'smtpHost': smtpHost,
                            'smtpPort': smtpPort,
                            'smtpUser': smtpUsername,
                            'smtpPassword': smtpPassword,
                            'encryption': encryption,
                        };

                        $.ajax({
                            type: 'PUT',
                            url: `${siteOptionsUri}/${itemId}`,
                            contentType: 'application/json',
                            headers: {
                                'Authorization': 'Bearer ' + access.token,
                            },
                            data: JSON.stringify(jsonData),
                            success: function () {
                                renderResultTip('setting-update-success', 'success', 'New settings were saved.');
                                $('#save-settings-loading').hide();
                                $('#save-settings').attr('modified', 'false');
                            },
                            error: function () {
                                renderResultTip('setting-update-error', 'error', 'Operation failed.');
                            },
                        }).catch(error => console.error('Unable to update the data in siteOptions uri: ' + error));
                    }
                });

                /* detect settings changes*/
                $('.settings-input').on('input propertychange', function () {
                    $(this).removeClass('input-empty');
                });

                $('.settings-input').keypress(function (event) {
                    if (event.keyCode === 13) {
                        $('#save-settings').click();
                    }
                });

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

                /* identify request hash */
                let requestHash = window.location.hash;
                let requestLink = '';

                if (requestHash.includes('/add-new-post/')) {
                    requestLink = '#add-new-post/';
                }
                else if (requestHash.includes('/edit-post/')) {
                    requestLink = '#edit-post/';
                }
                else {
                    requestLink = requestHash;
                }

                switch (requestLink) {
                    case '#menu/':
                        $('#dashboard-left-menu-menu').click();
                        break;
                    case '#posts/':
                        $('#dashboard-left-menu-posts').click();
                        break;
                    case '#draft-posts/':
                        $('.dashboard-content').hide();
                        $('#dashboard-posts-content').show();
                        $('#draft-posts').click();
                        break;
                    case '#about/':
                        $('#dashboard-left-menu-about').click();
                        break;
                    case '#users/':
                        $('#dashboard-left-menu-users').click();
                        break;
                    case '#profile/':
                        $('#dashboard-left-menu-profile').click();
                        break;
                    case '#settings/':
                        $('#dashboard-left-menu-settings').click();
                        break;
                    case '#choose-category/':
                    case '#add-new-post/':
                    case '#edit-post/':
                        window.location.assign(window.location.origin + window.location.pathname + '#posts/');
                        window.location.reload();
                        break;
                }
/*-----------------------*/
            },
            statusCode: {
                401: function() {
                    window.location.assign(window.location.origin + '/en/login/');
                }
            }
        })
    }
    else {
        window.location.assign(window.location.origin + '/en/login/');
    }

    
});