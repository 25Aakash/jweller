import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as jewellerController from '../controllers/jeweller.controller';

const router = Router();

// All jeweller routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize(['ADMIN']));

// Dashboard
router.get('/dashboard', jewellerController.getDashboard);

// Customers
router.get('/customers', jewellerController.getAllCustomers);
router.get('/customers/:customerId', jewellerController.getCustomerDetails);

// Transactions
router.get('/transactions', jewellerController.getAllTransactions);

// Bookings
router.get('/bookings', jewellerController.getAllBookings);

// Gold Price Management
router.post('/gold-price', jewellerController.updateGoldPrice);

export default router;
