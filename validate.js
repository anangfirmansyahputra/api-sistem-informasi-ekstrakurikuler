const Joi = require("joi");

const schemaRegister = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

const schemaLogin = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

const schemaLoginSiswa = Joi.object({
    nis: Joi.string().required(),
    password: Joi.string().required(),
});

const schemaPengajar = Joi.object({
    nama: Joi.string().required(),
    nik: Joi.string().required(),
    password: Joi.string().required().min(6),
    mengajar: Joi.string(),
    alamat: Joi.string(),
    tgl: Joi.string(),
    noTelp: Joi.string(),
});

const schemaSiswa = Joi.object({
    name: Joi.string().required(),
    nis: Joi.number().required().min(10),
    password: Joi.string().required().min(6),
});

module.exports = {
    schemaRegister: schemaRegister,
    schemaLogin: schemaLogin,
    schemaPengajar: schemaPengajar,
    schemaSiswa: schemaSiswa,
    schemaLoginSiswa,
};
