
const mailTemplates = {
  forgotPassword: (data) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #333;
        }
        p {
            color: #555;
            line-height: 1.6;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            color: #d9534f;
            text-align: center;
            background: #f8d7da;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            font-size: 12px;
            color: #888;
            margin-top: 20px;
            text-align: center;
        }
        .highlight {
            color: #d9534f;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Here's your password reset code:</p>
        <div class="code">${data.token}</div>
        <p><strong>This code will expire in 1 hour.</strong></p>
        <p>Please note:</p>
        <ul>
            <li>If you didn't request this password reset, please ignore this email.</li>
            <li>For security reasons, <span class="highlight">do not share this code</span> with anyone.</li>
            <li>The code is case-sensitive.</li>
        </ul>
        <p>Need help?</p>
        <p>If you have any questions or concerns, please contact our support team.</p>
        <p>Best regards,</p>
        <p><strong>Your Learning Platform Team</strong></p>
        <div class="footer">
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>
`;
  },
};

module.exports = mailTemplates;
