let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

export const RecordingSystem = (scene, inputManager) => {
    if (!inputManager || !scene) return;

    // 1. Initialize UI Indicator
    if (!scene.recIndicator) {
        scene.recIndicator = scene.add.text(10, 40, '🔴 REC', {
            font: '16px monospace',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: '#00000088'
        }).setScrollFactor(0).setDepth(3000).setVisible(false);

        const uiScale = 1 / scene.cameras.main.zoom;
        scene.recIndicator.setScale(uiScale);
        scene.recIndicator.setPosition(10 * uiScale, 40 * uiScale);
    }

    // 2. Robust Input Check: Action (D-Pad) OR Keyboard Down Arrow
    const dpadAction = inputManager.getAction('DOWN');
    const keyboardDown = inputManager.cursors?.down && Phaser.Input.Keyboard.JustDown(inputManager.cursors.down);

    if (dpadAction || keyboardDown) {
        if (!isRecording) {
            // --- START RECORDING ---
            const canvas = scene.game.canvas;
            if (!canvas) return;

            const stream = canvas.captureStream(60);

            try {
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
            } catch (e) {
                mediaRecorder = new MediaRecorder(stream);
            }

            recordedChunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `refract_clip_${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            };

            mediaRecorder.start();
            isRecording = true;
            scene.recIndicator.setVisible(true);
            console.log("🎥 Recording Started...");
        } else {
            // --- STOP RECORDING ---
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            isRecording = false;
            scene.recIndicator.setVisible(false);
            console.log("💾 Recording Saved.");
        }
    }
};