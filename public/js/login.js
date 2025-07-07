import { showAlert } from './alerts.js';

export const login = async (email, password) => {
  console.log('LOGIN');
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in Successfully');

      //load the home page
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    console.log(res);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if ((res.data.status = 'success')) {
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'Error logging out Try again');
  }
};
