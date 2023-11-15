function addPackageToCart(packageID, itemsArray) {
    var mys = loadMySelection();

    if (itemsArray == null)
        mys.add(packageID);
    else
        mys.add(packageID, itemsArray);

    mys.save();
}

function forwardToCart() {
    window.location.href = "/cart";
}

if (window.location.pathname === '/beunlimited/combineandsave') {
    $("div.teaser-card-group div.card a").eq(0).on("click", function (e) {
        e.preventDefault();
        try {
            var packageID = 996;                // Simply unbeatable wireless with 1 Gig internet package offer
            var packageComponents = [1, 0, 1];  // One wireless device, zero accessories, one 1 Gig internet service
            addPackageToCart(packageID, packageComponents);
            forwardToCart();
            $(this).off("click").attr('href', "javascript: void(0);");
        }
        catch (err) {
            console.log("An error occurred adding the 1 wireless line and Gig internet package to the cart.");
        }
    });

    $("div.teaser-card-group div.card a").eq(1).on("click", function (e) {
        e.preventDefault();
        try {
            var packageID = 600;                // Simply unbeatable wireless with 1 Gig internet package offer
            var packageComponents = [2, 0, 1];  // Two wireless devices, zero accessories, one 1 Gig internet service
            addPackageToCart(packageID, packageComponents);
            forwardToCart();
            $(this).off("click").attr('href', "javascript: void(0);");
        }
        catch (err) {
            console.log("An error occurred adding the 2 wireless lines and Gig internet package to the cart.");
        }
    });
}