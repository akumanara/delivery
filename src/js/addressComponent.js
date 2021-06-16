/* global google */
import autoBind from 'auto-bind';
import { debounce } from 'lodash';
import { store } from './store';
import texts from './texts';
// This class uses places autocomplete service
// developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service
export default class {
  constructor() {
    autoBind(this);
    // Query the DOM
    this.DOM = {};
    this.DOM.trigger = document.querySelector('.address-trigger');
    this.DOM.chooseAddress = document.querySelector('.choose-address');
    this.DOM.closeModal = document.querySelector('.choose-address__close-btn');

    this.DOM.autosuggestModal = {
      modal: document.querySelector('.add-address__autosuggest-modal'),
      input: document.querySelector('.add-address__autosuggest-input'),
      inputLoading: document.querySelector(
        '.add-address__autosuggest-input-loader-icon',
      ),
      autocompleteResults: document.querySelector(
        '.add-address__autosuggest-results',
      ),
    };

    // Debounce requestPlace so we dont spam the api with multiple request per keystroke
    this.requestPlacePrediction = debounce(this.requestPlacePrediction, 500);
    this.DOM.autosuggestModal.autocompleteResults.addEventListener(
      'click',
      this.suggestionClicked,
    );

    this.autocompleteSaved = false;
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

  googleMapsCallback() {
    // create service
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.geocoderService = new google.maps.Geocoder();
  }

  autocompleteInputChanged(e) {
    // input is locked
    if (this.autocompleteSaved) return;
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
      console.log('no results');
      this.DOM.autosuggestModal.autocompleteResults.innerHTML = '';
      const divHTML = `<div class="add-address__autosuggest-result">${texts.autocompleteNoResults}</div>`;
      this.DOM.autosuggestModal.autocompleteResults.insertAdjacentHTML(
        'beforeend',
        divHTML,
      );
    }
  }

  suggestionClicked(e) {
    const predictionElement = e.target.closest('.js-prediction');
    if (!predictionElement) return;

    // get index of element
    const index = [...predictionElement.parentElement.children].indexOf(
      predictionElement,
    );
    // get autocompletePrediction of element
    const autocompletePrediction = this.autocompletePredictions[index];

    console.log(autocompletePrediction);
    const details = this.geocoderService.geocode(
      { placeId: autocompletePrediction.place_id },
      this.geocoderFromGoogleCallback,
    );
    console.log(details);

    // google.maps.places.PlaceDetailsRequest
    console.log(predictionElement);
  }

  geocoderFromGoogleCallback(GeocoderResults, GeocoderStatus) {
    // this.autocompleteSaved = true;
    [this.savedPlace] = GeocoderResults;
    this.DOM.autosuggestModal.input.value =
      GeocoderResults[0].formatted_address;

    console.log(GeocoderResults);
    console.log(GeocoderStatus);
  }
}
