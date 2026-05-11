// server.js
// REST API Express OrderKuota
// ESM Module

import express from "express"
import crypto from "crypto"

const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

class OrderKuota {
  static API_URL = "https://app.orderkuota.com/api/v2"
  static HOST = "app.orderkuota.com"

  static USER_AGENT = "okhttp/5.3.2"
  static APP_VERSION_NAME = "26.02.04"
  static APP_VERSION_CODE = "260204"

  static PHONE_MODEL = "SM-G960N"
  static PHONE_UUID = "di309HvATsaiCppl5eDpoc"

  static APP_REG_ID =
    "di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ"

  constructor(username = "", authToken = "") {
    this.username = username
    this.authToken = authToken
  }

  generateTimestamp() {
    return Date.now().toString()
  }

  generateSignature(payload) {
    return crypto
      .createHash("sha512")
      .update(payload)
      .digest("hex")
  }

  buildHeaders(signature, timestamp) {
    return {
      Host: OrderKuota.HOST,
      Signature: signature,
      Timestamp: timestamp,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept-Encoding": "gzip",
      "User-Agent": OrderKuota.USER_AGENT
    }
  }

  async request(endpoint, body = {}) {
    const timestamp = this.generateTimestamp()

    const payload = new URLSearchParams(body).toString()

    const signature = this.generateSignature(payload)

    const headers = this.buildHeaders(signature, timestamp)

    const response = await fetch(
      `${OrderKuota.API_URL}${endpoint}`,
      {
        method: "POST",
        headers,
        body: payload
      }
    )

    return await response.json()
  }

  async login(username, password) {
    return await this.request("/login", {
      username,
      password,
      app_reg_id: OrderKuota.APP_REG_ID,
      app_version_code: OrderKuota.APP_VERSION_CODE,
      app_version_name: OrderKuota.APP_VERSION_NAME
    })
  }

  async getTransactionQris(id) {
    return await this.request("/get", {
      request_time: this.generateTimestamp(),
      auth_username: this.username,

      "requests[qris_details][id]": id,

      phone_model: OrderKuota.PHONE_MODEL,
      app_version_name: OrderKuota.APP_VERSION_NAME,
      phone_uuid: OrderKuota.PHONE_UUID,
      ui_mode: "light",
      app_version_code: OrderKuota.APP_VERSION_CODE,
      auth_token: this.authToken,
      phone_android_version: "6.0.1",
      app_reg_id: OrderKuota.APP_REG_ID
    })
  }

  async withdrawalQris(amount) {
    return await this.request("/get", {
      request_time: this.generateTimestamp(),
      auth_username: this.username,

      "requests[qris_withdraw][amount]": amount,

      phone_model: OrderKuota.PHONE_MODEL,
      app_version_name: OrderKuota.APP_VERSION_NAME,
      phone_uuid: OrderKuota.PHONE_UUID,
      ui_mode: "light",
      app_version_code: OrderKuota.APP_VERSION_CODE,
      auth_token: this.authToken,
      phone_android_version: "6.0.1",
      app_reg_id: OrderKuota.APP_REG_ID
    })
  }
}

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

/**
 * Login
 * POST /login
 */
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        status: false,
        message: "username & password required"
      })
    }

    const client = new OrderKuota()

    const result = await client.login(username, password)

    res.json(result)
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
})

app.get("/qris/detail", async (req, res) => {
  try {
    const { username, authToken } = req.query

    if (!username || !authToken) {
      return res.status(400).json({
        status: false,
        message: "username & authToken required"
      })
    }

    const client = new OrderKuota(username, authToken)

    // Ambil semua data
    const result = await client.getTransactionQris()

    res.json(result)
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
})

/**
 * Withdraw QRIS
 * POST /qris/withdraw
 */
app.post("/qris/withdraw", async (req, res) => {
  try {
    const {
      username,
      authToken,
      amount
    } = req.body

    if (!username || !authToken || !amount) {
      return res.status(400).json({
        status: false,
        message: "username, authToken & amount required"
      })
    }

    const client = new OrderKuota(
      username,
      authToken
    )

    const result = await client.withdrawalQris(amount)

    res.json(result)
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
})

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
