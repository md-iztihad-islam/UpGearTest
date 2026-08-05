import express from 'express';
import { activeBannerByIdController, addBannerController, deactiveBannerByIdController, deleteBannerByIdController, getActiveBannersInOrderController, getAllBannersInOrderController, getDeactiveBannersInOrderController } from './bannerControllers.js';
import { s3Uploader } from '../../config/multerConfig.js';

const router = express.Router();

router.post('/add-banner', s3Uploader.single('imageURL'), addBannerController);
router.delete('/delete-banner/:bannerId', deleteBannerByIdController);
router.get('/get-all-banners', getAllBannersInOrderController);
router.get('/get-active-banners', getActiveBannersInOrderController);
router.get('/get-deactive-banners', getDeactiveBannersInOrderController);
router.put('/deactive-banner/:bannerId', deactiveBannerByIdController);
router.put('/active-banner/:bannerId', activeBannerByIdController);

export default router;