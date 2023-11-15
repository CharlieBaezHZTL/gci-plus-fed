(function (window, $) {

    $('#RemoveItemFromCartConfirmation .cta').on('click', function (event) {
        event.preventDefault();
        var $button = $(event.target);
        var actionName = $button.attr('data-action-name');
        if (actionName.length > 0 && (actionName.toLowerCase().indexOf('remove') || actionName.toLowerCase().indexOf('delete'))) {
            var itemId = $(".remove[data-item-delete=yes]").attr('cart-id');
            $.ajax({
                url: '/api/v1/shoppingcartdelete',
                type: 'DELETE',
                data: { 'cartId': itemId },
                success: function (result) {
                    reflectCartChangesInCookie(result);
                    window.location.reload();
                }
            });
        }
    });

    $('.cart-experience').find('.remove').click(function (e) {
        e.preventDefault();
        $(".remove[data-item-delete=yes]").removeAttr('data-item-delete');
        $(this).attr('data-item-delete', 'yes');
        $('#' + $(this).attr('data-target')).modal('show');
    });

    $('.cart-experience').find('.sub-item-remove').click(function (e) {
        e.preventDefault();
        $(".sub-item-remove[data-item-delete=yes]").removeAttr('data-item-delete');
        $(this).attr('data-item-delete', 'yes');
        $('#' + $(this).attr('data-target')).modal('show');
    });

    $('#RemoveSubItemFromCartConfirmation .cta').click(function (e) {
        e.preventDefault();
        var $button = $(event.target);
        var actionName = $button.attr('data-action-name');
        if (actionName.length > 0 && (actionName.toLowerCase().indexOf('sub-item-remove') || actionName.toLowerCase().indexOf('delete'))) {
            var id = $(".sub-item-remove[data-item-delete=yes]").closest('.shopping-cart-item-id').attr('sub-item-id');
            $.ajax({
                url: '/api/v1/shoppingcartitemdetailsdelete',
                type: 'DELETE',
                data: { 'cartId': id },
                success: function (result) {
                    reflectCartChangesInCookie(result);
                    window.location.reload();
                }
            });
        }
    });

    function reflectCartChangesInCookie(result) {
        // if the user made changes to their stepped plan selections from the cart, apply the revisions in case they proceed to edit the plan later
        var cookieName = "gci_planbuilders";
        if (result && result.itemId) {
            var planBuilders = $.cookie(cookieName);
            if (planBuilders !== undefined) {
                var activeCookies = JSON.parse(planBuilders);

                // loop through active plan builder cookies to find the appropriate one
                activeCookies.forEach(function (thisCookie, cookieidx) {
                    var uid = thisCookie.plan;
                    var cookie = $.cookie(thisCookie.cookie);
                    if (cookie !== undefined) {
                        var items = JSON.parse(cookie);
                        // the first item is the base plan, confirm it matches
                        if (items.length >= 1 && items[0].items.length >= 1 && items[0].items[0].id === uid) {

                            // user removed the whole plan itself, delete it from active plans cookie, but keep the plan builder configuration cookie in case they go back in
                            if (uid === result.itemId) {
                                activeCookies.splice(cookieidx, 1);
                                var plansCookie = [cookieName, '=', JSON.stringify(activeCookies), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
                                document.cookie = plansCookie;
                            } else {
                                // loop through plan selection subitems to find the one they removed
                                items.forEach(function (item, itemidx) {
                                    item.items.forEach(function (subitem, subitemidx) {
                                        // user removed this subitem from the plan, update plan selections cookie
                                        if (subitem.id === result.itemId) {
                                            items[itemidx].items.splice(subitemidx, 1);
                                            // if it was the only subitem in this section, remove the node
                                            if (items[itemidx].items.length === 0) {
                                                items.splice(itemidx, 1);
                                            }
                                            var steppedCookie = [thisCookie.cookie, '=', JSON.stringify(items), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
                                            document.cookie = steppedCookie;
                                        }
                                    });
                                });
                            }

                        }
                    }
                });

            }
        }
    }

    $('.complete-order').click(function (e) {
        e.preventDefault();
        grecaptcha.ready(function () {
            grecaptcha.execute('6Ldlwt0bAAAAAL6fTdlL7u6N55PDuNxrXoQJcefS', { action: 'submit' }).then(function (token) {
                $("#GRecaptchaToken").val(token); // this will set hidden field value

                var form = $('#checkoutForm');
                form.validate();
                if (form.valid()) {
                    $('#error-messaging').hide();
                    $.ajax({
                        type: "POST",
                        url: '/api/v2/submission',
                        data: $('#checkoutForm').serialize(),
                        success: function (data) {

                            if (data.Status !== undefined) {
                                if (data.Status === 'InvalidModelState') {
                                    $('#error-messaging').show();
                                    $('.validation-summary-valid').html(data.Message);
                                    console.log(data.Message);
                                    return;
                                }
                                if (data.Status === 'ReCaptchaFail') {
                                    console.log(data.Message);
                                    return;
                                }
                            }

                            DataLayerPushEcommerce("complete_checkout");

                            window.dataLayer.push({
                                'event': 'checkout_success'
                            });

                            // remove cookie
                            try {
                                Cookies.remove('gci_cart');
                                Cookies.remove('gci_planbuilders', { path: "/", domain: "." + window.location.host.toString() });
                            }
                            catch (err) {
                                console.log(err);
                            }

                            // show success
                            if ($('.SubmissionType:checked').val() === "call") {
                                $(".checkout .form-container").hide();
                                $(".place-my-order").hide();
                                $('.callback-bg').show();
                                window.scrollTo(0, 0);
                                //Create session cookie for request a callback
                                Cookies.set('gci_requestcallback', 'scheduled');
                            }
                            else if ($('.SubmissionType:checked').val() === "chat") {

                                var pageData = {
                                    customField1Label: "Cart Edit Link",
                                    customField1: data, // this should be the link returned from the api
                                    firstName: $('#FirstName').val(),
                                    lastName: $('#LastName').val(),
                                    addressStreet: $('#Address').val(),
                                    addressCity: $('#City').val(),
                                    addressPostalCode: $('#PostalCode').val(),
                                    addressState: $('#State').val(),
                                    phoneNumber: $('#PhoneNumber').val(),
                                    email: $('#EmailAddress').val()
                                };

                                window._genesys.widgets.webchat.userData = pageData;
                                $(".checkout .form-container").hide();
                                $(".place-my-order").hide();
                                $('.chat-success').show();
                                window.scrollTo(0, 0);
                                $('#stickyChatcloud').trigger('click');
                                //Create session cookie for chat
                                Cookies.set('gci_chat', 'chat');
                            }
                        },
                        error: function (data) {
                            $('#error-messaging').hide();
                            $('#CartError').modal('show');
                            $('.validation-summary-valid').html(data.responseJSON.Details);

                            console.log("Cart Submission Error: ");
                            console.log(data.responseJSON.Details);

                            window.dataLayer.push({
                                'event': 'checkout_error',
                                'details': {
                                    'status': data.status,
                                    'statusText': data.statusText,
                                    'responseJSON': data.responseJSON
                                }
                            });
                        }
                    });
                }
                else {
                    $('#error-messaging').show();

                    $('html, body').animate({
                        scrollTop: ($('.checkout-form-title').first().offset().top)
                    }, 500);
                }
            });
        });
    });

    $('#CurrentCustomer').click(function (e) {
        var checked = $('#CurrentCustomer').is(':checked');
        if (checked) {
            $('.account-number').show();
        }
        else {
            $('.account-number').hide();
        }
    });

    $('.SubmissionType').click(function (e) {
        if ($('.SubmissionType:checked').val() === "call") {
            DataLayerPushEcommerce("select_contact_option", "call");
            $('.callback-times').show();
        }
        else if ($('.SubmissionType:checked').val() === "chat") {
            DataLayerPushEcommerce("select_contact_option", "chat");
            $('.callback-times').hide();
        }
    });

    var getInTouch = $(".get-in-touch .container-group input");
    $(getInTouch).on("click", function () {
        $(".get-in-touch .container-group input:checked").parent("label").parent(".comm-option").addClass("input-checked");
        $(".get-in-touch .container-group input:not(:checked)").parent("label").parent(".comm-option").removeClass("input-checked");
        if ($(".comm-option").hasClass("input-checked")) {
            $(".comm-option.input-checked .checkmark").html("Selected");
            $(".comm-option").not(".input-checked").find(".checkmark").html("Select");
        }

    });
    var checkoutChatTimes = $(".get-in-touch .select-div .dropdown-menu");
    var chatTimesList = $(checkoutChatTimes).find("li");

    // Default value so that if users submit form without selecting anything, Any Time will be submitted by default.
    $('#TimeRangeSelected').val(chatTimesList[0]);

    var chooseTimeText = $(".get-in-touch .select-div .dropdown-toggle");
    $(chatTimesList).on("click", function () {
        var listValue = $(this).text();
        $('#TimeRangeSelected').val(listValue);
        $(chooseTimeText).addClass("time-selected").html(listValue);
    });

    var addCustomerContactInfoSent = false;
    var customContactInfoInputs = $('.customer-contact-info input[data-val-ga-customer-contact-info], .customer-contact-info-address input[data-val-ga-customer-contact-info]');
    $(customContactInfoInputs).focusout(function () {
        var contactInfoComplete = true;
        $(customContactInfoInputs).each(function () {
            if ($(this).val().trim() === '' || !$(this).valid()) {
                contactInfoComplete = false;
            }
        });
        if (contactInfoComplete && !addCustomerContactInfoSent) {
            addCustomerContactInfoSent = true;
            DataLayerPushEcommerce('add_customer_contact_info');
        }
    });

})(window, jQuery);