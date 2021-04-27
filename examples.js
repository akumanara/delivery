let maxProductPrice = 0;
const push_add_to_cart_clicked = function (
  shop_id,
  shop_name,
  product_name,
  item_code,
  quantity,
  price,
) {
  if (price > maxProductPrice) {
    maxProductPrice = price;
    app.scout.customAttribute(
      'web_last_abandoned_cart_product_name',
      product_name,
    );
  }
  app.scout.customEvent('web_add_to_basket', {
    product: product_name,
    restaurant: shop_name,
    cuisine: app.shop.basic_cuisine,
  });
};

window.trimQueryStrings = function (url, stringsToTrim) {
  for (let i = 0; i < stringsToTrim.length; i++) {
    const s = stringsToTrim[i];
    const reg = new RegExp(`((&)*${s}=([^&]*))`);
    url = url.replace(reg, '');
  }
  const query = url.split('?');
  // remove question mark if there are no query strings left
  if (query.length > 1 && !query[1]) {
    url = url.replace('?', '');
  }
  return url;
};

window.config = {
  template: 'menu',
  mode: 'default',
  isChain: false,
  isPreview: false,
  shopId: 4076041,
  anonymous: false,
  shop: {
    information: {
      id: 4076041,
      slug: '/pagkrati/eldib-karnak-cafe',
      chain: null,
      title: 'Transit cafe - Παγκράτι',
      logo: 'https://cdn.e-food.gr/cdn-cgi/image/f=auto/shop/4076041/logo',
      cover: 'https://cdn.e-food.gr/cdn-cgi/image/f=auto/shop/4076041/cover',
      address: {
        street: 'Υμηττού 81',
        area: 'Παγκράτι',
        slug: 'pagrati',
        latitude: '37.9684076',
        longitude: '23.751909',
      },
      badges: [
        {
          tag: 'one plus one',
          title: '1+1 Προσφορά',
          background_color: '#fff5f3',
          font_color: '#ed2e2e',
          icon: null,
          rank: 0,
        },
      ],
      average_rating: 4.8,
      submitted_ratings: 110,
      num_ratings: 110,
      is_open: true,
      is_favorite: false,
      basic_cuisine: 'Καφέδες',
      basic_category: 'kafes',
      basic_category_name: 'Καφέδες',
      minimum_order: 2.2,
      minimum_order_has_tiers: false,
      delivery_cost: 0,
      delivery_cost_buyer: 'customer',
      delivery_cost_has_tiers: false,
      has_credit: true,
      delivery_eta: "30'",
      message:
        'H προσφορά 1+1 αφορά συγκεκριμένα προϊόντα & μπορείς να τα αναζητήσεις πιο κάτω στο menu του καταστήματος',
      description:
        '<p></p><p>Επωνυμία:<br>ΕΛΝΤΙΜΠ ΜΟΧΑΜΕΝΤ ΙΣΜΑΙΛ<br><br>ΓΕΜΗ:<br>-<br><br>ΑΦΜ:<br>144441039<br><br>Διεύθυνση Επωνυμίας:<br>, , <br><br></p>',
      has_coupons: true,
      has_own_delivery: false,
      has_discounts: false,
      is_serving: true,
      hasBusinessDiscounts: false,
      citySlug: 'pagkrati',
      shopSlug: 'eldib-karnak-cafe',
    },
    showInfoBadge: true,
    view: 'list',
    discounts: [],
    timetable: [
      { day: 'Δευτέρα', times: '08:00-20:00', is_today: false },
      { day: 'Τρίτη', times: '08:00-20:00', is_today: true },
      { day: 'Τετάρτη', times: '08:00-20:00', is_today: false },
      { day: 'Πέμπτη', times: '08:00-20:00', is_today: false },
      { day: 'Παρασκευή', times: '08:00-20:00', is_today: false },
      { day: 'Σάββατο', times: '08:00-20:00', is_today: false },
      { day: 'Κυριακή', times: '08:00-20:00', is_today: false },
    ],
    hasBusinessDiscounts: false,
    is_serving: true,
    shouldDisplayJoker: true,
    hideAddress: false,
    jokerIncludesDeliveryFeeNotice: '',
  },
  reminders: [
    {
      tag: 'coca-cola',
      title: 'Εεπ... Ξεχάστηκες;',
      subtitle: 'Μήπως θες και μία Coca-Cola;',
      items_title: 'Απογείωσε την παραγγελία σου',
      items_subtitle: 'Με μια παγωμένη Coca-Cola',
      item_group_name: 'Coca-Cola',
      logo:
        'https://static.e-food.gr/reminder-assets/coca-cola-reminder-asset.png',
      exclusions: ['supermarket'],
      items: [
        {
          code: 'IT_000000000020',
          order: 1,
          shortage: false,
          is_available: true,
          name: 'Coca-Cola 330ml',
          description: '',
          has_variations: false,
          has_options: false,
          size_info: '',
          allow_comments: true,
          quick_add: true,
          need_server_calculation: false,
          tags: ['coca-cola'],
          price: 1.3,
          max_item_count: 0,
          is_popular: false,
          images: {
            original: 'https://cdn.e-food.gr/global_assets/coca-cola-330ml',
            menu:
              'https://cdn.e-food.gr/cdn-cgi/image/h=160,fit=cover,q=100,f=auto/global_assets/coca-cola-330ml',
            featured: null,
            popular: null,
            banner:
              'https://cdn.e-food.gr/cdn-cgi/image/w=800,h=450,fit=cover,q=100,f=auto/global_assets/coca-cola-330ml',
          },
          metric_unit_description: '',
          transport_methods: ['delivery', 'takeaway'],
          badges: [],
          discount: 0,
          full_price: 1.3,
          has_free_items: false,
          combo: { buy: 0, get: 0 },
          requires_consent: false,
        },
        {
          code: 'IT_000000000021',
          order: 2,
          shortage: false,
          is_available: true,
          name: 'Coca-Cola light 330ml',
          description: '',
          has_variations: false,
          has_options: false,
          size_info: '',
          allow_comments: true,
          quick_add: true,
          need_server_calculation: false,
          tags: ['coca-cola'],
          price: 1.3,
          max_item_count: 0,
          is_popular: false,
          images: {
            original:
              'https://cdn.e-food.gr/global_assets/coca-cola-light-330ml',
            menu:
              'https://cdn.e-food.gr/cdn-cgi/image/h=160,fit=cover,q=100,f=auto/global_assets/coca-cola-light-330ml',
            featured: null,
            popular: null,
            banner:
              'https://cdn.e-food.gr/cdn-cgi/image/w=800,h=450,fit=cover,q=100,f=auto/global_assets/coca-cola-light-330ml',
          },
          metric_unit_description: '',
          transport_methods: ['delivery', 'takeaway'],
          badges: [],
          discount: 0,
          full_price: 1.3,
          has_free_items: false,
          combo: { buy: 0, get: 0 },
          requires_consent: false,
        },
        {
          code: 'IT_000000000022',
          order: 3,
          shortage: false,
          is_available: true,
          name: 'Coca-Cola zero 330ml',
          description: '',
          has_variations: false,
          has_options: false,
          size_info: '',
          allow_comments: true,
          quick_add: true,
          need_server_calculation: false,
          tags: ['coca-cola'],
          price: 1.3,
          max_item_count: 0,
          is_popular: false,
          images: {
            original:
              'https://cdn.e-food.gr/global_assets/coca-cola-zero-330ml',
            menu:
              'https://cdn.e-food.gr/cdn-cgi/image/h=160,fit=cover,q=100,f=auto/global_assets/coca-cola-zero-330ml',
            featured: null,
            popular: null,
            banner:
              'https://cdn.e-food.gr/cdn-cgi/image/w=800,h=450,fit=cover,q=100,f=auto/global_assets/coca-cola-zero-330ml',
          },
          metric_unit_description: '',
          transport_methods: ['delivery', 'takeaway'],
          badges: [],
          discount: 0,
          full_price: 1.3,
          has_free_items: false,
          combo: { buy: 0, get: 0 },
          requires_consent: false,
        },
        {
          code: 'IT_000000000023',
          order: 4,
          shortage: false,
          is_available: true,
          name: 'Fanta κόκκινη 330ml',
          description: '',
          has_variations: false,
          has_options: false,
          size_info: '',
          allow_comments: true,
          quick_add: true,
          need_server_calculation: false,
          tags: ['coca-cola'],
          price: 1.3,
          max_item_count: 0,
          is_popular: false,
          images: {
            original: 'https://cdn.e-food.gr/global_assets/fanta-orange-330ml',
            menu:
              'https://cdn.e-food.gr/cdn-cgi/image/h=160,fit=cover,q=100,f=auto/global_assets/fanta-orange-330ml',
            featured: null,
            popular: null,
            banner:
              'https://cdn.e-food.gr/cdn-cgi/image/w=800,h=450,fit=cover,q=100,f=auto/global_assets/fanta-orange-330ml',
          },
          metric_unit_description: '',
          transport_methods: ['delivery', 'takeaway'],
          badges: [],
          discount: 0,
          full_price: 1.3,
          has_free_items: false,
          combo: { buy: 0, get: 0 },
          requires_consent: false,
        },
        {
          code: 'IT_000000000024',
          order: 5,
          shortage: false,
          is_available: true,
          name: 'Fanta μπλε 330ml',
          description: '',
          has_variations: false,
          has_options: false,
          size_info: '',
          allow_comments: true,
          quick_add: true,
          need_server_calculation: false,
          tags: ['coca-cola'],
          price: 1.3,
          max_item_count: 0,
          is_popular: false,
          images: {
            original: 'https://cdn.e-food.gr/global_assets/fanta-blue-330ml',
            menu:
              'https://cdn.e-food.gr/cdn-cgi/image/h=160,fit=cover,q=100,f=auto/global_assets/fanta-blue-330ml',
            featured: null,
            popular: null,
            banner:
              'https://cdn.e-food.gr/cdn-cgi/image/w=800,h=450,fit=cover,q=100,f=auto/global_assets/fanta-blue-330ml',
          },
          metric_unit_description: '',
          transport_methods: ['delivery', 'takeaway'],
          badges: [],
          discount: 0,
          full_price: 1.3,
          has_free_items: false,
          combo: { buy: 0, get: 0 },
          requires_consent: false,
        },
        {
          code: 'IT_000000000025',
          order: 6,
          shortage: false,
          is_available: true,
          name: 'Fanta λεμόνι 330ml',
          description: '',
          has_variations: false,
          has_options: false,
          size_info: '',
          allow_comments: true,
          quick_add: true,
          need_server_calculation: false,
          tags: ['coca-cola'],
          price: 1.3,
          max_item_count: 0,
          is_popular: false,
          images: {
            original: 'https://cdn.e-food.gr/global_assets/fanta-lemon-330ml',
            menu:
              'https://cdn.e-food.gr/cdn-cgi/image/h=160,fit=cover,q=100,f=auto/global_assets/fanta-lemon-330ml',
            featured: null,
            popular: null,
            banner:
              'https://cdn.e-food.gr/cdn-cgi/image/w=800,h=450,fit=cover,q=100,f=auto/global_assets/fanta-lemon-330ml',
          },
          metric_unit_description: '',
          transport_methods: ['delivery', 'takeaway'],
          badges: [],
          discount: 0,
          full_price: 1.3,
          has_free_items: false,
          combo: { buy: 0, get: 0 },
          requires_consent: false,
        },
        {
          code: 'IT_000000000026',
          order: 7,
          shortage: false,
          is_available: true,
          name: 'Sprite 330ml',
          description: '',
          has_variations: false,
          has_options: false,
          size_info: '',
          allow_comments: true,
          quick_add: true,
          need_server_calculation: false,
          tags: ['coca-cola'],
          price: 1.3,
          max_item_count: 0,
          is_popular: false,
          images: {
            original: null,
            menu: null,
            featured: null,
            popular: null,
            banner: null,
          },
          metric_unit_description: '',
          transport_methods: ['delivery', 'takeaway'],
          badges: [],
          discount: 0,
          full_price: 1.3,
          has_free_items: false,
          combo: { buy: 0, get: 0 },
          requires_consent: false,
        },
      ],
    },
  ],
  availableShops:
    '/shops?address=%CE%9B%CE%B5%CF%89%CF%86%CF%8C%CF%81%CE%BF%CF%82+%CE%A7%CF%81%CF%85%CF%83%CE%BF%CF%83%CF%84%CF%8C%CE%BC%CE%BF%CF%85+%CE%A3%CE%BC%CF%8D%CF%81%CE%BD%CE%B7%CF%82+10%2C+%CE%92%CF%8D%CF%81%CF%89%CE%BD%CE%B1%CF%82+%CE%91%CE%B8%CE%AE%CE%BD%CE%B1%2C+16232&useraddress=252524&user_address=252524&latitude=37.9627451&longitude=23.7517235&city=%CE%92%CF%8D%CF%81%CF%89%CE%BD%CE%B1%CF%82&county=%CE%91%CE%B8%CE%AE%CE%BD%CE%B1&zip=16232&street=%CE%9B%CE%B5%CF%89%CF%86%CF%8C%CF%81%CE%BF%CF%82+%CE%A7%CF%81%CF%85%CF%83%CE%BF%CF%83%CF%84%CF%8C%CE%BC%CE%BF%CF%85+%CE%A3%CE%BC%CF%8D%CF%81%CE%BD%CE%B7%CF%82&area_slug=&scope=personal&street_no=10&nomap=0',
  loaderOn() {
    app.popup.showLoader();
  },
  modalLoaderOn() {
    app.popup.showLoader();
  },
  loaderOff() {
    app.popup.hideLoader();
  },
  modalLoaderOff() {
    app.popup.hideLoader();
  },
  modalMounted(m) {
    $(m).modal('show');
    window.ALLOW_INVOKE_COMPONENT = false;
  },
  modalUnmounted(m) {
    if ($(m).hasClass('expired')) {
      $(m).modal('hide');
      window.location.reload();
    }
    $(m).modal('hide');
    window.ALLOW_INVOKE_COMPONENT = true;

    // Clear query strings from url on modal unmount
    const url = window.trimQueryStrings(window.location.href, [
      'offer_id',
      'item_code',
      'order_id',
    ]);
    // Replace current url without reload
    window.history.replaceState({}, document.title, url);
  },
  onAddressChange() {
    app.popup.addressbox();
    return false;
  },
  onOpenUserAddresses() {
    app.popup.openUserAddresses('4076041');
    return false;
  },
  onCouponUpdate(coupon) {},
  onCartMount() {
    // clear order attributes when mounting on shop profile
    window.ComponentCart.cart().clearOrderAttributes();

    const url = window.location.href;
    const urlIndex = url.indexOf('&order_id=');
    let new_url = '';

    if (urlIndex > -1) {
      new_url = url.substring(0, urlIndex);
      window.history.replaceState({}, url, new_url);
    }

    $(document).ready(() => {
      efoodLib.setCategoriesButton();

      // The element which controls cart visibility status
      $('.cart-header-upper').click(() => {
        // Depending on user click on cart header to toggle cart, setting up the category button's visibility
        $('.grid-categories-btn').toggle();
      });

      // update supermarket ui with current products
      if (window.ComponentCart && window.ComponentCart.cart()) {
        efoodLib.updateGridUI(window.ComponentCart.cart().products);
      }
    });
  },
  onCartMounted() {
    $(document).ready(() => {
      window.EventBus.Bus.trigger(window.EventBus.CART_MOUNTED, {
        name: window.EventBus.CART_MOUNTED,
        data: window.ComponentCart.cart().export(),
      });

      if (window.app.shop.hasBusinessDiscounts) {
        if (window.ComponentCart) {
          window.ComponentCart.hideOffers(true);
        }
      }
    });
  },
  onCartQuickAddItem(products) {
    efoodLib.updateGridUI(products);
  },
  onQuickAddItemDecrease(products) {
    efoodLib.updateGridUI(products);
  },
  onQuickAddItemIncrease(products) {
    efoodLib.updateGridUI(products);
  },
  onMaxItemCountMessageShown() {
    efoodLib.tracking.productItemMessageShown(
      app.shop.id,
      app.shop.title,
      'cart',
      'max_item_quantity',
    );
  },
  onOfferAdd(product) {
    const cart = window.ComponentCart.cart();

    efoodLib.tracking.addToCart(
      cart.shop.information.id,
      cart.shop.information.title,
      product.name,
      product.product_id,
      product.quantity,
      product.price,
      'cart',
    );
    push_add_to_cart_clicked(
      cart.shop.information.id,
      cart.shop.information.title,
      product.name,
      '',
      product.quantity,
      product.price,
    );

    // Force DynamicComponentLoaders refetch data
    window.EventBus.Bus.trigger(window.EventBus.DYNAMIC_COMPONENT_FETCH_DATA, {
      view: 'shop_profile.ruby_banner',
      data: window.ComponentCart.cart().export(),
    });
  },
  onOfferRemove(productsRemoved) {
    // Force DynamicComponentLoaders refetch data
    window.EventBus.Bus.trigger(window.EventBus.DYNAMIC_COMPONENT_FETCH_DATA, {
      view: 'shop_profile.ruby_banner',
      data: window.ComponentCart.cart().export(),
    });
  },
  onProductAdd(product) {
    efoodLib.setCategoriesButton();

    const cart = window.ComponentCart.cart();

    efoodLib.updateGridUI(cart.products);
    efoodLib.tracking.addToCart(
      cart.shop.information.id,
      cart.shop.information.title,
      product.name,
      product.product_id,
      product.quantity,
      product.price,
      'cart',
    );

    push_add_to_cart_clicked(
      cart.shop.information.id,
      cart.shop.information.title,
      product.name,
      '',
      product.quantity,
      product.price,
    );
  },
  onProductRemove(productRemoved) {
    efoodLib.setCategoriesButton();

    if (!window.ComponentCart || !window.ComponentCart.cart()) return;

    efoodLib.updateGridUI(window.ComponentCart.cart().products);
  },
  onCartProductsQuantity(products) {
    efoodLib.updateGridUI(products);
  },
  onCartProductQuantityIncrease(product) {
    efoodLib.tracking.addToCart(
      app.shop.id,
      app.shop.title,
      product.name,
      product.product_id,
      product.quantity,
      product.price,
      'cart',
    );
  },
  onCartProductQuantityDecrease(product) {
    efoodLib.tracking.removeFromCart(
      app.shop.id,
      app.shop.title,
      product.name,
      product.product_id,
      product.quantity - 1,
      product.price,
      'cart',
    );
  },
  onCartProductUpdate(products) {
    efoodLib.updateGridUI(products);
  },
  onCartReminder(reminder) {
    if (
      window.efoodLib &&
      window.efoodLib.tracking &&
      window.efoodLib.tracking.promotionClick
    ) {
      window.efoodLib.tracking.promotionClick(
        [
          {
            id: '4076041',
            name: 'Reminder Button',
            creative: reminder.tag,
          },
        ],
        'reminder',
      );
    }
  },
  onCartReminderRender(reminder) {
    if (
      window.efoodLib &&
      window.efoodLib.tracking &&
      window.efoodLib.tracking.promoClick
    ) {
      window.efoodLib.tracking.promoClick(
        [
          {
            id: '4076041',
            creative: reminder.tag,
            name: 'Reminder Button',
          },
        ],
        'reminder',
      );
    }
  },
  onCartClean() {
    // assume no products in cart
    efoodLib.updateGridUI([]);
    app.scout.unsetCustomAttribute('web_last_abandoned_cart_product_name');
  },
  onCartSubmit() {
    let nextUrl = '/orders/form?shop_id=4076041';
    const delivery_method = window.ComponentCart.getDeliveryMethod();

    if (delivery_method) {
      nextUrl += `${nextUrl.split('?')[1] ? '&' : '?'}d=${
        delivery_method.selected.option.key
      }&dmv=${delivery_method.selected.view}`;
    }

    if (!app.userLoggedIn) {
      app.nextUrlLogin = nextUrl;
      app.popup.openUserLogin(nextUrl);
      return;
    }

    app.popup.showLoader();
    if (typeof window.config.shopId === 'undefined') {
      app.nextUrlLogin = nextUrl;
      app.popup.openUserLogin(nextUrl);
      return;
    }

    app.scout.customEvent('web_checkout_page');
    window.location.href = nextUrl;
  },
  onCartReOrder(products) {
    products.forEach((product) => {
      efoodLib.tracking.addToCart(
        app.shop.id,
        app.shop.title,
        product.name,
        product.product_id,
        product.quantity,
        product.price,
        'reorder',
      );
    });

    efoodLib.updateGridUI(products);

    window.EventBus.Bus.trigger(window.EventBus.DYNAMIC_COMPONENT_FETCH_DATA, {
      view: 'shop_profile.ruby_banner',
      data: window.ComponentCart.cart().export(),
    });
  },
  onDeliveryMethodSelected(method) {
    const cart = window.ComponentCart.cart();
    if (method.selected.option.value) {
      if (
        window.efoodLib &&
        window.efoodLib.tracking &&
        window.efoodLib.tracking.deliverySlotChanged
      ) {
        window.efoodLib.tracking.deliverySlotChanged(
          cart.shop.information.id,
          app.ga_currency,
          cart.amount,
          method.selected.option.key,
          method.selected.option.value,
        );
      }
    } else if (
      window.efoodLib &&
      window.efoodLib.tracking &&
      window.efoodLib.tracking.orderDeliveryMethodSelected
    ) {
      window.efoodLib.tracking.orderDeliveryMethodSelected(
        cart.shop.information.id,
        app.ga_currency,
        cart.amount,
        method.selected.option.key,
      );
    }
  },
  onJokerActive(joker) {
    $('body').addClass('joker-active');
    app.status.isJokerActive = true;
    $('.logout-btn').off('click');
    $('body.joker-active a')
      .not('[target="_blank"]')
      .not('[href^="#"]')
      .not('.dont-abandon-joker')
      .filter(function (e) {
        return (
          !$(this).parent().hasClass('clean-cart-wrapper') &&
          !$(this).parent().hasClass('promo-popup')
        );
      })
      .on('click', function (e) {
        e.preventDefault();
        app.link_joker_abandon = $(this).attr('href');
        window.ComponentCart.mountJokerModalAbandon();
        efoodLib.jokerGA.sendAbandonStarted(joker);
      });
    $('label[for=coupon_code]').remove();
    $('#coupon_code').remove();

    $(document).ready(() => {
      if (
        window.efoodLib &&
        window.efoodLib.jokerGA &&
        window.efoodLib.jokerGA.jokerShopLoaded
      ) {
        window.efoodLib.jokerGA.jokerShopLoaded(joker.offers[0].restaurant);
      }

      window.EventBus.Bus.trigger(window.EventBus.JOKER_SETTLED, {
        name: window.EventBus.JOKER_SETTLED,
      });
      window.EventBus.Bus.trigger(window.EventBus.JOKER_ACTIVE, {
        name: window.EventBus.JOKER_ACTIVE,
      });
    });
  },
  onJokerInactive() {
    $('body.joker-active a')
      .not('[target="_blank"]')
      .not('[href^="#"]')
      .off('click');
    $('body').removeClass('joker-active');
    app.status.isJokerActive = false;

    $(document).ready(() => {
      window.EventBus.Bus.trigger(window.EventBus.JOKER_SETTLED, {
        name: window.EventBus.JOKER_SETTLED,
      });
    });
  },
  onJokerAbandon(offer) {
    if (
      window.efoodLib &&
      window.efoodLib.jokerGA &&
      window.efoodLib.jokerGA.jokerResumeRejected
    ) {
      window.efoodLib.jokerGA.jokerResumeRejected(offer.restaurant);
    }

    efoodLib.jokerGA.sendAbandoned(offer);
    if (typeof app.link_joker_abandon !== 'undefined') {
      if (app.country_joker_abandoned) {
        if (
          window.efoodLib &&
          window.efoodLib.tracking &&
          window.efoodLib.tracking.countryChanged
        ) {
          window.efoodLib.tracking.countryChanged(app.country_joker_abandoned);
        }

        $.cookie('efcountry', app.country_joker_abandoned, {
          expires: 730,
          path: '/',
        });

        app.country_joker_abandoned = null;
      }

      window.location.href = app.link_joker_abandon;
    }
  },
  onJokerTierReached(joker) {
    efoodLib.jokerGA.sendTierReached(joker);
  },
};

// ==============================================================================================================================
// ==============================================================================================================================
// ==============================================================================================================================

app.siteVersion = '2.11.18';
app.sitePlatform = 'web';
app.enviroment = 'production';
app.brand = 'efood';
app.locale = 'el';
app.currency = 'EUR';
app.ga_currency = 'EUR';
app.userLoggedIn = true;
app.userSid = '0adae030-e45b-466d-bd15-4ef2d258879d';
app.pageController = 'menu';
app.latitude = '';
app.longitude = '';
app.area_slug = '';
app.userCartSid = '0adae030-e45b-466d-bd15-4ef2d258879d';
app.apiBaseURL = 'https://api.e-food.gr/api/v1';
app.apiURL = 'https://api.e-food.gr';
app.apiLocale = 'el';
app.googleMapsApiKeyString =
  '//maps.googleapis.com/maps/api/js?libraries=geometry,places&language=el&region=gr&client=gme-deliveryheroholding&channel=efood_gr';
app.savedAddresses = null;
app.isByArea = false;
app.isJokerEnabled =
  true && !/(iphone|ipod|ipad).* os 8_/.test(navigator.userAgent.toLowerCase());
app.loadMaps = false;
app.isAppboyEnabled = true;

app.displaySmartBanner = false;
app.businessDiscountUrl = '/foodatwork/';
app.isFoodAtWorkEnabled = true;
app.addressBusinessSlug = '';
app.referrerSlug = '';
app.apiOfflineMessage =
  'Προέκυψε πρόβλημα κατά την επικοινωνία με τον διακομιστή';
app.verticalType = 'food';

app.brandName = 'efood';

app.deliveryPrefix = 'delivery';
app.chainPrefix = 'menu';

app.i18n = {
  countryCode: 'GR',
  locale: 'el',
  currency: {
    symbol: '€',
    unit: 'EUR',
  },
  trans: {
    generic: {
      SEE_MORE: 'Δες περισσότερες',
      SEE_LESS: 'Δες λιγότερες',
      SHOP_LISTING_TOGGLE_LIST: 'Λίστα',
      SHOP_LISTING_TOGGLE_IMAGES: 'Με εικόνα',
      SHOP_LISTING_TIP: 'Άλλαξε από εδώ τον τρόπο εμφάνισης των καταστημάτων',
    },
    'menu-search': {
      'search-placeholder': 'Aναζήτηση',
      'no-results': 'Δε βρέθηκε αποτέλεσμα για',
      add: 'Προσθήκη',
      'max-item-count': 'Μέγιστη ποσότητα %n τεμάχια',
      from: 'Από',
    },
    'order-tracking': {
      ORDER_TRACKING_INFO_COMPLETE: 'Στην πόρτα σου σε:',
      ORDER_TRACKING_INFO_ESTIMATION: 'Εκτιμώμενος Χρόνος:',
      ORDER_TRACKING_RECEIVED_TITLE: 'Λάβαμε την παραγγελία σου!',
      ORDER_TRACKING_RECEIVED_SUBTITLE:
        'Το κατάστημα θα επιβεβαιώσει την παραγγελία σου.',
      ORDER_TRACKING_IN_PROGRESS_TITLE: 'Επεξεργασία Παραγγελίας',
      ORDER_TRACKING_IN_PROGRESS_SUBTITLE:
        'Το κατάστημα θα ξεκινήσει να ετοιμάζει την παραγγελία σου πολύ σύντομα.',
      ORDER_TRACKING_PREPARING_TITLE: 'Προετοιμασία Παραγγελίας',
      ORDER_TRACKING_PREPARING_SUBTITLE:
        'Το κατάστημα ετοιμάζει όλα όσα ζήτησες.',
      ORDER_TRACKING_READY_FOR_DELIVERY_TITLE: 'Αποστολή Παραγγελίας',
      ORDER_TRACKING_READY_FOR_DELIVERY_SUBTITLE:
        'Η παραγγελία σου είναι έτοιμη προς παράδοση.',
      ORDER_TRACKING_PICKED_UP_TITLE: 'Η παραγγελία σου έρχεται.',
      ORDER_TRACKING_PICKED_UP_SUBTITLE:
        "Έχει φύγει το παιδί και βρίσκεται καθ'οδόν.",
      ORDER_TRACKING_ARRIVING_SOON_TITLE: '3,2,1... Φτάνουμε!',
      ORDER_TRACKING_ARRIVING_SOON_SUBTITLE:
        'Σε πολύ λίγο θα είμαστε στην πόρτα σου.',
      ORDER_TRACKING_DELIVERED_TITLE: 'Η παραγγελία σου έφτασε.',
      ORDER_TRACKING_DELIVERED_SUBTITLE:
        'Σου άρεσε; Μην ξεχάσεις να την αξιολογήσεις!',
      ORDER_TRACKING_CANCELED_TITLE: 'Η παραγγελία σου ακυρώθηκε',
      ORDER_TRACKING_CANCELED_SUBTITLE:
        'Το κατάστημα δυστυχώς δεν αποδέχτηκε την παραγγελία σου. Μην ανησυχείς, θα επικοινωνήσουμε άμεσα μαζί σου!',
      ORDER_TRACKING_IS_DELAYED_TITLE: 'Η παραγγελία σου θα καθυστερήσει λίγο.',
      ORDER_TRACKING_IS_DELAYED_SUBTITLE: 'Ο χρόνος παράδοσης έχει ανανεωθεί.',
      ORDER_TRACKING_DELIVERED_AT: 'Παραδόθηκε στις:',
      ORDER_TRACKING_LIVE_PROGRESS: 'live εξέλιξη παραγγελίας',
      ORDER_TRACKING_DELIVERED_BY: 'delivered by',
    },
    swimlanes: {
      URL_PREFIX: '/delivery',
      MINIMUM_ORDER: 'Ελάχ.',
      SEE_ALL: 'Δες τα όλα',
    },
    loaderMessage: 'Παρακαλώ περιμένετε...',
  },
};

app.status = {
  isJokerActive: false,
  shopListing: {
    shopCategorySelectedQuantity: null,
    shopCategorySelected: null,
    shopFilteringSelected: null,
    shopSortingSelected: null,
    shopQuantityShown: null,
    shopQuantityTotal: null,
    shopListMessageShown: null,
  },
  cuisineLanding: {
    selectedCuisine: null,
  },
};

app.swimlanes = {
  key: null,
};

app.address = {
  id: 252524,
  latitude: '37.9627451',
  longitude: '23.7517235',
  city: '\u0392\u03cd\u03c1\u03c9\u03bd\u03b1\u03c2',
  county: '\u0391\u03b8\u03ae\u03bd\u03b1',
  doorbellName: '\u03a6\u03ce\u03c3\u03ba\u03bf\u03bb\u03bf\u03c2',
  floor: '2',
  phone: '6971880185',
  userId: 0,
  isDefault: false,
  country: 'GR',
  street:
    '\u039b\u03b5\u03c9\u03c6\u03cc\u03c1\u03bf\u03c2 \u03a7\u03c1\u03c5\u03c3\u03bf\u03c3\u03c4\u03cc\u03bc\u03bf\u03c5 \u03a3\u03bc\u03cd\u03c1\u03bd\u03b7\u03c2',
  streetNo: '10',
  notes: '',
  zip: '16232',
  slug: null,
  area_slug: '',
  friendly_name: null,
  scope: 'personal',
  isComplete: true,
  isByArea: false,
  isFoodAtWork: false,
  isInNoMapArea: false,
};
