/* global google */
import autoBind from 'auto-bind';
import { debounce } from 'lodash';
import PubSub from 'pubsub-js';
import { store } from './store';
import texts from './texts';
import mapStyle from './mapstyle';
import { distanceBetweenLatLon } from './utils';
// This class uses places autocomplete service
// developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service
export default class {
  constructor() {
    autoBind(this);
    // Query the DOM
    this.DOM = {};

    // Choose Address modal
    this.DOM.trigger = document.querySelector('.address-trigger');
    this.DOM.chooseAddress = document.querySelector('.choose-address');
    this.DOM.closeModal = document.querySelector('.choose-address__close-btn');

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
    };

    this.placeToSubmit = null;
    this.disableButton();
    this.init();
  }

  init() {
    if (this.DOM.trigger) {
      this.DOM.trigger.addEventListener('click', this.triggerClicked);
      this.DOM.closeModal.addEventListener(
        'click',
        this.hideChooseAddressModal,
      );
    }

    this.DOM.autosuggestModal.autocompleteResults.innerHTML = '';
    window.googleMapsCallback = this.googleMapsCallback;
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

    this.DOM.verifyModal.backBtn.addEventListener(
      'click',
      this.goToAutoSuggestModal,
    );

    // Debounce requestPlace so we dont spam the api with multiple request per keystroke
    this.requestPlacePrediction = debounce(this.requestPlacePrediction, 500);
    this.DOM.autosuggestModal.autocompleteResults.addEventListener(
      'click',
      this.suggestionClicked,
    );
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
    this.DOM.chooseAddress.classList.add('choose-address--active');
  }

  hideChooseAddressModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.chooseAddress.classList.remove('choose-address--active');
  }

  showAutosuggestModal() {
    this.savedPlace = null;
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
      styles: mapStyle,
    });

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
    // this.mapMarker.setAnimation(google.maps.Animation.DROP);
    this.mapMarker.setAnimation(null);
    // recenter the map to the marker
    this.map.panTo(this.mapMarker.position);

    this.updatePlaceToSubmitFromMarkerPosition();
    if (!this.savedPlace) return;
    // Check to see if it is to far
    const distance = distanceBetweenLatLon(
      this.mapMarker.position.lat(),
      this.mapMarker.position.lng(),
      this.savedPlace.geometry.location.lat(),
      this.savedPlace.geometry.location.lng(),
      'M',
    );

    if (distance > 0.25) {
      // TOO FAR
      this.DOM.verifyModal.mapInfo.classList.add('error');
      this.DOM.verifyModal.mapInfo.innerText = texts.markerDragERROR;
    } else {
      // OK
      this.DOM.verifyModal.mapInfo.classList.remove('error');
      this.DOM.verifyModal.mapInfo.innerText = texts.markerDragOK;
    }
  }

  updatePlaceToSubmitFromMarkerPosition() {
    PubSub.publish('show_loader');
    const latlng = {
      lat: this.mapMarker.position.lat(),
      lng: this.mapMarker.position.lng(),
    };
    this.geocoderService.geocode(
      { location: latlng },
      this.reverseGeocoderFromGoogleCallbackMarkerEnd,
    );
  }

  reverseGeocoderFromGoogleCallbackMarkerEnd(GeocoderResults, GeocoderStatus) {
    console.log(GeocoderResults);
    if (GeocoderResults.length > 0) {
      [this.placeToSubmit] = GeocoderResults;
    }
    console.log(this.placeToSubmit);
    this.updateForm(this.placeToSubmit);
  }

  autocompleteInputChanged(e) {
    this.disableButton();
    this.input = e.target.value;
    // dont requst for no input
    if (this.input.length < 3) return;

    console.log('user is typing. wait');
    this.DOM.autosuggestModal.inputLoading.classList.add('active');
    this.requestPlacePrediction();
  }

  requestPlacePrediction() {
    console.log('requesting');

    // extra check for input
    if (!this.input) return;

    // perform request. limit results to Greece
    const request = {
      input: this.input,
      types: ['address'],
      componentRestrictions: {
        country: 'gr',
      },
    };
    this.autocompleteService.getPlacePredictions(
      request,
      this.placesFromGoogleCallback,
    );
  }

  placesFromGoogleCallback(AutocompletePredictions, PlacesServiceStatus) {
    console.log(this.geocoderService);
    console.table(AutocompletePredictions);
    console.log(PlacesServiceStatus);
    this.autocompletePredictions = AutocompletePredictions;

    this.DOM.autosuggestModal.inputLoading.classList.remove('active');
    // if results
    // clear box from prev results
    // create list elements and append them to the results box
    // show box

    // else
    // hide results
    if (AutocompletePredictions) {
      console.log('we have results');
      this.DOM.autosuggestModal.autocompleteResults.innerHTML = '';
      AutocompletePredictions.forEach((prediction) => {
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
    const divHTML = `<div class="add-address__autosuggest-result js-no-result">${texts.autocompleteNoResults}</div>`;
    this.DOM.autosuggestModal.autocompleteResults.insertAdjacentHTML(
      'beforeend',
      divHTML,
    );
  }

  suggestionClicked(e) {
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

      const details = this.geocoderService.geocode(
        { placeId: autocompletePrediction.place_id },
        this.geocoderFromGoogleCallback,
      );
      console.log(details);

      // After we click the suggestion enable the button and hide the results
      this.enableButton();
      this.DOM.autosuggestModal.autocompleteResults.innerHTML = '';
    } else {
      const noResultElement = e.target.closest('.js-no-result');
      if (noResultElement) {
        console.log('no result click. go to next page');
      }
    }
  }

  geocoderFromGoogleCallback(GeocoderResults, GeocoderStatus) {
    [this.savedPlace] = GeocoderResults;
    this.DOM.autosuggestModal.input.value = this.savedPlace.formatted_address;

    console.log(GeocoderResults);
    console.log(GeocoderStatus);

    PubSub.publish('hide_loader');
  }

  enableButton() {
    this.DOM.autosuggestModal.actionBtn.classList.remove(
      'primary-btn--disabled',
    );
  }

  disableButton() {
    this.DOM.autosuggestModal.actionBtn.classList.add('primary-btn--disabled');
  }

  // Geolocation track
  geolocationTrack() {
    PubSub.publish('show_loader');
    navigator.geolocation.getCurrentPosition(
      this.geolocationSuccess,
      this.geolocationError,
      { enableHighAccuracy: true, maximumAge: 100, timeout: 3000 },
    );
  }

  geolocationSuccess(position) {
    console.log(position);
    const latlng = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    const details = this.geocoderService.geocode(
      { location: latlng },
      this.reverseGeocoderFromGoogleCallback,
    );
    console.log(details);
  }

  geolocationError(error) {
    PubSub.publish('hide_loader');
  }

  reverseGeocoderFromGoogleCallback(GeocoderResults, GeocoderStatus) {
    console.log(GeocoderResults);
    if (GeocoderResults.length > 0) {
      // We have results
      // Get the first result
      [this.savedPlace] = GeocoderResults;
      this.DOM.autosuggestModal.input.value = this.savedPlace.formatted_address;
      this.enableButton();
    } else {
      // no results found
    }
    PubSub.publish('hide_loader');
  }

  goToVerifyModal() {
    this.hideAutosuggestModal();
    this.prepareVerifyModal();
    this.showVerifyModal();
  }

  goToAutoSuggestModal() {
    this.hideVerifyModal();
    this.showAutosuggestModal();
  }

  prepareVerifyModal() {
    // Set the maps to saved place. if exists
    if (this.savedPlace) {
      this.updateForm(this.savedPlace);
    }
  }

  updateForm(googlePlace) {
    const pos = {
      lat: googlePlace.geometry.location.lat(),
      lng: googlePlace.geometry.location.lng(),
    };
    this.map.setCenter(pos);
    this.mapMarker.setPosition(pos);

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
    PubSub.publish('hide_loader');
  }
}
