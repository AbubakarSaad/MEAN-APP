var User   = require('../models/user');
var jwt    = require('jsonwebtoken');
var config = require('../config');

// super secert for creating tokens
var superSecret = config.secert;

module.exports = function(app, express){

	var apiRouter = express.Router();


	// route for authenticating a users (POST http://localhost:8080/api/authenticate)
	apiRouter.post('/authenticate', function(req, res) {
	    // find the user
	    // select the name username and password explicitly
	    User.findOne({
	        username: req.body.username
	    }).select('name username password').exec(function(err, user) {

	    	if(err) throw err;

	        // no user with that username was found
	        if (!user) {
	            res.json({
	                success: false,
	                message: 'Authentication failed. | User not found.'
	            });
	        } else if (user) {
	            
	            var validPassword = user.comparePassword(req.body.password);
	            if(!validPassword){
	            	res.json({
	            		success: false,
	            		message: 'Authentication failed: Wrong password'
	            	});
	            }else {
	            	// if user is found and password is right
		            // create a token
		            var token = jwt.sign(user, superSecert, {
		                expiresInMinutes: 1440 // expires in 24 hours
		            });

		            // return the information including token as JSON
		            res.json({
		                success: true,
		                message: 'Enjoy your token!',
		                token: token
		            });
	            }
	            
	        }
	    });
	});



	apiRouter.use(function(req, res, next) {
	    // do logging
	    console.log('Someday just came to our app!');

	    // check header or url parameters or post parameters for token
	    var token = req.body.token || req.query.token || req.headers['x-access-token'];

	    // decode token
	    if (token) {
	        // verifies secert and checks exp
	        jwt.verify(token, superSecert, function(err, decoded) {
	            if (err) {
	                return res.status(403).send({
	                    success: false,
	                    message: 'Failed to authenticate token.'
	                });
	            } else {
	                // if everything is good, save to request for use in other routes
	                req.decoded = decoded;

	                next();	// make sure we go the next routes and don't stop here
	            }
	        });
	    } else {
	        // if there is no token
	        // return as HTTP response of 403 (access forbidden) and an error message
	        return res.status(403).send({
	            success: false,
	            message: 'No token provided.'
	        });
	    }
	    // next();
	});

	// test route to make sure everything is working
	// accessed at GET http://localhost:8080/api
	apiRouter.get('/', function(req, res) {
	    res.json({
	        message: 'hooray! welcome to our api!'
	    });
	});

	// more routes for our API will happen here
	apiRouter.route('/users')

		// create a user (accessed at POST http://localhost:8080/api/users)
		.post(function(req, res) {
		    // create a new instance of the User model
		    var user = new User();

		    // set the users information (comes from the request)
		    user.name = req.body.name;
		    user.username = req.body.username;
		    user.password = req.body.password;

		    // save the user and check for errors
		    user.save(function(err) {
		        if (err) {
		            //duplicate entry
		            if (err.code == 11000) {
		                return res.json({
		                    success: false,
		                    message: 'A user with that username already exists. '
		                });
		            } else {
		                return res.send(err);
		            }
		        }
		        res.json({
		            message: 'User created! '
		        });
		    });
		})

		// get all the users (accessed at GET http://localhost:8080/api/users)
		.get(function(req, res) {
		    User.find(function(err, users) {
		        if (err) {
		            res.send(err);
		        }

		        // return the users
		        res.json(users);
		    });
		});

	apiRouter.route('/users/:user_id')

		// get the user with that id
		// (accessed at GET http://localhost:8080/api/users/:user_id)
		.get(function(req, res) {
		    User.findById(req.params.user_id, function(err, user) {
		        if (err) {
		            res.send(err);
		        }

		        // return that user
		        res.json(user);
		    });
		})

		// update the user with this id
		// (accessed at PUT http://localhost:8080/api/users/:user_id)
		.put(function(req, res) {

		    // user our user model to find the user we want
		    User.findById(req.params.user_id, function(err, user) {
		        if (err) {
		            res.send(err);
		        }

		        // update the users info only if it's new
		        if (req.body.name) {
		            user.name = req.body.name;
		        }
		        if (req.body.username) {
		            user.username = req.body.username;
		        }
		        if (req.body.username) {
		            user.password = req.body.password;
		        }

		        // save the user
		        user.save(function(err) {
		            if (err) {
		                res.send(err);
		            }

		            // return a message
		            res.json({
		                message: 'User updated!'
		            });
		        });
		    });
		})

		// delete the user with this id
		// (accessed at DELETE http://localhost:8080/api/users/:user_id)
		.delete(function(req, res) {
		    User.remove({
		        _id: req.params.user_id
		    }, function(err, user) {
		        if (err) {
		            return res.send(err);
		        }
		        res.json({
		            message: 'Successfully delete'
		        });
		    });
		});

	return apiRouter;
}