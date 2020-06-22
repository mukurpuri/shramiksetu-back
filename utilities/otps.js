import axios from 'axios';

function sendOTP(API_KEY, number, OTP) {
    const path = `https://2factor.in/API/V1/${API_KEY}/SMS/+91${number}/${OTP}/OTP for Shramik Setu Signin`;
    console.log(path);
    axios.get(path)
    .then(function (response) {
        // handle success
        return "pass"
    })
    .catch(function (error) {
        // handle error
        return "fail"
    })
    .then(function () {
        // always executed
        return "pass"
    });
}
function generateOTP(times) {
    let POWER = Math.pow(10, (times - 1));
    return (Math.floor(Math.random() * (9*(POWER))) + (POWER)).toString();
}
export { generateOTP, sendOTP } 