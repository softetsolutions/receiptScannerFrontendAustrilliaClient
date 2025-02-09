import React, { useState, useRef, useEffect } from "react";

const ReceiptScanner = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [apiCallStarted, setApiCallStarted] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [showPopup, setShowPopup] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 📁 Upload from Gallery
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      previewImage(file);
      uploadToBackend(file);
    }
  };

  // 📷 Open Camera
  const openCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      alert("Camera access denied or unavailable.");
      setCameraActive(false);
    }
  };

  // 📸 Capture Image
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // Convert canvas to file
    canvas.toBlob((blob) => {
      const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
      previewImage(file);
      uploadToBackend(file);
    }, "image/jpeg");

    // Stop camera after capture
    stopCamera();
  };

  // 🛑 Stop Camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  // 🖼️ Preview Image
  const previewImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // 🔄 Upload to Backend
  const uploadToBackend = async (file) => {
    const formData = new FormData();
    formData.append("receipt", file);

    try {
      setExtractedText("");
      setTotalPrice("");
      setApiCallStarted(true);
      const response = await fetch(
        "https://receiptscannerforaustrilianclient-1.onrender.com/upload-receipt",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      setExtractedText(data.extractedText || "No text extracted");
      setTotalPrice(data.totalPrice || "Not found");
      setApiCallStarted(false);
    } catch (error) {
      setApiCallStarted(false);
      alert("❌ Upload failed! Try again.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(
        "https://receiptscannerforaustrilianclient-1.onrender.com/test-api"
      ).then(() => console.log("pinging"));
    }, 10000);

    return ()=> clearInterval(interval)
  }, []);

  return (
    <div style={styles.container}>
      {showPopup && (
        <div style={styles.popup}>
          <div style={styles.popupContent}>
            <h2>🚀 Welcome to Our Receipt Scanner Demo!</h2>
            <p>
              This is a <b>proof of concept</b> showcasing our ability to scan
              and extract data from receipts. We built this in just{" "}
              <b>a few days</b> to demonstrate our capabilities.
            </p>
            <p>
              If you like this, we can develop a{" "}
              <b>full-fledged web & mobile solution</b> with all the features
              you need!
            </p>
            <p>
              <b>
                {" "}
                Note:-Currently, we do not have the exact receipt format you are
                using, so the extracted total price might differ from the actual
                value. We have tested with sample receipts, and once we finalize
                the receipt format, it will work perfectly.
              </b>
            </p>
            <p>Pls Hit Got It in order to see the demo.</p>
            <button style={styles.button} onClick={() => setShowPopup(false)}>
              Got It! ✅
            </button>
          </div>
        </div>
      )}

      <h1 style={styles.h1}>Receipt Scanner</h1>

      {apiCallStarted && <div style={styles.result}>Extracting Data...</div>}

      {/* Result Section */}
      {extractedText && (
        <div style={styles.result}>
          <h3>Extracted Data:</h3>
          <p>
            <strong>Extracted Text:</strong> {extractedText}
          </p>
          <p>
            <strong>Total Price:</strong> {totalPrice}
          </p>
        </div>
      )}

      {/* 📁 Upload Option */}
      <button
        style={styles.button}
        onClick={() => document.getElementById("fileInput").click()}
      >
        📁 Upload Receipt
      </button>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {/* 📷 Camera Option */}
      {!cameraActive ? (
        <button style={styles.button} onClick={openCamera}>
          📷 Scan from Camera
        </button>
      ) : (
        <button style={styles.button} onClick={stopCamera}>
          🛑 Close Camera
        </button>
      )}

      {/* Camera Preview */}
      {cameraActive && <video ref={videoRef} autoPlay style={styles.video} />}
      {cameraActive && (
        <button style={styles.button} onClick={captureImage}>
          📸 Capture & Upload
        </button>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <img src={imagePreview} alt="Preview" style={styles.image} />
      )}

      {/* Hidden Canvas for Capturing */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
};

// ✅ Styles
const styles = {
  container: {
    textAlign: "center",
    maxWidth: "400px",
    margin: "auto",
    padding: "20px",
    background: "#fff",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    color: "black",
  },
  button: {
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "none",
    background: "#007BFF",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    borderRadius: "5px",
  },
  video: {
    width: "100%",
    marginTop: "10px",
    borderRadius: "5px",
  },
  image: {
    width: "100%",
    marginTop: "10px",
    borderRadius: "5px",
  },
  result: {
    marginTop: "20px",
    padding: "10px",
    background: "#e3f2fd",
    borderRadius: "5px",
    textAlign: "left",
    color: "black",
  },
  popup: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "black",
  },
  popupContent: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    maxWidth: "400px",
  },
};

export default ReceiptScanner;
