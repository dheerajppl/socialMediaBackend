import { Router } from "express";

import user from './user.js';
import post from './post.js';
import message from './message.js'
import file from './fileRoutes.js'

const router = Router();

router.use('/user', user);

router.use('/post', post);

router.use('/message', message);

router.use('/file', file);


export default router;
