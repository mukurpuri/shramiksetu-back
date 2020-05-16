'use strict';

console.log('=============== session_timeout_duration ===============> ', process.env.session_timeout_duration);
console.log('=============== inactive_timeout_duration ===============> ', process.env.inactive_timeout_duration);

const moment = require('moment');
const sessionTimeoutDuration = process.env.session_timeout_duration || 8 * 3600; // 8 hours
const inactiveTimeoutDuration = process.env.inactive_timeout_duration || 3600; // 1 hour

const callControllerFunction = (userRef, controllerFunction, req, res, db, decodedToken, adminApp, auth) => {
    controllerFunction(req, res, db, decodedToken, adminApp, auth);
    userRef.set({ lastActive: Date.now() })
        .then((result) => { })
        .catch((error) => {
            console.log('------------- Error saving session data ------------', error, decodedToken.uid);
        });
};

const revokeToken = (auth, decodedToken, res, userRef) => {
    auth.revokeRefreshTokens(decodedToken.uid)
        .then(() => {
            if (userRef) {
                return userRef.delete();
            }
        })
        .then(() => {
            return res.status(401).send('TOKEN_REVOKED');
        });
};

const getSessionInfo = (userRef, controllerFunction, req, res, db, decodedToken, adminApp, auth) => {
    userRef.get()
        .then((result) => {
            if (result.data()) {
                const lastActiveTime = result.data().lastActive;
                const activeSessionTimeout = moment(lastActiveTime);
                activeSessionTimeout.add(inactiveTimeoutDuration, 'seconds');

                if (moment().isAfter(activeSessionTimeout)) {
                    return revokeToken(auth, decodedToken, res, userRef);
                } else {
                    return callControllerFunction(userRef, controllerFunction, req, res, db, decodedToken, adminApp, auth);
                }
            } else {
                return callControllerFunction(userRef, controllerFunction, req, res, db, decodedToken, adminApp, auth);
            }
        })
        .catch((err) => {
            return res.status(401).send('Unauthorised');
        });
};

const verifyIdToken = (req, res, controllerFunction, adminApp, auth, db) => {
    const idToken = req.header("idToken");
    if (!idToken) {
        return res.status(401).send('Unauthorised');
    } else {
        return auth.verifyIdToken(idToken)
            .then((decodedToken) => {
                const auth_time_ms = decodedToken.auth_time * 1000; // auth_time is in seconds from epoch
                const expirationTime = moment(auth_time_ms);
                expirationTime.add(sessionTimeoutDuration, 'seconds');

                // let sessionsRef = db.collection('user-sessions');
                // let userRef = sessionsRef.doc(decodedToken.uid);

                // Session timeout check
                if(moment().isAfter(expirationTime)) {
                    return revokeToken(auth, decodedToken, res, false);
                } else {
                    return controllerFunction(req, res, db, decodedToken, adminApp, auth);
                    // Active session timeout is now handled in frontend
                    // return getSessionInfo(userRef, controllerFunction, req, res, db, decodedToken, adminApp, auth);
                }
            }).catch((error) => {
                console.error(error);
                if (error.code === 'auth/id-token-revoked') {
                    return res.status(401).send('TOKEN_REVOKED');
                } else {
                    return res.status(401).send('Unauthorised');
                }
            });
    }
};

module.exports = {
    verifyIdToken
};