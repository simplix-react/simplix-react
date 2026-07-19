/**
 * Build the multipart form-data part for a captured photo. The capture
 * session endpoint itself belongs to the app's generated domain hooks —
 * this only shapes the file part.
 */
export function capturePhotoFormDataPart(
  photoUri: string,
  fileName = "arrival-photo.jpg",
): { uri: string; name: string; type: string } {
  const type = fileName.endsWith(".png") ? "image/png" : "image/jpeg";
  return { uri: photoUri, name: fileName, type };
}
