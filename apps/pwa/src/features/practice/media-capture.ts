import type { CameraFacing, MediaType } from "@improv/core";

export class MediaCaptureAdapter {
    private mediaRecorder: MediaRecorder | null = null;
    private stream: MediaStream | null = null;
    private chunks: Blob[] = [];

    getSupport(): boolean {
        return (
            typeof navigator !== "undefined" &&
            !!navigator.mediaDevices &&
            !!navigator.mediaDevices.getUserMedia
        );
    }

    async requestPermissions(mediaType: MediaType): Promise<boolean> {
        try {
            const constraints = {
                audio: true,
                video: mediaType === "video",
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            stream.getTracks().forEach((track) => track.stop());
            return true;
        } catch (e) {
            console.error("Failed to request media permissions", e);
            return false;
        }
    }

    async start(input: {
        mediaType: MediaType;
        cameraFacing?: CameraFacing | null;
    }): Promise<void> {
        const videoConstraints: boolean | MediaTrackConstraints =
            input.mediaType === "video"
                ? input.cameraFacing
                    ? { facingMode: input.cameraFacing }
                    : true
                : false;

        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: videoConstraints,
        });

        this.chunks = [];

        const mimeType =
            input.mediaType === "video"
                ? MediaRecorder.isTypeSupported("video/webm")
                    ? "video/webm"
                    : "video/mp4"
                : MediaRecorder.isTypeSupported("audio/webm")
                    ? "audio/webm"
                    : "audio/mp4";

        this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                this.chunks.push(e.data);
            }
        };

        // Use a small timeslice to ensure data is available frequently
        this.mediaRecorder.start(1000);
    }

    stop(): Promise<{ blob: Blob; mimeType: string }> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                // If it was never initialized, just return an empty blob so the session can "save" nothing
                // gracefully rather than bubbling an unhandled promise rejection to the UI
                const mimeType = "application/octet-stream";
                return resolve({ blob: new Blob([], { type: mimeType }), mimeType });
            }

            this.mediaRecorder.onstop = () => {
                const mimeType =
                    this.mediaRecorder?.mimeType || "application/octet-stream";
                const blob = new Blob(this.chunks, { type: mimeType });

                if (this.stream) {
                    this.stream.getTracks().forEach((track) => track.stop());
                    this.stream = null;
                }
                this.mediaRecorder = null;
                this.chunks = [];
                resolve({ blob, mimeType });
            };

            if (this.mediaRecorder.state !== "inactive") {
                this.mediaRecorder.stop();
            } else {
                const mimeType =
                    this.mediaRecorder.mimeType || "application/octet-stream";
                const blob = new Blob(this.chunks, { type: mimeType });
                resolve({ blob, mimeType });
            }
        });
    }

    cancel(): void {
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
            this.mediaRecorder.stop();
        }
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
        this.mediaRecorder = null;
        this.chunks = [];
    }
}
