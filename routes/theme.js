import { ThemeController } from '../controllers';
import express from 'express';

let router = express.Router();

router.get('/hello', (req, res) => {
    ThemeController.getTheme(req, res);
});

export default router;
