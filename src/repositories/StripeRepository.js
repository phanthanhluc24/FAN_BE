const stripe = require("stripe")("sk_test_51Osxt0P3QsmcFffhgo92RBOXe4s9n5tZS9LhxbFHsPH9tZGLBzCCV5iyEIcKI8pcCvZRqdoJR8PDhrK30ajhzq6a00WiK1MrLA")
class StripeRepository {
    async StripePayment(req, res) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: req.body.amount,
                currency: "vnd",
                automatic_payment_methods: {
                    enabled: true
                }
            })
            res.json({ paymentIntent: paymentIntent.client_secret })
        } catch (error) {
            res.status(400).json({
                error: error.message
            })
        }
    }
}
module.exports = new StripeRepository()