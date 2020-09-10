
import Config from '../config/index';
import haversine from 'haversine-distance'

function CalculateDistanceBetweenTwoPoints(current, destination) {
    const a = { latitude: current.lat, longitude: current.lng }
    const b = { latitude: parseFloat(destination.lat), longitude: parseFloat(destination.lng) }
    let R = haversine(a, b);
    let distance = parseInt(R);
    if(distance >= 1000) {
        return (distance/1000).toFixed(0) + " Kms"
    }
    if(distance <= 10) {
        return "Near to you"    
    }
    return (distance).toFixed(0) + " Meters"
}

function CalculateDistanceBetweenTwoPointsRaw(current, destination) {
    //console.log("PONTS", current, destination);
    const a = { latitude: current.lat, longitude: current.lng }
    const b = { latitude: parseFloat(destination.lat), longitude: parseFloat(destination.lng) }
    let R = haversine(a, b);
    return parseInt(R).toFixed(0);
}

export { CalculateDistanceBetweenTwoPoints, CalculateDistanceBetweenTwoPointsRaw } 