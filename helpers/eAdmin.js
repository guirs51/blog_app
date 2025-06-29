module.exports = {
    eAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.admin === 1){
            return next();
        }else {
            req.flash("error", "Voce precisa ser admin")
            res.redirect("/")
        }
    }
}