interface TutorFeatureEnv {
  VITE_ENABLE_RESULTS_TUTOR?: string;
  VITE_ENABLE_TUTOR_TTS?: string;
}

function parseBooleanFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export function isResultsTutorEnabled(env?: TutorFeatureEnv): boolean {
  if (env !== undefined) {
    return parseBooleanFlag(env.VITE_ENABLE_RESULTS_TUTOR);
  }

  const importMetaEnv = (import.meta as ImportMeta & { env?: TutorFeatureEnv }).env;
  return parseBooleanFlag(importMetaEnv?.VITE_ENABLE_RESULTS_TUTOR);
}

export function isTutorTtsEnabled(env?: TutorFeatureEnv): boolean {
  const isResultsTutorActive = isResultsTutorEnabled(env);

  if (!isResultsTutorActive) {
    return false;
  }

  if (env !== undefined) {
    return parseBooleanFlag(env.VITE_ENABLE_TUTOR_TTS);
  }

  const importMetaEnv = (import.meta as ImportMeta & { env?: TutorFeatureEnv }).env;
  return parseBooleanFlag(importMetaEnv?.VITE_ENABLE_TUTOR_TTS);
}
