// src/utils/WebcamDistraction.js
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';

/**
 * AI-powered webcam distraction detection using TensorFlow.js FaceMesh
 * Detects: face presence, eye gaze direction, head pose
 */
export class WebcamDistraction {
  constructor() {
    this.model = null;
    this.video = null;
    this.isRunning = false;
    this.detectionInterval = null;
    
    // Tracking state
    this.faceNotDetectedSeconds = 0;
    this.lookingAwaySeconds = 0;
    this.totalChecks = 0;
    this.distractedChecks = 0;
    
    // Thresholds
    this.FACE_LOST_THRESHOLD = 3; // seconds
    this.LOOKING_AWAY_THRESHOLD = 5; // seconds
    this.CHECK_INTERVAL = 1000; // ms
  }

  /**
   * Initialize TensorFlow.js and FaceMesh model
   */
  async init() {
    try {
      console.log('Initializing TensorFlow.js FaceMesh...');
      
      // Set backend to WebGL for performance
      await tf.setBackend('webgl');
      await tf.ready();
      
      // Load FaceMesh model
      this.model = await facemesh.load({
        maxFaces: 1,
        inputResolution: { width: 640, height: 480 },
      });
      
      console.log('FaceMesh model loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize FaceMesh:', error);
      return false;
    }
  }

  /**
   * Start webcam and begin detection
   */
  async start() {
    if (this.isRunning) return;

    try {
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      // Create video element
      this.video = document.createElement('video');
      this.video.srcObject = stream;
      this.video.width = 640;
      this.video.height = 480;
      this.video.autoplay = true;
      this.video.playsInline = true;

      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          resolve();
        };
      });

      // Initialize model if not loaded
      if (!this.model) {
        const success = await this.init();
        if (!success) {
          throw new Error('Failed to load FaceMesh model');
        }
      }

      // Reset tracking
      this.faceNotDetectedSeconds = 0;
      this.lookingAwaySeconds = 0;
      this.totalChecks = 0;
      this.distractedChecks = 0;
      this.isRunning = true;

      // Start detection loop
      this.detectionInterval = setInterval(() => {
        this.detectFace();
      }, this.CHECK_INTERVAL);

      console.log('Webcam distraction detection started');
      return true;
    } catch (error) {
      console.error('Failed to start webcam:', error);
      this.stop();
      return false;
    }
  }

  /**
   * Detect face and analyze attention
   */
  async detectFace() {
    if (!this.video || !this.model || !this.isRunning) return;

    try {
      const predictions = await this.model.estimateFaces(this.video);
      this.totalChecks++;

      if (predictions.length === 0) {
        // No face detected
        this.faceNotDetectedSeconds++;
        this.distractedChecks++;
      } else {
        // Face detected - analyze gaze
        const face = predictions[0];
        const isLookingAway = this.analyzeLookingAway(face);

        if (isLookingAway) {
          this.lookingAwaySeconds++;
          this.distractedChecks++;
        } else {
          // User is focused - reset counters
          this.faceNotDetectedSeconds = Math.max(0, this.faceNotDetectedSeconds - 0.5);
          this.lookingAwaySeconds = Math.max(0, this.lookingAwaySeconds - 0.5);
        }
      }
    } catch (error) {
      console.warn('Face detection error:', error);
    }
  }

  /**
   * Analyze if user is looking away from screen
   * Uses facial landmarks to estimate gaze direction
   */
  analyzeLookingAway(face) {
    const keypoints = face.scaledMesh;
    
    // Get key facial landmarks
    const noseTip = keypoints[1]; // Nose tip
    const leftEye = keypoints[33]; // Left eye outer corner
    const rightEye = keypoints[263]; // Right eye outer corner
    const chin = keypoints[152]; // Chin
    
    // Calculate face center
    const faceCenter = [
      (leftEye[0] + rightEye[0]) / 2,
      (leftEye[1] + rightEye[1]) / 2,
    ];

    // Calculate head rotation based on nose position relative to eye center
    const noseToCenterX = Math.abs(noseTip[0] - faceCenter[0]);
    const eyeDistance = Math.abs(leftEye[0] - rightEye[0]);
    
    // If nose is too far from center relative to eye distance, user is looking away
    const headRotationRatio = noseToCenterX / eyeDistance;
    const HEAD_ROTATION_THRESHOLD = 0.3; // 30% deviation
    
    // Calculate vertical head tilt
    const noseToFaceCenterY = Math.abs(noseTip[1] - faceCenter[1]);
    const faceHeight = Math.abs(chin[1] - faceCenter[1]);
    const verticalTiltRatio = noseToFaceCenterY / faceHeight;
    const VERTICAL_TILT_THRESHOLD = 0.4;

    return (
      headRotationRatio > HEAD_ROTATION_THRESHOLD ||
      verticalTiltRatio > VERTICAL_TILT_THRESHOLD
    );
  }

  /**
   * Check if distraction threshold exceeded
   */
  isDistracted() {
    return (
      this.faceNotDetectedSeconds >= this.FACE_LOST_THRESHOLD ||
      this.lookingAwaySeconds >= this.LOOKING_AWAY_THRESHOLD
    );
  }

  /**
   * Get distraction reason for logging
   */
  getDistractionReason() {
    if (this.faceNotDetectedSeconds >= this.FACE_LOST_THRESHOLD) {
      return 'Face not detected - user may have left desk';
    }
    if (this.lookingAwaySeconds >= this.LOOKING_AWAY_THRESHOLD) {
      return 'Looking away from screen - checking phone or surroundings';
    }
    return null;
  }

  /**
   * Get attention score (0-100)
   */
  getAttentionScore() {
    if (this.totalChecks === 0) return 100;
    
    const focusedChecks = this.totalChecks - this.distractedChecks;
    return Math.round((focusedChecks / this.totalChecks) * 100);
  }

  /**
   * Get metrics snapshot
   */
  getMetrics() {
    return {
      attentionScore: this.getAttentionScore(),
      faceNotDetectedSeconds: this.faceNotDetectedSeconds,
      lookingAwaySeconds: this.lookingAwaySeconds,
      totalChecks: this.totalChecks,
      distractedChecks: this.distractedChecks,
      isDistracted: this.isDistracted(),
      distractionReason: this.getDistractionReason(),
    };
  }

  /**
   * Reset tracking counters
   */
  reset() {
    this.faceNotDetectedSeconds = 0;
    this.lookingAwaySeconds = 0;
    this.totalChecks = 0;
    this.distractedChecks = 0;
  }

  /**
   * Stop detection and release resources
   */
  stop() {
    this.isRunning = false;

    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    if (this.video && this.video.srcObject) {
      const tracks = this.video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      this.video.srcObject = null;
    }

    this.video = null;
    console.log('Webcam distraction detection stopped');
  }

  /**
   * Check if webcam is available
   */
  static async isWebcamAvailable() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((device) => device.kind === 'videoinput');
    } catch {
      return false;
    }
  }
}
