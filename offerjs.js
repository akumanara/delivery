
(function ($) {
    $.fn.extend({
        Offer: function (opts) {

            var defaults = {
                modalContainerId: 'addOffer',
                modalContainer: '#addOffer',
                modalError: '#modal-error'
            }

            var stateVariables = {
                InitialModal: {
                    LoadUrl: null
                }
            }

            var options = $.extend(defaults, opts);

            return this.each(function () {

                $(this).on('click', function (e) {
                    e.preventDefault();

                    reset($(this));

                    if($(this).hasClass('chainshop')) {
                        $('body').find('.addressSelector').click();
                    }else if($(this).hasClass('chainshopnotfound')) {
                        showModalChainNotSupportsAddress();
                    }else{
                        loadOffer();
                    }
                })
            });

            function hideModal() {
                $(options.modalContainer).modal('hide');
            }


            function showModal() {
                $(options.modalContainer).modal('show');
            }

            function reset(e) {

                var offerObj = new Object();
                offerObj.products = {};
                window.offer = offerObj;
                createModal();
                stateVariables.InitialModal.LoadUrl = e.data('url');
            }

            function createModal(){
                var modalContainer = '';

                if($(options.modalContainer).length > 0){
                    modalContainer = $(options.modalContainer);
                    modalContainer.empty();
                }else{
                    modalContainer = $('<div id="'+options.modalContainerId+'" class="modal fade" role="dialog"></div>');
                    $('body').append(modalContainer);
                }

                //clear all handlers
                modalContainer.off();


            }


            function updateOfferCategories(){


                //hide submit button

                var modalContainer = $(options.modalContainer);


                var offerType = modalContainer.find('input[name=offer_type]').val();
                var offerAmount = parseFloat(modalContainer.find("input[name=offer_amount]").val());
                var offerDiscount = parseFloat(modalContainer.find("input[name=offer_discount]").val());
                var chargeIngredients = parseFloat(modalContainer.find("input[name=offer_charge_ingredients]").val());
                var initialPrice = 0;

                var totalPrice = 0;
                var totalIngredientPrice = 0;
                var totalBasePrice = 0;

                var offerIsReady = true;

                var categories = modalContainer.find('.offer-category');
                if(categories.length == 0)offerIsReady = false;

                var cheaperProduct = 0;
                var cheaperBaseProduct = 0;

                categories.each(function( index ) {

                    var category = window.offer.products[$( this ).data('offer-category-id')];

                    if(typeof category != 'undefined'){

                        var variant_name = '';
                        if(typeof category.variant_name != 'undefined' ){
                            variant_name = category.variant_name;
                        }

                        $(this).find('.offerName').html(category.category_name + ' ' +category.name+' '+ variant_name + '<span class="offer-name-price-modal">(&euro; '+category.price+ ')</span>');
                        $(this).find('.ingredients-description').html(category.ingredients_text);

                        var catId = $(this).find('.offerName').data('offer-category-id');

                        $(this).find('input#option-'+catId).prop('checked', true);

                        $(this).find('.offer-action-icon').addClass('hidden');
                        $(this).find('.offer-action-edit').removeClass('hidden');


                        var productPrice = parseFloat(category.price);
                        var productIngredientPrice = parseFloat(category.priceIngredients);


                        var baseProduct = productPrice - productIngredientPrice;

                        //if the discount is on the specific product
                        if((offerType == 1 || offerType == 2 ) && category.discounted_product == 1){

                            //if the discount is percent
                            if(offerType == 1){
                                if(chargeIngredients == 1){
                                    totalPrice += (baseProduct - (baseProduct * (offerDiscount /100))) + productIngredientPrice ;
                                }else{
                                    totalPrice += (productPrice - (productPrice * (offerDiscount /100)));
                                }

                            }else{
                                //if the product has specific value
                                if(chargeIngredients == 1){
                                    totalPrice += offerAmount + productIngredientPrice;
                                }else{
                                    totalPrice += offerAmount;
                                }
                            }

                        }else{
                            if(chargeIngredients == 1){
                                if(cheaperBaseProduct == 0 || baseProduct < cheaperBaseProduct) {
                                    cheaperProduct = productPrice;
                                    cheaperBaseProduct = baseProduct;
                                }
                            }else{
                                if(cheaperProduct == 0 || productPrice < cheaperProduct) {
                                    cheaperProduct = productPrice;
                                    cheaperBaseProduct = baseProduct;
                                }

                            }

                            totalPrice += productPrice;
                        }

                        initialPrice += productPrice;
                        totalIngredientPrice += productIngredientPrice;
                        totalBasePrice += baseProduct;

                    }else{
                        offerIsReady = false;
                    }

                });

                if(offerIsReady){
                    if(offerType == 0){
                        if(chargeIngredients == 1){
                            totalPrice = totalPrice - (cheaperBaseProduct * (offerDiscount / 100));
                        }else{
                            totalPrice = totalPrice - (cheaperProduct * (offerDiscount / 100));
                        }

                    }else if(offerType == 3){
                        if(chargeIngredients == 1){
                            totalPrice = offerAmount + totalIngredientPrice;
                        }else{
                            totalPrice = offerAmount;
                        }

                    }else if(offerType == 4){
                            totalPrice -= offerAmount;

                    }else if(offerType == 5){
                        if(chargeIngredients == 1) {
                            totalPrice = totalPrice - (totalBasePrice * (offerDiscount / 100));
                        }else{
                            totalPrice = totalPrice - (totalPrice * (offerDiscount / 100));
                        }

                    }


                    $('#offerModalFooter #offer-initial-price').html('<del>'+initialPrice.toFixed(2) + '&euro;'+'</del>');
                    $('#offerModalFooter #offer-price').html(totalPrice.toFixed(2) + '&euro;');

                    $('#addOfferToCart').removeClass('disabled')
                    //enable submit button
                }

                ////SAVE DATA
                //window.offer[product_form.find('input[name=offerCategoryId]').val()] = product_form.serialize();
                console.log(window.offer.products);

            }

            function returnToOffer(){
                var modalContainer = $(options.modalContainer);
                modalContainer.find('#offer-modal-dialog').removeClass('hidden');
                modalContainer.find('.offer-category-dialog').addClass('hidden');

                updateOfferCategories();
            }

            function loadOffer() {

                var modalContainer = $(options.modalContainer);

                $.ajax({
                    url: stateVariables.InitialModal.LoadUrl,
                    success: function (result) {
                        showModal();
                        modalContainer.html(result);
                        addHandlers();

                        console.log('load_offer');
                        addProducts();
                    },
                    beforeSend: function () {
                        n3.loader().loading();
                    },
                    complete: function () {
                        n3.loader().hide();
                    }
                });
            }


            function addProducts(){
                var modalContainer = $(options.modalContainer);

                modalContainer.find('.offer-category').each(function () {

                    var offerCategoryId = $(this).data('offerCategoryId');
                    var itemGroupId = $(this).data('itemgroupid');

                    if(typeof itemGroupId !== 'undefined' ){


                        //var itemGroupId = $(this).data('offercategoryid');
                        var itemName = $(this).data('itemname');
                        var offerCategoryId = $(this).data('offercategoryid');
                        var offerProductName = $(this).data('offerproductname');
                        var offerCategoryName = $(this).data('offercategoryname');
                        var offerDiscountedProduct = $(this).data('offerdiscountedproduct');
                        var offerChargeIngredients = $(this).data('offerchargeingredients');
                        var offerProductIngredientPrice = $(this).data('offerproductingredientprice');
                       // var offerProductTotalPrice = $(this).data('offerproducttotalprice');

                        var uom = $(this).data('uom');
                        var uomstep = $(this).data('uomstep');
                        var offerProductTotalPrice = $(this).data('productprice');


                        var form = $('<form>' +
                            '<input type="hidden" value="'+itemGroupId+'" name="itemGroupId"/>' +
                            '<input type="hidden" value="'+itemName+'" name="itemName"/>' +
                            '<input type="hidden" value="'+offerCategoryId+'" name="offerCategoryId"/>' +
                            '<input type="hidden" value="'+itemName+'" name="offerProductName"/>' +
                            '<input type="hidden" value="'+offerCategoryName+'" name="offerCategoryName"/>' +
                            '<input type="hidden" value="'+offerDiscountedProduct+'" name="offerDiscountedProduct"/>' +
                            '<input type="hidden" value="'+offerChargeIngredients+'" name="offerChargeIngredients"/>' +
                            '<input type="hidden" value="'+offerProductIngredientPrice+'" name="offerProductIngredientPrice"/>' +
                            '<input type="hidden" value="'+offerProductTotalPrice+'" name="offerProductTotalPrice"/>' +
                            '<textarea class="hide" name="itemInstructions"></textarea>' +
                            '<input type="hidden" name="uomstep" value="'+uomstep+'" />' +
                            '<input type="hidden" name="uom" value="'+uom+'" />' +
                            '<input type="hidden" name="itemQuantity" value="1" />' +
                            '<input type="hidden" name="totalPrice" value="'+(offerProductTotalPrice*uomstep)+'" />' +
                            '<input type="hidden" name="no-variant" value="0" />' +
                            '<input type="hidden" name="itemId" value="'+offerProductTotalPrice+'" />' +


                        '</form>');

                        //SAVE DATA
                        var obj = new Object();

                        obj.serialize = form.serializeArray();

                        obj.category_name = offerCategoryName;
                        obj.charge_extra_imngredients=0;
                        obj.discounted_product=offerDiscountedProduct;
                        obj.ingredients_text= ""
                        obj.price = offerProductTotalPrice * uomstep;
                        obj.priceIngredients = "0.00";

                        obj.itemGroupId = itemGroupId;
                        obj.itemName = itemName;



                        obj.name = itemName;
                        // obj.discounted_product = product_form.find('input[name=offerDiscountedProduct]').val();
                        // obj.charge_extra_imngredients = product_form.find('input[name=offerChargeIngredients]').val();
                        // obj.variant_name = product_form.find('input[name=itemId]:checked').data('variant-name');
                        // obj.ingredients_text = updateCustomSummary();
                        window.offer.products[offerCategoryId] = obj;




                    }

                });

                console.log('add_products');
                updateOfferCategories();
            }

            function addHandlers() {
                var modalContainer = $(options.modalContainer);
                var modalError = $(options.modalError);


                modalContainer.find('form#offerForm').submit(function (e) {
                    e.preventDefault();

                    if($(this).find('button[type=submit]').hasClass('disabled'))return;
                    window.offer.offer_id = modalContainer.find('input[name=offer_id]').val();
                    window.offer.offer_type = modalContainer.find('input[name=offer_type]').val();
                    window.offer.offer_amount = modalContainer.find('input[name=offer_amount]').val();
                    window.offer.offer_discount = modalContainer.find('input[name=offer_discount]').val();

                    $.ajax({
                        url: modalContainer.find('form#offerForm').attr('data-url'),
                        type: 'POST',
                        data: JSON.stringify(window.offer),
                        success: function (data) {
                            $('div#cart').html(data);

                        },
                        beforeSend: function () {
                            $(modalContainer).modal('hide');
                            $('div#cart #summary .items').append(
                                '<div class=\"progress progress-striped\" style=\"margin: 40px 0;\">' +
                                '<div class=\"bar\" style=\"width: 100%;\">' +
                                '</div>' +
                                '</div>');
                        },
                        complete: function () {

                        },
                        error: function () {
                            modalError.find('.modal-error').empty();
                            modalError.find('.modal-error').append('Το προϊόν δεν ηταν δυνατό να προστεθεί στον κατάλογο..');
                            modalError.modal('show');
                        }
                    });



                });


                modalContainer.on('show.bs.modal', function(){
                    returnToOffer();
                })

                modalContainer.find('.offer-category.category').click(function(e){
                    var category = $(this).attr('data-offer-category-id');
                    modalContainer.find('#offer-modal-dialog').addClass('hidden');
                    modalContainer.find('#offer-category-dialog-'+category).removeClass('hidden');
                });

                modalContainer.find('.back-to-offer').click(function(e){
                    returnToOffer();
                });

                modalContainer.find('.offerProducts .item').OfferProduct();


            }
        }
    });
})(jQuery);


