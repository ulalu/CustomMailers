import {
  CANDIDATE_PHOTO_THUMB_DIR,
  CANDIDATE_PHOTO_PRINT_DIR,
  candidatePhotos,
} from './candidate-photos.js';

export { candidatePhotos };

export function candidateThumbSrc(photoId) {
  return `${CANDIDATE_PHOTO_THUMB_DIR}/${photoId}.jpg`;
}

export function candidatePrintSrc(photoId) {
  return `${CANDIDATE_PHOTO_PRINT_DIR}/${photoId}.jpg`;
}

export function hasCandidatePhoto(photoId) {
  return candidatePhotos.some((photo) => photo.id === photoId);
}
