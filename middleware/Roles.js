const RBAC = (roles) => {
    return (req, res, next) => {
        const userRoles = req.user.roles;
        let allowed = false;
        userRoles.forEach(role => {
            if (roles.includes(role)) {
                allowed = true;
            }
        });
        if (!allowed) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};

module.exports = RBAC;