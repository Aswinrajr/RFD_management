const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');

class EmailService {
  constructor() {
    // SMTP transporter for sending emails
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
      , tls: {
        rejectUnauthorized: false,
      },
    });

    // IMAP configuration for receiving emails
    this.imapConfig = {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      host: process.env.IMAP_HOST,
      port: process.env.IMAP_PORT,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    };
  }

  // Send RFP email to vendors
  async sendRFPEmail(vendorEmail, vendorName, rfpDetails) {
    try {
      const emailContent = this.formatRFPEmail(rfpDetails, vendorName);

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: vendorEmail,
        subject: `RFP: ${rfpDetails.title}`,
        html: emailContent,
        text: this.stripHtml(emailContent)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Format RFP details into email HTML
  formatRFPEmail(rfpDetails, vendorName) {
    const requirementsList = rfpDetails.requirements
      .map(req => `<li><strong>${req.item}</strong>: Quantity ${req.quantity} - ${req.specifications}</li>`)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
          h2 { color: #34495e; margin-top: 20px; }
          .section { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #3498db; }
          .highlight { background-color: #fff3cd; padding: 2px 5px; }
          ul { list-style-type: none; padding-left: 0; }
          li { margin: 10px 0; padding: 10px; background-color: white; border-radius: 4px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Request for Proposal</h1>
          
          <p>Dear ${vendorName},</p>
          
          <p>We are pleased to invite you to submit a proposal for the following procurement requirement:</p>
          
          <div class="section">
            <h2>📋 Project Title</h2>
            <p><strong>${rfpDetails.title}</strong></p>
          </div>

          <div class="section">
            <h2>📝 Description</h2>
            <p>${rfpDetails.description}</p>
          </div>

          <div class="section">
            <h2>🛒 Requirements</h2>
            <ul>
              ${requirementsList}
            </ul>
          </div>

          <div class="section">
            <h2>💰 Budget</h2>
            <p><span class="highlight">${rfpDetails.budget.currency} ${rfpDetails.budget.amount.toLocaleString()}</span></p>
          </div>

          <div class="section">
            <h2>📅 Delivery Timeline</h2>
            <p><strong>${rfpDetails.deliveryTimeline.value} ${rfpDetails.deliveryTimeline.unit}</strong></p>
          </div>

          <div class="section">
            <h2>💳 Payment Terms</h2>
            <p>${rfpDetails.paymentTerms}</p>
          </div>

          ${rfpDetails.warranty ? `
          <div class="section">
            <h2>🛡️ Warranty Requirements</h2>
            <p>${rfpDetails.warranty}</p>
          </div>
          ` : ''}

          ${rfpDetails.additionalTerms ? `
          <div class="section">
            <h2>📌 Additional Terms</h2>
            <p>${rfpDetails.additionalTerms}</p>
          </div>
          ` : ''}

          <div class="footer">
            <p><strong>Please submit your proposal by replying to this email with the following details:</strong></p>
            <ul>
              <li>✓ Detailed pricing breakdown</li>
              <li>✓ Delivery timeline</li>
              <li>✓ Payment terms you can offer</li>
              <li>✓ Warranty details</li>
              <li>✓ Any additional terms or conditions</li>
            </ul>
            
            <p>We look forward to receiving your proposal.</p>
            
            <p>Best regards,<br>
            Procurement Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Strip HTML tags for plain text version
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Fetch unread emails from inbox
  async fetchUnreadEmails(callback) {
    return new Promise((resolve, reject) => {
      const imap = new Imap(this.imapConfig);
      const emails = [];
      let connectionClosed = false;

      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            if (!connectionClosed) {
              connectionClosed = true;
              imap.end();
              reject(err);
            }
            return;
          }

          // Search for unseen emails
          imap.search(['UNSEEN'], (err, results) => {
            if (err) {
              if (!connectionClosed) {
                connectionClosed = true;
                imap.end();
                reject(err);
              }
              return;
            }

            if (results.length === 0) {
              console.log('No unread emails');
              if (!connectionClosed) {
                connectionClosed = true;
                imap.end();
              }
              resolve([]);
              return;
            }

            const fetch = imap.fetch(results, { bodies: '', markSeen: true });

            fetch.on('message', (msg, seqno) => {
              let emailData = {};

              msg.on('body', (stream, info) => {
                simpleParser(stream, async (err, parsed) => {
                  if (err) {
                    console.error('Error parsing email:', err);
                    return;
                  }

                  emailData = {
                    from: parsed.from.value[0].address,
                    subject: parsed.subject,
                    text: parsed.text,
                    html: parsed.html,
                    date: parsed.date,
                    attachments: parsed.attachments
                  };

                  emails.push(emailData);

                  // Process the email with callback if provided
                  if (callback) {
                    try {
                      await callback(emailData);
                    } catch (callbackError) {
                      console.error('Error in callback:', callbackError);
                    }
                  }
                });
              });
            });

            fetch.once('error', (err) => {
              console.error('Fetch error:', err);
              if (!connectionClosed) {
                connectionClosed = true;
                imap.end();
                reject(err);
              }
            });

            fetch.once('end', () => {
              console.log('Done fetching messages');
              if (!connectionClosed) {
                connectionClosed = true;
                imap.end();
              }
            });
          });
        });
      });

      imap.once('error', (err) => {
        // Ignore ECONNRESET errors - they happen after successful fetch
        if (err.code === 'ECONNRESET') {
          console.log('IMAP connection closed (normal after fetching)');
          if (!connectionClosed) {
            connectionClosed = true;
            resolve(emails);
          }
        } else {
          console.error('IMAP error:', err);
          if (!connectionClosed) {
            connectionClosed = true;
            reject(err);
          }
        }
      });

      imap.once('end', () => {
        console.log('IMAP connection ended');
        if (!connectionClosed) {
          connectionClosed = true;
          resolve(emails);
        }
      });

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (!connectionClosed) {
          console.log('IMAP connection timeout - closing');
          connectionClosed = true;
          imap.end();
          resolve(emails);
        }
      }, 30000); // 30 second timeout

      imap.on('close', () => {
        clearTimeout(timeout);
      });

      imap.connect();
    });
  }

  // Start listening for new emails
  startEmailListener(callback) {
    const imap = new Imap(this.imapConfig);

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          console.error('Error opening inbox:', err);
          return;
        }

        console.log('Email listener started. Waiting for new emails...');

        // Listen for new mail events
        imap.on('mail', (numNewMsgs) => {
          console.log(`${numNewMsgs} new email(s) received`);
          this.fetchUnreadEmails(callback);
        });
      });
    });

    imap.once('error', (err) => {
      console.error('IMAP listener error:', err);
    });

    imap.connect();

    return imap;
  }
}

module.exports = new EmailService();