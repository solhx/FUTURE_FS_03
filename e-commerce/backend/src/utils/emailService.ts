import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

// OTP Email Template
export const sendOTPEmail = async (
  email: string,
  name: string,
  otp: string,
  type: "verification" | "reset"
): Promise<void> => {
  const isVerification = type === "verification";

  const subject = isVerification
    ? "🔐 Urban Nile - Verify Your Email"
    : "🔑 Urban Nile - Reset Your Password";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f0eb; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: #1a1a1a; padding: 40px; text-align: center; }
        .header h1 { color: #c9a96e; font-size: 32px; letter-spacing: 4px; font-weight: 300; }
        .header p { color: #888; font-size: 12px; letter-spacing: 2px; margin-top: 8px; }
        .body { padding: 50px 40px; }
        .greeting { font-size: 22px; color: #1a1a1a; margin-bottom: 20px; font-weight: 600; }
        .message { font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 35px; }
        .otp-container { background: linear-gradient(135deg, #1a1a1a, #333); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
        .otp-label { color: #c9a96e; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 15px; }
        .otp-code { font-size: 48px; font-weight: 700; color: #ffffff; letter-spacing: 12px; font-family: 'Courier New', monospace; }
        .otp-expiry { color: #888; font-size: 13px; margin-top: 15px; }
        .divider { height: 1px; background: #f0e8de; margin: 30px 0; }
        .warning { background: #fff8f0; border-left: 4px solid #c9a96e; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
        .warning p { color: #8a6a3a; font-size: 13px; line-height: 1.6; }
        .footer { background: #f9f5f0; padding: 30px 40px; text-align: center; }
        .footer p { color: #999; font-size: 12px; line-height: 1.8; }
        .footer a { color: #c9a96e; text-decoration: none; }
        .social-links { margin-top: 20px; }
        .social-links a { color: #c9a96e; text-decoration: none; margin: 0 10px; font-size: 13px; }
        .brand-tagline { color: #c9a96e; font-size: 11px; letter-spacing: 2px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>URBAN NILE</h1>
          <p>MODERN STREETWEAR INSPIRED BY THE NILE</p>
        </div>
        <div class="body">
          <p class="greeting">Hello, ${name}! 👋</p>
          <p class="message">
            ${
              isVerification
                ? "Welcome to Urban Nile! We're thrilled to have you join our community. To complete your registration and start exploring our exclusive streetwear collection, please verify your email address using the OTP code below."
                : "We received a request to reset your Urban Nile admin account password. Use the OTP code below to proceed. If you didn't make this request, please ignore this email and your password will remain unchanged."
            }
          </p>
          
          <div class="otp-container">
            <p class="otp-label">Your Verification Code</p>
            <p class="otp-code">${otp}</p>
            <p class="otp-expiry">⏱️ This code expires in 10 minutes</p>
          </div>
          
          <div class="warning">
            <p>⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone. Urban Nile will never ask for your OTP via phone or chat. This code is valid for one-time use only.</p>
          </div>
          
          <div class="divider"></div>
          
          <p class="message" style="font-size: 13px; color: #888;">
            If you didn't ${isVerification ? "create an account" : "request a password reset"} with Urban Nile, please disregard this email. No changes will be made to your account.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Urban Nile. All rights reserved.</p>
          <p>Cairo, Egypt | <a href="mailto:support@urbannile.com">support@urbannile.com</a></p>
          <div class="social-links">
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">TikTok</a>
          </div>
          <p class="brand-tagline">WEAR THE RIVER. LIVE THE CULTURE.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: email, subject, html });
};

// Order Confirmation Email
export const sendOrderConfirmationEmail = async (
  email: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    products: Array<{ name: string; quantity: number; size: string; price: number }>;
    totalPrice: number;
    shippingPrice: number;
    address: string;
    city: string;
  }
): Promise<void> => {
  const productRows = orderDetails.products
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f0e8de;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0e8de; text-align: center;">${item.size}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0e8de; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #f0e8de; text-align: right;">EGP ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Urban Nile</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f0eb; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: #1a1a1a; padding: 40px; text-align: center; }
        .header h1 { color: #c9a96e; font-size: 32px; letter-spacing: 4px; font-weight: 300; }
        .success-banner { background: linear-gradient(135deg, #c9a96e, #e8c99e); padding: 25px; text-align: center; }
        .success-banner h2 { color: #1a1a1a; font-size: 20px; font-weight: 700; }
        .success-banner p { color: #1a1a1a; font-size: 14px; margin-top: 5px; opacity: 0.8; }
        .body { padding: 40px; }
        .order-number { background: #f9f5f0; border-radius: 8px; padding: 15px 20px; margin-bottom: 30px; text-align: center; }
        .order-number span { font-size: 12px; color: #888; letter-spacing: 2px; display: block; }
        .order-number strong { font-size: 22px; color: #1a1a1a; letter-spacing: 3px; }
        .section-title { font-size: 14px; font-weight: 700; color: #1a1a1a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #c9a96e; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f9f5f0; padding: 12px; text-align: left; font-size: 12px; color: #888; letter-spacing: 1px; text-transform: uppercase; }
        .total-row td { padding: 15px 12px; font-weight: 700; font-size: 16px; color: #1a1a1a; }
        .shipping-info { background: #f9f5f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .shipping-info p { font-size: 14px; color: #555; line-height: 1.8; }
        .status-tracker { display: flex; justify-content: space-between; margin: 30px 0; }
        .footer { background: #1a1a1a; padding: 30px 40px; text-align: center; }
        .footer p { color: #666; font-size: 12px; line-height: 1.8; }
        .footer a { color: #c9a96e; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>URBAN NILE</h1>
        </div>
        <div class="success-banner">
          <h2>✅ Order Confirmed!</h2>
          <p>Thank you for shopping with Urban Nile, ${orderDetails.customerName}!</p>
        </div>
        <div class="body">
          <div class="order-number">
            <span>ORDER NUMBER</span>
            <strong>${orderDetails.orderNumber}</strong>
          </div>
          
          <p class="section-title">Order Summary</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align:center">Size</th>
                <th style="text-align:center">Qty</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
              <tr>
                <td colspan="3" style="padding: 12px; color: #888; font-size: 13px;">Shipping</td>
                <td style="padding: 12px; text-align: right; color: #888; font-size: 13px;">EGP ${orderDetails.shippingPrice.toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background: #f9f5f0;">
                <td colspan="3" class="total-row" style="padding: 15px 12px; font-weight: 700;">Total Amount</td>
                <td class="total-row" style="text-align: right; color: #c9a96e; padding: 15px 12px; font-weight: 700;">EGP ${(orderDetails.totalPrice + orderDetails.shippingPrice).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <p class="section-title">Delivery Address</p>
          <div class="shipping-info">
            <p>📍 <strong>${orderDetails.customerName}</strong></p>
            <p>${orderDetails.address}</p>
            <p>${orderDetails.city}, Egypt</p>
          </div>
          
          <p style="font-size: 13px; color: #888; text-align: center; margin-top: 20px;">
            Questions? Contact us at <a href="mailto:support@urbannile.com" style="color: #c9a96e;">support@urbannile.com</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Urban Nile | Cairo, Egypt</p>
          <p><a href="#">Instagram</a> | <a href="#">Facebook</a> | <a href="#">TikTok</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `✅ Order Confirmed - ${orderDetails.orderNumber} | Urban Nile`,
    html,
  });
};