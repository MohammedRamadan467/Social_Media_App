"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailTemplate = exports.templates = void 0;
const email_enum_js_1 = require("../../../enum/email.enum.js");
exports.templates = {
    [email_enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL]: (data) => {
        return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }

    .wrapper {
      width: 100%;
      padding: 40px 0;
    }

    .container {
      width: 500px;
      max-width: 90%;
      margin: auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    .header {
      padding: 25px;
      text-align: center;
      background-color: #111827;
      color: #ffffff;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
    }

    .content {
      padding: 35px 30px;
      text-align: center;
    }

    .content h2 {
      margin-top: 0;
      color: #111827;
      font-size: 22px;
    }

    .content p {
      color: #6b7280;
      font-size: 15px;
      line-height: 1.6;
    }

    .code {
      margin: 25px auto;
      padding: 15px 25px;
      width: fit-content;
      background-color: #f3f4f6;
      border-radius: 8px;
      font-size: 30px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #111827;
    }

    .warning {
      font-size: 13px;
      color: #9ca3af;
    }

    .footer {
      padding: 20px;
      text-align: center;
      background-color: #f9fafb;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>

<body>

  <div class="wrapper">

    <div class="container">

      <div class="header">
        <h1>SARAHA APP</h1>
      </div>

      <div class="content">

        <h2>${data.title}</h2>

        <p>
          Use the verification code below to complete your request.
        </p>

        <div class="code">
          ${data.code}
        </div>

        <p class="warning">
          This code is confidential. Please do not share it with anyone.
        </p>

        <p>
          If you did not request this code, you can safely ignore this email.
        </p>

      </div>

      <div class="footer">
        © 2026 YOUR APP NAME. All rights reserved.
      </div>

    </div>

  </div>

</body>

</html> `;
    },
    [email_enum_js_1.EmailSubjectEnum.FORGOT_PASSWORD]: (data) => {
        return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }

    .wrapper {
      width: 100%;
      padding: 40px 0;
    }

    .container {
      width: 500px;
      max-width: 90%;
      margin: auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    .header {
      padding: 25px;
      text-align: center;
      background-color: #111827;
      color: #ffffff;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
    }

    .content {
      padding: 35px 30px;
      text-align: center;
    }

    .content h2 {
      margin-top: 0;
      color: #111827;
      font-size: 22px;
    }

    .content p {
      color: #6b7280;
      font-size: 15px;
      line-height: 1.6;
    }

    .code {
      margin: 25px auto;
      padding: 15px 25px;
      width: fit-content;
      background-color: #f3f4f6;
      border-radius: 8px;
      font-size: 30px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #111827;
    }

    .warning {
      font-size: 13px;
      color: #9ca3af;
    }

    .footer {
      padding: 20px;
      text-align: center;
      background-color: #f9fafb;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>

<body>

  <div class="wrapper">

    <div class="container">

      <div class="header">
        <h1>SARAHA APP</h1>
      </div>

      <div class="content">

        <h2>${data.title}</h2>

        <p>
          Use the verification code below to complete your request.
        </p>

        <div class="code">
          ${data.code}
        </div>

        <p class="warning">
          This code is confidential. Please do not share it with anyone.
        </p>

        <p>
          If you did not request this code, you can safely ignore this email.
        </p>

      </div>

      <div class="footer">
        © 2026 YOUR APP NAME. All rights reserved.
      </div>

    </div>

  </div>

</body>

</html> `;
    },
    [email_enum_js_1.EmailSubjectEnum.TWO_STEP_VERIFICATION]: (data) => {
        return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }

    .wrapper {
      width: 100%;
      padding: 40px 0;
    }

    .container {
      width: 500px;
      max-width: 90%;
      margin: auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    .header {
      padding: 25px;
      text-align: center;
      background-color: #111827;
      color: #ffffff;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
    }

    .content {
      padding: 35px 30px;
      text-align: center;
    }

    .content h2 {
      margin-top: 0;
      color: #111827;
      font-size: 22px;
    }

    .content p {
      color: #6b7280;
      font-size: 15px;
      line-height: 1.6;
    }

    .code {
      margin: 25px auto;
      padding: 15px 25px;
      width: fit-content;
      background-color: #f3f4f6;
      border-radius: 8px;
      font-size: 30px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #111827;
    }

    .warning {
      font-size: 13px;
      color: #9ca3af;
    }

    .footer {
      padding: 20px;
      text-align: center;
      background-color: #f9fafb;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>

<body>

  <div class="wrapper">

    <div class="container">

      <div class="header">
        <h1>SARAHA APP</h1>
      </div>

      <div class="content">

        <h2>${data.title}</h2>

        <p>
          Use the verification code below to complete your request.
        </p>

        <div class="code">
          ${data.code}
        </div>

        <p class="warning">
          This code is confidential. Please do not share it with anyone.
        </p>

        <p>
          If you did not request this code, you can safely ignore this email.
        </p>

      </div>

      <div class="footer">
        © 2026 YOUR APP NAME. All rights reserved.
      </div>

    </div>

  </div>

</body>

</html> `;
    },
    [email_enum_js_1.EmailSubjectEnum.LOGIN]: (data) => {
        return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }

    .wrapper {
      width: 100%;
      padding: 40px 0;
    }

    .container {
      width: 500px;
      max-width: 90%;
      margin: auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

    .header {
      padding: 25px;
      text-align: center;
      background-color: #111827;
      color: #ffffff;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
    }

    .content {
      padding: 35px 30px;
      text-align: center;
    }

    .content h2 {
      margin-top: 0;
      color: #111827;
      font-size: 22px;
    }

    .content p {
      color: #6b7280;
      font-size: 15px;
      line-height: 1.6;
    }

    .code {
      margin: 25px auto;
      padding: 15px 25px;
      width: fit-content;
      background-color: #f3f4f6;
      border-radius: 8px;
      font-size: 30px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #111827;
    }

    .warning {
      font-size: 13px;
      color: #9ca3af;
    }

    .footer {
      padding: 20px;
      text-align: center;
      background-color: #f9fafb;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>

<body>

  <div class="wrapper">

    <div class="container">

      <div class="header">
        <h1>SARAHA APP</h1>
      </div>

      <div class="content">

        <h2>${data.title}</h2>

        <p>
          Use the verification code below to complete your request.
        </p>

        <div class="code">
          ${data.code}
        </div>

        <p class="warning">
          This code is confidential. Please do not share it with anyone.
        </p>

        <p>
          If you did not request this code, you can safely ignore this email.
        </p>

      </div>

      <div class="footer">
        © 2026 YOUR APP NAME. All rights reserved.
      </div>

    </div>

  </div>

</body>

</html> `;
    }
};
const verifyEmailTemplate = (data) => {
    return exports.templates[data.subject](data);
};
exports.verifyEmailTemplate = verifyEmailTemplate;
