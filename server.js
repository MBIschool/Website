require('dotenv').config();

const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = const port = process.env.PORT || 8080;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Directory Setup ---
const PDF_OUTPUT_DIR = path.join(__dirname, 'applications_pdfs');
const UPLOADED_DOCS_DIR = path.join(__dirname, 'uploaded_documents'); // For storing original uploaded files

// Ensure directories exist
if (!fs.existsSync(PDF_OUTPUT_DIR)) {
    fs.mkdirSync(PDF_OUTPUT_DIR);
}
if (!fs.existsSync(UPLOADED_DOCS_DIR)) {
    fs.mkdirSync(UPLOADED_DOCS_DIR);
}

// --- Multer Configuration ---
// For application form (handles multiple file fields)
    
    const applicationUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
}).fields([
    { name: 'birthCert', maxCount: 1 },
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'schoolReport', maxCount: 1 },
    { name: 'academicCertificates[]', maxCount: 10 }
]);

const contactUpload = multer();
// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465 (SSL), false for other ports (TLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// --- Helper Function to Generate PDF HTML ---
function generateApplicationPdfHtml(formData, fileNames) {
    // Helper to safely get value, defaulting to 'N/A' if undefined or empty
    const getValue = (key) => {
        const value = formData[key];
        return (value === undefined | value === null | (typeof value === 'string' && value.trim() === ''))? 'N/A' : value;
    };

    // Format date of birth if available
    const dob = getValue('dob');
    const formattedDob = dob!== 'N/A'? new Date(dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    // List uploaded files for the PDF
    const uploadedFilesHtml = fileNames.length > 0
       ? `<ul>${fileNames.map(name => `<li>${name}</li>`).join('')}</ul>`
        : 'No documents uploaded.';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Madrasatulbayt Application Form</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f6; }
              .header { background-color: #0056b3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .container { width: 90%; max-width: 800px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                h1 { color: #0056b3; text-align: center; margin-bottom: 25px; }
                fieldset { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background-color: #fdfdfd; }
                legend { font-weight: bold; color: #0056b3; padding: 0 10px; }
              .data-item { margin-bottom: 10px; display: flex; flex-wrap: wrap; }
              .data-item strong { display: inline-block; width: 180px; min-width: 120px; color: #555; flex-shrink: 0; }
              .data-item span { flex-grow: 1; word-wrap: break-word; }
              .footer { margin-top: 30px; text-align: center; font-size: 0.85em; color: #777; padding-top: 20px; border-top: 1px solid #eee; }
              .file-list { margin-top: 10px; }
              .file-list li { margin-bottom: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Madrasatulbayt Application Submission</h2>
            </div>
            <div class="container">
                <h1>Application Details</h1>

                <fieldset>
                    <legend>Personal Information</legend>
                    <div class="data-item"><strong>First Name:</strong> <span>${getValue('firstName')}</span></div>
                    <div class="data-item"><strong>Last Name:</strong> <span>${getValue('lastName')}</span></div>
                    <div class="data-item"><strong>Date of Birth:</strong> <span>${formattedDob}</span></div>
                    <div class="data-item"><strong>Gender:</strong> <span>${getValue('gender')}</span></div>
                    <div class="data-item"><strong>Home Address:</strong> <span>${getValue('address')}</span></div>
                    <div class="data-item"><strong>Phone Number:</strong> <span>${getValue('phone')}</span></div>
                    <div class="data-item"><strong>Email Address:</strong> <span>${getValue('email')}</span></div>
                </fieldset>

                <fieldset>
                    <legend>Parent/Guardian Details</legend>
                    <div class="data-item"><strong>Full Name:</strong> <span>${getValue('guardianName')}</span></div>
                    <div class="data-item"><strong>Relationship:</strong> <span>${getValue('guardianRelation')}</span></div>
                    <div class="data-item"><strong>Phone Number:</strong> <span>${getValue('guardianPhone')}</span></div>
                    <div class="data-item"><strong>Email Address:</strong> <span>${getValue('guardianEmail')}</span></div>
                </fieldset>

                <fieldset>
                    <legend>Academic History</legend>
                    <div class="data-item"><strong>Previous School:</strong> <span>${getValue('prevSchool')}</span></div>
                    <div class="data-item"><strong>Last Grade Completed:</strong> <span>${getValue('gradeCompleted')}</span></div>
                </fieldset>

                <fieldset>
                    <legend>Program Selection</legend>
                    <div class="data-item"><strong>Selected Program:</strong> <span>${getValue('program')}</span></div>
                </fieldset>

                <fieldset>
                    <legend>Uploaded Documents</legend>
                    ${uploadedFilesHtml}
                </fieldset>

                <div class="footer">
                    <p>Application submitted on: ${new Date().toLocaleString()}</p>
                    <p>Madrasatulbayt Admissions</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// --- Route for Application Form Submission ---
app.post('/submit-application', applicationUpload, async (req, res) => { // Use applicationUpload directly
    try {
        const formData = req.body;
        const uploadedFiles = req.files; // Contains files organized by field name

        console.log('Received Application Form Data:', formData);
        console.log('Received Application Uploaded Files:', uploadedFiles);

        const attachmentsForEmail = []; // Initialize as an empty array
        const fileNamesForPdf =[]; // Initialize as an empty array

        const processFileField = (field, isMultiple = false) => {
    const fieldFiles = uploadedFiles && uploadedFiles[field];
    const files = isMultiple
        ? fieldFiles || []
        : fieldFiles
            ? [fieldFiles[0]]
            : [];

    if (files.length > 0) {
        files.forEach(file => {
            const uniqueFileName = `${Date.now()}_${file.originalname}`;
            // const filePath = path.join(UPLOADED_DOCS_DIR, uniqueFileName);
            // fs.writeFileSync(filePath, file.buffer);
            // console.log(`Saved uploaded file: ${filePath}`);

            attachmentsForEmail.push({
                filename: file.originalname,
                content: file.buffer,
                contentType: file.mimetype
            });
            fileNamesForPdf.push(file.originalname);
        });
    }
};


        // Call processFileField for each expected file input
        processFileField('birthCert');
        processFileField('schoolReport');
        processFileField('passportPhoto');
        processFileField('academicCertificates', true); // true for multiple files

        // 2. Generate PDF from HTML using Puppeteer
        const htmlContent = generateApplicationPdfHtml(formData, fileNamesForPdf);
        //const browser = await puppeteer.launch({ headless: true }); // headless: 'new' for newer Puppeteer versions
        const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        // Define PDF file name and path
        const pdfFileName = `Application_${formData.firstName | 'Unknown'}_${formData.lastName | 'Applicant'}_${Date.now()}.pdf`;
        const pdfFilePath = path.join(PDF_OUTPUT_DIR, pdfFileName);

        // 3. Store the generated PDF locally
        fs.writeFileSync(pdfFilePath, pdfBuffer);
        console.log(`Generated PDF saved locally at: ${pdfFilePath}`);

        // Add the generated PDF to email attachments (at the beginning)
        attachmentsForEmail.unshift({
            filename: pdfFileName,
            content: pdfBuffer,
            contentType: 'application/pdf'
        });

        // 4. Define email options
        const mailOptions = {
            from: `"Madrasatulbayt Applications" <${process.env.SMTP_USER}>`,
            to: `${process.env.RECIPIENT_YAHOO_EMAIL}, ${process.env.RECIPIENT_OUTLOOK_EMAIL}`,
            subject: `New Application Received: ${formData.firstName} ${formData.lastName}`,
            html: `
                <p>Dear Administrator,</p>
                <p>A new application has been submitted for Madrasatulbayt by <strong>${formData.firstName} ${formData.lastName}</strong>.</p>
                <p>Please find the full application details in the attached PDF document, along with any submitted supporting documents.</p>
                <p><strong>Applicant Email:</strong> ${formData.email}</p>
                <p><strong>Program of Interest:</strong> ${formData.program}</p>
                <p>Thank you.</p>
            `,
            attachments: attachmentsForEmail,
        };

        // 5. Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Application Email sent: %s', info.messageId);
        console.log('Application Email Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // 6. Send confirmation email to the applicant
if (formData.email) {
    const confirmationMailOptions = {
        from: `"Madrasatulbayt Admissions" <${process.env.SMTP_USER}>`,
        to: formData.email,
        subject: "Your Application Has Been Received",
        html: `
            <p>Dear ${formData.firstName || 'Applicant'},</p>
            <p>Thank you for submitting your application to Madrasatulbayt.</p>
            <p>We have received your documents and will review your application shortly.</p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br>Admissions Team</p>
        `
    };

    const confirmationInfo = await transporter.sendMail(confirmationMailOptions);
    console.log('Confirmation email sent to applicant: %s', confirmationInfo.messageId);
}


        // Redirect the user to a thank you page
        res.redirect('/thankyou(app).html');

    } catch (error) {
        console.error('Error processing application:', error);
        if (error.code === 'EAUTH') {
            console.error('Authentication failed. Check your SMTP_USER and SMTP_PASS in.env. For Gmail, ensure you are using an App Password.');
        } else if (error.code === 'ECONNREFUSED' | error.code === 'ETIMEDOUT') {
            console.error('Could not connect to SMTP server. Check SMTP_HOST and SMTP_PORT, and ensure your network allows outgoing connections.');
        }
        res.status(500).send('An error occurred during application submission. Please try again later.');
    }
});

// --- Route for Contact Form Submission ---
// app.post('/submit-contact', contactUpload.none(), async (req, res) => {
    app.post('/submit-contact', async (req, res) => {
    try {
        const formData = req.body; // Contains text fields from the contact form

        console.log('Received Contact Form Data:', formData);

        // 1. Define email options for the contact form
        const mailOptions = {
            from: `"Madrasatulbayt Contact Form" <${process.env.SMTP_USER}>`,
            to: `${process.env.RECIPIENT_YAHOO_EMAIL}, ${process.env.RECIPIENT_OUTLOOK_EMAIL}`,
            subject: `New Contact Message from ${formData.name || 'Anonymous'}`,
            html: `
                <p>Dear Administrator,</p>
                <p>You have received a new message from the contact form:</p>
                <p><strong>Name:</strong> ${formData.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${formData.email || 'N/A'}</p>
                <p><strong>Subject:</strong> ${formData.subject || 'N/A'}</p>
                <p><strong>Message:</strong></p>
                <p>${formData.message || 'N/A'}</p>
                <p>Thank you.</p>
            `,
        };

        // 2. Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Contact Email sent: %s', info.messageId);
        console.log('Contact Email Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Redirect the user to a thank you page or send a success response
        res.redirect('/thankyou(con).html');

    } catch (error) {
        console.error('Error processing contact form:', error);
        if (error.code === 'EAUTH') {
            console.error('Authentication failed. Check your SMTP_USER and SMTP_PASS in.env. For Gmail, ensure you are using an App Password.');
        } else if (error.code === 'ECONNREFUSED' | error.code === 'ETIMEDOUT') {
            console.error('Could not connect to SMTP server. Check SMTP_HOST and SMTP_PORT, and ensure your network allows outgoing connections.');
        }
        res.status(500).send('An error occurred during contact form submission. Please try again later.');
    }
});

// Routing for downloading a blank form
app.get('/download-blank-form', async (req, res) => {
  try {
    // const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

    const page = await browser.newPage();

    // Path to your blank HTML form file (make sure you have this file in your project)
    const blankFormPath = path.join(__dirname, 'public', 'blank_form.html');

    await page.goto('file://' + blankFormPath, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      }
    });

    await browser.close();

    // Set headers to prompt download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Madrasatulbayt_Blank_Application_Form.pdf"',
      'Content-Length': pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating blank PDF:', error);
    return res.status(500).send('Could not generate blank PDF form. Please try again later.');
  }
});


// --- Serve Static Files ---
// Create a 'public' folder in your project root for your HTML files (forms, thank you page)
app.use(express.static('public'));

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`Application form endpoint: http://localhost:${port}/submit-application`);
    console.log(`Contact form endpoint: http://localhost:${port}/submit-contact`);
    console.log(`Make sure your HTML forms' 'action' attributes point to these URLs.`);
});
