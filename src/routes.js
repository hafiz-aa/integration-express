import express from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, AUTH_URL, TOKEN_URL, BASE_URL, SCOPE, STATE } = process.env;

let accessToken = null;
let refreshToken = null;

// Function to refresh the access token
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      TOKEN_URL,
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
};

// Middleware to ensure valid access token
const ensureValidAccessToken = async (req, res, next) => {
  if (!accessToken) {
    await refreshAccessToken();
  }
  req.accessToken = accessToken;
  next();
};

// Redirect to NetSuite authorization page
router.get("/authorize", (req, res) => {
  const authUrl = `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}`;
  res.redirect(authUrl);
});

// Handle OAuth callback and exchange code for tokens
router.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post(
      TOKEN_URL,
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;

    res.json({ access_token: accessToken, refresh_token: refreshToken });
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    res.status(500).json({ error: "Failed to exchange code for tokens" });
  }
});

// Example CRUD operations for Purchase Orders

// Create Purchase Order
router.post("/purchaseOrder", ensureValidAccessToken, async (req, res) => {
  const purchaseOrderData = req.body.purchaseOrderData;

  console.log("Access Token:", req.accessToken);
  console.log("Purchase Order Data:", purchaseOrderData);

  try {
    const response = await axios.post(`${BASE_URL}/purchaseOrder`, purchaseOrderData, {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const purchaseOrderId = response.data.id;
    res.json({ id: purchaseOrderId });
  } catch (error) {
    if (error.response) {
      console.error("Error creating purchase order:", error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error("Error creating purchase order:", error.message);
      res.status(500).json({ error: "Failed to create purchase order" });
    }
  }
});

// Get All Purchase Orders
router.get("/purchaseOrder", ensureValidAccessToken, async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/purchaseOrder`, {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error retrieving purchase orders:", error);
    res.status(500).json({ error: "Failed to retrieve purchase orders" });
  }
});

// GET Purchase Order by id
router.get("/purchaseOrder/:id", ensureValidAccessToken, async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/purchaseOrder/${id}`, {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error retrieving purchase order:", error);
    res.status(500).json({ error: "Failed to retrieve purchase order" });
  }
});

// Update Purchase Order
router.put("/purchaseOrder/:id", ensureValidAccessToken, async (req, res) => {
  const { id } = req.params;
  const purchaseOrderData = req.body.purchaseOrderData;
  try {
    const response = await axios.put(`${BASE_URL}/purchaseOrder/${id}`, purchaseOrderData, {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error updating purchase order:", error);
    res.status(500).json({ error: "Failed to update purchase order" });
  }
});

// Delete Purchase Order
router.delete("/purchaseOrder/:id", ensureValidAccessToken, async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.delete(`${BASE_URL}/purchaseOrder/${id}`, {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    res.status(500).json({ error: "Failed to delete purchase order" });
  }
});

// Get All Invoice
router.get("/invoice", ensureValidAccessToken, async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/invoice`, {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error retrieving invoice:", error);
    res.status(500).json({ error: "Failed to retrieve invoice" });
  }
});

export default router;
