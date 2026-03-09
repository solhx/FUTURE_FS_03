import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// ── Create transporter (returns null if not configured) ──
const createTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn(
      "⚠️  Email not configured. Set EMAIL_USER and EMAIL_PASS in .env"
    );
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST || "smtp.gmail.com",
    port: Number(EMAIL_PORT) || 587,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    tls: { rejectUnauthorized: false },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();

  if (!transporter) {
    // Log OTP to console in dev so you can still test
    console.log("─────────────────────────────────");
    console.log(`📧  EMAIL NOT SENT (no config)`);
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log("─────────────────────────────────");
    return; // Don't throw — just skip
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Urban Nile" <noreply@urbannile.com>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  console.log(`✅ Email sent to ${options.to}`);
};

// ── OTP Email ──
export const sendOTPEmail = async (
  email: string,
  name: string,
  otp: string,
  type: "verification" | "reset"
): Promise<void> => {
  const isVerification = type === "verification";

  const subject = isVerification
    ? "🔐 Urban Nile — Verify Your Email"
    : "🔑 Urban Nile — Reset Your Password";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subject}</title>
      <style>
        *  { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background:#f5f0eb; }
        .wrap  { max-width:580px; margin:40px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.10); }
        .head  { background:#1a1a1a; padding:36px; text-align:center; }
        .head h1 { color:#c9a96e; font-size:28px; letter-spacing:6px; font-weight:700; }
        .head p  { color:#888; font-size:11px; letter-spacing:3px; margin-top:6px; }
        .body  { padding:44px 40px; }
        .hi    { font-size:20px; color:#1a1a1a; font-weight:700; margin-bottom:16px; }
        .msg   { font-size:14px; color:#555; line-height:1.8; margin-bottom:32px; }
        .otp-box { background:linear-gradient(135deg,#1a1a1a,#333); border-radius:10px; padding:28px; text-align:center; margin:0 0 28px; }
        .otp-label { color:#c9a96e; font-size:11px; letter-spacing:4px; text-transform:uppercase; margin-bottom:12px; }
        .otp-code  { font-size:46px; font-weight:800; color:#FFFFFF; letter-spacing:14px; font-family:'Courier New',monospace; }
        .otp-exp   { color:#888; font-size:12px; margin-top:12px; }
        .warn  { background:#fff8f0; border-left:4px solid #c9a96e; padding:14px 18px; border-radius:0 6px 6px 0; margin-bottom:24px; }
        .warn p { color:#8a6a3a; font-size:13px; line-height:1.6; }
        .foot  { background:#f9f5f0; padding:24px; text-align:center; }
        .foot p { color:#aaa; font-size:12px; line-height:1.8; }
        .foot a { color:#c9a96e; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="head">
          <h1>URBAN NILE</h1>
          <p>MODERN STREETWEAR INSPIRED BY THE NILE</p>
        </div>
        <div class="body">
          <p class="hi">Hello, ${name}! 👋</p>
          <p class="msg">
            ${
              isVerification
                ? "Welcome to Urban Nile! Use the code below to verify your email and complete your registration."
                : "We received a password reset request. Use the code below to set a new password. Ignore this if you didn't request it."
            }
          </p>
          <div class="otp-box">
            <p class="otp-label">Your One-Time Code</p>
            <p class="otp-code">${otp}</p>
            <p class="otp-exp">⏱ Expires in 10 minutes</p>
          </div>
          <div class="warn">
            <p>⚠️ <strong>Never share this code.</strong> Urban Nile will never ask for it by phone or chat. One-time use only.</p>
          </div>
        </div>
        <div class="foot">
          <p>© ${new Date().getFullYear()} Urban Nile · Cairo, Egypt</p>
          <p><a href="mailto:support@urbannile.com">support@urbannile.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Log OTP to console always in dev
  if (process.env.NODE_ENV === "development") {
    console.log("─────────────────────────────────────");
    console.log(`🔑  OTP for ${email}: ${otp}`);
    console.log("─────────────────────────────────────");
  }

  await sendEmail({ to: email, subject, html });
};

// ── Order Confirmation Email ──
export const sendOrderConfirmationEmail = async (
  email: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    products: Array<{
      name: string;
      quantity: number;
      size: string;
      price: number;
    }>;
    totalPrice: number;
    shippingPrice: number;
    address: string;
    city: string;
  }
): Promise<void> => {
  const rows = orderDetails.products
    .map(
      (item) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #f0e8de;">${item.name}</td>
        <td style="padding:10px;border-bottom:1px solid #f0e8de;text-align:center;">${item.size}</td>
        <td style="padding:10px;border-bottom:1px solid #f0e8de;text-align:center;">${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #f0e8de;text-align:right;">
          EGP ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html><html lang="en">
    <head><meta charset="UTF-8"/><style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f0eb;}
      .wrap{max-width:580px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);}
      .head{background:#1a1a1a;padding:30px;text-align:center;}
      .head h1{color:#c9a96e;font-size:26px;letter-spacing:6px;}
      .banner{background:linear-gradient(135deg,#c9a96e,#e8c99e);padding:22px;text-align:center;}
      .banner h2{color:#1a1a1a;font-size:18px;font-weight:700;}
      .body{padding:36px;}
      .on{background:#f9f5f0;border-radius:8px;padding:14px;text-align:center;margin-bottom:24px;}
      .on span{font-size:11px;color:#888;letter-spacing:3px;display:block;}
      .on strong{font-size:22px;color:#1a1a1a;letter-spacing:4px;}
      table{width:100%;border-collapse:collapse;margin-bottom:24px;}
      th{background:#f9f5f0;padding:10px;text-align:left;font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;}
      .total td{padding:14px 10px;font-weight:700;font-size:16px;}
      .addr{background:#f9f5f0;border-radius:8px;padding:18px;margin-bottom:16px;}
      .addr p{font-size:13px;color:#555;line-height:1.8;}
      .foot{background:#1a1a1a;padding:24px;text-align:center;}
      .foot p{color:#666;font-size:12px;line-height:1.8;}
      .foot a{color:#c9a96e;text-decoration:none;}
    </style></head>
    <body>
      <div class="wrap">
        <div class="head"><h1>URBAN NILE</h1></div>
        <div class="banner">
          <h2>✅ Order Confirmed!</h2>
          <p style="color:#1a1a1a;font-size:13px;margin-top:4px;">
            Thank you, ${orderDetails.customerName}!
          </p>
        </div>
        <div class="body">
          <div class="on">
            <span>ORDER NUMBER</span>
            <strong>${orderDetails.orderNumber}</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th><th style="text-align:center">Size</th>
                <th style="text-align:center">Qty</th><th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding:10px;color:#888;font-size:13px;">Shipping</td>
                <td style="padding:10px;text-align:right;color:#888;font-size:13px;">
                  ${orderDetails.shippingPrice === 0 ? "FREE" : `EGP ${orderDetails.shippingPrice}`}
                </td>
              </tr>
              <tr class="total" style="background:#f9f5f0;">
                <td colspan="3">Total Amount</td>
                <td style="text-align:right;color:#c9a96e;">
                  EGP ${(orderDetails.totalPrice + orderDetails.shippingPrice).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
          <div class="addr">
            <p>📍 <strong>${orderDetails.customerName}</strong></p>
            <p>${orderDetails.address}</p>
            <p>${orderDetails.city}, Egypt</p>
          </div>
        </div>
        <div class="foot">
          <p>© ${new Date().getFullYear()} Urban Nile · Cairo, Egypt</p>
          <p><a href="mailto:support@urbannile.com">support@urbannile.com</a></p>
        </div>
      </div>
    </body></html>
  `;

  await sendEmail({
    to: email,
    subject: `✅ Order Confirmed — ${orderDetails.orderNumber} | Urban Nile`,
    html,
  });
};