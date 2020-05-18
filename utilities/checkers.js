
import Config from '../config/index';

function validateMobileNumber(number) {
    return /^\d+$/.test(number) && number.length === 10
}
function validateOTP(number) {
    return /^\d+$/.test(number) && number.length === Config.OTP_DIGIT_LENGTH
}
export { validateMobileNumber, validateOTP } 