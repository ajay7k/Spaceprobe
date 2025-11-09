// 1. Import the tools we need
// We are telling our file, "We need to use the 'express', 'cors', and 'body-parser' packages that we installed."
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// 2. Create our server application
// This line creates the main application object that we will configure.
const app = express();
const PORT = 3000; // This is the "address" or port number our server will use.

// 3. Set up Middleware (the "gatekeepers")
// Middleware are functions that process every request coming into the server before it reaches our specific logic.
app.use(cors()); // This allows your frontend (on a different address) to send requests to your backend. It's a security feature.
app.use(bodyParser.json()); // This tells the server to automatically understand and parse any JSON data that the frontend sends.

// 4. Define our API Endpoint (the "door" for our booking form)
// We are telling our server: "When you receive a POST request at the URL '/api/bookings', run this function."
app.post('/api/bookings', (req, res) => {
  
  // 'req' (request) is an object containing all the information about the incoming request, including the form data.
  // 'req.body' holds the data from your form, thanks to bodyParser.
  console.log('🎉 Booking data received on the server:');
  console.log(req.body);

  // Here, in the future, we will:
  // - Validate the data (e.g., make sure the email is a real email).
  // - Save the data to a database.
  // - Process a payment.

  // 'res' (response) is what we send back to the frontend.
  // We send a status of 201, which means "Created" (something was successfully created on the server).
  // We also send a JSON message back to confirm it worked.
  res.status(201).json({ 
    message: 'Booking request received successfully!',
    data: req.body // We can even send the data back to confirm we got the right stuff.
  });
});

// 5. Start the server
// This is the final step. It tells our application to start listening for any network requests on the port we defined.
app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on http://localhost:${PORT}`);
});