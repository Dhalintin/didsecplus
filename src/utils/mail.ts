
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (data :any) => {
  try {
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODE_MAILER_USER,
        pass: process.env.NODE_MAILER_PASS 
      },
    });

    const mailOptions = {
      from: `Bias project <${process.env.NODE_MAILER_USER}>`,
      to: data.email,
      subject: data.subject,
      html: data.html,
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};


export const hiringTeamMailOptionSendEmail = async (email: string, companyName: string, isExistingUser: boolean) => {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Join the Hiring Team at Bias-Free Job Platform",
    html: `
        <!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="x-apple-disable-message-reformatting">
            <title></title>

            <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">

            <!-- CSS Reset : BEGIN -->
            <style>
                html,
        body {
            margin: 0 auto !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
            background: #f1f1f1;
        }
        /* [Rest of the CSS Reset styles omitted for brevity, assume they remain the same] */
            </style>

            <!-- Progressive Enhancements : BEGIN -->
            <style>
                .primary{ background: #4CAF50; } /* Changed to a green shade for inclusivity */
                .bg_white{ background: #ffffff; }
                .bg_light{ background: #fafafa; }
                .bg_black{ background: #000000; }
                .bg_dark{ background: rgba(0,0,0,.8); }
                .email-section{ padding:2.5em; }

                /*BUTTON*/
                .btn{ padding: 10px 15px; display: inline-block; }
                .btn.btn-primary{ border-radius: 5px; background: #4CAF50; color: #ffffff; }
                .btn.btn-white{ border-radius: 5px; background: #ffffff; color: #000000; }
                .btn.btn-white-outline{ border-radius: 5px; background: transparent; border: 1px solid #fff; color: #fff; }
                .btn.btn-black-outline{ border-radius: 0px; background: transparent; border: 2px solid #000; color: #000; font-weight: 700; }

                h1,h2,h3,h4,h5,h6{ font-family: 'Lato', sans-serif; color: #000000; margin-top: 0; font-weight: 400; }
                body{ font-family: 'Lato', sans-serif; font-weight: 400; font-size: 15px; line-height: 1.8; color: rgba(0,0,0,.4); }
                a{ color: #4CAF50; }
                table{}
                .logo h1 { margin: 0; color: #4CAF50; font-size: 24px; font-weight: 700; font-family: 'Lato', sans-serif; }
                .hero{ position: relative; z-index: 0; }
                .hero .text{ color: rgba(0,0,0,.3); }
                .hero .text h2{ color: #000; font-size: 40px; margin-bottom: 0; font-weight: 400; line-height: 1.4; }
                .hero .text h3{ font-size: 24px; font-weight: 300; }
                .hero .text h2 span{ font-weight: 600; color: #4CAF50; }
                .heading-section{}
                .heading-section h2{ color: #000000; font-size: 28px; margin-top: 0; line-height: 1.4; font-weight: 400; }
                .heading-section .subheading{ margin-bottom: 20px !important; display: inline-block; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: rgba(0,0,0,.4); position: relative; }
                .heading-section .subheading::after{ position: absolute; left: 0; right: 0; bottom: -10px; content: ''; width: 100%; height: 2px; background: #4CAF50; margin: 0 auto; }
                .heading-section-white{ color: rgba(255,255,255,.8); }
                .heading-section-white h2{ font-family: line-height: 1; padding-bottom: 0; }
                .heading-section-white h2{ color: #ffffff; }
                .heading-section-white .subheading{ margin-bottom: 0; display: inline-block; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,.4); }
                ul.social{ padding: 0; }
                ul.social li{ display: inline-block; margin-right: 10px; }
                .footer{ border-top: 1px solid rgba(0,0,0,.05); color: rgba(0,0,0,.5); }
                .footer .heading{ color: #000; font-size: 20px; }
                .footer ul{ margin: 0; padding: 0; }
                .footer ul li{ list-style: none; margin-bottom: 10px; }
                .footer ul li a{ color: rgba(0,0,0,1); }
            </style>
        </head>

        <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;">
            <center style="width: 100%; background-color: #f1f1f1;">
            <div style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
            <div style="max-width: 600px; margin: 0 auto;" class="email-container">
                <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
                    <tr>
                        <td valign="middle" class="hero bg_white" style="padding: 3em 0 2em 0;">
                            <img src="https://biasfreejob.com/logo.png" alt="Bias-Free Job Platform" style="width: 300px; max-width: 600px; height: auto; margin: auto; display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td valign="middle" class="hero bg_white" style="padding: 2em 0 4em 0;">
                            <table>
                                <tr>
                                    <td>
                                        <div class="text" style="padding: 0 2.5em; text-align: center;">
                                            <h2>Welcome to the Hiring Team</h2>
                                            <p>You have been invited to join the hiring team for <strong>${companyName}</strong> on the Bias-Free Job Platform!</p>
                                            <p>Our platform is committed to promoting fair and inclusive hiring practices, ensuring every candidate is evaluated based on merit.</p>
                                            ${isExistingUser ? `
                                                <p>Please sign in to the Bias-Free Job Platform to view your notification and start contributing to a fair hiring process.</p>
                                                <p><a class="btn btn-primary" href="${process.env.APP_LINK}" target="_blank">Sign In</a></p>
                                            ` : `
                                                <p>Please join the Bias-Free Job Platform to get started with the hiring process and help us build a diverse workforce.</p>
                                                <p><a class="btn btn-primary" href="${process.env.APP_LINK}" target="_blank">Join Now</a></p>
                                            `}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
            </center>
        </body>
        </html>
    `,
  };

  return mailOptions;
};