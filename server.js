// require('dotenv').config();

// const express = require('express');
// const multer = require('multer');
// const nodemailer = require('nodemailer');

// // --- CHANGE START (Import Puppeteer) ---
// const puppeteer = require('puppeteer');
// // Original (after previous change): const puppeteer = require('puppeteer-core');
// // Original (after previous change): const chromium = require('chrome-aws-lambda');
// // Now, only puppeteer-core is needed, as Chromium is installed at the OS level by Dockerfile.
// // const puppeteer = require('puppeteer-core');
// // --- CHANGE END ---

// const fs = require('fs');
// const path = require('path');

// const app = express();
// const port = process.env.PORT || 8080;

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // --- Directory Setup (No change needed here, but remember these are ephemeral on Cloud Run) ---
// const PDF_OUTPUT_DIR = path.join(__dirname, 'applications_pdfs');
// const UPLOADED_DOCS_DIR = path.join(__dirname, 'uploaded_documents');

// if (!fs.existsSync(PDF_OUTPUT_DIR)) {
//     fs.mkdirSync(PDF_OUTPUT_DIR);
// }
// if (!fs.existsSync(UPLOADED_DOCS_DIR)) {
//     fs.mkdirSync(UPLOADED_DOCS_DIR);
// }

// // --- Multer Configuration (No change) ---
// const applicationUpload = multer({
//     storage: multer.memoryStorage(),
//     limits: { fileSize: 10 * 1024 * 1024 }
// }).fields([
//     { name: 'birthCert', maxCount: 1 },
//     { name: 'passportPhoto', maxCount: 1 },
//     { name: 'schoolReport', maxCount: 1 },
//     { name: 'academicCertificates[]', maxCount: 10 }
// ]);

// const contactUpload = multer();

// // --- Nodemailer Transporter Setup (No change) ---
// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: parseInt(process.env.SMTP_PORT),
//     secure: parseInt(process.env.SMTP_PORT) === 465,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//     },
// });

// // --- Helper Function to Generate PDF HTML (No change) ---
// function generateApplicationPdfHtml(formData, fileNames) {
//     const getValue = (key) => {
//         const value = formData[key];
//         return (value === undefined || value === null || (typeof value === 'string' && value.trim() === ''))? 'N/A' : value;
//     };

//     const dob = getValue('dob');
//     const formattedDob = dob !== 'N/A' ? new Date(dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

//     const uploadedFilesHtml = fileNames.length > 0
//         ? `<ul>${fileNames.map(name => `<li>${name}</li>`).join('')}</ul>`
//         : 'No documents uploaded.';

//     return `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Madrasatulbayt Application Form</title>
//             <style>
//                 body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f6; }
//               .header { background-color: #0056b3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
//               .container { width: 90%; max-width: 800px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
//                 h1 { color: #0056b3; text-align: center; margin-bottom: 25px; }
//                 fieldset { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; background-color: #fdfdfd; }
//                 legend { font-weight: bold; color: #0056b3; padding: 0 10px; }
//               .data-item { margin-bottom: 10px; display: flex; flex-wrap: wrap; }
//               .data-item strong { display: inline-block; width: 180px; min-width: 120px; color: #555; flex-shrink: 0; }
//               .data-item span { flex-grow: 1; word-wrap: break-word; }
//               .footer { margin-top: 30px; text-align: center; font-size: 0.85em; color: #777; padding-top: 20px; border-top: 1px solid #eee; }
//               .file-list { margin-top: 10px; }
//               .file-list li { margin-bottom: 5px; }
//             </style>
//         </head>
//         <body>
//             <div class="header">
//                 <h2>Madrasatulbayt Application Submission</h2>
//             </div>
//             <div class="container">
//                 <h1>Application Details</h1>

//                 <fieldset>
//                     <legend>Personal Information</legend>
//                     <div class="data-item"><strong>First Name:</strong> <span>${getValue('firstName')}</span></div>
//                     <div class="data-item"><strong>Last Name:</strong> <span>${getValue('lastName')}</span></div>
//                     <div class="data-item"><strong>Date of Birth:</strong> <span>${formattedDob}</span></div>
//                     <div class="data-item"><strong>Gender:</strong> <span>${getValue('gender')}</span></div>
//                     <div class="data-item"><strong>Home Address:</strong> <span>${getValue('address')}</span></div>
//                     <div class="data-item"><strong>Phone Number:</strong> <span>${getValue('phone')}</span></div>
//                     <div class="data-item"><strong>Email Address:</strong> <span>${getValue('email')}</span></div>
//                 </fieldset>

//                 <fieldset>
//                     <legend>Parent/Guardian Details</legend>
//                     <div class="data-item"><strong>Full Name:</strong> <span>${getValue('guardianName')}</span></div>
//                     <div class="data-item"><strong>Relationship:</strong> <span>${getValue('guardianRelation')}</span></div>
//                     <div class="data-item"><strong>Phone Number:</strong> <span>${getValue('guardianPhone')}</span></div>
//                     <div class="data-item"><strong>Email Address:</strong> <span>${getValue('guardianEmail')}</span></div>
//                 </fieldset>

//                 <fieldset>
//                     <legend>Academic History</legend>
//                     <div class="data-item"><strong>Previous School:</strong> <span>${getValue('prevSchool')}</span></div>
//                     <div class="data-item"><strong>Last Grade Completed:</strong> <span>${getValue('gradeCompleted')}</span></div>
//                 </fieldset>

//                 <fieldset>
//                     <legend>Program Selection</legend>
//                     <div class="data-item"><strong>Selected Program:</strong> <span>${getValue('program')}</span></div>
//                 </fieldset>

//                 <fieldset>
//                     <legend>Uploaded Documents</legend>
//                     ${uploadedFilesHtml}
//                 </fieldset>

//                 <div class="footer">
//                     <p>Application submitted on: ${new Date().toLocaleString()}</p>
//                     <p>Madrasatulbayt Admissions</p>
//                 </div>
//             </div>
//         </body>
//         </html>
//     `;
// }

// // --- Route for Application Form Submission ---
// app.post('/submit-application', applicationUpload, async (req, res) => {
//     try {
//         const formData = req.body;
//         const uploadedFiles = req.files;

//         console.log('Received Application Form Data:', formData);
//         console.log('Received Application Uploaded Files:', uploadedFiles);

//         const attachmentsForEmail = [];
//         const fileNamesForPdf =[];

//         const processFileField = (field, isMultiple = false) => {
//             const fieldFiles = uploadedFiles && uploadedFiles[field];
//             const files = isMultiple
//                 ? fieldFiles || []
//                 : fieldFiles
//                     ? [fieldFiles[0]]
//                     : [];

//             if (files.length > 0) {
//                 files.forEach(file => {
//                     const uniqueFileName = `${Date.now()}_${file.originalname}`;
//                     attachmentsForEmail.push({
//                         filename: file.originalname,
//                         content: file.buffer,
//                         contentType: file.mimetype
//                     });
//                     fileNamesForPdf.push(file.originalname);
//                 });
//             }
//         };

//         processFileField('birthCert');
//         processFileField('schoolReport');
//         processFileField('passportPhoto');
//         processFileField('academicCertificates', true);

//         // 2. Generate PDF from HTML using Puppeteer
//         const htmlContent = generateApplicationPdfHtml(formData, fileNamesForPdf);

//         // --- CHANGE START (Puppeteer Launch Options) ---
//          Original: const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//         // const browser = await puppeteer.launch({
//         //     headless: true, // Set to true for server environments
//         //     args: [
//         //         '--no-sandbox', // Essential for running as root (or in a containerized env)
//         //         '--disable-setuid-sandbox', // Also good practice
//         //         '--disable-dev-shm-usage', // Helps with /dev/shm limitations in some Docker setups
//         //         '--disable-gpu', // Cloud Run services don't have GPUs by default
//         //         '--single-process' // Often helps with memory and simplifies the process model
//         //     ],
//         // });
//         // --- CHANGE END ---

//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
//         const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
//         await browser.close();

//         const pdfFileName = `Application_${formData.firstName || 'Unknown'}_${formData.lastName || 'Applicant'}_${Date.now()}.pdf`;
//         const pdfFilePath = path.join(PDF_OUTPUT_DIR, pdfFileName);

//         fs.writeFileSync(pdfFilePath, pdfBuffer);
//         console.log(`Generated PDF saved locally at: ${pdfFilePath}`);

//         attachmentsForEmail.unshift({
//             filename: pdfFileName,
//             content: pdfBuffer,
//             contentType: 'application/pdf'
//         });

//         // 4. Define email options (No change)
//         const mailOptions = {
//             from: `"Madrasatulbayt Applications" <${process.env.SMTP_USER}>`,
//             to: `${process.env.RECIPIENT_YAHOO_EMAIL}, ${process.env.RECIPIENT_OUTLOOK_EMAIL}`,
//             subject: `New Application Received: ${formData.firstName} ${formData.lastName}`,
//             html: `
//                 <p>Dear Administrator,</p>
//                 <p>A new application has been submitted for Madrasatulbayt by <strong>${formData.firstName} ${formData.lastName}</strong>.</p>
//                 <p>Please find the full application details in the attached PDF document, along with any submitted supporting documents.</p>
//                 <p><strong>Applicant Email:</strong> ${formData.email}</p>
//                 <p><strong>Program of Interest:</strong> ${formData.program}</p>
//                 <p>Thank you.</p>
//             `,
//             attachments: attachmentsForEmail,
//         };

//         // 5. Send the email (No change)
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Application Email sent: %s', info.messageId);
//         console.log('Application Email Preview URL: %s', nodemailer.getTestMessageUrl(info));

//         // 6. Send confirmation email to the applicant (No change)
//         if (formData.email) {
//             const confirmationMailOptions = {
//                 from: `"Madrasatulbayt Admissions" <${process.env.SMTP_USER}>`,
//                 to: formData.email,
//                 subject: "Your Application Has Been Received",
//                 html: `
//                     <p>Dear ${formData.firstName || 'Applicant'},</p>
//                     <p>Thank you for submitting your application to Madrasatulbayt.</p>
//                     <p>We have received your documents and will review your application shortly.</p>
//                     <p>If you have any questions, feel free to reply to this email.</p>
//                     <p>Best regards,<br>Admissions Team</p>
//                 `
//             };
//             const confirmationInfo = await transporter.sendMail(confirmationMailOptions);
//             console.log('Confirmation email sent to applicant: %s', confirmationInfo.messageId);
//         }

//         res.redirect('/thankyou(app).html');

//     } catch (error) {
//         console.error('Error processing application:', error);
//         if (error.code === 'EAUTH') {
//             console.error('Authentication failed. Check your SMTP_USER and SMTP_PASS in.env. For Gmail, ensure you are using an App Password.');
//         } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
//             console.error('Could not connect to SMTP server. Check SMTP_HOST and SMTP_PORT, and ensure your network allows outgoing connections.');
//         }
//         res.status(500).send('An error occurred during application submission. Please try again later.');
//     }
// });

// // --- Route for Contact Form Submission (No change, but simplified Puppeteer launch as above) ---
// app.post('/submit-contact', async (req, res) => {
//     try {
//         const formData = req.body;
//         console.log('Received Contact Form Data:', formData);

//         const mailOptions = {
//             from: `"Madrasatulbayt Contact Form" <${process.env.SMTP_USER}>`,
//             to: `${process.env.RECIPIENT_YAHOO_EMAIL}, ${process.env.RECIPIENT_OUTLOOK_EMAIL}`,
//             subject: `New Contact Message from ${formData.name || 'Anonymous'}`,
//             html: `
//                 <p>Dear Administrator,</p>
//                 <p>You have received a new message from the contact form:</p>
//                 <p><strong>Name:</strong> ${formData.name || 'N/A'}</p>
//                 <p><strong>Email:</strong> ${formData.email || 'N/A'}</p>
//                 <p><strong>Subject:</strong> ${formData.subject || 'N/A'}</p>
//                 <p><strong>Message:</strong></p>
//                 <p>${formData.message || 'N/A'}</p>
//                 <p>Thank you.</p>
//             `,
//         };

//         const info = await transporter.sendMail(mailOptions);
//         console.log('Contact Email sent: %s', info.messageId);
//         console.log('Contact Email Preview URL: %s', nodemailer.getTestMessageUrl(info));

//         res.redirect('/thankyou(con).html');

//     } catch (error) {
//         console.error('Error processing contact form:', error);
//         if (error.code === 'EAUTH') {
//             console.error('Authentication failed. Check your SMTP_USER and SMTP_PASS in.env. For Gmail, ensure you are using an App Password.');
//         } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
//             console.error('Could not connect to SMTP server. Check SMTP_HOST and SMTP_PORT, and ensure your network allows outgoing connections.');
//         }
//         res.status(500).send('An error occurred during contact form submission. Please try again later.');
//     }
// });

// // --- Routing for downloading a blank form ---
// app.get('/download-blank-form', async (req, res) => {
//     try {
//         // --- CHANGE START (Puppeteer Launch Options) ---
//         // Original: const browser = await puppeteer.launch();
//         // Original (after chrome-aws-lambda): const browser = await puppeteer.launch({ args: chromium.args, ... });
//         // Use simpler args because Chromium is installed globally by Dockerfile's apt-get.
//         const browser = await puppeteer.launch({
//             headless: true, // Set to true for server environments
//             args: [
//                 '--no-sandbox',
//                 '--disable-setuid-sandbox',
//                 '--disable-dev-shm-usage',
//                 '--disable-gpu',
//                 '--single-process'
//             ],
//             // executablePath: '/usr/bin/chromium' // Optional
           
//         });
//         // --- CHANGE END ---

//         const page = await browser.newPage();

//         const blankFormPath = path.join(__dirname, 'public', 'blank_form.html');

//         // It's generally more reliable to read the file content and use page.setContent
//         // rather than 'file://' URLs in containerized environments.
//         await page.setContent(fs.readFileSync(blankFormPath, 'utf8'), { waitUntil: 'networkidle0' });
//         // Original: await page.goto('file://' + blankFormPath, { waitUntil: 'networkidle0' });


//         const pdfBuffer = await page.pdf({
//             format: 'A4',
//             printBackground: true,
//             margin: {
//                 top: '20mm',
//                 bottom: '20mm',
//                 left: '15mm',
//                 right: '15mm',
//             }
//         });

//         await browser.close();

//         res.set({
//             'Content-Type': 'application/pdf',
//             'Content-Disposition': 'attachment; filename="Madrasatulbayt_Blank_Application_Form.pdf"',
//             'Content-Length': pdfBuffer.length,
//         });

//         return res.send(pdfBuffer);
//     } catch (error) {
//         console.error('Error generating blank PDF:', error);
//         return res.status(500).send('Could not generate blank PDF form. Please try again later.');
//     }
// });


// // --- Serve Static Files (No change) ---
// app.use(express.static('public'));

// // --- Start the Server (No change) ---
// app.listen(port, () => {
//     console.log(`Server listening at http://localhost:${port}`);
//     console.log(`Application form endpoint: http://localhost:${port}/submit-application`);
//     console.log(`Contact form endpoint: http://localhost:${port}/submit-contact`);
//     console.log(`Make sure your HTML forms' 'action' attributes point to these URLs.`);
//     //console.log('Using Chromium at:', puppeteer.executablePath());

// });


// server.js

require('dotenv').config();



const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000; 


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

    
    const applicationUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
}).fields([
    { name: 'birthCert', maxCount: 1 },
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'schoolReport', maxCount: 1 },
    { name: 'academicCertificates[]', maxCount: 10 }
]);
//  ggi
const contactUpload = multer();
// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: parseInt(process.env.SMTP_PORT) === 465, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


function generateApplicationPdfHtml(formData, fileNames) {
    const getValue = (key) => {
        const value = formData[key];
        return (value === undefined | value === null | (typeof value === 'string' && value.trim() === ''))? 'N/A' : value;
    };

    
    const dob = getValue('dob');
    const formattedDob = dob!== 'N/A'? new Date(dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

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
app.post('/submit-application', applicationUpload, async (req, res) => { 
    try {
        const formData = req.body;
        const uploadedFiles = req.files; 

        console.log('Received Application Form Data:', formData);
        console.log('Received Application Uploaded Files:', uploadedFiles);

        const attachmentsForEmail = []; 
        const fileNamesForPdf =[]; 

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
        processFileField('academicCertificates', true); 

  
        const htmlContent = generateApplicationPdfHtml(formData, fileNamesForPdf);

        // const browser = await puppeteer.launch({
        //     headless: true,
        //     args: ['--no-sandbox', '--disable-setuid-sandbox'],
        //    ignoreDefaultArgs: ['--disable-extensions'],
        //    enableExtensions: true,
        //     });

        const browser = await puppeteer.launch({
    headless: 'new', // Set to 'new' for modern headless mode if using Puppeteer v22+
     executablePath: '/usr/bin/chromium',
    args: [
        '--no-sandbox',             // Essential for running in a Docker container as a non-root user
        '--disable-setuid-sandbox', // Companion argument to --no-sandbox
        '--disable-gpu',            // Often recommended for stability in headless environments
        '--disable-dev-shm-usage'   // Important for environments with limited /dev/shm (like containers)
    ]
    // No 'executablePath' needed here because we are setting PUPPETEER_EXECUTABLE_PATH
    // in the Dockerfile environment variables, which Puppeteer will honor.
   
});

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        const pdfFileName = `Application_${formData.firstName | 'Unknown'}_${formData.lastName | 'Applicant'}_${Date.now()}.pdf`;
        const pdfFilePath = path.join(PDF_OUTPUT_DIR, pdfFileName);

        fs.writeFileSync(pdfFilePath, pdfBuffer);
        console.log(`Generated PDF saved locally at: ${pdfFilePath}`);


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

   
        const info = await transporter.sendMail(mailOptions);
        console.log('Application Email sent: %s', info.messageId);
        console.log('Application Email Preview URL: %s', nodemailer.getTestMessageUrl(info));

  
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

    app.post('/submit-contact', async (req, res) => {
    try {
        const formData = req.body; 

        console.log('Received Contact Form Data:', formData);

        
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

        //  Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Contact Email sent: %s', info.messageId);
        console.log('Contact Email Preview URL: %s', nodemailer.getTestMessageUrl(info));

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


app.get('/download-blank-form', async (req, res) => {
  try {
    
//     const browser = await puppeteer.launch({
//   headless: true,
//   args: ['--no-sandbox', '--disable-setuid-sandbox'],
// ignoreDefaultArgs: ['--disable-extensions'],
// enableExtensions: true,
// })
const browser = await puppeteer.launch({
    headless: 'new', // Set to 'new' for modern headless mode if using Puppeteer v22+
     executablePath: '/usr/bin/chromium',
    args: [
        '--no-sandbox',             // Essential for running in a Docker container as a non-root user
        '--disable-setuid-sandbox', // Companion argument to --no-sandbox
        '--disable-gpu',            // Often recommended for stability in headless environments
        '--disable-dev-shm-usage'   // Important for environments with limited /dev/shm (like containers)
    ]
    // No 'executablePath' needed here because we are setting PUPPETEER_EXECUTABLE_PATH
    // in the Dockerfile environment variables, which Puppeteer will honor.
});

    const page = await browser.newPage();

    
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



app.use(express.static('public'));


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`Application form endpoint: http://localhost:${port}/submit-application`);
    console.log(`Contact form endpoint: http://localhost:${port}/submit-contact`);
    console.log(`Make sure your HTML forms' 'action' attributes point to these URLs.`);
});

