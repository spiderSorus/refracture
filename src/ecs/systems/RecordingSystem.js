let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

export const RecordingSystem = (_scene, _inputManager) => {
    // Recording disabled (previously bound to BACK / B / ESC, which consumed BACK input and triggered downloads)
    if (isRecording && mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        isRecording = false;
    }
    return;
};