import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from './db.config.js';
import bcrypt from 'bcrypt';
import { findUserBySocial, createUserForSocial, linkSocialAccount } from '#Repository/user.repository.js';

// Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            return done(null, false, { message: '등록되지 않은 이메일입니다.' });
        }
        
        if (!user.password) {
            return done(null, false, { message: '소셜 로그인으로 가입된 계정입니다.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:80/api/user/google/callback",
    scope: ['email', 'profile']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let user = await findUserBySocial('google', googleId);
        if (user) {
            return done(null, user);
        }
        user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            await linkSocialAccount(user.id, 'google', googleId);
        } else {
            user = await createUserForSocial({
                email,
                name,
                provider: 'google',
                socialId: googleId
            });
        }
        
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
        const user = await prisma.user.findUnique({ 
            where: { id: BigInt(jwtPayload.userId) } 
        });
        
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));