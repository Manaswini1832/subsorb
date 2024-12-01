import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import createErrorObject from '../utils/error.js'

const authChecker = async (req, res, next) => {
    console.log('AUTH MIDDLEWARE')
    try {
        const token = req.header('Authorization')?.split(' ')[1]
        const supabaseSecret = `${process.env.SERVER_SUPABASE_JWT_SECRET}`

        if (token) {
            const decoded = jwt.verify(token, supabaseSecret)
            res.locals.authenticated = true
            res.locals.decoded = decoded
        } else {
            const message = createErrorObject('No token, auth denied!')
            res.status(401).json(message)
        }
        next();
    } catch (err) {
        console.log(err)
        const message = createErrorObject('Invalid token, auth denied!')
        res.status(400).json(message)
    }
}
//TO PREVENT OVERLOADING AUTH SERVER
//UNCOMMENT WHILE DOING ACTUAL MIDDLEWARE TESTING
// const authChecker = async (req, res, next) => {
//     console.log("authorized")
//     res.locals.authenticated = true
//     res.locals.user = {
//         id : 'db022c62-cb67-49b5-aa1f-47c9834f927b'
//     }
//     next()
// }

export default authChecker
