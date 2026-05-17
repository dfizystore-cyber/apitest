import express from "express"
import axios from "axios"
import qs from "qs"

const app = express()
const PORT = 3000

// Signature tetap
const signature =
   "c9920f28a36ea22628e94f1ecc327c454871288947ef9a752b6faf1324fe1bac7c127bc81febcebea6ca47af4c3bc6142010ae06a247b58d9ef581455aa61fef"

// Endpoint API
app.get("/api/qris/mutasi", async (req, res) => {
   try {

      // Ambil parameter
      const username = req.query.username
      const token = req.query.token

      // Validasi
      if (!username || !token) {
         return res.status(400).json({
            status: false,
            message: "Parameter username dan token wajib diisi"
         })
      }

      // Timestamp baru setiap request
      const timestamp = Date.now().toString()

      // Body request
      const body = {
         "requests[qris_history][keterangan]": "",
         "requests[0]": "account",
         "app_version_code": "260204",
         "requests[qris_history][page]": "1",
         "auth_token": token,
         "requests[qris_history][jumlah]": "",
         "requests[qris_history][dari_tanggal]": "",
         "phone_android_version": "6.0.1",
         "request_time": timestamp,
         "auth_username": username,
         "phone_model": "SM-G532G",
         "app_version_name": "26.02.04",
         "requests[qris_history][ke_tanggal]": "",
         "phone_uuid": "e8pPDMENQwSvAg0XtLR8sg",
         "ui_mode": "light",
         "app_reg_id":
            "e8pPDMENQwSvAg0XtLR8sg:APA91bGbGb0lkb8NR1FzwaG0VlAeebVVl-sVkIeIwLiuQJFFv5Q90edISFh6kEvOFYf8iv5QqP8-9J5oWMGVmKWSM5vATgPxuSFNn_1MpRaFehnzvhoyDsw"
      }

      // Encode body
      const encodedBody = qs.stringify(body)

      // Debug request
      console.log("\n========== DEBUG REQUEST ==========")
      console.log("USERNAME :", username)
      console.log("TOKEN    :", token)
      console.log("TIMESTAMP:", timestamp)
      console.log("SIGNATURE:", signature)
      console.log("BODY:")
      console.log(encodedBody)
      console.log("===================================\n")

      // Request ke OrderKuota
      const response = await axios.post(
         "https://app.orderkuota.com/api/v2/qris/mutasi/1523980",
         encodedBody,
         {
            headers: {
               "signature": signature,
               "timestamp": timestamp,
               "content-type": "application/x-www-form-urlencoded",
               "content-length": Buffer.byteLength(encodedBody),
               "accept-encoding": "gzip",
               "user-agent": "okhttp/5.3.2"
            }
         }
      )

      // Debug response
      console.log("\n========== RESPONSE ==========")
      console.log(JSON.stringify(response.data, null, 2))
      console.log("================================\n")

      // Kirim response
      res.json({
         status: true,
         result: response.data
      })

   } catch (err) {

      console.log("\n========== ERROR ==========")

      if (err.response) {

         console.log("STATUS :", err.response.status)
         console.log("DATA   :")
         console.log(JSON.stringify(err.response.data, null, 2))

         return res.status(err.response.status).json({
            status: false,
            error: err.response.data
         })

      } else {

         console.log(err.message)

         return res.status(500).json({
            status: false,
            message: err.message
         })
      }

   }
})

// Jalankan server
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`)
})
