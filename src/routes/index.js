import { Router } from "express";

import user from './user.js';
import post from './post.js';
import message from './message.js'

const router = Router();

router.use('/user', user);

router.use('/post', post);

router.use('/message', message)


export default router;
