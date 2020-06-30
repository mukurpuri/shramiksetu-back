
import Config from '../config/index';

function validateMobileNumber(number) {
    return /^\d+$/.test(number) && number.length === 10
}
function validateOTP(number) {
    return /^\d+$/.test(number) && number.length === Config.OTP_DIGIT_LENGTH
}
function isValidState(state) {
   return [
        "AN",
        "AP",
        "AR",
        "AS",
        "BR",
        "CH",
        "CT",
        "DL",
        "DN",
        "GA",
        "GJ",
        "HP",
        "HR",
        "JH",
        "JK",
        "KA",
        "KL",
        "LA",
        "LD",
        "MH",
        "ML",
        "MN",
        "MP",
        "MZ",
        "NL",
        "OR",
        "PB",
        "PY",
        "RJ",
        "SK",
        "TG",
        "TN",
        "TR",
        "TT",
        "UN",
        "UP",
        "UT",
        "WB"
      ].indexOf(state) >= 0
}
export { validateMobileNumber, validateOTP, isValidState } 