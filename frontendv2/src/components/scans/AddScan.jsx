import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import * as mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { useUser } from "../authentication/UserContext";

const AddScan = ({ onAddScan, scrollToTop, slidesRef }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [convertingFile, setConvertingFile] = useState(false);
  
  const [scanName, setScanName] = useState("");
  const { userId, setTotalScans} = useUser();

  const handleScanNameChange = (e) => {
    setScanName(e.target.value);
    if (scanName.length !== 0) {
      setErrorMessage("");
    }
  };

  // Function to convert DOCX to PDF using jsPDF, we us mammoth first as jspdf doesn't do well with direct doxc files
  const convertDocxToPdf = async (docxFile) => {
    try {
      setConvertingFile(true);
      
      // Read the DOCX file as ArrayBuffer
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(docxFile);
      });
      
      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = result.value;
      
      // Create a temporary div to render the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);
      
      // Setup PDF document with jsPDF as jspdf handles html conversion to pdf better 
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const margin = 15; 
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = margin;
      const lineHeight = 7;
      
      const textNodes = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
      for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        const text = node.textContent.trim();
        
        if (text) {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          if (node.tagName.toLowerCase().startsWith('h')) {
            pdf.setFont('helvetica', 'bold');
            const headingSize = 16 - parseInt(node.tagName.charAt(1));
            pdf.setFontSize(headingSize);
          } else {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
          }
          
          const splitText = pdf.splitTextToSize(text, pageWidth - 2 * margin);
          for (let j = 0; j < splitText.length; j++) {
            pdf.text(splitText[j], margin, yPosition);
            yPosition += lineHeight;
            
            if (yPosition > pageHeight - margin && j < splitText.length - 1) {
              pdf.addPage();
              yPosition = margin;
            }
          }
          
          yPosition += 3;
        }
      }
      
      document.body.removeChild(tempDiv);
      
      const pdfBlob = pdf.output('blob');
      
      const pdfFile = new File(
        [pdfBlob], 
        `${docxFile.name.replace('.docx', '.pdf')}`, 
        { type: 'application/pdf' }
      );
      
      setConvertingFile(false);
      return pdfFile;
    } catch (error) {
      console.error('DOCX to PDF conversion error:', error);
      setConvertingFile(false);
      setErrorMessage("Failed to convert DOCX file to PDF");
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const droppedFile = acceptedFiles[0];
    if (!droppedFile) return;
    
    setErrorMessage("");
    
    if (droppedFile.name.toLowerCase().endsWith('.docx')) {
      try {
        setIsLoading(true);
        const pdfFile = await convertDocxToPdf(droppedFile);
        if (pdfFile) {
          setFile(pdfFile);
        }
      } catch (error) {
        console.error("Error converting DOCX to PDF:", error);
        setErrorMessage("Failed to convert DOCX file");
      } finally {
        setIsLoading(false);
      }
    } else {
      setFile(droppedFile);
    }
  }, []);

  const handleUpload = async () => {
    if (!scanName.trim()) {
      setErrorMessage("Please enter a scan name");
      return;
    }
    if (!file) {
      setErrorMessage("Please select a file");
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const parseResponse = await fetch("https://api.zukini.com/scans/callparse", {
        method: "POST", 
        body: formData,
      });
      const parseResult = await parseResponse.json();
      await handleSave(parseResult.text, parseResult.filePath, parseResult.date);
    } catch (error) {
      console.error("Error in handleUpload:", error);
      setErrorMessage("Failed to process file");
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: false,
  });

  const handleSave = async (text, filePath, date) => {
    try {
      if (text.length === 0) {
        setErrorMessage("Please upload a file");
        return;
      }
      const key = uuidv4();
      const payload = {
        scankey: key,
        filePath: filePath,
        scanName,
        parsedText: text,
        currDate: date,
        userId: userId,
      };

      const response = await fetch(
        "https://api.zukini.com/scans/saveandexit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );


      if (response.ok) {
        if (onAddScan) {
          onAddScan({
            scankey: key,
            filepath: filePath,
            scanname: scanName,
            value: text,
            date: date,
            userId: userId,
          });
        }
        setTotalScans((prev) => prev + 1);
        setScanName("");
        setFile(null);
        scrollToTop();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        console.error("Failed to save data");
      }
    } catch (error) {
      console.error("Error during saving:", error);
    }
  };

  return (
    <div ref={(el) => (slidesRef.current[1] = el)} className="p-6">
      <h2 className="text-2xl font-bold text-[#0f0647] mb-4">
        Create New Scan
      </h2>

      <div className="space-y-5">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={scanName}
          onChange={handleScanNameChange}
          placeholder="Enter scan name, e.g., Chemistry 101 Notes"
        />

        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all 
            ${isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300"} ${
            isLoading || convertingFile ? "pointer-events-none" : "hover:border-indigo-400"
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            {file ? (
              <p className="text-gray-800 font-medium">
                Selected file: {file.name}
              </p>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m0 0v4a4 4 0 004 4h20a4 4 0 004-4V28m-4-4v-4m0 0v-8a4 4 0 00-4-4h-8m0 0V4"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-gray-600">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOCX, and images
                </p>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || !scanName.trim() || isLoading || convertingFile}
          className={`w-full p-3 rounded-lg font-semibold transition-all hover:cursor-pointer 
            ${
              !file || !scanName.trim() || isLoading || convertingFile
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0f0647] to-[#67d7cc] text-white hover:opacity-90"
            }`}
        >
          {isLoading ? "Processing..." : convertingFile ? "Converting DOCX to PDF..." : "Upload Scan"}
        </button>

        {errorMessage && (
          <p className="text-red-500 text-center text-sm">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default AddScan;