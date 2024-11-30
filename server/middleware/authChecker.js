import supabase from '../supabaseClient.js'

const authChecker = async (req, res, next) => {
    const header = req.headers['authorization']
    console.log('AUTH MIDDLEWARE')

    if(header == null){
        res.sendStatus(400);//Bad request
    }

    if (header !== undefined) {
        const bearer = header.split(' ')
        const token = bearer[1]

        try {
            const { data: { user } } = await supabase.auth.getUser(token)

            if (user !== null) {
                next();
            } else {
                res.sendStatus(403); // Forbidden (403)
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            res.sendStatus(500); // Internal server error (500)
        }
    } else {
        res.sendStatus(403); // Forbidden (403)
    }
};

export default authChecker
