const crypto = require('crypto');
const axios = require('axios');
const express = require('express');

class BufPay {
    constructor(appId, appSecret) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.baseUrl = 'https://bufpay.com/api';
    }

    /**
     * Creates MD5 signature for API requests
     * @private
     * @param {...string} params - Parameters to sign
     * @returns {string} - Uppercase MD5 hash
     */
    #createSignature(...params) {
        const concatenated = params
            .filter(param => param !== undefined && param !== null)
            .map(param => String(param))
            .join('');

        return crypto
            .createHash('md5')
            .update(concatenated, 'utf8')
            .digest('hex')
            .toUpperCase();
    }

    /**
     * Creates a new payment
     * @param {Object} params - Payment parameters
     * @param {string} params.name - Product or service name
     * @param {string} params.payType - Payment type (alipay or wechat)
     * @param {string} params.price - Payment amount
     * @param {string} params.orderId - Unique order ID
     * @param {string} params.orderUid - User ID or email
     * @param {string} params.notifyUrl - Webhook URL for payment notifications
     * @param {string} [params.returnUrl] - URL to redirect after payment
     * @param {string} [params.feedbackUrl] - URL for payment feedback
     * @returns {Promise<Object>} Payment creation response
     */
    async createPayment({
        name,
        payType,
        price,
        orderId,
        orderUid,
        notifyUrl,
        returnUrl = '',
        feedbackUrl = ''
    }) {
        if (!name || !payType || !price || !orderId || !orderUid || !notifyUrl) {
            throw new Error('Missing required payment parameters');
        }

        const signature = this.#createSignature(
            name,
            payType,
            price,
            orderId,
            orderUid,
            notifyUrl,
            returnUrl,
            feedbackUrl,
            this.appSecret
        );

        const formData = new URLSearchParams({
            name,
            pay_type: payType,
            price,
            order_id: orderId,
            order_uid: orderUid,
            notify_url: notifyUrl,
            return_url: returnUrl,
            feedback_url: feedbackUrl,
            sign: signature
        });

        try {
            const response = await axios.post(
                `${this.baseUrl}/pay/${this.appId}?format=json`,
                formData.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Payment creation failed: ${error.message}`);
        }
    }

    /**
     * Query payment status
     * @param {string} aoid - BufPay order ID
     * @returns {Promise<Object>} Payment status
     */
    async queryPayment(aoid) {
        if (!aoid) {
            throw new Error('AOID is required');
        }

        try {
            const response = await axios.get(`${this.baseUrl}/query/${aoid}`);
            return response.data;
        } catch (error) {
            throw new Error(`Payment query failed: ${error.message}`);
        }
    }

    /**
     * Verify webhook notification signature
     * @param {Object} params - Notification parameters
     * @returns {boolean} Verification result
     */
    verifyNotification(params) {
        const { aoid, order_id, order_uid, price, pay_price, sign } = params;

        if (!aoid || !order_id || !order_uid || !price || !pay_price || !sign) {
            return false;
        }

        const expectedSignature = this.#createSignature(
            aoid,
            order_id,
            order_uid,
            price,
            pay_price,
            this.appSecret
        );

        return sign === expectedSignature;
    }
}

/**
 * Creates Express middleware for handling BufPay notifications
 * @param {BufPay} bufpay - BufPay instance
 * @param {Function} [onPaymentSuccess] - Callback for successful payments
 * @returns {express.Router}
 */
function createBufPayMiddleware(bufpay, onPaymentSuccess) {
    const router = express.Router();

    router.post('/bufpay/notify', express.json(), (req, res) => {
        if (!bufpay.verifyNotification(req.body)) {
            return res.status(400).send('Invalid signature');
        }

        if (typeof onPaymentSuccess === 'function') {
            onPaymentSuccess(req.body);
        }

        res.status(200).send('OK');
    });

    return router;
}

module.exports = {
    BufPay,
    createBufPayMiddleware
};
