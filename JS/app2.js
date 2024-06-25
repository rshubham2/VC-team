const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Replace the following with your actual values
const clientId = '1000.KXTGP1GAGIDX12Q294C6OIMVR60VMX';
const clientSecret = 'bb44b083c2b29eb4eefd1a605266a866fcd5f491fb';
const refreshToken = '1000.94fccafc2fd7f57ea21eee0f8cdd7955.fd557182781a6dc4059361c7bd66e041';
const redirectUri = 'https://www.google.com/';
const organizationId = '60005679410';
const apiUrl = `https://books.zoho.in/api/v3/salesorders?organization_id=${organizationId}`;

let accessToken = '';

// Function to refresh the access token
async function refreshAccessToken() {
  try {
    const response = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
      params: {
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'refresh_token'
      }
    });

    accessToken = response.data.access_token;
    console.log('Access token refreshed successfully');
  } catch (error) {
    console.error('Error refreshing access token:', error);
  }
}

// Refresh the access token initially
refreshAccessToken();

// Set up a timer to refresh the access token every 3600 seconds (1 hour)
setInterval(refreshAccessToken, 3600000);

app.get('/', async (req, res) => {
  const orderNumber = req.query.orderNumber;
  const page = parseInt(req.query.page) || 1;
  const perPage = 10; // Number of items per page

  let requestUrl = apiUrl;
  if (orderNumber) {
    requestUrl = `${apiUrl}&search_text=${orderNumber}`;
  }

  try {
    const response = await axios.get(requestUrl, {
      headers: {
        'Authorization': 'Zoho-oauthtoken ' + accessToken
      }
    });

    let salesOrders = [];
    if (orderNumber) {
      salesOrders = response.data.salesorders || [];
    } else {
      salesOrders = response.data.salesorders.slice((page - 1) * perPage, page * perPage);
    }

    let tableRows = '';
    if (salesOrders.length === 0) {
      tableRows = `
        <tr>
          <td colspan="11" style="text-align: center; color: red; font-weight: bold;">No sales orders found for the given order number.</td>
        </tr>
      `;
    } else {
      salesOrders.forEach(order => {
        const formattedTotal = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(order.total);

        tableRows += `
          <tr>
            <td>${order.date || '—'}</td>
            <td>${order.salesorder_number || '—'}</td>
            <td>${order.customer_name || '—'}</td>
            <td>${order.reference_number || '—'}</td>
            <td>${formattedTotal}</td>
            <td>${order.status || '—'}</td>
            <td>${order.invoiced_status || '—'}</td>
            <td>${order.payment_status || '—'}</td>
            <td>${order.expected_shipment_date || '—'}</td>
            <td>${order.order_status || '—'}</td>
            <td>${order.delivery_method || '—'}</td>
          </tr>
        `;
      });
    }

    const totalPages = Math.ceil(response.data.salesorders.length / perPage);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sales Orders</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
          }
          
          .container {
            width: 95%;
            max-width: 1400px;
            margin: 20px auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          
          h1 {
            text-align: center;
            color: #333;
          }
          
          .search-container {
            position: sticky;
            top: 0;
            background-color: white;
            padding: 20px 0;
            z-index: 1000;
          }
          
          form {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
          }
          
          label {
            font-weight: bold;
            margin-right: 10px;
          }
          
          input[type="text"] {
            padding: 10px;
            width: 250px;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin-right: 10px;
          }
          
          button {
            padding: 10px 20px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          
          button:hover {
            background-color: #555;
          }
          
          .table-container {
            max-height: 600px;
            overflow-y: auto;
            margin-top: 20px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1400px;
          }
          
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
            min-width: 120px;
          }
          
          th {
            background-color: #4CAF50;
            color: white;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          tr:hover {
            background-color: #f1f1f1;
          }
          
          .pagination {
            display: flex;
            justify-content: center;
            margin-top: 20px;
          }
          
          .pagination button {
            padding: 10px 15px;
            margin: 0 5px;
            border: 1px solid #ddd;
            background-color: #333;
            color: white;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          
          .pagination button:hover {
            background-color: #555;
          }
          
          .pagination button.disabled {
            cursor: not-allowed;
            color: #ccc;
            background-color: #ddd;
          }
          
          .error-message {
            color: red;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
          }
          
          .back-button {
            position: absolute;
            top: 20px;
            left: 20px;
            padding: 10px 20px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
          }
          
          @media (max-width: 768px) {
            .container {
              width: 100%;
            }
            
            form {
              flex-direction: column;
              align-items: center;
            }
            
            input[type="text"] {
              margin-bottom: 10px;
              width: 100%;
            }
            
            button {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <a href="/" class="back-button">Back</a>
        <div class="container">
          <h1>Sales Orders</h1>
          <div class="search-container">
            <form action="/" method="GET">
              <label for="orderNumber">Order Number:</label>
              <input type="text" id="orderNumber" name="orderNumber" placeholder="Enter Order Number" value="${orderNumber || ''}">
              <button type="submit">Search</button>
            </form>
          </div>
          ${salesOrders.length === 0 && orderNumber ? '<div class="error-message">No sales orders found for the given order number.</div>' : ''}
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sales Order#</th>
                  <th>Customer Name</th>
                  <th>Reference#</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoiced</th>
                  <th>Payment</th>
                  <th>Expected Shipment Date</th>
                  <th>Order Status</th>
                  <th>Delivery Method</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
          <div class="pagination">
            <form action="/" method="GET">
              <input type="hidden" name="page" value="${page - 1}">
              <button type="submit" ${page === 1 ? 'class="disabled"' : ''}>Previous</button>
            </form>
            <form action="/" method="GET">
              <input type="hidden" name="page" value="${page + 1}">
              <button type="submit" ${page === totalPages ? 'class="disabled"' : ''}>Next</button>
            </form>
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});