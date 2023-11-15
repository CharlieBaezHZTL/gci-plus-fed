var cookieName = 'gci_myselection';
var cookieMaxAgeName = 'gci_myselection_maxage';
function getMySelection() {
    return $.cookie(cookieName);
}
function setMySelection(val) {
    var d = new Date();
    d.setDate(d.getDate() + 30);
    $.cookie(cookieName, val, { expires: d, path: '/' });

    var day = d.getDate();
    var monthIndex = d.getMonth()+1;
    var year = d.getFullYear();

    //var timezoneOffset = 60000* (-d.getTimezoneOffset());
    var maxage = d.getTime();//+ timezoneOffset;
    $.cookie(cookieMaxAgeName, ""+maxage, { expires: d, path: '/' });
}

function createdummyselection2() {
    return [
        //device
        {
            u: 1,
            //protection plans
            s: [2, 3],
            c: 1,//contract true
            d: 1, //retail true
            b:1//business
        },
        //accessory
        {
            u: 4,
        },
        //internet plan
        {
            u: 5
        },
        //wireless fast phone
        {
            u: 6,
            s: [7, 8],//addons
        },
        //wireless plan simple share
        {
            u: 9,
            s: [10, 11]//data
        }
    ];
}

function loadMySelection() {
    var mys = getMySelection() || "";
    //var mysobj = createdummyselection();
    try {
        var obj = parseMySelection2(mys);
        return obj;
    }
    catch (e) {
        console.log('invalid gci_selection found:' + mys);
        return [];//empty array of objects
    }
}

function parseMySelection2(value) {

    if (typeof (value) !== 'string')
        throw "invalid argument";

    if (value.length == 0) {
        value = "[]";
    }
    else {
        if (!/^\[/.test(value) || !/\]$/.test(value))//assuming is url version or empty//assuming is url version or empty
        {
            value = "[" + value.replace(/\b([a-z]+)\b/g, "\"$1\"") + "]";
        }
    }
        
    try {
        var pr = JSON.parse(value);
    }
    catch (e)
    {
        throw "invalid arg:" + value;
    }

    var result = {
        products: [],
        isChanged: false,
        alert: function () {
            alert(JSON.stringify(this.products));
        },
        count: function () {
            return this.products.length;
        },
        find: function (uid) {
            var nuid = Number(uid);
            var r = null;
            $.each(this.products, function (i, v) {
                if (v.u == nuid) {
                    r = v;
                    return false;
                }

            })
            return r;
        },
        findIndex: function (uid) {
            var nuid = Number(uid);
            var r = -1;
            $.each(this.products, function (i, v) {
                if (v.u == nuid) {
                    r = i;
                    return false;
                }
            });
            return r;
        },
        verifyarray: function(subitems)
        {
            var s = null;
            if (subitems != null && typeof(subitems) !== 'undefined') {
                if (subitems.constructor === Array)
                {
                    if (subitems.length > 0)
                    {
                        $.each(subitems, function (i, v) {
                            if (isNaN(v)) {
                                throw "subitems must be array of ids";
                            }
                        })
                        s = subitems;
                    }
                }
                else {
                    throw "subitems must be array of ids";
                }
            }

            return s;
        },
        createProduct: function(uid, subitems, moresubitems)
        {
            if (!/\d+/g.test(uid))
                return;

            var s = this.verifyarray(subitems);

            var p = { u: uid };
            if (s != null) {
                p.s = s;
            }

            var m = this.verifyarray(moresubitems);
            if (m != null) {
                p.m = m;
            }

            return p;
        },
        pushProduct: function (p)
        {
            this.products.push(p);
            this.isChanged = true;
            this.updateCart();
        },
        addProduct: function (productObj) {
            if (productObj != null && typeof (productObj) === 'object')
            {
                if (productObj.s != null && productObj.s.constructor !== Array)
                {
                    throw "invalid s property. array is expected:" + productObj.s;
                }

                this.verifyarray(productObj.s);

                if (productObj.m != null && productObj.m.constructor !== Array) {
                    throw "invalid m property. array is expected:" + productObj.m;
                }

                this.verifyarray(productObj.m);

                if (productObj.u == null || typeof (productObj.u) !== 'number') {
                    throw "invalid u property. number is expected:" + productObj.u;
                }

                if (productObj.b != null && typeof (productObj.b) !== 'number') {
                    throw "invalid b property. number is expected:" + productObj.b;
                }

                if (productObj.c != null && typeof (productObj.c) !== 'number') {
                    throw "invalid c property. number is expected:" + productObj.c;
                }

                this.pushProduct(productObj);
                return productObj;
            }
            
            throw "invalid argument. object is expected:" + productObj;
        },
        add: function (uid, subitems, moresubitems) {
            var p = this.createProduct(uid, subitems, moresubitems);
            this.pushProduct(p);
            return p;
        },
        addContractDevice: function (uid, subitems) {         
            var p = this.createProduct(uid, subitems);
            p.c = 1;
            this.pushProduct(p);
            return p;
        },
        addRetailDevice: function (uid, subitems) {
            var p = this.createProduct(uid, subitems);
            p.d = 1;
            this.pushProduct(p);
            return p;
        },
        add36MonthDevice: function (uid, subitems) {
            var p = this.createProduct(uid, subitems);
            p.t = 1;
            this.pushProduct(p);
            return p;
        },
        add24MonthDevice: function (uid, subitems) {
            var p = this.createProduct(uid, subitems);
            p.b = 0;
            this.pushProduct(p);
            return p;
        },
        addTvPlan: function (uid, hardware, premiumChannels) {
            var p = this.createProduct(uid, hardware, premiumChannels);
            this.pushProduct(p);
            return p;
        },
        addBiz: function (uid, subitems, moresubitems) {
            var p = this.createProduct(uid, subitems, moresubitems);
            p.b = 1;
            this.pushProduct(p);
            return p;
        },
        addBizContractDevice: function (uid, subitems) {
            var p = this.createProduct(uid, subitems);
            p.c = 1;
            p.b = 1;
            this.pushProduct(p);
            return p;
        },
        addBizTvPlan: function (uid, hardware, premiumChannels) {
            var p = this.createProduct(uid, hardware, premiumChannels);
            p.b = 1;
            this.pushProduct(p);
            return p;
        },
        remove: function (uid) {
            var index = this.findIndex(uid);
            if (index == -1)
                return;
            this.products.splice(index, 1);
            this.updateCart();
            this.isChanged = true;
        },
        removeByIndex: function (index) {
            if (index >= 0 && index < this.products.length && this.products.length > 0)
            {
                this.products.splice(index, 1);
                this.updateCart();
                this.isChanged = true;
            }            
        },
        newDelimiter: function () {
            var delimiters = 'abcdefghijklmnoprstuvwyz';
            var delimiterIndex = Math.floor((Math.random() * delimiters.length));
            return delimiters.charAt(delimiterIndex);
        },
        serialize: function () {           
            return JSON.stringify(this.products);
        },
        toUrl: function () {
            return this.serialize().replace(/"/g, '').slice(1).slice(0, -1);
        },
        save: function () {
            setMySelection(this.serialize());
        },
        updateCart: function ()
        {
            var $cart = $('.carticon');
            if ($cart.length == 0)
                return;

            var $carttext = $('.cart-number', $cart);

            var c = this.count();
            if (c > 0) {
                $cart.toggleClass('hidden', false);
                $carttext.text(c);
            }
            else {
                $cart.toggleClass('hidden', false);
                $carttext.text("");
            }
        }
    };

    result.products = pr;
    return result;
}

function reloadPage() {
    window.location.href = window.location.href;
}

function updateLinkToMySelection(data) {
    var link = getLinkToMySelection();
    generateShortUrl(link);
}

$('#saveCart').click(function (event) {
    $('.savingImage').show();
    saveCart();
    event.preventDefault();
})

$('.getCart').click(function (event) {
    $('.retrievingImage').show();
    getCart();
    event.preventDefault();
    
})

$('#getCartEmail, #saveCartEmail').focus(function(){
    $(this).removeClass('inputError');
});
 
function getLinkToMySelection()
{
    var link = window.location.href;
    if (!/data=/gi.test(link)) {
        if (typeof (data) !== 'string')
            var data = loadMySelection().toUrl();

        if (data && data.length > 0) {
            link += /\?/gi.test(link) ? '&' : '?';
            link += 'data=' + data;
        }
    }

    return link;
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
  }


function getCart() {
    var email = $('#getCartEmail').val();
    var host = $('.myselectionurl-host').text();
    var url = host + '/api/operations/getcart/';

    if (validateEmail(email)) {
        $.ajax({
            url: url,
            dataType: "json",
            type: "POST",
            data: { '': email },
            success: OnSuccess,
            error: function (xhr, textStatus, errorThrown) {
                //console.log("generateShortUrl rrror -> xhr: " + xhr + ' | textStatus: ' + textStatus + ' | errorThrown: ' + errorThrown);
                $("#cartLinkHolder").slideDown('fast');
                $("#cartLinkHolder").text('An error occurred!');
                $('.retrievingImage').hide();
            }

        });
        function OnSuccess(response) {
            if (response.data.m_Item1 != 0) {
                $("#cartLinkHolder").html('View your saved cart here: <a href="/cart">' + host + '/' + response.data.m_Item1 + '</a>');
                $("#cartLinkHolder").slideDown('fast');
                $("#getCartForm").slideUp('fast');
                $("#cartLink").attr('href', host + '/' + response.data.m_Item1).text(host + '/' + response.data.m_Item1);
                $('.retrievingImage').hide();
                Cookies.set('gci_myselection', response.data.m_Item2);
                return false;
        } else {
                $("#cartLinkHolder").html('No cart found for that email!');
                $("#cartLinkHolder").slideDown('fast');
                $('.retrievingImage').hide();

    }

        }
    } else {
                $("#cartLinkHolder").slideDown('fast');
                $("#cartLinkHolder").text('Not a valid email!');
                $('.retrievingImage').hide();
                $('#getCartEmail').addClass('inputError');
}
}
function saveCart(shortUrl, email) {
    var shortUrl = $('.myselectionurl-short').text();
    var host = $('.myselectionurl-host').text();
    var shortLetters = $("#suLetters").val();
    var email = $('#saveCartEmail').val(); 
    var cartMonthlyTotal = parseFloat($('.monthlycostdata').text().replace('$', '').replace(',', ''));
    var cartTotal = parseFloat($('.totalcostdata').text().replace('$', '').replace(',', ''));
    var cartItems = Cookies.get('gci_myselection'); 



    var url = host + '/api/operations/savecart/?shorturl=' + shortLetters + '&email=' + email + '&cartItems=' + cartItems + '&cartTotal=' + cartTotal + '&cartMonthlyTotal=' + cartMonthlyTotal;

    if (validateEmail(email)) {

        $.ajax({
            url: url,
            dataType: "json",
            type: "POST",
            data: {},
            success: OnSuccess,
            error: function (xhr, textStatus, errorThrown) {
                //console.log("generateShortUrl rrror -> xhr: " + xhr + ' | textStatus: ' + textStatus + ' | errorThrown: ' + errorThrown);
                $("#savedSuccess").slideDown('fast');
                $("#savedSuccess").text('An error occurred!');
                $('.savingImage').hide();
            }

        });
        function OnSuccess(response) {
            $("#savedSuccess").text('Your cart has been saved!');
            $("#savedSuccess").slideDown('fast');
            $("#saveForm").slideUp('fast');
            $('.ssavingImage').hide();

        }
} else {
                $("#savedSuccess").slideDown('fast');
                $("#savedSuccess").text('Not a valid email!');
                $('.savingImage').hide();
                $('#saveCartEmail').addClass('inputError');

            }
}//end generateShortUrl


function generateShortUrl(longUrl) {
    var host = $('.myselectionurl-host').text();
    var url = host + '/api/operations/getshorturl';
    $.ajax({
        url: url,
        dataType: "json",
        type: "POST",
        data: {
            '': longUrl
        },
        success: OnSuccess,
        error: function (xhr, textStatus, errorThrown) {
            //console.log("generateShortUrl rrror -> xhr: " + xhr + ' | textStatus: ' + textStatus + ' | errorThrown: ' + errorThrown);
        }
        
    });
    function OnSuccess(response) {
        $(".currentselection").text(response);
        $(".shortURL").val(host + '/' + response.shortUrl);
        $("#suLetters").val(response.shortUrl);
       
    }
}//end generateShortUrl
 
loadMySelection().updateCart();