const bcrypt = require('bcrypt');

//hash password
exports.hashPassword = async (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            if(err) {
                reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) {
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
};

//compare password || decrypt password
exports.comparePassword = (password, hashed) => {
    return bcrypt.compare(password, hashed);
};

