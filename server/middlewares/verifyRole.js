const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
      const role = req.role;
      if (allowedRoles.includes(role)) {
        next();
      } else {
        res
          .status(403)
          .json({ message: "You are not authorized to access this route!" });
      }
    };
  };
  
module.exports = verifyRole;