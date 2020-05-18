function generateOTP(times) {
    let POWER = Math.pow(10, (times - 1));
    return (Math.floor(Math.random() * (9*(POWER))) + (POWER)).toString();
}
export { generateOTP } 