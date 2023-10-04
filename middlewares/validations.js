module.exports = {

    userAddValidation: (req, res, next) => {

        try {

            const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


            const {
                user_name,
                user_email,
                user_password,
                user_password_confirm
            } = req.body;
    
            if (!user_name || !user_email || !user_password|| !user_password_confirm) {
                throw new Error("missing required feilds");
            };

            if (!email_regex.test(user_email)){
                throw new Error("email should be a valid email");
            };

            if (!password_regex.test(user_password)){
                throw new Error("password should have a letter, big letter and number and specail sign");
            };

            if (user_password !== user_password_confirm) {
                throw new Error("passwords are donth match"); 
            }

            next();
            
        } catch (error) {
            return res.status(500).json({
                message:"error in user validation",
                error:error.message
            })
        }

    },

    userLoginValidation: (req,res,next)=>{

        try {

            const {
                user_email,
                user_password
            } = req.body;
    
            if (!user_email || !user_password) {
                throw new Error("missing required feilds");
            };

            next();
            
        } catch (error) {
            return res.status(500).json({
                message:"error in user validation",
                error:error.message
            })
        }

    }
}