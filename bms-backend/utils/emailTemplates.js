const getOTPEmailTemplate = (otp, userName, action) => {
    const actionText = action === 'signup' ? 'verify your email address' : 'reset your password';
    const heading = action === 'signup' ? 'Email Verification' : 'Password Reset';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BookMyShow — ${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">
          <!-- Header -->
          <tr>
            <td style="background:#cc0000;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;letter-spacing:1px;">BookMyShow</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="color:#222222;margin-top:0;">${heading}</h2>
              <p style="color:#555555;font-size:15px;line-height:1.6;">Hi <strong>${userName}</strong>,</p>
              <p style="color:#555555;font-size:15px;line-height:1.6;">
                Use the OTP below to ${actionText}. This OTP is valid for <strong>10 minutes</strong>.
              </p>
              <!-- OTP Box -->
              <div style="text-align:center;margin:32px 0;">
                <span style="display:inline-block;background:#cc0000;color:#ffffff;font-size:36px;font-weight:bold;letter-spacing:12px;padding:16px 32px;border-radius:8px;">
                  ${otp}
                </span>
              </div>
              <p style="color:#888888;font-size:13px;line-height:1.6;">
                If you did not request this, please ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="margin:0;color:#aaaaaa;font-size:12px;">
                © ${new Date().getFullYear()} BookMyShow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const getBookingConfirmationTemplate = (booking, user) => {
    const seatList = (booking.seats || [])
        .map(s => `${s.row_label}${s.seat_number} (${s.seat_type})`)
        .join(', ');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">
          <tr>
            <td style="background:#cc0000;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">BookMyShow</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="color:#222;margin-top:0;">Booking Confirmed! 🎉</h2>
              <p style="color:#555;font-size:15px;">Hi <strong>${user.first_name}</strong>, your booking is confirmed.</p>

              <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin:20px 0;">
                <tr style="background:#f9f9f9;">
                  <td style="color:#888;font-size:13px;width:40%;">Booking Ref</td>
                  <td style="color:#222;font-size:14px;font-weight:bold;">${booking.booking_ref}</td>
                </tr>
                <tr>
                  <td style="color:#888;font-size:13px;">Movie</td>
                  <td style="color:#222;font-size:14px;">${booking.movie_title}</td>
                </tr>
                <tr style="background:#f9f9f9;">
                  <td style="color:#888;font-size:13px;">Date &amp; Time</td>
                  <td style="color:#222;font-size:14px;">${booking.show_date} at ${booking.show_time}</td>
                </tr>
                <tr>
                  <td style="color:#888;font-size:13px;">Theater</td>
                  <td style="color:#222;font-size:14px;">${booking.theater_name || ''}</td>
                </tr>
                <tr style="background:#f9f9f9;">
                  <td style="color:#888;font-size:13px;">Seats</td>
                  <td style="color:#222;font-size:14px;">${seatList}</td>
                </tr>
                <tr>
                  <td style="color:#888;font-size:13px;">Total Amount</td>
                  <td style="color:#cc0000;font-size:16px;font-weight:bold;">₹${booking.total_amount}</td>
                </tr>
              </table>

              <p style="color:#888;font-size:13px;">Enjoy the movie! 🍿</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;color:#aaa;font-size:12px;">
                © ${new Date().getFullYear()} BookMyShow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = { getOTPEmailTemplate, getBookingConfirmationTemplate };
