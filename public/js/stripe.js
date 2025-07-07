import { showAlert } from './alerts.js';

const stripe = Stripe(
  'pk_test_51RhZguR5Ngf9x6YEH1Rim42Uku8rmpXU8zaOTPV1hL4IzA9E8n9Z6Lltl6wr9duwO84iYrtFv8wMsw7gcZA5ygTC00TvMl6vIZ',
);

export const bookTour = async (tourId) => {
  try {
    //1) get checkout session from api
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);

    console.log(session.data);

    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
