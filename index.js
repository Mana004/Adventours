console.log("Script loaded \u2705");
const $70af9284e599e604$export$596d806903d1f59e = async (email, password)=>{
    console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email: email,
                password: password
            }
        });
        if (res.data.status === 'success') {
            alert('Logged in Successfully');
            //load the home page
            window.setTimeout(()=>{
                location.assign('/');
            }, 1500);
        }
        console.log(res);
    } catch (err) {
        alert(err.response.data.message);
    }
};


document.querySelector('.form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    (0, $70af9284e599e604$export$596d806903d1f59e)(email, password);
});


//# sourceMappingURL=index.js.map
