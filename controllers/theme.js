const ThemeController = {
    getTheme: function(req, res) {
        let responseText = 'Welcome to the Utlrta Theme.';
        res.status(200).send(responseText);
    }
}
export default ThemeController;
