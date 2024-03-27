# Siallure E-Commerce Backend

Welcome to the backend repository for Siallure E-Commerce! This repository showcases my skills in building robust backend systems for e-commerce platforms. Siallure E-Commerce backend is built with Node.js, Express.js, MySQL, Nodemailer, and Stripe (in test mode), providing essential functionalities to support e-commerce operations efficiently.

## Features

### 1. Secure Payment Processing with Stripe (Test Mode)

I integrated Stripe payment processing in test mode, ensuring secure transactions for users during their shopping experience. The backend handles the creation of checkout sessions, verification of product quantities before checkout, and updates the cart accordingly.

### 2. Persistent Cart Management

Users can add products to their cart, and the backend ensures that cart contents persist across sessions. Additionally, the backend fetches product quantities on initial fetch, preventing users from adding more items to the cart than available in stock.

### 3. Dynamic Product Management

The backend supports dynamic product management by fetching product data from the database, sorting products from new to old, fetching the latest products, and providing real-time information on product quantities in stock.

### 4. Contact Form Submission and Email Notifications

I implemented a contact form feature, allowing users to submit inquiries or feedback. Upon submission, the backend sends email notifications using Nodemailer, ensuring prompt communication with users.


## Technologies Used

- **Node.js**: Backend runtime environment
- **Express.js**: Web framework for Node.js
- **MySQL**: Relational database management system
- **Nodemailer**: Module for sending emails
- **Stripe**: Payment processing platform (Test Mode)
