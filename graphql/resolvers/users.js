const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');
const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
const { SECRET_KEY } = require('../../config');


module.exports = {
    Mutation:{
        // any mutation function takes 4 arguments ( parent, args, context , info ) now we do not need anything except args, insted of parent we will use so that no memory is taken for that variable
        async register( _ , args  ){
            let { registerInput :{username,email,password,confirmPassword}} = args ;
            //make sure the user doesn't already exists 
            const {valid,errors} = validateRegisterInput(username,email,password,confirmPassword);
            if( !valid ){
                throw new UserInputError( 'Errors', { errors })
            } 
            const user = await User.findOne({username:username})
            if( user){
                // we can just throw error, but better to use specific errors  provided by apollo here below we have also attached a payload, to use that later to display these errors on our website's form 
                throw new UserInputError('Username Is Taken', {
                    errors:{
                        username:'This username is taken'
                    }
                })
            }
            //hash password and create a new user 
            password = await bcrypt.hash(password,12);
            const newUser = new User({
                username,
                email,
                password,
                confirmPassword,
                createdAt: new Date().toISOString(),
            })

            const res = await newUser.save();
            const token = generateToken(res );

            return {
                ...res._doc,
                id:res._id,
                token,
            }
            // TODO: Validate user data 
            // Make sure user does'nt already exists
            // Todo: Hash password and create and auth token 
        },
        async login(_, args ){
            const {username,password} = args ;
            const {errors,valid} = validateLoginInput( username, password );
            if( !valid ){
                throw new UserInputError('Input Error' , {errors});
            }
            const user = await User.findOne({username} );
            console.log( user );
            if( !user ){
                errors.general = 'User not found';
                throw new UserInputError('User not found', {errors});
            }
            const match = await bcrypt.compare( password , user.password );
            //console.log( match );
            if( !match ){
                errors.general = 'Wrong Credentials'
                throw new UserInputError('Wrong Credentials', {errors} );
            }
            const token = generateToken( user );
    
            return { 
                ...user._doc,
                id:user.id,
                token,
            }
        }
    }
    
}

function generateToken( user ){
    return jwt.sign({
        id:user.id,
        email:user.email,
        username:user.username,
    }, SECRET_KEY ,{ expiresIn:'1h' } ); 
}
