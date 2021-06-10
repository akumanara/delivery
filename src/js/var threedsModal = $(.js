const threedsModal = $(
  '<div id="threeDs" class="modal" tabindex="-1" role="dialog"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-body"><div id="threed-pane" style="height:60vh;width:100%">Παρακαλώ περιμένετε...</div></div></div></div></div>',
);
function showThreeDSModal() {
  $('#card-payment-modal').modal('hide');
  $('#threeDs').modal('show');
}
$('body').append(threedsModal);
$('body').on('click', '#submit', function (evt) {
  evt.preventDefault();
  n3.loader().loading();
  const form = $(this).closest('form');
  const save = form.find('input[name=save]');
  let saveCard = 0;
  if (save.length > 0) {
    saveCard = save.is(':checked');
  }
  VivaPayments.cards
    .requestToken({ amount: 2450 })
    .done((data) => {
      const payment_form = $(
        `<form action="/order/payment/pay" method="POST"><input type="hidden" name="__csrf_token__" value="15899761060c1e964d62bb2.32925953"><input type="hidden" name="token" value="${data.chargeToken}"><input type="hidden" name="order_id" value="1"><button type="submit" ></button></form>`,
      );
      if (saveCard == 1) {
        payment_form.append('<input type="hidden" name="save" value="1">');
      }
      $('body').append(payment_form);
      payment_form.submit();
    })
    .fail((responseData) => {
      n3.loader().hide();
      toastr.error(
        'Παρακαλώ ελέγξτε τα στοιχεία της κάρτας και δοκιμάστε ξανά!',
      );
      console.log(
        `Here is the reason it failed: ${responseData.Error.toString()}`,
      );
    });
});
function createPaymentModal() {
  let paymentModal = $(
    '<div id="card-payment-modal" class="modal fade" role="dialog"><div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button></div><div class="modal-body"></div></div></div></div>',
  );
  if ($('#card-payment-modal').length > 0) {
    paymentModal = $('#card-payment-modal');
    paymentModal.find('.modal-body').html('');
  } else {
    $('body').append(paymentModal);
  }
  return paymentModal;
}
function startPayment(form) {
  paymentModal = createPaymentModal();
  const url = form.attr('data-action');
  $.ajax({
    url,
    method: 'POST',
    data: form.serialize(),
    beforeSend() {
      n3.loader().loading();
    },
  })
    .done((response) => {
      paymentModal.find('.modal-body').html(response);
      paymentModal.modal('show');
    })
    .fail(() => {})
    .always(() => {
      n3.loader().hide();
    });
}
$(document).ready(() => {
  $('form#prepare_pay_with_card').submit(function (e) {
    const cardForm = $(this);
    if (
      $('[name=creditCardId]').length > 0 &&
      $('[name=creditCardId]:checked').val() != 'add_new_card'
    ) {
      n3.loader().loading();
    } else {
      e.preventDefault();
      startPayment(cardForm);
    }
  });
});
const baseUrl = 'https://demo-api.vivapayments.com';
VivaPayments.cards.setup({
  baseURL: baseUrl,
  authToken: 'BEADF0DDC0C8CBE3F0C35036CBD8192D65116BB908939D3D71D962938AA014FE',
  cardHolderAuthOptions: {
    cardHolderAuthPlaceholderId: 'threed-pane',
    cardHolderAuthInitiated() {
      showThreeDSModal();
      n3.loader().hide();
    },
    cardHolderAuthFinished() {},
  },
});
