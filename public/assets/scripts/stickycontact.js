$(document).ready(function () {

    function stickyPhone() {
        $("#stickycontact").hover(stickyPhoneIn, stickyPhoneOut);
        $("#stickyPhone").on("click", function () {
            if ($("#stickyPhone div p").html() != $("#stickyPhoneValue").val()) {
                stickyPhoneIn();
            }
            else {
                stickyPhoneOut();
            }
        });
        if ($("#stickyChat").length > 0) {
            setTimeout(function () {
                $("#stickyChat #lpChatButton2 p").html($("#stickyChatText").val());
                $("#stickyChat").css('display', 'block');
                $("#stickycontact").show(500);
            }, 1000);
        }
        else {
            if (!$("#stickycontact").hasClass('nonintrusive')) {
                $("#stickycontact").show();
            }
        }
    }
    function stickyPhoneIn() {
        $("#stickycontact").addClass("fullhover");
    }
    function stickyPhoneOut() {
        $("#stickycontact").removeClass("fullhover");
    }
    if ($("#stickycontact").length) {
        stickyPhone();
    }

    var pageData = {
        customField1Label: "User current page",
        customField1: window.location.href,
        customField3Label: "Phone Number",
        customField3: "",
    }

    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://apps.mypurecloud.com/widgets/9.0/cxbus.min.js';
    document.getElementsByTagName('head')[0].appendChild(script);


    script.onload = function () {
        pureCloudTargetAddress = ""
        deploymentKeyVar = ""

        if (document.getElementById('stickyChatcloud') != null &&
            document.getElementById('stickyChatcloud').getAttribute('data-pc-team-name') != "" &&
            document.getElementById('stickyChatcloud').getAttribute('data-pc-key') != "") {

            pureCloudTargetAddress = document.getElementById('stickyChatcloud').getAttribute('data-pc-team-name');
            deploymentKeyVar = document.getElementById('stickyChatcloud').getAttribute('data-pc-key');
        }
        else {
            pureCloudTargetAddress = 'RCS Sales Promotion';
            deploymentKeyVar = '129e06d3-fc25-4022-86b1-754593d0f729';
        }


        //Call desired functions
        javascript: CXBus.configure({ debug: false, pluginsPath: 'https://apps.mypurecloud.com/widgets/9.0/plugins/' }); CXBus.loadPlugin('widgets-core');
        window._genesys = {
            widgets: {
                webchat: {
                    transport: {
                        type: 'purecloud-v2-sockets',
                        dataURL: 'https://api.mypurecloud.com',
                        deploymentKey: deploymentKeyVar,
                        orgGuid: '877c3a1d-4455-4018-bd4d-1106279a1ac2',
                        interactionData: {
                            routing: {
                                targetType: 'QUEUE',
                                targetAddress: pureCloudTargetAddress,
                                priority: 2
                            }
                        }
                    },
                    userData: pageData
                },
                main: {
                    cookieOptions: {
                        secure: true,
                        domain: window.location.hostname,
                        path: '/'
                    }
                }
            }
        };

        function isEmptyOrSpaces(str) {
            return str === null || str.match(/^ *$/) !== null;
        }

        function getAdvancedConfig() {
            emailField = '';
            phonefield = '';
            return {
                formJSON: {
                    wrapper: '<table></table>',
                    inputs: [
                        // Default fields
                        {
                            id: 'cx_webchat_form_firstname',
                            name: 'firstname',
                            maxlength: '100',
                            placeholder: 'Required',
                            label: 'First Name',
                            validate: function (event, form, input, label, $, CXBus, Common) {
                                if (input) {
                                    return !isEmptyOrSpaces(input.val());
                                }
                                else {
                                    return false;
                                }
                            }
                        },
                        {
                            id: 'cx_webchat_form_lastname',
                            name: 'lastname',
                            maxlength: '100',
                            placeholder: 'Required',
                            label: 'Last Name',
                            validate: function (event, form, input, label, $, CXBus, Common) {
                                if (input) {
                                    return !isEmptyOrSpaces(input.val());
                                }
                                else {
                                    return false;
                                }
                            }
                        },
                        {
                            id: 'cx_webchat_form_email',
                            name: 'email',
                            maxlength: '100',
                            placeholder: '',
                            label: 'Email',
                            wrapper: '<tr><td colspan="2">Please enter at least one of the following:</td></tr><tr><th>{label}</th><td>{input}</td></tr>',
                            validate: function (event, form, input, label, $, CXBus, Common) {
                                if (input) {
                                    emailField = input.val();
                                    return !(isEmptyOrSpaces(phonefield) && isEmptyOrSpaces(emailField))
                                }
                                return true;
                            }
                        },
                        //{
                        //    id: 'cx_webchat_form_subject',
                        //    name: 'subject',
                        //    maxlength: '100',
                        //    placeholder: 'Optional',
                        //    label: 'Subject'
                        //},
                        //// Custom Fields
                        {
                            id: 'custom_field_3',
                            name: 'customField3',
                            maxlength: '100',
                            placeholder: '',
                            label: 'Phone Number',
                            validate: function (event, form, input, label, $, CXBus, Common) {
                                if (input) {
                                    phonefield = input.val();
                                    return !(isEmptyOrSpaces(phonefield) && isEmptyOrSpaces(emailField))
                                }
                                return false;
                            }
                        }
                    ]

                }
            };
        }

        const customPlugin = CXBus.registerPlugin('Custom');

        customPlugin.subscribe('WebChatService.started', function (e) {
            console.log('Chat started', e);
        });

        customPlugin.subscribe('WebChatService.ended', function (e) {
            console.log('Chat ended', e);
        });
        $('#stickyChatcloud').click(function (event) {
            pageData["customField2Label"] = "User current city";
            pageData["customField2"] = $(".geocitytext").first().text();
            customPlugin.command('WebChat.open', getAdvancedConfig());
            event.preventDefault();
        });
        $('.mysctachatfloatingsummary, .mysctachat').click(function (event) {
            pageData["customField2Label"] = "Smart Card URL";
            pageData["customField2"] = $(".shortURL").val();
            customPlugin.command('WebChat.open', getAdvancedConfig());
            ga('gtm1.send', 'event', 'Chat', window.location.href, 'chatFloatingSummary');
            event.preventDefault();
        });
    }
});