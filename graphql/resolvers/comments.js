const {AuthenticationError} = require('apollo-server');
const { UserInputError } = require('apollo-server');
const Post = require('../../models/Post')
const checkAuth = require('../../util/check-auth');

module.exports = {
    Mutation:{
        createComment: async (_ , {postId,body} , context ) => {

            const user = checkAuth(context);
            if( body.trim() === '' ){
                throw new UserInput('Empy Comment' , {
                    errors: {
                        body: 'Comment body must not be empty',
                    }
                })
            }

            const post = await Post.findById( postId );

            if( post ){
                post.comments.unshift({
                    body,
                    username:user.username,
                    createdAt: new Date().toISOString()
                });
                await post.save();
                return post ;
            }else {
                throw new UserInputError('Post not found');
            }

        }
        ,
        async deleteComment( _ , args , context ){
            const {postId , commentId } = args ;
            const user = checkAuth(context);

            const post  = await Post.findById( postId );
            if( post ){
                const commentIndex = post.comments.findIndex( c => c.id === commentId ) 

                if( post.comments[commentIndex].username === user.username ){
                    post.comments.splice(commentIndex,1);
                    await post.save();
                    return post ;
                }else{
                    throw new AuthenticationError('Action not Allowed');
                }
            }else{
                throw new UserInputError('Post not found')
            }
        }
    }
    
}