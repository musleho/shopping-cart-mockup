window.addEventListener("load", function () {
    //coupon-related variables
    var couponApplied = false;
    var invalidApplied = false;

    function removeItem(inputID, priceID, subtotalID, value) {
        document.getElementById(inputID).value = value;
        getSubtotal(inputID, subtotalID, priceID); //calls updatePrices() so don't need to call it in this function.
    }

    function resetItems() {
        let confirmReset = confirm("Would you like to reset all options to defaults?");
        if (confirmReset){
            removeItem("quant1", "price1", "subtotal1", 1);
            removeItem("quant2", "price2", "subtotal2", 1);
            document.querySelectorAll("input[type=radio]")[0].checked = true;
            let checkBoxes = document.querySelectorAll("input[type=checkbox]");
            checkBoxes.forEach(function(checkbox){
                checkbox.checked = false;
            });
            removeDiscount(); //calls updatePrices() so don't need to call it in this function.
        }
    }

    function getSubtotal(inputID, labelID, priceID) {
        let quantity = document.getElementById(inputID).value;
        let priceString = document.getElementById(priceID).innerHTML;
        let subtotal = quantity * parseFloat(priceString.substring(1));
        document.getElementById(labelID).innerHTML = subtotal;
        updatePrices();
    }

    function checkCouponCode() {
        let couponCode = document.getElementById("coupon").value;
        if (couponCode.toLowerCase() == "tennisdiscountnow") {
            if (!couponApplied) {
                document.getElementById("couponMessage").innerHTML = "TENNISDISCOUNTNOW Applied&nbsp;<input type=button id='removeCoupon' name='removeCoupon' value = 'X'>";
                document.getElementById("removeCoupon").onclick = function(event) {removeDiscount();}
                couponApplied = true;
            }
            else { document.getElementById("notValid").innerHTML = "Coupon already applied!"; }
            invalidApplied = false;
        }
        else if (!invalidApplied) {
            document.getElementById("notValid").innerHTML = "That is not a valid discount code.";
            invalidApplied = true;
        }
        updatePrices();
    }

    function removeDiscount() {
        couponApplied = false;
        invalidApplied = false;
        document.getElementById("couponMessage").innerHTML = "";
        document.getElementById("notValid").innerHTML = ""
        document.getElementById("coupon").value = "";
        updatePrices();
    }

    function updatePrices() { //goes through each element that impacts price, calculates its value and updates the corresponding element.
        //first, get the actual product subtotals
        let subtotals = document.querySelectorAll(".subtotals"); //gets the product subtotals
        let subtotal = 0; //stores the final subtotal
        let total = 0; //stores the final total
        subtotals.forEach(function (sub) {
            subtotal += parseFloat(sub.innerHTML);
        });
        document.getElementById("fullSubtotal").innerHTML = subtotal.toFixed(2);
        total += subtotal;
        
        //next, handle shipping using a similar procedure.
        let shippings = document.querySelectorAll("input[type=radio]");
        shippings.forEach(function (shipping) {
            if (shipping.checked) {
                total += parseFloat(shipping.value);
                document.getElementById("shippingCost").innerHTML = parseFloat(shipping.value).toFixed(2);
                if (subtotal === 0) { //force shipping to be 0 if the subtotal is 0.
                    document.getElementById("shippingCost").innerHTML = "0.00";
                    total = 0; //also force the total to be 0 if the subtotal is 0 (you cannot ship no products)
                }
            }
        });
        
        //handle the addons next. Start with gift wrap since it impacts insurance price
        let addOns = document.querySelectorAll("input[type=checkbox]");
        let giftWrapTotal = addOns[0].checked && subtotal > 0 ? 9.99 : 0;
        total += giftWrapTotal;
        
        //next, do insurance price since it depends on all previous selections
        let insuranceTotal = addOns[1].checked ? total * 0.1 : 0;
        total += insuranceTotal;
        let addOnsTotal = giftWrapTotal + insuranceTotal;
        document.getElementById("addonCost").innerHTML = addOnsTotal.toFixed(2);
        
        //almost there. Next, figure out the coupon discount. Could also be applied only to the product subtotal but chose to do full subtotal here.
        if (couponApplied) {
            let discount = total * 0.2;
            document.getElementById("couponDiscount").innerHTML = `<p>Coupon: -$${discount.toFixed(2)}</p>`;
            total -= discount;
        }

        if (!couponApplied) {
            document.getElementById("couponDiscount").innerHTML = "";
        }
        
        //finally, deal with taxes then display the total.
        document.getElementById("tax").innerHTML = (total * 0.13).toFixed(2);
        total *= 1.13;
        document.getElementById("total").innerHTML = total.toFixed(2);
    }

    function confirmPay() { //mimics sending to a (very silly) landing page by just replacing everything with a simple message.
        let total = parseFloat(document.getElementById("total").innerHTML);
        if (total > 0) { //cannot confirm and pay if the total is 0.
            document.querySelector("body").innerHTML = "<h1>K thx bye</h1>";
        }
    }

    //fills in some defaults on page load.
    getSubtotal("quant1", "subtotal1", "price1");
    getSubtotal("quant2", "subtotal2", "price2");
    document.querySelectorAll("input[type=radio]")[0].checked = true;
    updatePrices();
    
    //Mapping of functions to HTML elements.
    document.querySelector("form").oninput = function (event) { updatePrices(); };
    document.getElementById("reset").onclick = function (event) { resetItems(); };
    document.getElementById("quant1").oninput = function (event) { getSubtotal("quant1", "subtotal1", "price1"); };
    document.getElementById("remove1").onclick = function (event) { removeItem("quant1", "price1", "subtotal1", 0); };
    document.getElementById("quant2").oninput = function (event) { getSubtotal("quant2", "subtotal2", "price2"); };
    document.getElementById("remove2").onclick = function (event) { removeItem("quant2", "price2", "subtotal2", 0); };
    document.getElementById("applyCoupon").onclick = function (event) { checkCouponCode(); };
    document.getElementById("confirm").onclick = function (event) { confirmPay(); };

});