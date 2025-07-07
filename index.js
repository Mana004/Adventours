console.log('alert triggered');
const $3adf927435cf4518$export$516836c6a9dfc573 = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};
const $3adf927435cf4518$export$de026b00723010c1 = (type, msg) => {
  $3adf927435cf4518$export$516836c6a9dfc573();
  const markup = `<div class ="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout($3adf927435cf4518$export$516836c6a9dfc573, 5000);
};

const $70af9284e599e604$export$596d806903d1f59e = async (email, password) => {
  console.log('LOGIN');
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });
    if (res.data.status === 'success') {
      (0, $3adf927435cf4518$export$de026b00723010c1)(
        'success',
        'Logged in Successfully',
      );
      //load the home page
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    console.log(res);
  } catch (err) {
    (0, $3adf927435cf4518$export$de026b00723010c1)(
      'error',
      err.response.data.message,
    );
  }
};
const $70af9284e599e604$export$a0973bcfe11b05c9 = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    res.data.status = 'success';
    window.setTimeout(() => {
      location.assign('/');
    }, 1500);
    location.reload(true);
  } catch (err) {
    (0, $3adf927435cf4518$export$de026b00723010c1)(
      'error',
      'Error logging out Try again',
    );
  }
};

/*eslint-disable*/ const $f60945d37f8e594c$export$4c5dd147b21b9176 = (
  locations,
) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWFuaXNocGF0aWwyMDA0IiwiYSI6ImNtY2x2cm1lZzBmcnEya3NkODRhZHU3eWEifQ.eeQNTPBPQQiKFtD0VqWG3A';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    projection: 'mercator',
    scrollZoom: false,
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    //Create Marker
    const el = document.createElement('div');
    el.className = 'marker';
    //Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    //Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`)
      .addTo(map);
    //Extend Map Bounds to include current location
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};

const $936fcc27ffb6bbb1$export$f558026a994b6051 = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : 'api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url: url,
      data: data,
    });
    if (res.data.status === 'success')
      (0, $3adf927435cf4518$export$de026b00723010c1)(
        'success',
        `${type.toUpperCase()} updated successfully !`,
      );
  } catch (err) {
    (0, $3adf927435cf4518$export$de026b00723010c1)(
      'error',
      err.response.data.message,
    );
  }
};

const $6710bca62beba915$var$stripe = Stripe(
  'pk_test_51RhZguR5Ngf9x6YEH1Rim42Uku8rmpXU8zaOTPV1hL4IzA9E8n9Z6Lltl6wr9duwO84iYrtFv8wMsw7gcZA5ygTC00TvMl6vIZ',
);
const $6710bca62beba915$export$8d5bdbf26681c0c2 = async (tourId) => {
  try {
    //1) get checkout session from api
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    console.log(session.data);
    //2) Create checkout form + charge credit card
    await $6710bca62beba915$var$stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    (0, $3adf927435cf4518$export$de026b00723010c1)('error', err);
  }
};

console.log('HEY HEY');
// DOM ELEMENTS
const $d0f7ce18c37ad6f6$var$mapBox = document.getElementById('map');
const $d0f7ce18c37ad6f6$var$loginForm = document.querySelector('.form--login');
const $d0f7ce18c37ad6f6$var$logOutBtn =
  document.querySelector('.nav__el--logout');
const $d0f7ce18c37ad6f6$var$userDataForm =
  document.querySelector('.form-user-data');
const $d0f7ce18c37ad6f6$var$userPasswordForm = document.querySelector(
  '.form-user-password',
);
const $d0f7ce18c37ad6f6$var$bookBtn = document.getElementById('book-tour');
//DELEGATION
if ($d0f7ce18c37ad6f6$var$mapBox) {
  const locations = JSON.parse($d0f7ce18c37ad6f6$var$mapBox.dataset.locations);
  console.log(locations);
  (0, $f60945d37f8e594c$export$4c5dd147b21b9176)(locations);
}
if ($d0f7ce18c37ad6f6$var$loginForm)
  $d0f7ce18c37ad6f6$var$loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //VALUES
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    (0, $70af9284e599e604$export$596d806903d1f59e)(email, password);
  });
if ($d0f7ce18c37ad6f6$var$logOutBtn) {
  $d0f7ce18c37ad6f6$var$logOutBtn.addEventListener(
    'click',
    (0, $70af9284e599e604$export$a0973bcfe11b05c9),
  );
  console.log('logout btn detected');
}
if ($d0f7ce18c37ad6f6$var$userDataForm)
  $d0f7ce18c37ad6f6$var$userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    (0, $936fcc27ffb6bbb1$export$f558026a994b6051)(form, 'data');
  });
if ($d0f7ce18c37ad6f6$var$userPasswordForm)
  $d0f7ce18c37ad6f6$var$userPasswordForm.addEventListener(
    'submit',
    async (e) => {
      e.preventDefault();
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value; //these are the exact names our api expects
      await (0, $936fcc27ffb6bbb1$export$f558026a994b6051)(
        {
          passwordCurrent: passwordCurrent,
          password: password,
          passwordConfirm: passwordConfirm,
        },
        'password',
      );
      //after done set it to empty
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    },
  );
if ($d0f7ce18c37ad6f6$var$bookBtn)
  $d0f7ce18c37ad6f6$var$bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing..';
    const { tourId: tourId } = e.target.dataset;
    //call bookTour fn and give it the curr tour id
    (0, $6710bca62beba915$export$8d5bdbf26681c0c2)(tourId);
  });

//# sourceMappingURL=index.js.map
