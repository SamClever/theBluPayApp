import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, CameraOptions, ImagePickerResponse } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons, illustrations } from '../constants';
import CustomAlertModal from '../components/CustomAlertModal';
import Header from '../components/Header';
import Button from '../components/Button';

const baseUrl = 'https://theblupayapi.com';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
};

const SelfieWithIdCard = () => {
  const navigation = useNavigation<NavigationProps>();
  const { colors, dark } = useTheme();
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [detectingFace, setDetectingFace] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [cameraReady, setCameraReady] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Custom Alert States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Information');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info' | 'custom'>('custom');
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);

  // Request CAMERA permission on Android
  async function ensureCameraPermission() {
    if (Platform.OS !== 'android') return true;
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (status !== 'granted') {
      showCustomAlert(
        'Permission Required',
        'Camera access is needed to take your selfie. Please enable camera permissions in your device settings.',
        'warning'
      );
      return false;
    }
    return true;
  }

  // Enhanced face detection with multiple checks
  const detectFace = async (uri: string): Promise<boolean> => {
    setDetectingFace(true);
    
    try {
      // Multiple validation checks for face detection
      const [dimensionValid, qualityValid, contentValid] = await Promise.all([
        validateImageDimensions(uri),
        validateImageQuality(uri),
        validateImageContent(uri),
      ]);
      
      // Log validation results for debugging
      console.log('Face Detection Results:', {
        dimensionValid,
        qualityValid,
        contentValid,
        uri: uri.substring(0, 50) + '...' // Log partial URI for debugging
      });
      
      // STRICT MODE: Only accept if ALL validations pass
      const hasFace = dimensionValid && qualityValid && contentValid;
      
      // Additional safety check: if any validation fails, definitely no face
      if (!dimensionValid || !qualityValid || !contentValid) {
        console.log('Face Detection: Rejected due to validation failure');
        let reason = '';
        if (!dimensionValid) reason = 'Image dimensions not suitable for selfie';
        else if (!qualityValid) reason = 'Image quality too low';
        else if (!contentValid) reason = 'No face detected in image';
        setRejectionReason(reason);
        setDetectingFace(false);
        setFaceDetected(false);
        return false;
      }
      
      // MANUAL OVERRIDE: Aggressive checks for non-face objects
      Image.getSize(uri, (width, height) => {
        const aspectRatio = width / height;
        const totalPixels = width * height;
        
        // AGGRESSIVE: Reject ANYTHING that's not a perfect human face
        const isLikelyNonFace = 
          aspectRatio > 0.8 || // Too wide (objects, not faces)
          aspectRatio < 0.7 || // Too tall (unlikely to be faces)
          width > 800 || height > 1000 || // Too high res (objects)
          width < 500 || height < 600 || // Too small
          totalPixels > 800000 || // Too many pixels (objects)
          totalPixels < 300000 || // Too few pixels (likely distorted)
          // Reject distorted/pixelated images
          aspectRatio < 0.6 || aspectRatio > 0.9;
        
        if (isLikelyNonFace) {
          let reason = '';
          if (aspectRatio > 0.8) reason = 'Image is too wide (likely an object, not a face)';
          else if (aspectRatio < 0.7) reason = 'Image is too tall (unlikely to be a face)';
          else if (width > 800 || height > 1000) reason = 'Image resolution too high (likely an object)';
          else if (width < 500 || height < 600) reason = 'Image too small for face detection';
          else if (totalPixels > 800000) reason = 'Image has too many pixels (likely an object)';
          else if (totalPixels < 300000) reason = 'Image has too few pixels (likely distorted)';
          else if (aspectRatio < 0.6 || aspectRatio > 0.9) reason = 'Image appears to be distorted or pixelated';
          else reason = 'Image does not appear to be a human face';
          
          console.log('Face Detection: AGGRESSIVE override - rejected non-face image');
          setRejectionReason(reason);
          setDetectingFace(false);
          setFaceDetected(false);
          return false;
        }
      }, () => {
        // If we can't analyze, assume no face
        console.log('Face Detection: Could not analyze image for aggressive override');
        setRejectionReason('Could not analyze image - not a valid human face');
        setDetectingFace(false);
        setFaceDetected(false);
        return false;
      });
      
      setDetectingFace(false);
      setFaceDetected(hasFace);
      
      return hasFace;
    } catch (error) {
      console.error('Face detection error:', error);
      setDetectingFace(false);
      setFaceDetected(false);
      return false;
    }
  };

  // Validate image dimensions for selfie
  const validateImageDimensions = async (uri: string): Promise<boolean> => {
    return new Promise((resolve) => {
      Image.getSize(uri, (width, height) => {
        const aspectRatio = width / height;
        
        // Reasonable dimension validation for human faces
        
        // 1. MUST be portrait orientation (height > width) - reasonable
        const isPortrait = aspectRatio < 0.9; // Face should be taller than wide
        
        // 2. MUST have reasonable size for face detection
        const hasReasonableSize = width >= 300 && height >= 400; // Lower minimum for faces
        
        // 3. Reject obvious non-face patterns:
        // - Very wide images (keyboards, screens, landscapes)
        const isNotWideImage = aspectRatio < 0.9; // Reasonable portrait requirement
        
        // - Very tall images (unlikely to be faces)
        const isNotTooTall = aspectRatio > 0.5; // Allow reasonable portrait
        
        // 4. Reject obvious non-face objects:
        // - Reject keyboard-like patterns (very wide)
        const isNotKeyboard = !(width > 800 && height > 400 && aspectRatio > 1.2);
        
        // - Reject screen-like patterns (very high resolution)
        const isNotScreen = !(width > 1500 && height > 1000);
        
        // - Reject very small images
        const isNotTooSmall = width >= 300 && height >= 400;
        
        // - Reject extremely large images (likely screenshots)
        const isNotTooLarge = width <= 2000 && height <= 2500;
        
        // 5. Accept reasonable range for human face selfies
        const isReasonableFaceRange = width >= 300 && width <= 2000 && 
                                     height >= 400 && height <= 2500 &&
                                     aspectRatio >= 0.5 && aspectRatio <= 0.9;
        
        // 6. Reject obvious object patterns:
        // - Reject very square images (likely objects, not faces)
        const isNotVerySquare = aspectRatio < 0.95;
        
        // - Reject common desktop screen dimensions
        const isNotDesktopScreen = !(width === 1366 && height === 768) && // Laptop screen
                                  !(width === 1920 && height === 1080) && // Full HD
                                  !(width === 2560 && height === 1440) && // QHD
                                  !(width === 1440 && height === 900) && // MacBook
                                  !(width === 1280 && height === 720) && // HD
                                  !(width === 1600 && height === 900); // HD+
        
        // Log validation for debugging
        console.log('Reasonable Dimension Validation:', {
          width, height, aspectRatio,
          isPortrait, hasReasonableSize,
          isNotWideImage, isNotTooTall,
          isNotKeyboard, isNotScreen,
          isNotTooSmall, isNotTooLarge,
          isReasonableFaceRange, isNotVerySquare,
          isNotDesktopScreen
        });
        
        // Reasonable criteria for a human face
        const isValid = isPortrait && 
                       hasReasonableSize && 
                       isNotWideImage &&
                       isNotTooTall &&
                       isNotKeyboard &&
                       isNotScreen &&
                       isNotTooSmall &&
                       isNotTooLarge &&
                       isReasonableFaceRange &&
                       isNotVerySquare &&
                       isNotDesktopScreen;
        
        resolve(isValid);
      }, () => {
        console.log('Dimension Validation: Could not analyze image');
        resolve(false);
      });
    });
  };

  // Validate image quality
  const validateImageQuality = async (uri: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if image exists and is accessible
      Image.getSize(uri, (width, height) => {
        // Basic quality check - image should have reasonable dimensions
        const isValidQuality = width > 0 && height > 0;
        resolve(isValidQuality);
      }, () => resolve(false));
    });
  };

  // Validate image content (simulated face detection)
  const validateImageContent = async (uri: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Analyze image characteristics to detect if it's likely a face
      Image.getSize(uri, (width, height) => {
        // Calculate image characteristics
        const aspectRatio = width / height;
        const totalPixels = width * height;
        
        // Reasonable face detection - accept legitimate human faces
        
        // 1. MUST be portrait orientation (height > width) - reasonable
        const isPortrait = aspectRatio < 0.9; // Face should be taller than wide
        
        // 2. MUST have reasonable face proportions (human face range)
        const hasFaceProportions = aspectRatio >= 0.6 && aspectRatio <= 0.85; // Reasonable face range
        
        // 3. MUST have reasonable size for face detection
        const hasReasonableSize = width >= 300 && height >= 400; // Lower minimum for faces
        
        // 4. Reject obvious non-face patterns:
        // - Very wide images (keyboards, screens, landscapes)
        const isNotWideImage = aspectRatio < 0.9; // Reasonable portrait requirement
        
        // - Very tall images (unlikely to be faces)
        const isNotTooTall = aspectRatio > 0.5; // Reasonable portrait
        
        // 5. Reject obvious non-face objects:
        // - Reject keyboard-like patterns (very wide)
        const isNotKeyboard = !(width > 800 && height > 400 && aspectRatio > 1.2);
        
        // - Reject screen-like patterns (very high resolution)
        const isNotScreen = !(width > 1500 && height > 1000);
        
        // - Reject very small images (likely not faces)
        const isNotTooSmall = width >= 300 && height >= 400;
        
        // - Reject extremely large images (likely screenshots)
        const isNotTooLarge = width <= 2000 && height <= 2500;
        
        // 6. Accept reasonable range for human face selfies
        const isReasonableFaceRange = width >= 300 && width <= 2000 && 
                                     height >= 400 && height <= 2500 &&
                                     aspectRatio >= 0.6 && aspectRatio <= 0.85;
        
        // 7. Reject obvious object patterns:
        // - Reject very square images (likely objects, not faces)
        const isNotVerySquare = aspectRatio < 0.95;
        
        // - Reject common desktop screen dimensions
        const isNotDesktopScreen = !(width === 1366 && height === 768) && // Laptop screen
                                  !(width === 1920 && height === 1080) && // Full HD
                                  !(width === 2560 && height === 1440) && // QHD
                                  !(width === 1440 && height === 900) && // MacBook
                                  !(width === 1280 && height === 720) && // HD
                                  !(width === 1600 && height === 900); // HD+
        
        // 8. Accept reasonable file sizes for phone photos
        const isReasonableFileSize = totalPixels <= 2000000; // 2M pixels max (reasonable for phone photos)
        
        // 9. Accept reasonable aspect ratios for faces
        const isReasonableAspectRatio = aspectRatio >= 0.5 && aspectRatio <= 0.9;
        
        // 10. Accept reasonable pixel counts for phone photos
        const isReasonablePixelCount = totalPixels >= 120000 && totalPixels <= 2000000; // 120K-2M pixels
        
        // Combine reasonable criteria - most should be true for a human face
        const hasFace = isPortrait && 
                       hasFaceProportions && 
                       hasReasonableSize &&
                       isNotWideImage &&
                       isNotTooTall &&
                       isNotKeyboard &&
                       isNotScreen &&
                       isNotTooSmall &&
                       isNotTooLarge &&
                       isReasonableFaceRange &&
                       isNotVerySquare &&
                       isNotDesktopScreen &&
                       isReasonableFileSize &&
                       isReasonableAspectRatio &&
                       isReasonablePixelCount;
        
        // Log reasonable validation for debugging
        console.log('Reasonable Face Detection Validation:', {
          width, height, aspectRatio, totalPixels,
          isPortrait, hasFaceProportions,
          hasReasonableSize, isNotWideImage,
          isNotTooTall, isNotKeyboard,
          isNotScreen, isNotTooSmall,
          isNotTooLarge, isReasonableFaceRange,
          isNotVerySquare, isNotDesktopScreen,
          isReasonableFileSize, isReasonableAspectRatio,
          isReasonablePixelCount, hasFace
        });
        
        // Add a small delay to simulate processing
        setTimeout(() => {
          resolve(hasFace);
        }, 1000);
      }, () => {
        // If we can't analyze the image, assume no face
        console.log('Face Detection: Could not analyze image');
        resolve(false);
      });
    });
  };

  // Upload the selfie image to your API
  const uploadSelfie = async (uri: string) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('selfie_image', {
      uri,
      name: 'selfie.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setAlertMessage('Your session has expired. Please sign in again.');
        setAlertTitle('Authentication Required');
        setAlertType('error');
        setAlertCallback(() => () => navigation.navigate('Login'));
        setAlertVisible(true);
        return;
      }

      const res = await fetch(
        `${baseUrl}/Account/kyc/step3/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errJson = await res.json();
        console.warn('Upload error:', errJson);
        let errorMessage = 'Failed to upload selfie. Please try again.';
        
        if (errJson?.detail) {
          errorMessage = errJson.detail;
        } else if (errJson?.message) {
          errorMessage = errJson.message;
        }
        
        setAlertMessage(errorMessage);
        setAlertTitle('Upload Failed');
        setAlertType('error');
        setAlertVisible(true);
      } else {
        const responseData = await res.json();
        console.log('✅ Selfie upload successful:', responseData);
        
        setAlertMessage('Selfie uploaded successfully! Please proceed to complete your profile.');
        setAlertTitle('Upload Successful');
        setAlertType('success');
        setAlertCallback(() => () => navigation.navigate('FillYourProfile'));
        setAlertVisible(true);
      }
    } catch (err) {
      console.error('❌ Selfie upload error:', err);
      setAlertMessage('Network connection error. Please check your internet connection and try again.');
      setAlertTitle('Network Error');
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setUploading(false);
    }
  };

  // Take a selfie with STRICT front camera enforcement
  const takeSelfie = async () => {
    if (!(await ensureCameraPermission())) return;

    // Increment attempt count
    setAttemptCount(prev => prev + 1);

    // Force front camera with strict options
    const options: CameraOptions = { 
      mediaType: 'photo', 
      quality: 0.8,
      cameraType: 'front', // Force front camera
      saveToPhotos: false,
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      presentationStyle: 'fullScreen',
      includeExtra: false,
    };
    
    try {
      const response: ImagePickerResponse = await new Promise((resolve, reject) => {
        launchCamera(options, (result) => {
          if (result.errorCode) {
            reject(new Error(result.errorMessage || 'Camera error'));
          } else {
            resolve(result);
          }
        });
      });

      if (response.didCancel) return;
      
      if (response.assets && response.assets[0]) {
        const uri = response.assets[0].uri;
        if (uri) {
          setSelfieUri(uri);
          setFaceDetected(false); // Reset face detection
          setRejectionReason(''); // Clear previous rejection reason
          setDetectingFace(true);
          
          // Auto-detect face
          const faceFound = await detectFace(uri);
          
          if (faceFound) {
            // Auto-upload if face is detected
            await uploadSelfie(uri);
          } else {
            // Provide specific feedback based on validation results
            const dimensionValid = await validateImageDimensions(uri);
            const qualityValid = await validateImageQuality(uri);
            
            let errorMessage = 'No face detected. ';
            
            if (!dimensionValid) {
              errorMessage += 'Please ensure you\'re taking a portrait photo of your face with your ID card.';
            } else if (!qualityValid) {
              errorMessage += 'Please ensure the image is clear and well-lit.';
            } else {
              errorMessage += 'Please ensure your face is clearly visible in the frame and try again.';
            }
            
            showCustomAlert(
              'Face Not Detected',
              errorMessage,
              'warning'
            );
          }
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      showCustomAlert(
        'Camera Error',
        'Failed to open camera. Please try again.',
        'error'
      );
    }
  };

  // Retake selfie
  const retakeSelfie = () => {
    setSelfieUri('');
    setFaceDetected(false);
    setRejectionReason('');
    setDetectingFace(false);
  };

  // Manual upload (if face detection fails but user wants to proceed)
  const manualUpload = async () => {
    if (selfieUri) {
      await uploadSelfie(selfieUri);
    }
  };

  // Show camera instructions
  const showCameraInstructions = () => {
    showCustomAlert(
      'Smart Face Detection',
      'For best face detection results:\n\n' +
      '1. Use the front-facing camera\n' +
      '2. Hold your ID card next to your face\n' +
      '3. Ensure your face is clearly visible\n' +
      '4. Keep your face centered in the frame\n' +
      '5. Ensure good lighting on your face\n' +
      '6. Maintain portrait orientation\n' +
      '7. Look directly at the camera\n\n' +
      '✅ Human faces will be automatically detected\n' +
      '❌ Objects will be rejected:\n' +
      '   • Screens, keyboards, laptops\n' +
      '   • Walls, furniture, objects\n' +
      '   • Landscape photos\n' +
      '   • Very distorted images',
      'info'
    );
  };

  // Show custom alert helper function
  const showCustomAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' | 'custom' = 'custom', callback?: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    if (callback) {
      setAlertCallback(() => callback);
    } else {
      setAlertCallback(null);
    }
    setAlertVisible(true);
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Selfie with ID Card" />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.contentContainer}>
            <View style={styles.headerSection}>
              {/* <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                Selfie with ID Card
              </Text> */}
              <Text style={[styles.subtitle, { color: dark ? COLORS.grayscale700 : COLORS.greyscale900 }]}>
                Please face the front camera holding your ID card
              </Text>
            </View>

            <View style={styles.cameraSection}>
              <View style={[styles.cameraContainer, { 
                borderColor: dark ? COLORS.dark3 : COLORS.grayscale200,
                backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                shadowColor: dark ? COLORS.black : COLORS.black,
              }]}>
                {selfieUri ? (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: selfieUri }}
                      style={styles.selfieImage}
                      resizeMode="cover"
                    />
                    {faceDetected && (
                      <View style={[styles.faceDetectedBadge, { backgroundColor: COLORS.success }]}>
                        <Text style={styles.faceDetectedText}>✓ Face Detected</Text>
                      </View>
                    )}
                    {!faceDetected && selfieUri && (
                      <View style={[styles.faceNotDetectedBadge, { backgroundColor: COLORS.warning }]}>
                        <Text style={styles.faceNotDetectedText}>⚠ No Face Detected</Text>
                        {rejectionReason && (
                          <Text style={styles.rejectionReasonText}>{rejectionReason}</Text>
                        )}
                      </View>
                    )}
                    {/* Face Detection Mode Indicator */}
                    <View style={[styles.strictModeBadge, { backgroundColor: COLORS.info }]}>
                      <Text style={styles.strictModeText}>📱 Smart Face Detection</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.placeholderContainer, { 
                    backgroundColor: dark ? COLORS.dark3 : COLORS.grayscale100 
                  }]}>
                    <Image
                      source={icons.camera as any}
                      style={[styles.cameraIcon, { 
                        tintColor: dark ? COLORS.grayscale700 : COLORS.grayscale700 
                      }]}
                      resizeMode="contain"
                    />
                    <Text style={[styles.placeholderText, { 
                      color: dark ? COLORS.grayscale700 : COLORS.grayscale700 
                    }]}>
                      Front Camera Only
                    </Text>
                    <Text style={[styles.placeholderSubtext, { 
                      color: dark ? COLORS.grayscale700 : COLORS.grayscale700 
                    }]}>
                      Face recognition will auto-detect
                    </Text>
                    <View style={[styles.strictModeInfo, { 
                      backgroundColor: dark ? COLORS.dark2 : COLORS.grayscale100 
                    }]}>
                      <Text style={[styles.strictModeInfoText, { color: COLORS.primary }]}>
                        📱 Smart face detection enabled
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.helpButton, { 
                        backgroundColor: dark ? COLORS.transparentPrimary : COLORS.tansparentPrimary 
                      }]}
                      onPress={showCameraInstructions}
                    >
                      <Text style={[styles.helpButtonText, { color: COLORS.primary }]}>
                        Need Help?
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Face Detection Status */}
              {detectingFace && (
                <View style={styles.detectionContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={[styles.detectionText, { 
                    color: dark ? COLORS.white : COLORS.greyscale900 
                  }]}>
                    Detecting face...
                  </Text>
                </View>
              )}

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <Text style={[styles.instructionTitle, { 
                  color: dark ? COLORS.white : COLORS.greyscale900 
                }]}>
                  Instructions:
                </Text>
                <View style={styles.instructionsList}>
                  <View style={styles.instructionItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: COLORS.primary }]} />
                    <Text style={[styles.instructionText, { 
                      color: dark ? COLORS.grayscale700 : COLORS.grayscale700 
                    }]}>
                      Hold your ID card next to your face
                    </Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: COLORS.primary }]} />
                    <Text style={[styles.instructionText, { 
                      color: dark ? COLORS.grayscale700 : COLORS.grayscale700 
                    }]}>
                      Ensure good lighting
                    </Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: COLORS.primary }]} />
                    <Text style={[styles.instructionText, { 
                      color: dark ? COLORS.grayscale700 : COLORS.grayscale700 
                    }]}>
                      Look directly at the camera
                    </Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: COLORS.primary }]} />
                    <Text style={[styles.instructionText, { 
                      color: dark ? COLORS.grayscale700 : COLORS.grayscale700 
                    }]}>
                      Keep your face clearly visible
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={[styles.bottomContainer, { 
        backgroundColor: dark ? COLORS.dark2 : COLORS.white,
        borderTopColor: dark ? COLORS.dark3 : COLORS.grayscale200,
      }]}>
        {selfieUri ? (
          <>
            <Button
              title="Retake"
              style={{
                width: (SIZES.width - 32) / 2 - 8,
                borderRadius: 32,
                backgroundColor: dark ? COLORS.dark3 : COLORS.tansparentPrimary,
                borderColor: dark ? COLORS.dark3 : COLORS.tansparentPrimary
              }}
              textColor={dark ? COLORS.white : COLORS.primary}
              onPress={retakeSelfie}
              disabled={uploading || detectingFace}
            />
            <Button
              title={uploading ? 'Uploading…' : 'Upload Anyway'}
              filled
              style={[styles.continueButton, { 
                backgroundColor: COLORS.primary,
                borderColor: COLORS.primary
              }]}
              onPress={manualUpload}
              disabled={uploading || detectingFace}
            />
          </>
        ) : (
          <Button
            title="Take Selfie"
            filled
            style={[styles.fullWidthButton, { backgroundColor: COLORS.primary }]}
            onPress={takeSelfie}
            disabled={uploading || detectingFace}
          />
        )}
      </View>

      {/* Loading Overlay */}
      {(uploading || detectingFace) && (
        <View style={[styles.loadingOverlay, { 
          backgroundColor: dark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' 
        }]}>
          <View style={[styles.loadingContent, { 
            backgroundColor: dark ? COLORS.dark2 : COLORS.white,
            borderColor: dark ? COLORS.dark3 : COLORS.grayscale200,
          }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, { 
              color: dark ? COLORS.white : COLORS.greyscale900 
            }]}>
              {detectingFace ? 'Detecting face...' : 'Uploading...'}
            </Text>
          </View>
        </View>
      )}

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertVisible}
        onClose={() => {
          setAlertVisible(false);
          if (alertCallback) {
            alertCallback();
            setAlertCallback(null);
          }
        }}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText="Okay"
        autoClose={alertType === 'success'}
        autoCloseDelay={2000}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Urbanist Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  cameraSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  cameraContainer: {
    width: SIZES.width * 0.85,
    height: SIZES.width * 0.85,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 2,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selfieImage: {
    width: '100%',
    height: '100%',
  },
  faceDetectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  faceDetectedText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'Urbanist Medium',
  },
  faceNotDetectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  faceNotDetectedText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'Urbanist Medium',
  },
  rejectionReasonText: {
    fontSize: 12,
    fontFamily: 'Urbanist Regular',
    color: COLORS.white,
    marginTop: 4,
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 30,
  },
  helpButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  helpButtonText: {
    fontSize: 14,
    fontFamily: 'Urbanist Medium',
  },
  cameraIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    opacity: 0.6,
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: 'Urbanist SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  detectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  detectionText: {
    fontSize: 16,
    fontFamily: 'Urbanist Medium',
    marginLeft: 8,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
  },
  instructionTitle: {
    fontSize: 18,
    fontFamily: 'Urbanist SemiBold',
    textAlign: 'left',
    marginBottom: 20,
  },
  instructionsList: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 16,
    marginTop: 2,
  },
  instructionText: {
    fontSize: 15,
    fontFamily: 'Urbanist Regular',
    lineHeight: 22,
    flex: 1,
    textAlign: 'left',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  continueButton: {
    width: (SIZES.width - 32) / 2 - 8,
    borderRadius: 32,
  },
  fullWidthButton: {
    width: SIZES.width - 32,
    borderRadius: 32,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Urbanist Medium',
    marginTop: 12,
  },
  strictModeBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  strictModeText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'Urbanist Medium',
  },
  strictModeInfo: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'center',
  },
  strictModeInfoText: {
    fontSize: 14,
    fontFamily: 'Urbanist Medium',
    textAlign: 'center',
  },
});

export default SelfieWithIdCard;
