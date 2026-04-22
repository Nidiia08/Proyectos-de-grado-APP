/** Perfil académico del trabajo de grado (modalidad y subtipo). */
export type ProjectModality = 'investigacion' | 'interaccion_social';

export type SocialSubtype =
  | 'pasantia'
  | 'proyecto_desarrollo_software'
  | 'proyecto_intervencion';

/** Fases del flujo de entregables (orden estricto). */
export type StudentWorkflowPhase =
  | 'inscripcion'
  | 'aprobacion'
  | 'desarrollo'
  | 'culminacion'
  | 'evaluacion';

export const STUDENT_WORKFLOW_PHASES: readonly StudentWorkflowPhase[] = [
  'inscripcion',
  'aprobacion',
  'desarrollo',
  'culminacion',
  'evaluacion',
] as const;

export interface StudentProjectProfile {
  modality: ProjectModality;
  socialSubtype: SocialSubtype | null;
}
