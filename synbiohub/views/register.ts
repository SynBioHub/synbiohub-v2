
import pug from 'pug';
import validator from 'validator';
import util from 'synbiohub/util';
import async from 'async';
import extend from 'xtend';
import config from 'synbiohub/config';
import createUser from 'synbiohub/createUser';
import db from 'synbiohub/db';

export default function(req, res) {
    
    if(req.method === 'POST') {
        registerPost(req, res)
    } else {
        registerForm(req, res, {})
    }
};

function registerForm(req, res, locals) {

	if (req.user) {
		return res.redirect(req.query.next || '/');
	}

    locals = extend({
        config: config.get(),
        section: 'register',
        nextPage: req.query.next || '/',
        registerAlert: null,
        user: req.user,
        form: locals.form || {}
    }, locals)
    
    res.send(pug.renderFile('templates/views/register.jade', locals))
}


function registerPost(req, res) {

    if(!req.body.name) {
        return registerForm(req, res, {
            form: req.body,
            registerAlert: 'Please enter your name'
        })
    }

    if(!req.body.username || !validator.isAlphanumeric(req.body.username)) {
        return registerForm(req, res, {
            form: req.body,
            registerAlert: 'Please enter a valid username'
        })
    }

    if(!req.body.email || !validator.isEmail(req.body.email)) {
        return registerForm(req, res, {
            form: req.body,
            registerAlert: 'Please enter a valid e-mail address'
        })
    }

    if(!req.body.password1) {
        return registerForm(req, res, {
            form: req.body,
            registerAlert: 'Please enter a password'
        })
    }

    if(req.body.password1 !== req.body.password2) {
        return registerForm(req, res, {
            form: req.body,
            registerAlert: 'Passwords do not match'
        })
    }

    createUser({

        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        affiliation: req.body.affiliation || '',
        password: req.body.password1

    }).then((user) => {

        req.session.user = user.id
	req.session.save(() => {
            res.redirect(req.body.next || '/');
        })

    }).catch((err) => {

        registerForm(req, res, {
            form: req.body,
            registerAlert: err.toString()
        })

    })
    
}

