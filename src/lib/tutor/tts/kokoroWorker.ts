import { createKokoroEngine, type KokoroProgressEvent } from './kokoroEngine';

type WorkerRequest =
  | { id: number; type: 'preload' }
  | { id: number; type: 'generate-audio'; text: string }
  | { id: number; type: 'stop' };

type WorkerMessage =
  | { type: 'progress'; progress: KokoroProgressEvent }
  | { type: 'backend-selected'; backend: 'webgpu' | 'wasm' | 'cpu' }
  | { type: 'ready'; id: number; backend: 'webgpu' | 'wasm' | 'cpu' }
  | { type: 'audio'; id: number; audioBuffer: ArrayBuffer; mimeType: string }
  | { type: 'error'; id: number; message: string };

const workerScope = self as unknown as Worker;
const engine = createKokoroEngine();
let activeRequestId = 0;

function postMessage(message: WorkerMessage, transfer?: Transferable[]) {
  workerScope.postMessage(message, transfer ?? []);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }

  return 'Torch voice worker failed';
}

workerScope.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  if (request.type === 'stop') {
    activeRequestId = request.id;
    return;
  }

  if (request.type === 'preload') {
    try {
      await engine.preload({
        onProgress(progress) {
          postMessage({ type: 'progress', progress });
        },
      });

      const backend = engine.getBackend();
      if (!backend) {
        throw new Error('Torch voice backend was not selected');
      }

      postMessage({ type: 'backend-selected', backend });
      postMessage({ type: 'ready', id: request.id, backend });
    } catch (error) {
      postMessage({ type: 'error', id: request.id, message: toErrorMessage(error) });
    }
    return;
  }

  if (request.type === 'generate-audio') {
    activeRequestId = request.id;

    try {
      const audio = await engine.generateAudio(request.text);
      if (activeRequestId !== request.id) {
        return;
      }

      const audioBuffer = await audio.arrayBuffer();
      postMessage(
        {
          type: 'audio',
          id: request.id,
          audioBuffer,
          mimeType: audio.type || 'audio/wav',
        },
        [audioBuffer]
      );
    } catch (error) {
      postMessage({ type: 'error', id: request.id, message: toErrorMessage(error) });
    }
  }
});
