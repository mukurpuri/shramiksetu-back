import axios from 'axios';

function GetRJCovidCases() {
    const path = `https://api.covid19india.org/v3/min/data.min.json`;
    axios.get(path)
    .then(function (response) {
       let jaipurData = response.data["RJ"].districts["Jaipur"];
       return jaipurData;
    })
    .catch(function (error) {
        return "fail"
    })
}
export { GetRJCovidCases }