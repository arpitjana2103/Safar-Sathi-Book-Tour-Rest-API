const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const helper = require("../utils/helper.util");

const validatePassword = function (password) {
    return (
        password.length >= 5 &&
        password.length <= 20 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password)
    );
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "(( User must have a name ))"],
    },
    email: {
        type: String,
        required: [true, "(( User must have email ))"],
        unique: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: "(( Invalid email address ))",
        },
    },
    photo: String,
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user",
    },
    password: {
        type: String,
        required: [true, "(( User must have a password ))"],
        validate: {
            validator: validatePassword,
            message:
                "(( Password must be 5 to 20 characters and includes uppercase, lowercase & number ))",
        },
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, "(( Please confirm your password ))"],
        validate: {
            validator: function (passwordConfirm) {
                return this.password === passwordConfirm;
            },
            message: "(( Password and PasswordConfirm need to be same ))",
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

////////////////////////////////////////
// DOCUMENT MEDDLEWARE / HOOK //////////

// runs before Model.prototype.save() and Model.create()
userSchema.pre("save", async function (next) {
    // Only Run the Function if the password is modified
    if (!this.isModified("password")) return next();

    // Hash Password
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 2000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

// runs after Model.prototype.save() and Model.create()
userSchema.post("save", function (doc, next) {
    doc.password = undefined;
    doc.__v = undefined;
    next();
});

////////////////////////////////////////
// Instance Method /////////////////////
// These Methods will be availabe for all the Documents

userSchema.methods.varifyPassword = async function (
    rawPassord,
    hashedPassword,
) {
    return await bcrypt.compare(rawPassord, hashedPassword);
};

userSchema.methods.varifyToken = async function (rawToken, hashedToken) {
    return await bcrypt.compare(rawToken, hashedToken);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10,
        );
        return JWTTimestamp < changedTimeStamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const fourDigitNum = helper.getRandomNum(1000, 9999);
    const fourAlphaStr = helper.getRandomAlphabets(4);
    const token = `${fourDigitNum}-${fourAlphaStr}`;
    return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
