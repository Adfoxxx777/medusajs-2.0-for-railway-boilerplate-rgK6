import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { Router } from "express"

export default (router: Router) => {
  router.post("/store/test-email", async (req: MedusaRequest, res: MedusaResponse) => {
    const notificationService = req.scope.resolve("notificationService")

    try {
      await notificationService.send({
        to: req.body.to,
        data: {
          // Тестовые данные для шаблона
          order: {
            display_id: "TEST-1234",
            email: req.body.to,
            items: [
              {
                title: "Test Product",
                quantity: 1,
                unit_price: 1000 // 10.00 в центах
              }
            ],
            total: 1000
          },
          // Дополнительные опции для email
          emailOptions: {
            subject: "Test Email from SendPulse SMTP",
          }
        },
        template: "order.placed"
      })

      res.json({
        success: true,
        message: "Test email sent successfully"
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  })

  return router
}
