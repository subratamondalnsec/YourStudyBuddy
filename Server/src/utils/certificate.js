import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import Certificate from './models/Certificate.js'; // Adjust path as needed

class CertificateGenerator {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Generate certificate HTML template
  generateCertificateHTML(certificateData) {
    const {
      userName,
      courseName,
      score,
      issuedDate,
      certificateId,
      txHash,
      instructorName = 'Course Instructor'
    } = certificateData;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Completion</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Open Sans', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .certificate {
                background: white;
                width: 1000px;
                height: 700px;
                padding: 60px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
            }
            
            .certificate::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 8px;
                background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
            }
            
            .certificate::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 8px;
                background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .certificate-title {
                font-family: 'Playfair Display', serif;
                font-size: 48px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            
            .subtitle {
                font-size: 18px;
                color: #7f8c8d;
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            
            .content {
                text-align: center;
                margin: 60px 0;
            }
            
            .awarded-text {
                font-size: 24px;
                color: #34495e;
                margin-bottom: 30px;
                font-weight: 300;
            }
            
            .recipient-name {
                font-family: 'Playfair Display', serif;
                font-size: 56px;
                font-weight: 700;
                color: #2c3e50;
                margin: 30px 0;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                border-bottom: 3px solid #3498db;
                display: inline-block;
                padding-bottom: 10px;
            }
            
            .course-text {
                font-size: 20px;
                color: #34495e;
                margin: 30px 0;
                line-height: 1.6;
            }
            
            .course-name {
                font-weight: 600;
                color: #2980b9;
                font-size: 24px;
            }
            
            .score-section {
                margin: 30px 0;
                padding: 20px;
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                border-radius: 10px;
                display: inline-block;
            }
            
            .score-text {
                font-size: 18px;
                color: #495057;
                margin-bottom: 10px;
            }
            
            .score-value {
                font-size: 36px;
                font-weight: 700;
                color: #28a745;
            }
            
            .footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 60px;
                padding-top: 30px;
                border-top: 2px solid #ecf0f1;
            }
            
            .signature-section {
                text-align: center;
            }
            
            .signature-line {
                width: 200px;
                height: 2px;
                background: #bdc3c7;
                margin: 0 auto 10px;
            }
            
            .signature-text {
                font-size: 14px;
                color: #7f8c8d;
                font-weight: 600;
            }
            
            .date-section {
                text-align: center;
            }
            
            .date-value {
                font-size: 16px;
                color: #2c3e50;
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .date-label {
                font-size: 12px;
                color: #7f8c8d;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .certificate-id {
                position: absolute;
                bottom: 20px;
                right: 30px;
                font-size: 12px;
                color: #95a5a6;
                font-family: 'Courier New', monospace;
            }
            
            .blockchain-info {
                position: absolute;
                bottom: 20px;
                left: 30px;
                font-size: 10px;
                color: #95a5a6;
                max-width: 300px;
            }
            
            .blockchain-hash {
                word-break: break-all;
                font-family: 'Courier New', monospace;
                background: #f8f9fa;
                padding: 2px 4px;
                border-radius: 3px;
                margin-top: 2px;
            }
            
            .decoration {
                position: absolute;
                top: 30px;
                right: 30px;
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                opacity: 0.1;
            }
            
            .decoration-2 {
                position: absolute;
                bottom: 100px;
                left: 30px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #f093fb, #f5576c);
                border-radius: 50%;
                opacity: 0.1;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="decoration"></div>
            <div class="decoration-2"></div>
            
            <div class="header">
                <h1 class="certificate-title">Certificate of Completion</h1>
                <p class="subtitle">This certifies that</p>
            </div>
            
            <div class="content">
                <p class="awarded-text">This certificate is proudly awarded to</p>
                
                <h2 class="recipient-name">${userName}</h2>
                
                <p class="course-text">
                    for successfully completing the course<br>
                    <span class="course-name">${courseName}</span>
                </p>
                
                <div class="score-section">
                    <div class="score-text">Final Score</div>
                    <div class="score-value">${score}%</div>
                </div>
            </div>
            
            <div class="footer">
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div class="signature-text">${instructorName}</div>
                </div>
                
                <div class="date-section">
                    <div class="date-value">${issuedDate}</div>
                    <div class="date-label">Date of Completion</div>
                </div>
            </div>
            
            <div class="certificate-id">Certificate ID: ${certificateId}</div>
            
            ${txHash ? `
            <div class="blockchain-info">
                <div>Verified on Aptos Blockchain:</div>
                <div class="blockchain-hash">${txHash}</div>
            </div>
            ` : ''}
        </div>
    </body>
    </html>
    `;
  }

  // Generate PDF certificate
  async generateCertificatePDF(certificateData, outputPath) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      // Set page size to A4 landscape
      await page.setViewport({ width: 1200, height: 800 });
      
      // Generate HTML content
      const htmlContent = this.generateCertificateHTML(certificateData);
      
      // Set HTML content
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        path: outputPath,
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });
      
      await page.close();
      return pdfBuffer;
      
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // Generate certificate image (PNG)
  async generateCertificateImage(certificateData, outputPath) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      // Set page size
      await page.setViewport({ width: 1200, height: 800 });
      
      // Generate HTML content
      const htmlContent = this.generateCertificateHTML(certificateData);
      
      // Set HTML content
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Take screenshot
      const imageBuffer = await page.screenshot({
        path: outputPath,
        type: 'png',
        fullPage: true,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 800
        }
      });
      
      await page.close();
      return imageBuffer;
      
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // Main method to create certificate from database
  async createCertificate(certificateId, options = {}) {
    try {
      // Fetch certificate data from database
      const certificate = await Certificate.findById(certificateId)
        .populate('user', 'name email')
        .populate('course', 'title description instructor')
        .exec();

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // Prepare certificate data
      const certificateData = {
        userName: certificate.user.name,
        courseName: certificate.course.title,
        score: certificate.score,
        issuedDate: certificate.issuedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        certificateId: certificate._id.toString(),
        txHash: certificate.txHash,
        instructorName: certificate.course.instructor || 'Course Instructor'
      };

      // Generate output paths
      const outputDir = options.outputDir || './certificates';
      await fs.mkdir(outputDir, { recursive: true });
      
      const baseFilename = `certificate_${certificate._id}`;
      const pdfPath = path.join(outputDir, `${baseFilename}.pdf`);
      const imagePath = path.join(outputDir, `${baseFilename}.png`);

      // Generate both PDF and image
      const results = {};
      
      if (options.generatePDF !== false) {
        results.pdfBuffer = await this.generateCertificatePDF(certificateData, pdfPath);
        results.pdfPath = pdfPath;
      }
      
      if (options.generateImage !== false) {
        results.imageBuffer = await this.generateCertificateImage(certificateData, imagePath);
        results.imagePath = imagePath;
      }

      return {
        certificate,
        certificateData,
        ...results
      };

    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  }

  // Batch generate certificates
  async batchGenerateCertificates(certificateIds, options = {}) {
    const results = [];
    
    for (const id of certificateIds) {
      try {
        const result = await this.createCertificate(id, options);
        results.push({ success: true, certificateId: id, ...result });
      } catch (error) {
        results.push({ success: false, certificateId: id, error: error.message });
      }
    }
    
    return results;
  }
}

// Usage example and API endpoints
export default CertificateGenerator;

// Example usage:
/*
const generator = new CertificateGenerator();

// Generate single certificate
const result = await generator.createCertificate('certificate_id_here', {
  outputDir: './output/certificates',
  generatePDF: true,
  generateImage: true
});

// Batch generate
const batchResults = await generator.batchGenerateCertificates([
  'cert_id_1',
  'cert_id_2',
  'cert_id_3'
]);

// Don't forget to close browser when done
await generator.closeBrowser();
*/

// Express.js API endpoint example
export const certificateRoutes = (app) => {
  const generator = new CertificateGenerator();

  // Generate certificate endpoint
  app.post('/api/certificates/:id/generate', async (req, res) => {
    try {
      const { id } = req.params;
      const { format = 'both' } = req.body; // 'pdf', 'image', or 'both'
      
      const options = {
        generatePDF: format === 'pdf' || format === 'both',
        generateImage: format === 'image' || format === 'both'
      };
      
      const result = await generator.createCertificate(id, options);
      
      res.json({
        success: true,
        message: 'Certificate generated successfully',
        data: {
          certificateId: result.certificate._id,
          pdfPath: result.pdfPath,
          imagePath: result.imagePath
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate certificate',
        error: error.message
      });
    }
  });

  // Download certificate endpoint
  app.get('/api/certificates/:id/download/:format', async (req, res) => {
    try {
      const { id, format } = req.params;
      
      const options = {
        generatePDF: format === 'pdf',
        generateImage: format === 'png'
      };
      
      const result = await generator.createCertificate(id, options);
      
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="certificate_${id}.pdf"`);
        res.send(result.pdfBuffer);
      } else if (format === 'png') {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="certificate_${id}.png"`);
        res.send(result.imageBuffer);
      } else {
        res.status(400).json({ error: 'Invalid format. Use pdf or png.' });
      }
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to download certificate',
        error: error.message
      });
    }
  });

  // Batch generate endpoint
  app.post('/api/certificates/batch-generate', async (req, res) => {
    try {
      const { certificateIds, format = 'both' } = req.body;
      
      const options = {
        generatePDF: format === 'pdf' || format === 'both',
        generateImage: format === 'image' || format === 'both'
      };
      
      const results = await generator.batchGenerateCertificates(certificateIds, options);
      
      res.json({
        success: true,
        message: 'Batch generation completed',
        results
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Batch generation failed',
        error: error.message
      });
    }
  });

  // Cleanup on app shutdown
  process.on('SIGINT', async () => {
    await generator.closeBrowser();
    process.exit(0);
  });
};



