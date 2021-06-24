/* eslint-disable class-methods-use-this */
/* global google */
import autoBind from 'auto-bind';
import { debounce } from 'lodash';
import PubSub from 'pubsub-js';
import { store } from './store';
import mapStyle from './mapstyle';
import API from './api';
// todo dp floor
// todo check form completed
// todo submit address and refresh page

// This class uses places autocomplete service
// developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service
export default class {
  constructor() {
    autoBind(this);
    this.api = new API();
    this.queryTheDOM();
    // todo refacto below line
    this.verificationPlace = null;
    this.init();
  }

  queryTheDOM() {
    // Query the DOM
    this.DOM = {};

    // Choose Address modal
    this.DOM.chooseAddressModal = document.querySelector('.choose-address');
    this.DOM.chooseAddressModal = {
      modal: this.DOM.chooseAddressModal,
      trigger: document.querySelector('.address-trigger'),
      closeBtn: this.DOM.chooseAddressModal.querySelector(
        '.choose-address__close-btn',
      ),
      addNew: this.DOM.chooseAddressModal.querySelector(
        '.choose-address__add-new',
      ),
    };

    // Autosuggest modal
    this.DOM.autosuggestModal = document.querySelector(
      '.add-address__autosuggest-modal',
    );
    this.DOM.autosuggestModal = {
      modal: this.DOM.autosuggestModal,
      input: this.DOM.autosuggestModal.querySelector(
        '.add-address__autosuggest-input',
      ),
      inputLoading: this.DOM.autosuggestModal.querySelector(
        '.add-address__autosuggest-input-loader-icon',
      ),
      autocompleteResults: this.DOM.autosuggestModal.querySelector(
        '.add-address__autosuggest-results',
      ),
      actionBtn: this.DOM.autosuggestModal.querySelector('.js-action-btn'),
      closeBtn: this.DOM.autosuggestModal.querySelector('.js-close-modal'),
      trackme: this.DOM.autosuggestModal.querySelector('.add-address__trackme'),
      noResultTemplate: this.DOM.autosuggestModal.querySelector(
        '.add-address__autosuggest-result--no-result',
      ).outerHTML,
    };

    // Verify address modal
    this.DOM.verifyModal = document.querySelector('.add-address__verify-modal');
    this.DOM.verifyModal = {
      modal: this.DOM.verifyModal,
      map: this.DOM.verifyModal.querySelector('.add-address__map'),
      actionBtn: this.DOM.verifyModal.querySelector('.js-action-btn'),
      closeBtn: this.DOM.verifyModal.querySelector('.js-close-modal'),
      backBtn: this.DOM.verifyModal.querySelector('.js-previous-step'),
      mapInfo: this.DOM.verifyModal.querySelector('.add-address__map-info'),
      formStreetNumber: this.DOM.verifyModal.querySelector('.js-street-number'),
      formStreetName: this.DOM.verifyModal.querySelector('.js-street-name'),
      formStreetCity: this.DOM.verifyModal.querySelector('.js-city'),
      formPostalCode: this.DOM.verifyModal.querySelector('.js-postal'),
      formDoorbell: this.DOM.verifyModal.querySelector('.js-doorbell'),
      formFloor: this.DOM.verifyModal.querySelector('.js-floor'),
    };
  }

  init() {
    this.initChooseAddressModal();
    this.initAutoSuggestModal();
    this.initVerifyModal();

    window.googleMapsCallback = this.googleMapsCallback;
  }

  initChooseAddressModal() {
    // Choose address modal
    if (this.DOM.chooseAddressModal.trigger) {
      this.DOM.chooseAddressModal.trigger.addEventListener(
        'click',
        this.triggerClicked,
      );
      this.DOM.chooseAddressModal.closeBtn.addEventListener(
        'click',
        this.hideChooseAddressModal,
      );
      this.DOM.chooseAddressModal.addNew.addEventListener(
        'click',
        this.goToAddNewAddress,
      );
    }
  }

  initAutoSuggestModal() {
    this.DOM.autosuggestModal.autocompleteResults.innerHTML = '';
    this.DOM.autosuggestModal.input.addEventListener(
      'input',
      this.autocompleteInputChanged,
    );
    this.DOM.autosuggestModal.closeBtn.addEventListener(
      'click',
      this.hideAutosuggestModal,
    );
    this.DOM.autosuggestModal.actionBtn.addEventListener(
      'click',
      this.goToVerifyModal,
    );
    // hide the button if it doesnt support geolocation
    if (!navigator.geolocation) {
      this.DOM.autosuggestModal.trackme.classList.add('d-none');
    }
    this.DOM.autosuggestModal.trackme.addEventListener(
      'click',
      this.geolocationTrack,
    );

    // Debounce requestPlace so we dont spam the api with multiple request per keystroke
    this.requestPlacePrediction = debounce(this.requestPlacePrediction, 500);
    this.DOM.autosuggestModal.autocompleteResults.addEventListener(
      'click',
      this.suggestionClicked,
    );
  }

  initVerifyModal() {
    this.DOM.verifyModal.backBtn.addEventListener(
      'click',
      this.goToAutoSuggestModal,
    );

    // focus out
    this.DOM.verifyModal.formStreetCity.addEventListener(
      'focusout',
      this.focusOutInput,
    );
    this.DOM.verifyModal.formStreetNumber.addEventListener(
      'focusout',
      this.focusOutInput,
    );
    this.DOM.verifyModal.formStreetName.addEventListener(
      'focusout',
      this.focusOutInput,
    );

    this.DOM.verifyModal.formPostalCode.addEventListener(
      'focusout',
      this.focusOutInput,
    );

    this.DOM.verifyModal.actionBtn.addEventListener(
      'click',
      this.submitAddress,
    );
  }

  async focusOutInput() {
    // Κολοκοτρώνη 48, Βύρωνας 162 32, Ελλάδα
    const street = this.DOM.verifyModal.formStreetName.value;
    const number = this.DOM.verifyModal.formStreetNumber.value;
    const city = this.DOM.verifyModal.formStreetCity.value;
    const postal = this.DOM.verifyModal.formPostalCode.value;
    const addressToSearch = `${street} ${number}, ${city} ${postal}, Ελλάδα`;

    // If on focus out we have the same address dont do anything
    if (addressToSearch === this.addressToSearch) {
      return;
    }
    this.addressToSearch = addressToSearch;

    PubSub.publish('show_loader');
    try {
      const details = await this.geocoderService.geocode({
        address: addressToSearch,
      });
      console.log(details.results);
      if (details.results.length > 0) {
        [this.verificationPlace] = details.results;
      }
      this.updateMap(this.verificationPlace);
    } catch (error) {
      console.log('not found');
    }
    PubSub.publish('hide_loader');
  }

  triggerClicked() {
    console.log('clicked');
    // TODO check if the user has at least one address
    if (store.context.isUserLoggedIn) {
      console.log('user is logged in');
      this.showChooseAddressModal();
    } else {
      console.log('user is guest');
    }
  }

  showChooseAddressModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.chooseAddressModal.modal.classList.add('choose-address--active');
  }

  hideChooseAddressModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.chooseAddressModal.modal.classList.remove(
      'choose-address--active',
    );
  }

  showAutosuggestModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.autosuggestModal.modal.classList.add('active');
  }

  hideAutosuggestModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.autosuggestModal.modal.classList.remove('active');
  }

  showVerifyModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.verifyModal.modal.classList.add('active');
  }

  hideVerifyModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.verifyModal.modal.classList.remove('active');
  }

  googleMapsCallback() {
    // create service
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.geocoderService = new google.maps.Geocoder();
    // init map
    // initial position
    const pos = { lat: -37.9586849, lng: 23.7513711 };
    this.map = new google.maps.Map(this.DOM.verifyModal.map, {
      center: pos,
      zoom: 16,
      zoomControl: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      keyboardShortcuts: false,
      clickableIcons: false,
      styles: mapStyle,
    });
    window.mapitem = this.map;

    const image = `${store.context.imagesURL}icons/mapMarker.svg`;
    this.mapMarker = new google.maps.Marker({
      position: pos,
      map: this.map,
      icon: image,
      draggable: true,
    });

    this.mapMarker.addListener('dragstart', this.markerDragStart);
    this.mapMarker.addListener('dragend', this.markerDragEnd);
  }

  markerDragStart() {
    this.mapMarker.setAnimation(google.maps.Animation.BOUNCE);
  }

  markerDragEnd() {
    this.mapMarker.setAnimation(null);
    this.map.panTo(this.mapMarker.position);
  }

  autocompleteInputChanged(e) {
    this.autosuggestModalDisableButton();
    this.input = e.target.value;
    // dont requst for no input
    if (this.input.length < 3) return;

    console.log('user is typing. wait');
    this.DOM.autosuggestModal.inputLoading.classList.add('active');
    this.requestPlacePrediction();
  }

  async requestPlacePrediction() {
    console.log('requesting');

    // extra check for input
    if (!this.input) return;

    // perform request. limit results to Greece
    // https://developers.google.com/maps/documentation/places/web-service/supported_types#table3
    const request = {
      input: this.input,
      // types: ['(regions)'],
      types: ['address'],
      componentRestrictions: {
        country: 'gr',
      },
    };

    const response = await this.autocompleteService.getPlacePredictions(
      request,
    );

    this.autocompletePredictions = response.predictions;
    console.log(this.autocompletePredictions);

    this.DOM.autosuggestModal.inputLoading.classList.remove('active');

    if (this.autocompletePredictions) {
      console.log('we have results');
      this.DOM.autosuggestModal.autocompleteResults.innerHTML = '';
      this.autocompletePredictions.forEach((prediction) => {
        /* html */
        const divHTML = `
        <div class="add-address__autosuggest-result js-prediction">
          <img
            class="img-fluid mw-18"
            src="./images/icons/pin-blue.svg"
            alt=""
          />
          <div>
            <span>${prediction.structured_formatting.main_text}</span> <span class="color-dark-gray">${prediction.structured_formatting.secondary_text}</span>
          </div>
        </div>
        `;
        this.DOM.autosuggestModal.autocompleteResults.insertAdjacentHTML(
          'beforeend',
          divHTML,
        );
      });
    } else {
      this.DOM.autosuggestModal.autocompleteResults.innerHTML = '';
      console.log('no results');
    }
    const divHTML = this.DOM.autosuggestModal.noResultTemplate;
    this.DOM.autosuggestModal.autocompleteResults.insertAdjacentHTML(
      'beforeend',
      divHTML,
    );
  }

  async suggestionClicked(e) {
    const predictionElement = e.target.closest('.js-prediction');
    // User clicked on prediction
    if (predictionElement) {
      // show loader
      PubSub.publish('show_loader');
      // get index of element
      const index = [...predictionElement.parentElement.children].indexOf(
        predictionElement,
      );
      // get autocompletePrediction of element
      const autocompletePrediction = this.autocompletePredictions[index];

      // call the geocoderservice to get the place
      const details = await this.geocoderService.geocode({
        placeId: autocompletePrediction.place_id,
      });
      [this.autosuggestPlace] = details.results;
      this.DOM.autosuggestModal.input.value =
        this.autosuggestPlace.formatted_address;
      // hide loader
      PubSub.publish('hide_loader');
      // After we click the suggestion enable the button and hide the results
      this.autosuggestModalEnableButton();
      this.DOM.autosuggestModal.autocompleteResults.innerHTML = '';
    } else {
      const noResultElement = e.target.closest('.js-no-result');
      if (noResultElement) {
        console.log('no result click. go to next page');
        this.goToVerifyModal();
      }
    }
  }

  // Geolocation track
  async geolocationTrack() {
    PubSub.publish('show_loader');
    await this.getPosition({
      enableHighAccuracy: true,
      maximumAge: 100,
      timeout: 3000,
    })
      .then(async (position) => {
        const latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const details = await this.geocoderService.geocode({
          location: latlng,
        });

        if (details.results.length > 0) {
          // We have results
          // Get the first result
          [this.autosuggestPlace] = details.results;
          this.DOM.autosuggestModal.input.value =
            this.autosuggestPlace.formatted_address;
          this.autosuggestModalEnableButton();
        } else {
          // no results found
        }
      })
      .catch((err) => {
        console.log('er');
        console.error(err.message);
      });

    PubSub.publish('hide_loader');
  }

  autosuggestModalEnableButton() {
    this.DOM.autosuggestModal.actionBtn.classList.remove(
      'primary-btn--disabled',
    );
  }

  autosuggestModalDisableButton() {
    this.DOM.autosuggestModal.actionBtn.classList.add('primary-btn--disabled');
  }

  goToVerifyModal() {
    this.hideAutosuggestModal();
    this.prepareVerifyModal();
    this.showVerifyModal();
  }

  goToAutoSuggestModal() {
    this.hideVerifyModal();
    this.prepareAutosuggestModal();
    this.showAutosuggestModal();
  }

  goToAddNewAddress() {
    this.hideChooseAddressModal();
    this.prepareAutosuggestModal();
    this.showAutosuggestModal();
  }

  prepareAutosuggestModal() {
    this.DOM.autosuggestModal.autocompleteResults.innerHTML = '';
    this.autosuggestPlace = null;
    this.DOM.autosuggestModal.input.value = '';
    this.autosuggestModalDisableButton();
  }

  prepareVerifyModal() {
    // Set the maps to saved place. if exists
    if (this.autosuggestPlace) {
      this.verificationPlace = this.autosuggestPlace;
      this.updateFormAndMap(this.autosuggestPlace);
    } else {
      this.updateFormAndMap();
    }

    const street = this.DOM.verifyModal.formStreetName.value;
    const number = this.DOM.verifyModal.formStreetNumber.value;
    const city = this.DOM.verifyModal.formStreetCity.value;
    const postal = this.DOM.verifyModal.formPostalCode.value;
    const addressToSearch = `${street} ${number}, ${city} ${postal}, Ελλάδα`;

    this.addressToSearch = addressToSearch;
  }

  updateMap(googlePlace) {
    const pos = {
      lat: googlePlace.geometry.location.lat(),
      lng: googlePlace.geometry.location.lng(),
    };
    this.map.setCenter(pos);
    this.mapMarker.setPosition(pos);
  }

  updateFormAndMap(googlePlace, setMarker = true) {
    this.clearForm();

    let pos;

    if (googlePlace) {
      pos = {
        lat: googlePlace.geometry.location.lat(),
        lng: googlePlace.geometry.location.lng(),
      };
      // set the inputs to saved place. if exists
      googlePlace.address_components.forEach((component) => {
        // address_components types
        // https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingAddressTypes
        if (component.types.includes('street_number')) {
          this.DOM.verifyModal.formStreetNumber.value = component.long_name;
        } else if (component.types.includes('route')) {
          this.DOM.verifyModal.formStreetName.value = component.long_name;
        } else if (component.types.includes('postal_code')) {
          this.DOM.verifyModal.formPostalCode.value = component.long_name;
        } else if (component.types.includes('locality')) {
          this.DOM.verifyModal.formStreetCity.value = component.long_name;
        }
      });
    } else {
      pos = {
        lat: 37.98381,
        lng: 23.727539,
      };
    }
    if (setMarker) {
      this.map.setCenter(pos);
      this.mapMarker.setPosition(pos);
    } else {
      const latlng = {
        lat: this.mapMarker.position.lat(),
        lng: this.mapMarker.position.lng(),
      };
      this.map.setCenter(latlng);
    }
  }

  clearForm() {
    this.DOM.verifyModal.formStreetNumber.value = '';
    this.DOM.verifyModal.formStreetName.value = '';
    this.DOM.verifyModal.formPostalCode.value = '';
    this.DOM.verifyModal.formStreetCity.value = '';
  }

  getForm() {
    const obj = {
      street: this.DOM.verifyModal.formStreetName.value,
      number: this.DOM.verifyModal.formStreetNumber.value,
      postal: this.DOM.verifyModal.formPostalCode.value,
      city: this.DOM.verifyModal.formStreetCity.value,
      doorbell: this.DOM.verifyModal.formDoorbell.value,
      floor: this.DOM.verifyModal.formFloor.value,
    };
    return obj;
  }

  getPosition(options) {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, options),
    );
  }

  async submitAddress() {
    PubSub.publish('show_loader');
    const formValues = this.getForm();
    const addressObject = {
      lat: this.mapMarker.position.lat(),
      lng: this.mapMarker.position.lng(),
      street_number: formValues.number,
      route: formValues.street,
      postal_code: formValues.postal,
      city: formValues.city,
      // todo ask dimitris about those 3
      // state: Κεντρικός Τομέας Αθηνών
      // country: Ελλάδα
      // saved: false,
      // todo tell dimitris about new data
      doorbell: formValues.doorbell,
      floor: formValues.floor,
    };
    console.log(this.verificationPlace);
    console.log(addressObject);
    await this.api
      .addAddress(addressObject)
      .then((result) => {
        console.log(result);
        window.location.reload();
      })
      .catch((error) => {
        // TODO change to our alert
        alert(error.message);
      });

    PubSub.publish('hide_loader');
  }
}
