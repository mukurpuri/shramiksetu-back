const UserController = {
    getUser: function(req, res) {
        let responseText = 'Welcome to SLDB backend';
        res.status(200).send(responseText);
    }
}
export default UserController;
