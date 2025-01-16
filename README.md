# BufPay Node.js SDK 🚀

Easily integrate with BufPay's payment gateway using this simple-to-use Node.js SDK. 💳💻

---

## 🌟 Features
- **Payment Creation**: Generate payment links with various parameters.
- **Payment Query**: Check the status of payments.
- **Notification Verification**: Securely validate webhook notifications from BufPay.
- **Express Middleware**: Seamlessly handle notifications in your Node.js apps.

---

## 📦 Installation

```bash
npm install bufpay-sdk
```

---

## 🚀 Getting Started

### 1️⃣ Import and Initialize
```javascript
const { BufPay, createBufPayMiddleware } = require('bufpay.js');

const bufpay = new BufPay('your_app_id', 'your_app_secret');
```

### 2️⃣ Create Payments
```javascript
async function createPaymentExample() {
    try {
        const payment = await bufpay.createPayment({
            name: 'Test Product',
            payType: 'alipay', // or 'wechat'
            price: '100.00',
            orderId: 'order123',
            orderUid: 'user123',
            notifyUrl: 'https://your-domain.com/bufpay/notify',
            returnUrl: 'https://your-domain.com/success'
        });

        console.log('Payment created:', payment);
    } catch (error) {
        console.error('Payment creation failed:', error);
    }
}
```

### 3️⃣ Verify Notifications
```javascript
const express = require('express');
const app = express();

app.use(createBufPayMiddleware(bufpay, (paymentData) => {
    console.log('Payment received:', paymentData);
}));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
```

---

## 🔑 Methods

### BufPay Class

#### 1. `createPayment(params)`
Creates a new payment.
- **Parameters**: 
  - `name` (string): Product or service name.
  - `payType` (string): Payment type ('alipay' or 'wechat').
  - `price` (string): Payment amount.
  - `orderId` (string): Unique order ID.
  - `orderUid` (string): User ID or email.
  - `notifyUrl` (string): Webhook URL.
  - `returnUrl` (string, optional): URL to redirect after payment.
  - `feedbackUrl` (string, optional): URL for payment feedback.
- **Returns**: Promise with payment details.

#### 2. `queryPayment(aoid)`
Queries payment status.
- **Parameters**: 
  - `aoid` (string): BufPay order ID.
- **Returns**: Promise with payment status.

#### 3. `verifyNotification(params)`
Verifies webhook notification signature.
- **Parameters**: 
  - `params` (object): Notification parameters including `aoid`, `order_id`, `order_uid`, `price`, `pay_price`, and `sign`.
- **Returns**: Boolean indicating validity.

---

## ⚙️ Middleware

### `createBufPayMiddleware(bufpay, onPaymentSuccess)`
Creates an Express router for handling BufPay notifications.
- **Parameters**:
  - `bufpay` (BufPay): Instance of the BufPay class.
  - `onPaymentSuccess` (Function, optional): Callback for successful payments.

---

## 🛡️ Security
Ensure your `appId` and `appSecret` are kept confidential. 🔒
